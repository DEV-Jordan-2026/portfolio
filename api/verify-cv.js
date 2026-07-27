// Vercel Serverless Function — /api/verify-cv
// Verifies a Cloudflare Turnstile token server-side, then (and only then)
// streams the CV PDF back. The PDF itself lives in /private, which is never
// served as a static file, so this endpoint is the only way to reach it.

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = req.body && req.body.token;
  if (!token) {
    res.status(400).json({ error: 'Token manquant' });
    return;
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set');
    res.status(500).json({ error: 'Configuration serveur manquante' });
    return;
  }

  try {
    const remoteip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip })
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      res.status(403).json({ error: 'Vérification humaine échouée', codes: verifyData['error-codes'] || [] });
      return;
    }

    const filePath = path.join(process.cwd(), 'private', 'cv-steve-tankoua.pdf');
    const fileBuffer = fs.readFileSync(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="CV-Steve-Tankoua.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(fileBuffer);
  } catch (err) {
    console.error('verify-cv error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
