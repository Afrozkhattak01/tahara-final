/* ══════════════════════════════════════════════════════════════
   Platform mega-menu — the one copy.

   Data, markup and behaviour live here so the menu is identical wherever
   it appears. Two callers:
     · the landing page, via tahara-engine.js (UI.mega delegates here)
     · /resources, which mounts it straight from React

   Adding or renaming a menu item means editing MENU below and nothing
   else. The host page supplies only the shell — #megaBtn in the nav,
   #mega > .mega-card > #megaInner (with the demo panel inside it), and
   #megaScrim — everything between them is built here.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* [ column heading, [ title, description, comingSoon, href?, subHeading? ] ]
     href defaults to the platform anchor. subHeading opens a second,
     divider-topped group inside the column — that is how the vulnerability
     rows sit under PII guardrails. */
  const MENU = {
    en: [
      ['Governance', [
        ['Statement of Applicability', 'Every control, justified',   false],
        ['Evidence Locker',            'Proof, stored and dated',    false],
        ['Audit Ledger',               'Tamper-proof history',       false],
        ['AI Inventory',               'Every system, tracked',      false],
        ['Risk Classification',        'Tiered by exposure',         false],
        ['Agent Constraints',          'Boundaries, enforced',       false],
        ['Compliance Reporting',       'Ready when asked',           false],
        ['Continuous Dashboard',       'Live, not annual',           false],
        ['Vendor Risk',                'Third-party AI tracked',     true ],
        ['Access Reviews',             'Checked regularly, always',  true ]
      ]],
      ['Adversarial', [
        ['Attack Simulation',          'Scheduled, staging only',    false],
        ['OWASP LLM Top 10',           'Every category, tracked',    false],
        ['Red-Team Scheduling',        'Recurring, not annual',      false],
        ['Findings Register',          'Every result, kept',         false],
        ['Continuous Dashboard',       'Attacks, tracked live',      false]
      ]],
      ['PII Guardrails', [
        ['Prompt Inspection',          'Checked before the model sees it',   false],
        ['Masking & Redaction',        'Reversible, on our side only',       false],
        ['Bilingual Detection',        'English and Roman Urdu',             false],
        ['Cookie & Consent',           'Banner rules, tracker checks',       true ],
        ['Cloud Config Scan',          'IAM, storage, network rules',        false, '', 'Vulnerability Scanner'],
        ['Dependency Checks',          'Known CVEs, flagged',                false],
        ['Secret Detection',           'Exposed keys, caught early',         false]
      ]]
    ],
    ar: [
      ['الحوكمة', [
        ['بيان الانطباق',        'كل ضابط، مبرَّر',              false],
        ['خزانة الأدلة',         'إثبات، مخزَّن ومؤرَّخ',        false],
        ['سجلّ التدقيق',         'سجلّ غير قابل للتلاعب',        false],
        ['جرد الذكاء الاصطناعي', 'كل نظام، متتبَّع',             false],
        ['تصنيف المخاطر',        'مُدرَّج حسب درجة التعرّض',      false],
        ['قيود الوكلاء',         'حدود، مفروضة',                false],
        ['تقارير الامتثال',      'جاهزة عند الطلب',              false],
        ['لوحة متابعة مستمرة',   'حيّة، لا سنوية',               false],
        ['مخاطر المورّدين',      'ذكاء اصطناعي خارجي متتبَّع',    true ],
        ['مراجعات الوصول',       'مُراجَعة دوريًا، دائمًا',       true ]
      ]],
      ['الاختبار العدائي', [
        ['محاكاة الهجوم',        'مجدولة، في بيئة التجهيز فقط',  false],
        ['OWASP LLM Top 10',     'كل فئة، متتبَّعة',             false],
        ['جدولة الفريق الأحمر',  'متكررة، وليست سنوية',          false],
        ['سجلّ النتائج',         'كل نتيجة، محفوظة',             false],
        ['لوحة متابعة مستمرة',   'الهجمات، متتبَّعة مباشرة',      false]
      ]],
      ['ضوابط حماية البيانات الشخصية', [
        ['فحص الطلبات',          'يُفحص قبل وصوله إلى النموذج',   false],
        ['الإخفاء والتنقيح',     'قابل للعكس، من جانبنا فقط',     false],
        ['الكشف ثنائي اللغة',    'الإنجليزية والأردية باللاتينية', false],
        ['ملفات الارتباط والموافقة', 'قواعد اللافتات وفحوصات المتتبّعات', true ],
        ['فحص إعدادات السحابة',  'إدارة الهوية والتخزين وقواعد الشبكة', false, '', 'الفحص الأمني'],
        ['فحص التبعيات',         'ثغرات معروفة، مُعلَّمة',        false],
        ['كشف الأسرار',          'مفاتيح مكشوفة، تُكتشف مبكرًا',   false]
      ]]
    ]
  };

  /* the row under the columns — [ label, href ] */
  const MORE = {
    en: [
      ['Framework mappings', '#resources'],
      ['Architecture',       '#stack'],
      ['FAQ',                '#faq']
    ],
    ar: [
      ['ربط الأطر المرجعية',   '#resources'],
      ['البنية',              '#stack'],
      ['الأسئلة الشائعة',      '#faq']
    ]
  };

  const STR = {
    more: { en: 'More',        ar: 'المزيد' },
    soon: { en: 'Coming soon', ar: 'قريبًا' }
  };

  /* Every target is a section of the landing page, so anywhere else the
     anchors need the site root in front of them or they point at nothing. */
  function root() {
    return location.pathname === '/' || location.pathname === '' ? '' : '/';
  }

  const $ = (s) => document.querySelector(s);

  /* Current nodes, re-read on every mount. A client-side navigation away and
     back replaces them all, so the handlers read these rather than closing
     over whatever existed the first time. */
  let btn, panel, card, scrim, header, links, toggle;
  let open = false, openedAt = 0;
  let docWired = false;
  const bound = new WeakSet();          /* elements already given listeners */

  /* ── columns + more row, rebuilt on boot and on every language switch ── */
  function build(lang) {
    const inner = $('#megaInner');
    const card = $('#mega .mega-card');
    if (!inner || !card) return;

    const demo = inner.querySelector('.mega-demo');
    const soonTxt = STR.soon[lang];
    const prefix = root();

    inner.querySelectorAll('.mega-col').forEach((c) => c.remove());
    (MENU[lang] || MENU.en).forEach(([heading, items], c) => {
      const col = document.createElement('div');
      col.className = 'mega-col';
      col.style.setProperty('--c', c);
      const h = document.createElement('div');
      h.className = 'mega-h';
      h.textContent = heading;
      col.appendChild(h);
      items.forEach(([title, desc, soon, href, sub]) => {
        if (sub) {
          const s = document.createElement('div');
          s.className = 'mega-sub';
          s.textContent = sub;
          col.appendChild(s);
        }
        const a = document.createElement('a');
        a.className = 'mega-item';
        a.href = prefix + (href || '#platform');
        a.innerHTML =
          '<span><b>' + title + (soon ? ' <i class="soon">' + soonTxt + '</i>' : '') + '</b>' +
          '<span class="d">' + desc + '</span></span>';
        col.appendChild(a);
      });
      inner.insertBefore(col, demo || null);
    });

    const stale = card.querySelector('.mega-more');
    if (stale) stale.remove();
    const more = document.createElement('div');
    more.className = 'mega-more';
    const kicker = document.createElement('div');
    kicker.className = 'mega-h';
    kicker.textContent = STR.more[lang];
    const grid = document.createElement('div');
    grid.className = 'more-grid';
    (MORE[lang] || MORE.en).forEach(([label, href]) => {
      const a = document.createElement('a');
      a.className = 'more-item';
      a.href = prefix + href;
      const b = document.createElement('b');
      b.textContent = label;
      a.appendChild(b);
      grid.appendChild(a);
    });
    more.appendChild(kicker);
    more.appendChild(grid);
    card.appendChild(more);
  }

  /* Cap the panel to the room left under the header. Measured off the
     header, not the panel — the panel carries a translate while closed,
     which would report a top 12px too high. */
  function fit() {
    if (!header || !panel) return;
    const top = header.getBoundingClientRect().bottom;
    const h = Math.max(220, innerHeight - top - 18) + 'px';
    if (card) card.style.maxHeight = h; else panel.style.maxHeight = h;
  }

  /* hover intent: one timer, shared by the link and the card */
  let hideT = 0;
  const hold = () => clearTimeout(hideT);
  const hide = () => { clearTimeout(hideT); hideT = setTimeout(() => set(false), 180); };

  function set(v) {
    if (open === v || !panel || !btn) return;
    open = v;
    if (v) document.dispatchEvent(new CustomEvent('tahara:menu-open', { detail: 'platform' }));
    if (v) fit();
    panel.classList.toggle('open', v);
    /* Let the panel render one frame before the columns animate — an
       animation started on the frame an element becomes visible can be
       dropped. The timeout is a safety net: if rAF is starved the menu
       must still become readable, so it never depends on a frame landing. */
    if (v) {
      const light = () => { if (open) panel.classList.add('lit'); };
      requestAnimationFrame(() => requestAnimationFrame(light));
      setTimeout(light, 120);
    } else {
      panel.classList.remove('lit');
    }
    scrim && scrim.classList.toggle('on', v);
    btn.setAttribute('aria-expanded', String(v));
    if (v) {
      openedAt = scrollY || 0;
      /* on small screens the panel and the burger list share the same
         slot under the header, so they take turns rather than stack */
      if (innerWidth <= 860 && links) {
        links.classList.remove('open');
        toggle && toggle.setAttribute('aria-expanded', 'false');
      }
    }
  }

  /* ── open/close ──
     Element listeners are attached per node and skipped for nodes that
     already have them, so a language rebuild binds nothing twice while a
     client-side navigation (fresh nodes) is wired properly. */
  function wire() {
    if (!btn || !panel) return;

    /* opening the burger list closes the panel */
    if (toggle && !bound.has(toggle)) {
      bound.add(toggle);
      toggle.addEventListener('click', () => set(false));
    }

    /* ── hover, on pointer devices only ──
       Opens on Platform, closes as soon as the pointer is over neither
       Platform nor the card. Held by the CARD, not #mega: the panel is a
       full-width strip and the card only its middle, so hooking the strip
       kept the menu open over blank space either side of it.

       The short grace period covers one trip only — link to card, across the
       10px the panel reserves above it. Anywhere else, including another nav
       item, nothing cancels the timer and the menu closes. */
    const hoverable = matchMedia('(hover:hover) and (pointer:fine)').matches;

    if (!bound.has(btn)) {
      bound.add(btn);
      btn.addEventListener('click', (e) => { e.preventDefault(); set(!open); });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!open); }
      });
      if (hoverable) {
        btn.addEventListener('mouseenter', () => { hold(); if (innerWidth > 860) set(true); });
        btn.addEventListener('mouseleave', hide);
      }
    }

    if (hoverable) {
      if (card && !bound.has(card)) {
        bound.add(card);
        card.addEventListener('mouseenter', hold);
        card.addEventListener('mouseleave', hide);
      }
      /* landing on a different nav item is unambiguous — shut it at once
         rather than sitting through the grace period */
      links && links.querySelectorAll('a').forEach((a) => {
        if (a === btn || bound.has(a)) return;
        bound.add(a);
        a.addEventListener('mouseenter', () => { hold(); set(false); });
      });
    }

    if (!bound.has(panel)) {
      bound.add(panel);
      panel.addEventListener('click', (e) => { if (e.target.closest('.mega-item,.more-item')) set(false); });
    }
    if (scrim && !bound.has(scrim)) {
      bound.add(scrim);
      scrim.addEventListener('click', () => set(false));
    }

    /* document- and window-level listeners read the module-scope nodes, so
       one set covers every mount */
    if (docWired) return;
    docWired = true;
    /* only one header menu open at a time — close if another one opened */
    document.addEventListener('tahara:menu-open', (e) => { if (e.detail !== 'platform') set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && open) { set(false); btn && btn.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (open && panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) set(false);
    });
    addEventListener('resize', () => { if (open) fit(); });
    addEventListener('scroll', () => {
      if (open && Math.abs((scrollY || 0) - openedAt) > 60) set(false);
    }, { passive: true });
  }

  /* Call on boot and again whenever the language changes. */
  function mount(lang) {
    lang = lang === 'ar' ? 'ar' : 'en';
    /* re-read every node: a client-side navigation replaces them all */
    btn = $('#megaBtn');
    panel = $('#mega');
    card = panel && panel.querySelector('.mega-card');
    scrim = $('#megaScrim');
    header = $('#siteHeader');
    links = $('#navLinks');
    toggle = $('#navToggle');
    if (!panel) return;
    open = panel.classList.contains('open');
    build(lang);
    /* rebuilt while open (language switch): replay the reveal so the new
       columns don't arrive mid-animation at opacity 0 */
    if (panel.classList.contains('open')) {
      panel.classList.remove('lit');
      requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('lit')));
    }
    wire();
  }

  window.TaharaMega = { mount: mount };
  /* the engine loads separately and may boot first — it waits for this */
  dispatchEvent(new CustomEvent('tahara:mega-ready'));
})();
