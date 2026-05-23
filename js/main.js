/* ============================================================
   Hayti Airways — main.js
   Améliorations JavaScript — Session 2025-2026
   ============================================================ */

/* ----------------------------------------------------------
   1. BARRE DE PROGRESSION DE LECTURE
   Affiche une barre dorée en haut de la page qui progresse
   au fur et à mesure que l'utilisateur fait défiler.
   ---------------------------------------------------------- */
(function initReadingProgress() {
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: linear-gradient(90deg, #C9A84C, #F0D080);
    z-index: 9999; transition: width 0.1s ease;
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  });
})();


/* ----------------------------------------------------------
   2. BOUTON RETOUR EN HAUT (SCROLL-TO-TOP)
   Apparaît après 300px de défilement, remonte tout en haut
   avec une animation fluide au clic.
   ---------------------------------------------------------- */
(function initScrollToTop() {
  const btn = document.createElement('button');
  btn.id = 'scroll-top-btn';
  btn.innerHTML = '✈';
  btn.title = 'Retour en haut';
  btn.style.cssText = `
    position: fixed; bottom: 2rem; right: 2rem;
    width: 48px; height: 48px; border-radius: 50%;
    background: #C9A84C; color: #fff; font-size: 1.2rem;
    border: none; cursor: pointer; opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transform: rotate(-45deg) translateY(10px);
  `;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.style.opacity = '1';
      btn.style.transform = 'rotate(-45deg) translateY(0)';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'rotate(-45deg) translateY(10px)';
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ----------------------------------------------------------
   3. COMPTEUR ANIMÉ DES STATISTIQUES
   Les chiffres (ex: 2M+, 98%, 35+) s'animent en comptant
   de 0 jusqu'à leur valeur cible quand ils entrent dans
   le viewport.
   ---------------------------------------------------------- */
(function initCounters() {
  const counterEls = document.querySelectorAll('.stat-number, [data-counter]');

  // Aussi cibler les chiffres clés sur projets.html
  const allStatEls = document.querySelectorAll(
    '.stat-number, [data-counter], .col-6.col-lg-3 [style*="font-size:2.5rem"]'
  );

  function animateCounter(el) {
    const raw = el.textContent.trim();
    // Extraire le chiffre, le préfixe et le suffixe
    const match = raw.match(/^([^0-9]*)([0-9,.]+)([^0-9]*)$/);
    if (!match) return;

    const prefix = match[1] || '';
    const numStr = match[2].replace(',', '.');
    const suffix = match[3] || '';
    const target = parseFloat(numStr);
    if (isNaN(target)) return;

    const duration = 1800;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubique
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      // Formater avec le point décimal si le chiffre original en avait un
      const formatted = numStr.includes('.') ? current.toFixed(1) : current;
      el.textContent = prefix + formatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = raw; // S'assure qu'on finit avec la valeur exacte
      }
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  allStatEls.forEach(el => observer.observe(el));
})();


/* ----------------------------------------------------------
   4. VALIDATION DU FORMULAIRE DE CONTACT
   Valide en temps réel (au blur et à la soumission) :
   - Prénom / Nom requis
   - Email valide
   - Sujet sélectionné
   - Message d'au moins 20 caractères
   - Case RGPD cochée
   Affiche un toast de succès après soumission valide.
   ---------------------------------------------------------- */
(function initContactForm() {
  const form = document.querySelector('form[action="#"]');
  if (!form) return;

  // --- Helpers ---
  function showError(input, msg) {
    clearError(input);
    input.classList.add('is-invalid');
    const err = document.createElement('div');
    err.className = 'invalid-feedback d-block';
    err.style.color = '#ff6b6b';
    err.style.fontSize = '0.8rem';
    err.style.marginTop = '4px';
    err.textContent = msg;
    input.parentNode.appendChild(err);
  }

  function showSuccess(input) {
    clearError(input);
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  }

  function clearError(input) {
    input.classList.remove('is-invalid', 'is-valid');
    const existing = input.parentNode.querySelector('.invalid-feedback');
    if (existing) existing.remove();
  }

  function validateField(input) {
    const val = input.value.trim();
    const id = input.id;

    if (id === 'prenom' || id === 'nom') {
      if (!val) { showError(input, 'Ce champ est obligatoire.'); return false; }
      if (val.length < 2) { showError(input, 'Minimum 2 caractères.'); return false; }
    }

    if (id === 'email') {
      if (!val) { showError(input, 'L\'adresse e-mail est obligatoire.'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showError(input, 'Veuillez saisir une adresse e-mail valide.'); return false;
      }
    }

    if (id === 'sujet') {
      if (!val) { showError(input, 'Veuillez sélectionner un sujet.'); return false; }
    }

    if (id === 'message') {
      if (!val) { showError(input, 'Votre message est obligatoire.'); return false; }
      if (val.length < 20) {
        showError(input, `Minimum 20 caractères. (${val.length}/20 actuellement)`);
        return false;
      }
    }

    showSuccess(input);
    return true;
  }

  // Compteur de caractères pour le textarea message
  const msgArea = document.getElementById('message');
  if (msgArea) {
    const counter = document.createElement('div');
    counter.style.cssText = 'font-size:.75rem; color:rgba(255,255,255,.4); text-align:right; margin-top:4px;';
    counter.textContent = '0 / 20 caractères minimum';
    msgArea.parentNode.appendChild(counter);

    msgArea.addEventListener('input', () => {
      const len = msgArea.value.trim().length;
      counter.textContent = `${len} caractère${len > 1 ? 's' : ''} (minimum 20)`;
      counter.style.color = len >= 20 ? 'rgba(100,220,100,.7)' : 'rgba(255,255,255,.4)';
    });
  }

  // Validation au blur (perte de focus)
  ['prenom', 'nom', 'email', 'sujet', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(el));
  });

  // Soumission du formulaire
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = ['prenom', 'nom', 'email', 'sujet', 'message'].map(id => document.getElementById(id)).filter(Boolean);
    const rgpd = document.getElementById('rgpd');
    let valid = true;

    fields.forEach(f => { if (!validateField(f)) valid = false; });

    if (rgpd && !rgpd.checked) {
      showError(rgpd, 'Vous devez accepter la politique de confidentialité.');
      valid = false;
    } else if (rgpd) {
      clearError(rgpd);
    }

    if (valid) {
      showToast('✈ Message envoyé avec succès ! Notre équipe vous répondra sous 24h.', 'success');
      form.reset();
      fields.forEach(f => f.classList.remove('is-valid'));
    } else {
      showToast('⚠ Veuillez corriger les erreurs avant d\'envoyer.', 'error');
    }
  });
})();


/* ----------------------------------------------------------
   5. TOAST DE NOTIFICATION
   Affiche un message temporaire en bas à gauche de l'écran.
   Type : 'success' (vert-doré) ou 'error' (rouge).
   ---------------------------------------------------------- */
function showToast(message, type = 'success') {
  // Supprimer un toast existant
  const old = document.getElementById('hayti-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'hayti-toast';
  toast.textContent = message;
  const bg = type === 'success'
    ? 'linear-gradient(135deg, #1a2e4a, #2a4870)'
    : 'linear-gradient(135deg, #5c1a1a, #8b2020)';

  toast.style.cssText = `
    position: fixed; bottom: 2rem; left: 2rem;
    background: ${bg}; color: #fff;
    padding: 1rem 1.5rem; border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    z-index: 9999; font-size: .9rem;
    border-left: 4px solid ${type === 'success' ? '#C9A84C' : '#ff6b6b'};
    max-width: 380px; line-height: 1.5;
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  `;
  document.body.appendChild(toast);

  // Animation d'entrée
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
  });

  // Disparaît après 5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}


/* ----------------------------------------------------------
   6. FILTRE INTERACTIF DES DESTINATIONS (projets.html)
   Boutons de filtre : Toutes | Caraïbes | Amérique du Nord | Europe
   Les cartes non-correspondantes s'estompent avec animation.
   ---------------------------------------------------------- */
(function initDestinationFilter() {
  // On cible les sections de destinations
  const destSections = document.querySelectorAll('section .destination-card');
  if (destSections.length === 0) return;

  // Construire la barre de filtre
  const filterBar = document.createElement('div');
  filterBar.id = 'dest-filter-bar';
  filterBar.style.cssText = `
    display: flex; flex-wrap: wrap; gap: .6rem;
    justify-content: center; margin-bottom: 2rem;
  `;

  const regions = [
    { label: '🌍 Toutes', value: 'all' },
    { label: '🌴 Caraïbes', value: 'caraïbes' },
    { label: '🗽 Amérique du Nord', value: 'amerique' },
    { label: '🗼 Europe', value: 'europe' },
  ];

  regions.forEach(r => {
    const btn = document.createElement('button');
    btn.textContent = r.label;
    btn.dataset.filter = r.value;
    btn.style.cssText = `
      padding: .45rem 1.1rem; border-radius: 30px; cursor: pointer;
      font-size: .85rem; font-weight: 600; letter-spacing: .5px;
      border: 2px solid #C9A84C; transition: all .25s ease;
      background: ${r.value === 'all' ? '#C9A84C' : 'transparent'};
      color: ${r.value === 'all' ? '#fff' : '#C9A84C'};
    `;
    filterBar.appendChild(btn);
  });

  // Insérer la barre avant la première section destinations
  const firstDestSection = document.querySelector('section .destination-card')
    ?.closest('section');
  if (firstDestSection) {
    firstDestSection.insertBefore(filterBar, firstDestSection.querySelector('.container'));
    filterBar.style.paddingTop = '1rem';
  }

  // Ajouter des attributs data-region aux cartes
  const allCards = document.querySelectorAll('.destination-card');
  allCards.forEach(card => {
    const heading = card.querySelector('h5');
    if (!heading) return;
    const text = heading.textContent.toLowerCase();
    if (text.includes('miami') || text.includes('new york') || text.includes('montréal') || text.includes('boston')) {
      card.dataset.region = 'amerique';
    } else if (text.includes('paris')) {
      card.dataset.region = 'europe';
    } else {
      card.dataset.region = 'caraïbes';
    }
  });

  // Logique de filtre
  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;

    const filter = btn.dataset.filter;

    // Mise à jour des boutons actifs
    filterBar.querySelectorAll('button').forEach(b => {
      const isActive = b === btn;
      b.style.background = isActive ? '#C9A84C' : 'transparent';
      b.style.color = isActive ? '#fff' : '#C9A84C';
    });

    // Afficher/masquer les cartes avec animation
    allCards.forEach(card => {
      const col = card.closest('[class*="col-"]') || card.parentElement;
      const match = filter === 'all' || card.dataset.region === filter;

      if (match) {
        col.style.transition = 'opacity .3s ease, transform .3s ease';
        col.style.opacity = '1';
        col.style.transform = 'scale(1)';
        col.style.pointerEvents = 'auto';
      } else {
        col.style.transition = 'opacity .3s ease, transform .3s ease';
        col.style.opacity = '0.2';
        col.style.transform = 'scale(0.97)';
        col.style.pointerEvents = 'none';
      }
    });
  });
})();


/* ----------------------------------------------------------
   7. ANIMATION D'APPARITION DES ÉLÉMENTS AU SCROLL
   Les cartes de services, destinations, témoignages etc.
   glissent vers le haut et s'opacifient à leur entrée dans
   le viewport.
   ---------------------------------------------------------- */
(function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.service-card, .destination-card, .testimonial-card, .contact-info-item, .card'
  );

  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity .6s ease ${(i % 4) * 0.1}s, transform .6s ease ${(i % 4) * 0.1}s`;
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => revealObserver.observe(el));
})();


/* ----------------------------------------------------------
   8. RECHERCHE RAPIDE DE DESTINATION (index.html)
   Un mini champ de recherche dans la section hero qui
   filtre dynamiquement les destinations du carrousel
   et redirige vers la page projets.html avec un paramètre.
   ---------------------------------------------------------- */
(function initHeroSearch() {
  const hero = document.querySelector('.hero .col-lg-7');
  if (!hero) return;

  const searchWrap = document.createElement('div');
  searchWrap.style.cssText = `
    display: flex; gap: 0; margin-top: 1.5rem; max-width: 420px;
    border-radius: 8px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  `;
  searchWrap.innerHTML = `
    <input
      type="text"
      id="hero-search"
      placeholder="Rechercher une destination…"
      autocomplete="off"
      style="
        flex:1; padding:.75rem 1rem; border:none; outline:none;
        font-size:.9rem; background:rgba(255,255,255,.12);
        color:#fff; backdrop-filter:blur(6px);
      "
    />
    <button
      id="hero-search-btn"
      style="
        padding:.75rem 1.2rem; background:#C9A84C; border:none;
        color:#fff; cursor:pointer; font-size:1rem;
        transition:background .2s;
      "
      aria-label="Rechercher"
    >✈</button>
  `;

  // Insérer avant les boutons d'action
  const btnGroup = hero.querySelector('.d-flex');
  if (btnGroup) hero.insertBefore(searchWrap, btnGroup);

  const input = searchWrap.querySelector('#hero-search');
  const btn   = searchWrap.querySelector('#hero-search-btn');

  const destinations = [
    'Miami', 'Montréal', 'Paris', 'Santo Domingo', 'La Havane',
    'Kingston', 'New York', 'Punta Cana', 'Guadeloupe', 'Martinique',
    'Boston', 'Fort Lauderdale'
  ];

  // Autocomplete simple
  const suggest = document.createElement('ul');
  suggest.style.cssText = `
    position:absolute; list-style:none; margin:0; padding:0;
    background:#0d1b2e; border:1px solid #C9A84C; border-radius:0 0 6px 6px;
    z-index:100; max-width:300px; display:none;
  `;
  searchWrap.style.position = 'relative';
  searchWrap.appendChild(suggest);

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    suggest.innerHTML = '';
    if (!q) { suggest.style.display = 'none'; return; }

    const matches = destinations.filter(d => d.toLowerCase().includes(q));
    if (matches.length === 0) { suggest.style.display = 'none'; return; }

    matches.slice(0, 5).forEach(d => {
      const li = document.createElement('li');
      li.textContent = '✈ ' + d;
      li.style.cssText = `
        padding:.55rem 1rem; cursor:pointer; font-size:.85rem; color:#e0d5b0;
        border-bottom:1px solid rgba(255,255,255,.05);
      `;
      li.addEventListener('mouseenter', () => li.style.background = 'rgba(201,168,76,.15)');
      li.addEventListener('mouseleave', () => li.style.background = 'transparent');
      li.addEventListener('click', () => {
        input.value = d;
        suggest.style.display = 'none';
      });
      suggest.appendChild(li);
    });
    suggest.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!searchWrap.contains(e.target)) suggest.style.display = 'none';
  });

  function doSearch() {
    const q = input.value.trim();
    if (q) {
      window.location.href = `projets.html?destination=${encodeURIComponent(q)}`;
    } else {
      window.location.href = 'projets.html';
    }
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
})();


/* ----------------------------------------------------------
   FIN DU FICHIER main.js
   ---------------------------------------------------------- */
console.log('%c✈ Hayti Airways JS chargé avec succès', 'color:#C9A84C; font-weight:bold; font-size:14px;');
