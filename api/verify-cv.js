// Vercel Serverless Function — POST /api/verify-cv
//
// Vérifie un token Cloudflare Turnstile côté serveur, puis (et seulement
// ensuite) renvoie le PDF du CV.
//
// Le PDF vit dans /private. Il est bien COMMITÉ (indispensable pour que
// `includeFiles` l'embarque dans le bundle), mais l'accès direct à
// /private/* est bloqué par la règle `redirects` de vercel.json, qui est
// évaluée avant le système de fichiers.

const fs = require('fs');
const path = require('path');

const PDF_NAME = 'cv-steve-tankoua.pdf';
const DOWNLOAD_NAME = 'CV-Steve-Tankoua.pdf';
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT_MS = 8000;

/**
 * Le PDF peut se trouver à des emplacements différents selon la façon dont
 * Vercel construit le bundle. On teste les candidats plausibles au lieu de
 * supposer un seul chemin (cause classique de ENOENT en production).
 */
function resolvePdfPath() {
  const candidates = [
    path.join(process.cwd(), 'private', PDF_NAME),
    path.join(__dirname, '..', 'private', PDF_NAME),
    path.join(__dirname, 'private', PDF_NAME),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * req.body est normalement déjà parsé par Vercel pour application/json,
 * mais pas si le Content-Type est absent ou si le runtime change.
 * On couvre les trois cas plutôt que de supposer.
 */
async function readToken(req) {
  if (req.body && typeof req.body === 'object' && req.body.token) {
    return String(req.body.token);
  }
  if (typeof req.body === 'string' && req.body.length) {
    try {
      const parsed = JSON.parse(req.body);
      if (parsed && parsed.token) return String(parsed.token);
    } catch (_) {
      return null;
    }
  }
  // Dernier recours : lire le flux brut.
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return null;
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return parsed && parsed.token ? String(parsed.token) : null;
  } catch (_) {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, code: 'method_not_allowed' });
    return;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('[verify-cv] TURNSTILE_SECRET_KEY absente des variables d\'environnement');
    res.status(500).json({ ok: false, code: 'server_misconfigured' });
    return;
  }

  // On résout le PDF AVANT la vérification : inutile de consommer un token
  // Turnstile (usage unique) si le fichier est introuvable de toute façon.
  const filePath = resolvePdfPath();
  if (!filePath) {
    console.error('[verify-cv] PDF introuvable. cwd=%s __dirname=%s', process.cwd(), __dirname);
    res.status(500).json({ ok: false, code: 'file_missing' });
    return;
  }

  let token;
  try {
    token = await readToken(req);
  } catch (err) {
    console.error('[verify-cv] lecture du corps impossible :', err);
    res.status(400).json({ ok: false, code: 'bad_request' });
    return;
  }

  if (!token) {
    res.status(400).json({ ok: false, code: 'missing_token' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const forwarded = req.headers['x-forwarded-for'];
    const remoteip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || '')
      .split(',')[0]
      .trim() || undefined;

    const verifyRes = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip }),
      signal: controller.signal,
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      console.warn('[verify-cv] Turnstile a refusé le token :', verifyData['error-codes']);
      res.status(403).json({
        ok: false,
        code: 'challenge_failed',
        errors: verifyData['error-codes'] || [],
      });
      return;
    }

    const fileBuffer = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', String(fileBuffer.length));
    res.setHeader('Content-Disposition', `attachment; filename="${DOWNLOAD_NAME}"`);
    res.setHeader('X-Robots-Tag', 'noindex');
    res.status(200).send(fileBuffer);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('[verify-cv] délai dépassé lors de l\'appel à Cloudflare');
      res.status(504).json({ ok: false, code: 'verify_timeout' });
      return;
    }
    console.error('[verify-cv] erreur inattendue :', err);
    res.status(500).json({ ok: false, code: 'server_error' });
  } finally {
    clearTimeout(timeout);
  }
};
