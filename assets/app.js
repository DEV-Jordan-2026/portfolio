/* ============================================================
   Portfolio Steve Jordan Tankoua — script partagé FR / EN
   Un seul fichier pour index.html et en.html : les chaînes
   visibles sont choisies d'après <html lang>.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const isEN = document.documentElement.lang === 'en';
  const T = isEN ? {
    cvUnavailable: 'Unavailable — email me',
    cvUnavailableTitle: 'The anti-bot check could not load (ad blocker or restricted network). Click to request the CV by email.',
    cvFailed: 'Failed — try again',
    cvOffline: 'Offline — try again',
    cvPreparing: 'Preparing…',
    cvVerifying: 'Verifying…',
    cvDone: 'Downloaded ✓',
    mailSubject: 'CV request',
    mailBody: "Hi Steve,\n\nThe CV download from your portfolio did not work. Could you send it to me?\n\nThanks.",
    copyOk: 'Email copied!',
    copyFail: 'Copy failed — select the address',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    zoom: 'Enlarge this screenshot',
    lbClose: 'Close',
    lbPrev: 'Previous image',
    lbNext: 'Next image',
    lbTitle: 'Screenshot viewer',
    of: 'of'
  } : {
    cvUnavailable: "Indisponible — m'écrire",
    cvUnavailableTitle: "La vérification anti-robot n'a pas pu se charger (bloqueur de publicité ou réseau restreint). Cliquez pour recevoir le CV par e-mail.",
    cvFailed: 'Échec — réessayer',
    cvOffline: 'Hors ligne — réessayer',
    cvPreparing: 'Préparation…',
    cvVerifying: 'Vérification…',
    cvDone: 'Téléchargé ✓',
    mailSubject: 'Demande de CV',
    mailBody: "Bonjour Steve,\n\nLe téléchargement du CV depuis le portfolio n'a pas fonctionné. Pouvez-vous me l'envoyer ?\n\nMerci.",
    copyOk: 'Email copié !',
    copyFail: "Copie impossible — sélectionnez l'adresse",
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    zoom: 'Agrandir cette capture',
    lbClose: 'Fermer',
    lbPrev: 'Image précédente',
    lbNext: 'Image suivante',
    lbTitle: 'Visionneuse de captures',
    of: 'sur'
  };

  /* ---------- Apparitions au défilement ---------- */
  document.querySelectorAll('.hero .reveal').forEach(el => {
    requestAnimationFrame(() => el.classList.add('visible'));
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('section .reveal, section .reveal-img')
    .forEach(el => revealObserver.observe(el));

  /* ---------- Compteurs animés ---------- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1300;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    })(performance.now());
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (reduceMotion) entry.target.textContent = entry.target.dataset.count;
        else animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  /* ---------- Barre de progression + fond de la nav ----------
     Un seul écouteur de défilement, la mesure est faite dans
     requestAnimationFrame pour éviter de lire le layout à chaque event. */
  const progressBar = document.getElementById('progress-bar');
  const nav = document.getElementById('nav');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (height > 0 ? (window.scrollY / height) * 100 : 0) + '%';
      nav.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Menu mobile ----------
     Fermé, le panneau était encore atteignable au clavier : on le sort
     de l'arbre d'accessibilité avec inert + visibility, on gère Échap
     et on rend le focus au bouton. */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksEl = document.querySelector('.nav-links');
  const mqMobile = window.matchMedia('(max-width:768px)');

  function syncNavInert() {
    if (mqMobile.matches && !navLinksEl.classList.contains('open')) {
      navLinksEl.setAttribute('inert', '');
    } else {
      navLinksEl.removeAttribute('inert');
    }
  }
  function setNav(open) {
    navLinksEl.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? T.closeMenu : T.openMenu);
    navToggle.innerHTML = open
      ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    syncNavInert();
    if (open) {
      const first = navLinksEl.querySelector('a');
      if (first) first.focus();
    }
  }
  syncNavInert();
  mqMobile.addEventListener('change', syncNavInert);
  navToggle.addEventListener('click', () => setNav(!navLinksEl.classList.contains('open')));
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { if (mqMobile.matches) setNav(false); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinksEl.classList.contains('open')) {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ---------- Lien de nav actif ---------- */
  const navAnchors = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

  /* ---------- Inclinaison de la photo (souris uniquement) ---------- */
  const heroPhoto = document.getElementById('heroPhoto');
  if (heroPhoto && window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    heroPhoto.addEventListener('mousemove', (e) => {
      const rect = heroPhoto.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroPhoto.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
    });
    heroPhoto.addEventListener('mouseleave', () => {
      heroPhoto.style.transform = 'perspective(700px) rotateY(0) rotateX(0) scale(1)';
    });
  }

  /* ---------- Coordonnées assemblées à l'exécution ---------- */
  const emailCodes = [106,111,114,100,97,110,109,111,117,97,107,97,64,103,109,97,105,108,46,99,111,109];
  const phoneCodes = [50,51,55,54,57,49,55,56,51,51,52,49];
  const email = emailCodes.map(c => String.fromCharCode(c)).join('');
  const phoneDigits = phoneCodes.map(c => String.fromCharCode(c)).join('');
  const phoneDisplay = '+' + phoneDigits.slice(0,3) + ' ' + phoneDigits.slice(3,6) + ' ' +
    phoneDigits.slice(6,8) + ' ' + phoneDigits.slice(8,10) + ' ' + phoneDigits.slice(10,12);

  document.querySelector('[data-email]').textContent = email;
  const waLink = document.querySelector('[data-whatsapp]');
  waLink.href = 'https://wa.me/' + phoneDigits;
  waLink.querySelector('[data-phone]').textContent = phoneDisplay;

  /* ---------- Téléchargement du CV (Turnstile invisible) ---------- */
  const TURNSTILE_SITE_KEY = '0x4AAAAAAD_FiPgarZZt6fog';
  const TURNSTILE_BOOT_TIMEOUT = 6000;

  let cvWidgetId = null;
  let cvBusy = false;
  const cvBtn = document.querySelector('[data-cv-download]');
  const cvLabel = document.querySelector('[data-cv-label]');
  const cvLabelDefault = cvLabel.textContent;

  const setCvLabel = (text) => { cvLabel.textContent = text; };
  const resetCvLabel = (delay = 2600) => setTimeout(() => {
    if (!cvBusy) setCvLabel(cvLabelDefault);
  }, delay);

  function endCvAttempt(message, resetWidget = true) {
    cvBusy = false;
    cvBtn.disabled = false;
    cvBtn.removeAttribute('aria-busy');
    setCvLabel(message);
    if (resetWidget && cvWidgetId !== null && window.turnstile) {
      try { turnstile.reset(cvWidgetId); } catch (_) {}
    }
    resetCvLabel();
  }

  function degradeCvButton() {
    cvBusy = false;
    cvBtn.disabled = false;
    cvBtn.removeAttribute('aria-busy');
    setCvLabel(T.cvUnavailable);
    cvBtn.title = T.cvUnavailableTitle;
    cvBtn.dataset.cvFallback = 'mail';
  }

  function renderCvWidget() {
    if (cvWidgetId !== null || !window.turnstile) return;
    try {
      cvWidgetId = turnstile.render('#turnstile-cv', {
        sitekey: TURNSTILE_SITE_KEY,
        size: 'invisible',
        retry: 'never',
        callback: (token) => downloadCv(token),
        'error-callback': () => { endCvAttempt(T.cvFailed); return true; },
        'timeout-callback': () => endCvAttempt(T.cvFailed),
        'expired-callback': () => endCvAttempt(T.cvFailed)
      });
    } catch (err) {
      console.error('Turnstile render failed:', err);
      degradeCvButton();
    }
  }

  if (window.__turnstileReady) {
    renderCvWidget();
  } else {
    window.__onTurnstileReady = renderCvWidget;
    setTimeout(() => { if (cvWidgetId === null) degradeCvButton(); }, TURNSTILE_BOOT_TIMEOUT);
  }

  async function downloadCv(token) {
    setCvLabel(T.cvPreparing);
    let res;
    try {
      res = await fetch('/api/verify-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (err) {
      console.error('CV request failed:', err);
      endCvAttempt(navigator.onLine ? T.cvFailed : T.cvOffline);
      return;
    }

    if (!res.ok) {
      let code = 'http_' + res.status;
      try { const body = await res.json(); if (body && body.code) code = body.code; } catch (_) {}
      console.error('CV endpoint refused the request:', code);
      endCvAttempt(T.cvFailed);
      return;
    }

    try {
      const blob = await res.blob();
      if (blob.type && blob.type.indexOf('pdf') === -1) throw new Error('unexpected ' + blob.type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV-Steve-Tankoua.pdf';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      endCvAttempt(T.cvDone);
    } catch (err) {
      console.error('CV download failed:', err);
      endCvAttempt(T.cvFailed);
    }
  }

  cvBtn.addEventListener('click', () => {
    if (cvBtn.dataset.cvFallback === 'mail') {
      window.location.href = 'mailto:' + email +
        '?subject=' + encodeURIComponent(T.mailSubject) +
        '&body=' + encodeURIComponent(T.mailBody);
      return;
    }
    if (cvBusy) return;
    if (cvWidgetId === null) { degradeCvButton(); return; }
    cvBusy = true;
    cvBtn.disabled = true;
    cvBtn.setAttribute('aria-busy', 'true');
    setCvLabel(T.cvVerifying);
    try {
      turnstile.execute(cvWidgetId);
    } catch (err) {
      console.error('Turnstile execute failed:', err);
      endCvAttempt(T.cvFailed);
    }
  });

  /* ---------- Copie de l'e-mail ----------
     Le message de succès ne s'affiche plus quand la copie échoue. */
  const copyBtn = document.querySelector('.copy-email');
  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  copyBtn.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('no clipboard api');
      await navigator.clipboard.writeText(email);
      showToast(T.copyOk);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      showToast(T.copyFail);
    }
  });

  /* ---------- URL de démo CMB centralisée ---------- */
  const CMB_DEMO_URL = 'https://cmb-v29.vercel.app';
  document.querySelectorAll('[data-demo="cmb"]').forEach(a => { a.href = CMB_DEMO_URL; });
  const cmbHost = CMB_DEMO_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
  document.querySelectorAll('#cmb .frame-url').forEach(el => { el.textContent = cmbHost; });

  /* ---------- Onglets de rôles ----------
     Motif ARIA complet : aria-controls, tabindex glissant,
     flèches gauche/droite, Origine/Fin. */
  document.querySelectorAll('.project-showcase').forEach(showcase => {
    const tabs = Array.from(showcase.querySelectorAll('.role-tab'));
    const panels = Array.from(showcase.querySelectorAll('.project-media[data-role-panel]'));
    if (!tabs.length) return;

    function select(tab, moveFocus = true) {
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(p => { p.hidden = (p.dataset.rolePanel !== tab.dataset.role); });
      if (moveFocus) tab.focus();
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next); }
      });
    });

    select(tabs.find(t => t.classList.contains('active')) || tabs[0], false);
  });

  /* ---------- Visionneuse plein écran ----------
     <dialog>.showModal() donne le piège de focus, la touche Échap
     et l'inertisation de l'arrière-plan sans code supplémentaire. */
  const zoomables = Array.from(document.querySelectorAll('[data-zoom]'));
  if (zoomables.length) {
    const dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', T.lbTitle);
    dlg.innerHTML =
      '<button type="button" class="lb-close" aria-label="' + T.lbClose + '"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
      '<button type="button" class="lb-prev" aria-label="' + T.lbPrev + '"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
      '<button type="button" class="lb-next" aria-label="' + T.lbNext + '"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>' +
      '<div class="lb-inner">' +
        '<img class="lb-img" alt="">' +
        '<p class="lb-caption"></p>' +
        '<p class="lb-counter" aria-live="polite"></p>' +
      '</div>';
    document.body.appendChild(dlg);

    const lbImg = dlg.querySelector('.lb-img');
    const lbCap = dlg.querySelector('.lb-caption');
    const lbCount = dlg.querySelector('.lb-counter');
    const btnPrev = dlg.querySelector('.lb-prev');
    const btnNext = dlg.querySelector('.lb-next');

    let group = [];
    let index = 0;
    let opener = null;

    function render() {
      const src = group[index];
      const img = src.querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lbCap.textContent = img.alt || '';
      lbCount.textContent = (index + 1) + ' ' + T.of + ' ' + group.length;
      const many = group.length > 1;
      btnPrev.hidden = !many;
      btnNext.hidden = !many;
    }
    function step(delta) {
      index = (index + delta + group.length) % group.length;
      render();
    }

    zoomables.forEach(el => {
      el.addEventListener('click', () => {
        // Le groupe = toutes les captures visibles du même projet.
        const scope = el.closest('article') || document;
        group = Array.from(scope.querySelectorAll('[data-zoom]'))
          .filter(z => !z.closest('[hidden]'));
        if (!group.length) group = [el];
        index = Math.max(0, group.indexOf(el));
        opener = el;
        render();
        dlg.showModal();
      });
    });

    btnPrev.addEventListener('click', () => step(-1));
    btnNext.addEventListener('click', () => step(1));
    dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());

    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    // Clic sur le fond (hors image) : on ferme.
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.classList.contains('lb-inner')) dlg.close();
    });
    dlg.addEventListener('close', () => {
      lbImg.removeAttribute('src');
      if (opener) opener.focus();
    });
  }
});
