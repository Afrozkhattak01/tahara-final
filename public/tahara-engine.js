/* ════════════════════════════════════════════════════════════
   TAHARA AI · 3D background
   A wireframe lattice drawn with real perspective projection — no
   library, no WebGL, one canvas. Rotates on two axes, drifts with
   scroll, leans slightly toward the pointer.

   Kept cheap on purpose: geometry is built once, draw calls are
   batched into a handful of alpha buckets rather than one call per
   edge, device pixel ratio is capped, and it renders at ~30fps.
   ════════════════════════════════════════════════════════════ */
window.TaharaScene = (function(){
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const N       = 78;      // lattice points
  const LINK    = 0.40;    // edge threshold in unit-sphere space
  const FOV     = 2.6;     // perspective depth
  const SPIN    = 0.00016; // radians per ms, y axis
  const TILT    = 0.00009; // radians per ms, x axis wobble
  const BUCKETS = 7;       // alpha quantisation for batching
  const MIN_MS  = 32;      // ~30fps ceiling
  const MAX_DPR = 1.5;

  function init(canvas){
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d', { alpha:true });
    if (!ctx) return;

    /* ── geometry: fibonacci sphere + proximity edges, built once ── */
    const px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
    const big = new Uint8Array(N);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++){
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      px[i] = Math.cos(th) * r; py[i] = y; pz[i] = Math.sin(th) * r;
      big[i] = i % 11 === 0 ? 1 : 0;
    }
    const ea = [], eb = [], ew = [];
    for (let i = 0; i < N; i++){
      for (let j = i + 1; j < N; j++){
        const dx = px[i]-px[j], dy = py[i]-py[j], dz = pz[i]-pz[j];
        const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (d < LINK){ ea.push(i); eb.push(j); ew.push(1 - d / LINK * 0.55); }
      }
    }
    const E = ea.length;

    /* scratch buffers, reused every frame */
    const sx = new Float32Array(N), sy = new Float32Array(N);
    const sk = new Float32Array(N), sz = new Float32Array(N);
    const edgeBins = []; const nodeBins = [];
    for (let i = 0; i < BUCKETS; i++){ edgeBins.push([]); nodeBins.push([]); }

    /* ── viewport ── */
    let W = 0, H = 0, R = 0;
    function resize(){
      const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
      W = innerWidth; H = innerHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1;
      R = Math.min(W, H) * 0.56;
    }
    resize();
    addEventListener('resize', resize);

    /* ── input ── */
    let scrollRot = 0, wantScrollRot = 0, lx = 0, ly = 0, wlx = 0, wly = 0;
    addEventListener('scroll', () => {
      wantScrollRot = (scrollY || pageYOffset) * 0.00042;
    }, { passive:true });
    if (matchMedia('(hover:hover)').matches){
      addEventListener('pointermove', e => {
        wlx = (e.clientX / innerWidth  - 0.5) * 0.24;
        wly = (e.clientY / innerHeight - 0.5) * 0.18;
      }, { passive:true });
    }

    /* ── render ── */
    function draw(ay, ax){
      ctx.clearRect(0, 0, W, H);
      const cy = Math.cos(ay), siy = Math.sin(ay);
      const cx = Math.cos(ax), six = Math.sin(ax);
      const ox = W / 2, oy = H * 0.46;

      for (let i = 0; i < N; i++){
        const x1 =  px[i] * cy + pz[i] * siy;
        const z1 = -px[i] * siy + pz[i] * cy;
        const y2 =  py[i] * cx - z1 * six;
        const z2 =  py[i] * six + z1 * cx;
        const k  = FOV / (FOV + z2);
        sx[i] = ox + x1 * R * k;
        sy[i] = oy + y2 * R * k;
        sk[i] = k;
        sz[i] = z2;
      }

      for (let i = 0; i < BUCKETS; i++){ edgeBins[i].length = 0; nodeBins[i].length = 0; }

      /* bin edges by depth-derived alpha */
      for (let e = 0; e < E; e++){
        const i = ea[e], j = eb[e];
        const near = 1 - ((sz[i] + sz[j]) * 0.5 + 1) * 0.5;
        const a = (0.05 + near * 0.17) * ew[e];
        let bin = (a / 0.22 * BUCKETS) | 0;
        if (bin < 0) bin = 0; else if (bin >= BUCKETS) bin = BUCKETS - 1;
        edgeBins[bin].push(i, j);
      }
      for (let b = 0; b < BUCKETS; b++){
        const list = edgeBins[b];
        if (!list.length) continue;
        ctx.strokeStyle = 'rgba(9,47,104,' + (((b + 0.5) / BUCKETS) * 0.22).toFixed(3) + ')';
        ctx.beginPath();
        for (let q = 0; q < list.length; q += 2){
          ctx.moveTo(sx[list[q]], sy[list[q]]);
          ctx.lineTo(sx[list[q+1]], sy[list[q+1]]);
        }
        ctx.stroke();
      }

      /* bin nodes the same way */
      for (let i = 0; i < N; i++){
        const near = 1 - (sz[i] + 1) * 0.5;
        const a = 0.10 + near * 0.34;
        let bin = (a / 0.46 * BUCKETS) | 0;
        if (bin < 0) bin = 0; else if (bin >= BUCKETS) bin = BUCKETS - 1;
        nodeBins[bin].push(i);
      }
      for (let b = 0; b < BUCKETS; b++){
        const list = nodeBins[b];
        if (!list.length) continue;
        ctx.fillStyle = 'rgba(9,47,104,' + (((b + 0.5) / BUCKETS) * 0.46).toFixed(3) + ')';
        ctx.beginPath();
        for (let q = 0; q < list.length; q++){
          const i = list[q], rad = (big[i] ? 2.4 : 1.5) * sk[i];
          ctx.moveTo(sx[i] + rad, sy[i]);
          ctx.arc(sx[i], sy[i], rad, 0, 6.2832);
        }
        ctx.fill();
      }
    }

    /* ── loop ── */
    if (REDUCE){ draw(0.6, 0.42); return; }

    const t0 = performance.now();
    let last = 0, running = true, raf = 0;

    function step(now){
      if (!running){ raf = 0; return; }
      raf = requestAnimationFrame(step);
      if (now - last < MIN_MS) return;
      last = now;
      const t = now - t0;
      scrollRot += (wantScrollRot - scrollRot) * 0.08;
      lx += (wlx - lx) * 0.06;
      ly += (wly - ly) * 0.06;
      draw(t * SPIN + scrollRot + lx, 0.34 + Math.sin(t * TILT) * 0.18 + ly);
    }

    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running && !raf) raf = requestAnimationFrame(step);
    });
    raf = requestAnimationFrame(step);
  }

  return { init };
})();

/* ════════════════════════════════════════════════════════════
   TAHARA AI · content data
   Edit copy here — the UI modules read from this object only.
   ════════════════════════════════════════════════════════════ */
/* Where connector logos come from:
     'cdn'   → cdn.simpleicons.org (default — real marks, zero setup)
     'local' → assets/logos/<slug>.svg first, CDN as backup
   Either way an inline glyph is the final fallback. */
window.TAHARA_CONFIG = { logoSource: 'cdn' };

window.TAHARA_DATA = (function(){

  /* ── live decision feed ── */
  const FEED = [
    ['<b>claims-triage-agent</b> → customer_pii.address · out of scope', 'chip-block', 'Blocked'],
    ['<b>support-copilot</b> · injection pattern matched',               'chip-block', 'Blocked'],
    ['<b>finance-summariser</b> · 3 account numbers removed',            'chip-pass',  'Redacted'],
    ['<b>mistral-small</b> seen in eu-west-1 · no owner',                'chip-log',   'Registered'],
    ['<b>hr-assistant</b> · system prompt leak attempt',                 'chip-block', 'Blocked'],
    ['<b>vendor-bot</b> → contracts.pdf · within scope',                 'chip-pass',  'Allowed'],
    ['<b>eval-runner</b> · new model version detected',                  'chip-log',   'Registered'],
    ['<b>sql-copilot</b> · unbounded DELETE rejected',                   'chip-block', 'Blocked']
  ];

  /* ── customer proof bar ─────────────────────────────────────
     Empty renders placeholder slots. Add entries as
     ['Display name', 'logo-file.svg'] and drop the file in
     assets/logos/customers/. Set CUSTOMER_BAR to 'off' to hide the
     row entirely — do that or fill it before launch; shipping
     placeholder slots on a live site reads as unfinished.
     ───────────────────────────────────────────────────────── */
  const CUSTOMER_BAR = 'auto';          /* 'auto' | 'on' | 'off' */
  const CUSTOMER_SLOTS = 6;
  const CUSTOMERS = [];

  /* ── standards marquee ── */
  const STANDARDS = ['ISO/IEC 42001','ISO/IEC 27001','NIST AI RMF','EU AI Act',
                     'OWASP LLM Top 10','MITRE ATLAS','AIUC-1','SOC 2','GDPR'];

  /* ── fallback glyphs, used when a logo file cannot be loaded ── */
  const GLYPH = {
    spark:'<path d="M12 3.4 13.9 10.1 20.6 12 13.9 13.9 12 20.6 10.1 13.9 3.4 12 10.1 10.1Z"/>',
    hex:'<path d="M12 3.2 19.6 7.6v8.8L12 20.8 4.4 16.4V7.6Z"/>',
    cloud:'<path d="M7.6 18.2a3.9 3.9 0 0 1 .6-7.7 5.1 5.1 0 0 1 9.5 1.2 3.3 3.3 0 0 1-.6 6.5Z"/>',
    db:'<ellipse cx="12" cy="6.2" rx="7" ry="2.6"/><path d="M5 6.2v11.6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6.2"/><path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6"/>',
    layers:'<path d="M12 3.2 20.8 7.6 12 12 3.2 7.6Z"/><path d="M3.2 12.2 12 16.6l8.8-4.4"/><path d="M3.2 16.6 12 21l8.8-4.4"/>',
    graph:'<circle cx="12" cy="12" r="2.6"/><circle cx="5" cy="5.6" r="2.1"/><circle cx="19" cy="5.6" r="2.1"/><circle cx="5" cy="18.4" r="2.1"/><circle cx="19" cy="18.4" r="2.1"/><path d="M6.6 7.1 10.2 10.3M17.4 7.1 13.8 10.3M6.6 16.9 10.2 13.7M17.4 16.9 13.8 13.7"/>',
    code:'<path d="M9 5.6 4.2 12 9 18.4M15 5.6 19.8 12 15 18.4"/>',
    key:'<circle cx="15.4" cy="8.6" r="4.2"/><path d="M12.4 11.6 4.6 19.4h3.2v-3.2h3.2v-2.6"/>',
    shield:'<path d="M12 3 19.2 5.9v5.4c0 4.5-3.1 7.8-7.2 9-4.1-1.2-7.2-4.5-7.2-9V5.9Z"/>',
    wave:'<path d="M2.8 12.4h3.4l2.3-6.2 3.6 12.2 2.8-8.6 1.8 2.6h4.5"/>',
    table:'<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2"/><path d="M3.4 9.6h17.2M9.2 9.6v9.8"/>',
    flow:'<path d="M3.6 8.4h13l-3.4-3.4M20.4 15.6h-13l3.4 3.4"/>',
    cube:'<path d="M12 3.2 20 7.7v8.6L12 20.8 4 16.3V7.7Z"/><path d="M4 7.7 12 12.2l8-4.5M12 12.2v8.6"/>',
    lock:'<rect x="5.4" y="10.4" width="13.2" height="9.4" rx="2"/><path d="M8.6 10.4V7.7a3.4 3.4 0 0 1 6.8 0v2.7"/>',
    pulse:'<path d="M2.8 12.6h4l2.1-4.9 3.2 9.4 2.5-6.3 1.7 1.8h4.9"/>',
    branch:'<path d="M7.2 6.6v7.4a3.4 3.4 0 0 0 3.4 3.4h3.2"/><circle cx="7.2" cy="4.4" r="2.2"/><circle cx="7.2" cy="19.6" r="2.2"/><circle cx="16.8" cy="17.4" r="2.2"/>',
    chat:'<path d="M4.4 5.4h15.2v10.2h-9L6 19.6v-4h-1.6Z"/>',
    box:'<path d="M12 3.2 20.4 7.4v9.2L12 20.8 3.6 16.6V7.4Z"/><path d="M3.6 7.4 12 11.6l8.4-4.2"/>',
    gear:'<circle cx="12" cy="12" r="3.4"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/>'
  };

  /* ── connectors ──────────────────────────────────────────────
     label · logo slug · fallback glyph
     Logo resolution order:
       1. assets/logos/<slug>.svg      (self-hosted — preferred for production)
       2. cdn.simpleicons.org/<slug>   (Simple Icons, CC0 SVGs, tinted brand green)
       3. inline geometric glyph       (always works, no network)
     See assets/logos/README.md to self-host.
     ───────────────────────────────────────────────────────── */
  const CONNECTORS = [
    ['OpenAI','openai','spark'],            ['Anthropic','anthropic','hex'],
    ['Gemini','googlegemini','spark'],      ['AWS','amazonwebservices','cloud'],
    ['Azure','microsoftazure','cloud'],     ['Google Cloud','googlecloud','cloud'],
    ['Hugging Face','huggingface','box'],   ['Meta','meta','hex'],
    ['Mistral','mistralai','spark'],        ['Ollama','ollama','hex'],
    ['LangChain','langchain','branch'],     ['NVIDIA','nvidia','cube'],
    ['Pinecone','pinecone','layers'],       ['Qdrant','qdrant','layers'],
    ['PostgreSQL','postgresql','db'],       ['MongoDB','mongodb','db'],
    ['Redis','redis','db'],                 ['Snowflake','snowflake','db'],
    ['Databricks','databricks','db'],       ['BigQuery','googlebigquery','table'],
    ['Kafka','apachekafka','flow'],         ['Airflow','apacheairflow','flow'],
    ['Spark','apachespark','flow'],         ['Okta','okta','key'],
    ['Auth0','auth0','key'],                ['Vault','vault','lock'],
    ['Cloudflare','cloudflare','shield'],   ['Splunk','splunk','wave'],
    ['Elastic','elastic','wave'],           ['Grafana','grafana','pulse'],
    ['Datadog','datadog','pulse'],          ['Prometheus','prometheus','pulse'],
    ['Sentry','sentry','shield'],           ['PagerDuty','pagerduty','pulse'],
    ['ServiceNow','servicenow','table'],    ['Jira','jira','table'],
    ['Confluence','confluence','table'],    ['Slack','slack','chat'],
    ['GitHub','github','code'],             ['GitLab','gitlab','code'],
    ['Kubernetes','kubernetes','cube'],     ['Terraform','terraform','cube'],
    ['Docker','docker','box'],              ['Notion','notion','table'],
    ['Salesforce','salesforce','cloud'],    ['Kong','kong','gear']
  ];

  /* Gap positions keep the grid from looking like a solid block while
     guaranteeing the corners — including bottom-right — stay filled. */
  const GRID_LAYOUT = {
    10:{ rows:5, gaps:{0:[3,7], 1:[0,5], 2:[2,8], 3:[4,9], 4:[1,6]} },
     8:{ rows:5, gaps:{0:[2,6], 1:[4],   2:[0,7], 3:[3],   4:[5]}   },
     5:{ rows:4, gaps:{} },
     4:{ rows:5, gaps:{} }
  };

  /* ── footer links — edit here any time, nowhere else ─────────
     [ column heading, [ [label, href], … ] ]. href can be a real URL,
     an in-page anchor like '#faq', or '#' as a temporary placeholder —
     change it whenever the real page exists, nothing else to touch. */
  const FOOTER_LINKS = [
    ['Platform', [
      ['Discovery', '#platform'], ['Runtime guardrails', '#platform'],
      ['Policy engine', '#platform'], ['Evidence packs', '#platform']
    ]],
    ['Lifecycle', [
      ['Assess', '#lifecycle'], ['Govern', '#lifecycle'],
      ['Test', '#lifecycle'], ['Monitor', '#lifecycle']
    ]],
    ['Resources', [
      ['Field guides', '#resources'], ['Framework mappings', '#resources'],
      ['FAQ', '#faq'], ['Documentation', '#']
    ]],
    ['Company', [
      ['About', '#'], ['Careers', '#'], ['Contact', '#'], ['Privacy', '#']
    ]]
  ];

  /* ── Platform mega-menu ──────────────────────────────────────
     [ column heading, [ monogram, title, one-line description, comingSoon ] ]
     ───────────────────────────────────────────────────────── */
  /* [title, description, comingSoon, href?] — href is optional and currently
     unset on every item: the menu is presentational until the pages exist. */
  const PLATFORM_MENU = [
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
      ['Cookie & Consent',           'Banner rules, tracker checks',       true ]
    ]],
    ['Vulnerability Scanner', [
      ['Cloud Config Scan',          'IAM, storage, network rules',        false],
      ['Dependency Checks',          'Known CVEs, flagged',                false],
      ['Secret Detection',           'Exposed keys, caught early',         false]
    ]]
  ];

  /* ── connector marquee: two rows, monochrome icons ──────────
     Row content and order exactly as specified. Glyph lookup is
     self-contained (not the old CONNECTORS array) since these render
     as inline SVG, not logo images — the tint must transition on
     hover, which a CDN raster image can't do. ─────────────────── */
  const MARQUEE_ROW_1 = ['OpenAI','Anthropic','Gemini','AWS','Azure','Google Cloud',
                          'Hugging Face','Meta','Mistral','Ollama','Cohere','AI21'];
  const MARQUEE_ROW_2 = ['PostgreSQL','MongoDB','Redis','Snowflake','Grafana','Cloudflare',
                          'Datadog','Prometheus','Okta','Slack','GitHub','GitLab','Jira','Confluence'];
  const MARQUEE_GLYPH = {
    'OpenAI':'spark','Anthropic':'hex','Gemini':'spark','AWS':'cloud','Azure':'cloud','Google Cloud':'cloud',
    'Hugging Face':'box','Meta':'hex','Mistral':'spark','Ollama':'hex','Cohere':'spark','AI21':'hex',
    'PostgreSQL':'db','MongoDB':'db','Redis':'db','Snowflake':'db','Grafana':'pulse','Cloudflare':'shield',
    'Datadog':'pulse','Prometheus':'pulse','Okta':'key','Slack':'chat','GitHub':'code','GitLab':'code',
    'Jira':'table','Confluence':'table'
  };

  /* Real brand marks, pulled from Simple Icons (cdn.simpleicons.org) and tinted
     to a single flat colour via the URL — no separate hover asset to manage,
     the CDN recolours on request. Any slug that 404s (a brand with no usable
     single-colour mark, or a typo here) falls back automatically to the
     geometric glyph above — nothing ever renders blank. */
  const MARQUEE_SLUG = {
    'OpenAI':'openai','Anthropic':'anthropic','Gemini':'googlegemini','AWS':'amazonwebservices',
    'Azure':'microsoftazure','Google Cloud':'googlecloud','Hugging Face':'huggingface','Meta':'meta',
    'Mistral':'mistralai','Ollama':'ollama','Cohere':'cohere',
    'PostgreSQL':'postgresql','MongoDB':'mongodb','Redis':'redis','Snowflake':'snowflake',
    'Grafana':'grafana','Cloudflare':'cloudflare','Datadog':'datadog','Prometheus':'prometheus',
    'Okta':'okta','Slack':'slack','GitHub':'github','GitLab':'gitlab','Jira':'jira','Confluence':'confluence'
    /* 'AI21' intentionally omitted — no reliable single-colour mark available;
       it renders its geometric glyph, which is the correct behaviour here. */
  };

  /* ── framework drawer detail ── */
  const FRAMEWORK_DETAIL = {
    'ISO/IEC 42001': ['AI management system',
      'The management-system standard for AI: policy, objectives, roles, risk treatment and continual improvement.',
      ['Annex A controls mapped to platform evidence','Impact assessment templates',
       'Objectives and roles recorded against owners','Internal audit and review trail']],
    'ISO/IEC 27001': ['Information security',
      'Information security management. Where AI systems touch regulated or personal data, these controls still apply.',
      ['Access control evidence for models and agents','Logging and monitoring hooks',
       'Supplier and third-party records','Change control on model versions']],
    'NIST AI RMF': ['Risk framework',
      'A voluntary framework organised around Govern, Map, Measure and Manage.',
      ['Govern: policy set and approval workflow','Map: inventory, ownership and risk tiering',
       'Measure: drift, refusal and adversarial results','Manage: treatment plans and retest']],
    'EU AI Act': ['Regulation',
      'Obligations scale with risk tier. High-risk systems carry documentation, logging, oversight and accuracy duties.',
      ['Risk classification per system','Technical documentation assembled from the register',
       'Automatic event logging retained','Human oversight recorded at decision points']],
    'OWASP LLM': ['Application risk',
      'The application-security view of LLM systems, listing the categories the red team tests against.',
      ['Prompt injection probes, direct and indirect','Sensitive information disclosure checks',
       'Excessive agency and tool-abuse cases','Findings scored and retested after fix']],
    'MITRE ATLAS': ['Adversary tactics',
      'A knowledge base of real tactics and techniques used against AI systems.',
      ['Attack simulations mapped to ATLAS techniques','Coverage gaps surfaced per system',
       'Detection hooks routed to your SOC','Recurring schedule, not an annual exercise']],
    'AIUC-1': ['Agent certification',
      'A certification standard for AI agents, written so a buyer can hold every vendor’s agent to one bar.',
      ['Agent controls mapped to platform evidence','Each finding tied to the control it affects',
       'Evidence packaged for the certification audit','Re-checked continuously, not only at audit time']]
  };


  /* ── FAQ answers, one array entry per rendered line ── */
  /* Each entry is one answer, split into lines that slide up in sequence —
     the breaks are clause boundaries, not wrapping (the panel wraps on its own). */
  const ANSWERS = [
    ['Inside your own environment. Tahara AI never asks for data to leave your systems,',
     'it runs where the infrastructure already lives, reads only what it’s given permission to see,',
     'and never holds credentials.'],
    ['Tahara AI doesn’t rely on what’s documented, it checks what’s real.',
     'It reads the actual configuration and access records directly,',
     'so anything genuinely running shows up, whether or not it was ever registered or logged.'],
    ['Yes. Tahara AI doesn’t require an agent to be built on it, deployed through it,',
     'or wired into it in any special way. It reads the environment an agent already runs in',
     'so anything live is in scope, regardless of where or how it was built.'],
    ['A gateway sits in front of traffic and a dashboard shows what’s already been reported.',
     'Tahara AI does neither, it independently checks the real system against what’s claimed and what’s documented,',
     'and only marks something resolved once a stakeholder confirms it.',
     'It’s built to catch what a dashboard would just display without question.'],
    ['Tahara AI flags it the moment it’s found, not held for the next scheduled review.',
     'Every violation is logged with a status, an owner,',
     'and a record that stays open until it’s resolved.']
  ];

  return { FEED, STANDARDS, GLYPH, CONNECTORS, GRID_LAYOUT, PLATFORM_MENU, ANSWERS,
           CUSTOMER_BAR, CUSTOMER_SLOTS, CUSTOMERS, FRAMEWORK_DETAIL,
           MARQUEE_ROW_1, MARQUEE_ROW_2, MARQUEE_GLYPH, MARQUEE_SLUG, FOOTER_LINKS };
})();

/* ════════════════════════════════════════════════════════════
   TAHARA AI · assurance stack
   Builds five isometric slabs and drives their three scroll phases.
   ════════════════════════════════════════════════════════════ */
window.TaharaStack = (function(){
  const NS = 'http://www.w3.org/2000/svg';
  const CX = 250, W = 186, H = 91, T = 11, DY = 134, BASE = 650;
  const S = W / 155;               /* every fixed pixel offset below scales with the slab */
  const INK = '#092f68';

  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const P  = (cy, a, b) => [CX + (a - b) * W, cy + (a + b - 1) * H];
  const pts = arr => arr.map(p => p.join(',')).join(' ');
  const mid = (cy, a, b, s) => P(cy, a + s / 2, b + s / 2);

  function box(g, cy, a, b, s, lift, fill){
    const y = cy - lift;
    const top = [P(y,a,b), P(y,a+s,b), P(y,a+s,b+s), P(y,a,b+s)];
    const h = Math.max(7, s * 40) * S;
    g.appendChild(el('polygon',{points:pts([top[3],top[2],[top[2][0],top[2][1]+h],[top[3][0],top[3][1]+h]]),fill:'#d3e0f2',stroke:INK,'stroke-width':.9}));
    g.appendChild(el('polygon',{points:pts([top[1],top[2],[top[2][0],top[2][1]+h],[top[1][0],top[1][1]+h]]),fill:'#e7eef9',stroke:INK,'stroke-width':.9}));
    g.appendChild(el('polygon',{points:pts(top),fill:fill,stroke:INK,'stroke-width':.9}));
  }

  /* layer-specific furniture, bottom (0) to top (4) */
  function furnish(g, cy, i){
    if (i === 0){                                   // enterprise data
      const c = mid(cy,.18,.2,.2);
      g.appendChild(el('ellipse',{cx:c[0],cy:c[1]-22*S,rx:26*S,ry:13*S,fill:'#f4f7fc',stroke:INK,'stroke-width':1}));
      g.appendChild(el('path',{d:`M${c[0]-26*S} ${c[1]-22*S} v${18*S} a${26*S} ${13*S} 0 0 0 ${52*S} 0 v${-18*S}`,fill:'#e7eef9',stroke:INK,'stroke-width':1}));
      g.appendChild(el('ellipse',{cx:c[0],cy:c[1]-4*S,rx:26*S,ry:13*S,fill:'none',stroke:INK,'stroke-width':1,opacity:.6}));
      box(g,cy,.58,.5,.12,4,'#f4f7fc'); box(g,cy,.34,.68,.1,4,'#114086');
    } else if (i === 1){                            // models and tools
      box(g,cy,.16,.30,.14,5,'#f4f7fc'); box(g,cy,.40,.18,.14,5,'#f4f7fc');
      box(g,cy,.60,.46,.14,5,'#062451'); box(g,cy,.30,.60,.14,5,'#f4f7fc');
    } else if (i === 2){                            // agents and orchestration
      const hub = mid(cy,.42,.40,.16), sp = [[.16,.20],[.70,.22],[.22,.70],[.66,.68]];
      sp.forEach(s => { const c = mid(cy,s[0],s[1],.12);
        g.appendChild(el('line',{x1:hub[0],y1:hub[1]-12*S,x2:c[0],y2:c[1]-8*S,stroke:INK,'stroke-width':1,'stroke-dasharray':'3 3',opacity:.7})); });
      sp.forEach(s => { const c = mid(cy,s[0],s[1],.12);
        g.appendChild(el('ellipse',{cx:c[0],cy:c[1]-8*S,rx:13*S,ry:7.5*S,fill:'#f4f7fc',stroke:INK,'stroke-width':1})); });
      g.appendChild(el('ellipse',{cx:hub[0],cy:hub[1]-12*S,rx:19*S,ry:11*S,fill:'#114086',stroke:INK,'stroke-width':1}));
    } else if (i === 3){                            // runtime guardrails
      for (let n = 0; n < 4; n++){
        const a = .12 + n * .2, p1 = P(cy,a,.12), p2 = P(cy,a,.88);
        g.appendChild(el('polygon',{
          points:pts([p1,p2,[p2[0],p2[1]-20*S],[p1[0],p1[1]-20*S]]),
          fill:  n === 2 ? 'rgba(168,104,26,.20)' : 'rgba(17,64,134,.14)',
          stroke:n === 2 ? '#b5651d' : INK, 'stroke-width':1 }));
      }
      box(g,cy,.74,.40,.12,22*S,'#062451');
    } else {                                        // governance and assurance
      box(g,cy,.30,.34,.30,6,'#f4f7fc');
      const c = mid(cy,.30,.34,.30), sy = c[1] - 66*S;
      g.appendChild(el('line',{x1:c[0],y1:c[1]-12*S,x2:c[0],y2:sy+44*S,stroke:INK,'stroke-width':1,'stroke-dasharray':'3 4',opacity:.55}));
      g.appendChild(el('path',{d:`M${c[0]} ${sy-18*S} l${30*S} ${11*S} v${20*S} c0 ${18*S} ${-13*S} ${30*S} ${-30*S} ${35*S} ${-17*S} ${-5*S} ${-30*S} ${-17*S} ${-30*S} ${-35*S} v${-20*S} z`,fill:'#f4f7fc',stroke:INK,'stroke-width':1.6*S}));
      g.appendChild(el('path',{d:`M${c[0]-12*S} ${sy+12*S} l${9*S} ${9*S} ${17*S} ${-19*S}`,fill:'none',stroke:'#114086','stroke-width':2.4*S,'stroke-linecap':'round','stroke-linejoin':'round'}));
    }
  }

  let layers = [];

  function build(svg){
    if (!svg) return [];
    svg.appendChild(el('ellipse',{cx:CX,cy:BASE+112,rx:170,ry:21,fill:'rgba(3,24,56,.07)',class:'shadow'}));

    for (let i = 0; i < 5; i++){
      const cy = BASE - i * DY;
      /* odd layers arrive from the right, even from the left */
      const fromRight = i % 2 === 1;
      const g = el('g', {
        class:'layer',
        'data-layer':String(i),
        style:`--dy:${(i-2)*74}px;--ex:${fromRight ? 780 : -780}px;--rot:${fromRight ? 6 : -6}deg`
      });

      const top = [P(cy,0,0), P(cy,1,0), P(cy,1,1), P(cy,0,1)];
      g.appendChild(el('polygon',{points:pts([top[3],top[2],[top[2][0],top[2][1]+T],[top[3][0],top[3][1]+T]]),class:'slab-side'}));
      g.appendChild(el('polygon',{points:pts([top[1],top[2],[top[2][0],top[2][1]+T],[top[1][0],top[1][1]+T]]),class:'slab-side2'}));
      g.appendChild(el('polygon',{points:pts(top),class:'slab-top'}));

      const gr = el('g',{class:'slab-grid'});
      for (let n = 1; n < 8; n++){
        const a1 = P(cy,n/8,0), a2 = P(cy,n/8,1), b1 = P(cy,0,n/8), b2 = P(cy,1,n/8);
        gr.appendChild(el('line',{x1:a1[0],y1:a1[1],x2:a2[0],y2:a2[1]}));
        gr.appendChild(el('line',{x1:b1[0],y1:b1[1],x2:b2[0],y2:b2[1]}));
      }
      g.appendChild(gr);
      furnish(g, cy, i);

      const e0 = P(cy,1,0);
      g.appendChild(el('line',{x1:e0[0]+7,y1:e0[1],x2:e0[0]+54,y2:e0[1],class:'lead'}));
      const tx = el('text',{x:e0[0]+61,y:e0[1]+4,class:'lead-tx'});
      tx.textContent = '0' + (i + 1);
      g.appendChild(tx);

      svg.appendChild(g);
      layers.push(g);
    }
    return layers;
  }

  /* Entry progress for layer i given overall phase-A progress.

     smootherstep has zero velocity at both ends, so a slab eases out of
     nothing and settles into place rather than starting or stopping
     abruptly. Windows are wide and overlap heavily, so one slab is still
     arriving while the next begins — the five reads as one continuous
     assembly instead of five separate moves. */
  const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);

  function entryOf(p, i){
    const start = i * 0.092, span = 0.215;
    return Math.max(0, Math.min(1, (p - start) / span));
  }
  function entryEased(p, i){
    return smooth(entryOf(p, i));
  }
  /* shared so the merge phase can use the same curve */
  function smoothstep(t){ return smooth(Math.max(0, Math.min(1, t))); }
  function write(i, e){
    if (layers[i]) layers[i].style.setProperty('--e', e.toFixed(4));
  }

  function setEntries(p){
    let allIn = true;
    layers.forEach((g, i) => {
      const e = entryOf(p, i);
      g.style.setProperty('--e', e.toFixed(3));
      if (e < 1) allIn = false;
    });
    return allIn;
  }

  return { build, setEntries, entryOf, entryEased, smoothstep, write, get layers(){ return layers; } };
})();

/* ════════════════════════════════════════════════════════════
   TAHARA AI · interface modules
   ════════════════════════════════════════════════════════════ */
window.TaharaUI = (function(){
  const D = window.TAHARA_DATA;
  const $  = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v,a,b) => v < a ? a : v > b ? b : v;

  /* logo sources, tried in order */
  const LOCAL = slug => 'assets/logos/' + slug + '.svg';
  const CDN   = slug => 'https://cdn.simpleicons.org/' + slug + '/1f5238';

  /* ── mobile navigation ── */
  function nav(){
    const toggle = $('#navToggle'), links = $('#navLinks');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;
      if (a.id === 'megaBtn') return;      /* that one opens the mega-menu */
      if (a.id === 'resBtn')  return;      /* and that one opens the resources dropdown */
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    });
  }

  /* ── platform mega-menu ─────────────────────────────────────
     Opens on hover with intent on pointer devices, on tap or Enter
     everywhere. Closes on outside click, Escape, a real scroll, or
     when the pointer leaves the header and panel together.
     ───────────────────────────────────────────────────────── */
  function mega(langData){
    const btn   = $('#megaBtn');
    const panel = $('#mega');
    const card  = panel && panel.querySelector('.mega-card');
    const inner = $('#megaInner');
    const demo  = inner && inner.querySelector('.mega-demo');
    const scrim = $('#megaScrim');
    const header = $('#siteHeader');
    if (!btn || !panel || !inner) return;

    /* rebuilding the columns (English on boot, or Arabic on a language
       switch) never touches the open/close behaviour below — that's
       wired once, guarded by mega._wired, so a rebuild can't double-bind
       the same listeners */
    inner.querySelectorAll('.mega-col').forEach(c => c.remove());
    const source = langData || D.PLATFORM_MENU;
    source.forEach(([heading, items], c) => {
      const col = document.createElement('div');
      col.className = 'mega-col';
      col.style.setProperty('--c', c);
      const h = document.createElement('div');
      h.className = 'mega-h';
      h.textContent = heading;
      col.appendChild(h);
      /* the AR menu sets the same `soon` flag, so the badge follows the locale */
      const soonTxt = window.TaharaI18N && window.TaharaI18N.current === 'ar' ? 'قريبًا' : 'Coming soon';
      items.forEach(([title, desc, soon, href]) => {
        const a = document.createElement('a');
        a.className = 'mega-item';
        a.href = href || '#platform';
        a.innerHTML =
          '<span><b>' + title + (soon ? ' <i class="soon">' + soonTxt + '</i>' : '') + '</b>' +
          '<span class="d">' + desc + '</span></span>';
        col.appendChild(a);
      });
      inner.insertBefore(col, demo || null);
    });
    if (panel.classList.contains('open')){
      panel.classList.remove('lit');
      requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('lit')));
    }
    if (mega._wired) return;
    mega._wired = true;

    const links  = $('#navLinks');
    const toggle = $('#navToggle');
    let open = false, hideT = 0, openedAt = 0;

    /* Cap the panel to the room left under the header. Measured off the
       header, not the panel — the panel carries a translate while closed,
       which would report a top 12px too high. */
    function fit(){
      const top = header.getBoundingClientRect().bottom;
      const h = Math.max(220, innerHeight - top - 18) + 'px';
      if (card) card.style.maxHeight = h; else panel.style.maxHeight = h;
    }
    addEventListener('resize', () => { if (open) fit(); });

    function set(v){
      if (open === v) return;
      open = v;
      if (v) document.dispatchEvent(new CustomEvent('tahara:menu-open', { detail:'platform' }));
      if (v) fit();
      panel.classList.toggle('open', v);
      /* Let the panel render one frame before the columns animate — an
         animation started on the frame an element becomes visible can be
         dropped. The timeout is a safety net: if rAF is starved the menu
         must still become readable, so it never depends on a frame landing. */
      if (v){
        const light = () => { if (open) panel.classList.add('lit'); };
        requestAnimationFrame(() => requestAnimationFrame(light));
        setTimeout(light, 120);
      } else {
        panel.classList.remove('lit');
      }
      scrim && scrim.classList.toggle('on', v);
      btn.setAttribute('aria-expanded', String(v));
      if (v){
        openedAt = scrollY || 0;
        /* on small screens the panel and the burger list share the same
           slot under the header, so they take turns rather than stack */
        if (innerWidth <= 860 && links){
          links.classList.remove('open');
          toggle && toggle.setAttribute('aria-expanded', 'false');
        }
      }
    }
    /* opening the burger list closes the panel */
    toggle && toggle.addEventListener('click', () => set(false));
    /* only one header menu open at a time — close if another one opened */
    document.addEventListener('tahara:menu-open', e => { if (e.detail !== 'platform') set(false); });

    btn.addEventListener('click', e => { e.preventDefault(); set(!open); });
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); set(!open); }
    });

    if (matchMedia('(hover:hover) and (pointer:fine)').matches && innerWidth > 860){
      const show = () => { clearTimeout(hideT); set(true); };
      const hide = () => { clearTimeout(hideT); hideT = setTimeout(() => set(false), 220); };
      btn.addEventListener('mouseenter', show);
      panel.addEventListener('mouseenter', () => clearTimeout(hideT));
      header.addEventListener('mouseleave', hide);
      panel.addEventListener('mouseleave', hide);
    }

    panel.addEventListener('click', e => { if (e.target.closest('.mega-item')) set(false); });
    scrim && scrim.addEventListener('click', () => set(false));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open){ set(false); btn.focus(); }
    });
    document.addEventListener('click', e => {
      if (open && !panel.contains(e.target) && !btn.contains(e.target)) set(false);
    });
    addEventListener('scroll', () => {
      if (open && Math.abs((scrollY || 0) - openedAt) > 60) set(false);
    }, { passive:true });
  }

  /* ── customer proof bar ── */
  function proof(){
    const row = $('#proofRow'), band = $('#proof');
    if (!row || !band) return;
    if (D.CUSTOMER_BAR === 'off' ||
       (D.CUSTOMER_BAR === 'auto' && !D.CUSTOMERS.length && location.hostname &&
        location.hostname !== 'localhost' && location.hostname !== '127.0.0.1' &&
        !location.hostname.startsWith('192.168.'))){
      band.remove();          /* never ship empty slots to a real host */
      return;
    }
    if (D.CUSTOMERS.length){
      D.CUSTOMERS.forEach(([name, file], i) => {
        const img = document.createElement('img');
        img.className = 'proof-logo';
        img.src = 'assets/logos/customers/' + file;
        img.alt = name;
        img.loading = 'lazy';
        img.style.setProperty('--i', i);
        row.appendChild(img);
      });
    } else {
      for (let i = 0; i < D.CUSTOMER_SLOTS; i++){
        const slot = document.createElement('div');
        slot.className = 'proof-slot';
        slot.style.setProperty('--i', i);
        slot.textContent = 'Logo';
        row.appendChild(slot);
      }
    }
  }

  /* ── footer links, built from FOOTER_LINKS in data.js ─────────
     The marker is replaced by real sibling <div>s — not wrapped —
     so the footer's 5-column CSS grid (brand + 4 columns) still sees
     five direct children, exactly as before. ───────────────────── */
  function footer(langData){
    const grid = $('.foot-grid');
    if (!grid) return;
    const marker = $('#footCols');
    const source = langData || D.FOOTER_LINKS;

    if (marker){
      /* first run: replace the marker with real sibling columns so the
         footer's 5-column CSS grid still sees five direct children */
      const parent = marker.parentNode;
      source.forEach(([heading, links]) => {
        parent.insertBefore(buildFootCol(heading, links), marker);
      });
      marker.remove();
    } else {
      /* language switch: the marker is long gone, so swap the existing
         columns in place — brand column (first child) stays untouched */
      const old = [...grid.children].slice(1);
      source.forEach((entry, i) => {
        const [heading, links] = entry;
        const fresh = buildFootCol(heading, links);
        if (old[i]) grid.replaceChild(fresh, old[i]);
        else grid.appendChild(fresh);
      });
    }
  }
  function buildFootCol(heading, links){
    const col = document.createElement('div');
    const h5 = document.createElement('h5');
    h5.textContent = heading;
    col.appendChild(h5);
    const ul = document.createElement('ul');
    links.forEach(([label, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.appendChild(a);
      ul.appendChild(li);
    });
    col.appendChild(ul);
    return col;
  }

  /* ── FAQ extras: most-asked flag, was-this-helpful ── */
  function faqExtras(){
    const btns = $$('.q-item');
    btns.slice(0, 2).forEach(b => {
      const tag = document.createElement('span');
      tag.className = 'most';
      tag.setAttribute('data-i18n', 'faq.mostasked');
      tag.textContent = 'Most asked';
      b.querySelector('span:nth-child(2)').appendChild(tag);
    });
    const foot = $('.q-foot');
    if (!foot) return;
    const box = document.createElement('div');
    box.className = 'helpful';
    box.innerHTML =
      '<span data-i18n="faq.helpful">Was this helpful?</span>' +
      '<button class="vote" data-v="up" aria-label="Yes, helpful">' +
        '<svg viewBox="0 0 16 16"><path d="M5 14V7l3.4-5c.9 0 1.6.8 1.4 1.7L9.3 6h3.3c.9 0 1.6.9 1.4 1.8l-1 4.6c-.2.9-.9 1.6-1.8 1.6Z"/><path d="M5 7H2.6v7H5"/></svg>' +
      '</button>' +
      '<button class="vote" data-v="down" aria-label="No, not helpful">' +
        '<svg viewBox="0 0 16 16"><path d="M11 2v7l-3.4 5c-.9 0-1.6-.8-1.4-1.7L6.7 10H3.4c-.9 0-1.6-.9-1.4-1.8l1-4.6C3.2 2.7 3.9 2 4.8 2Z"/><path d="M11 9h2.4V2H11"/></svg>' +
      '</button>';
    foot.parentNode.insertBefore(box, foot);
    box.addEventListener('click', e => {
      const v = e.target.closest('.vote');
      if (!v || box.classList.contains('done')) return;
      v.classList.add('hit');
      box.classList.add('done');
      const span = box.querySelector('span');
      span.setAttribute('data-i18n', 'faq.thanks');
      span.textContent = window.TaharaI18N && window.TaharaI18N.current === 'ar' ? 'شكرًا، تم التسجيل.' : 'Thanks, noted.';
      /* wire this to your endpoint when the form backend exists */
    });
  }

  /* ── click ripple on every button ── */
  function ripple(){
    if (REDUCE) return;
    document.addEventListener('pointerdown', e => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const el = document.createElement('span');
      el.className = 'ripple';
      el.style.width = el.style.height = size + 'px';
      el.style.left = (e.clientX - r.left) + 'px';
      el.style.top  = (e.clientY - r.top) + 'px';
      btn.appendChild(el);
      setTimeout(() => el.remove(), 650);
    });
  }

  /* ── standards marquee ── */
  function marquee(){
    const mq = $('#marquee');
    if (!mq) return;
    const track = () => {
      const t = document.createElement('div');
      t.className = 'mq-track';
      D.STANDARDS.forEach(s => {
        const i = document.createElement('span');
        i.className = 'mq-item';
        i.innerHTML = '<i></i>' + s;
        t.appendChild(i);
      });
      return t;
    };
    mq.appendChild(track());
    mq.appendChild(track());
  }

  /* ── live decision feed ── */
  function feed(consoleEl){
    const list = $('#feedList');
    if (!list) return;
    let cursor = 0;
    const clock = new Date();
    clock.setHours(10, 42, 7, 0);
    const stamp = () => {
      const s = clock.toTimeString().slice(0,8);
      clock.setSeconds(clock.getSeconds() + 11 + Math.floor(Math.random() * 26));
      return s;
    };
    const row = (d, fresh) => {
      const e = document.createElement('div');
      e.className = 'feed-row' + (fresh ? ' fresh' : '');
      e.innerHTML = '<span class="t">' + stamp() + '</span><span class="m">' + d[0] +
                    '</span><span class="chip ' + d[1] + '">' + d[2] + '</span>';
      return e;
    };
    for (let i = 0; i < 4; i++) list.appendChild(row(D.FEED[cursor++ % D.FEED.length], false));
    if (REDUCE) return;
    setInterval(() => {
      if (document.hidden || !consoleEl.classList.contains('lit')) return;
      const r = list.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      list.insertBefore(row(D.FEED[cursor++ % D.FEED.length], true), list.firstChild);
      const last = list.lastElementChild;
      last.classList.add('leaving');
      setTimeout(() => last.remove(), 450);
    }, 3400);
  }

  /* ── metric counters ── */
  function counters(){
    $$('.tile .v[data-count]').forEach((el, k) => {
      const target = +el.dataset.count, t0 = performance.now() + k * 110, dur = 1250;
      (function tick(now){
        const p = clamp((now - t0) / dur, 0, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
    });
  }
  function countersInstant(){
    $$('.tile .v[data-count]').forEach(e => e.textContent = (+e.dataset.count).toLocaleString('en-US'));
  }

  /* ── connector grid ─────────────────────────────────────────
     Cells are laid out on an explicit column count so the gaps
     can be placed deliberately — every corner stays filled.
     ───────────────────────────────────────────────────────── */
  function colsNow(){
    const w = innerWidth;
    if (w <= 560) return 4;
    if (w <= 860) return 5;
    if (w <= 1100) return 8;
    return 10;
  }

  function logoNode(label, slug, glyph, variant){
    const cls = variant === 'orb' ? '' : 'integ-logo';
    const img = document.createElement('img');
    if (cls) img.className = cls;
    img.alt = label;
    img.loading = 'lazy';
    img.decoding = 'async';
    const useLocal = (window.TAHARA_CONFIG || {}).logoSource === 'local';
    img.dataset.stage = useLocal ? 'local' : 'cdn';
    img.src = useLocal ? LOCAL(slug) : CDN(slug);
    img.addEventListener('error', function onErr(){
      if (img.dataset.stage === 'local'){
        img.dataset.stage = 'cdn';
        img.src = CDN(slug);
        return;
      }
      img.removeEventListener('error', onErr);
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 24 24');
      svg.setAttribute('aria-hidden','true');
      if (cls) svg.setAttribute('class', cls);
      svg.innerHTML = D.GLYPH[glyph] || D.GLYPH.hex;
      img.replaceWith(svg);
    });
    return img;
  }

  let gridCols = 0;
  function connectors(force){
    const grid = $('#integGrid');
    if (!grid) return;
    const cols = colsNow();
    if (cols === gridCols && !force) return;
    gridCols = cols;
    grid.innerHTML = '';

    const layout = D.GRID_LAYOUT[cols] || { rows:5, gaps:{} };
    const rows = layout.rows;
    let k = 0;

    for (let r = 0; r < rows; r++){
      const gaps = layout.gaps[r] || [];
      for (let c = 0; c < cols; c++){
        const cell = document.createElement('div');
        cell.className = 'integ-cell';
        if (gaps.indexOf(c) !== -1){
          cell.classList.add('void');
        } else {
          const [label, slug, glyph] = D.CONNECTORS[k++ % D.CONNECTORS.length];
          cell.appendChild(logoNode(label, slug, glyph));
          const b = document.createElement('b');
          b.textContent = label;
          cell.appendChild(b);
        }
        /* wave-in delay: distance from the centre of the grid */
        const d = Math.hypot(c - (cols - 1) / 2, (r - (rows - 1) / 2) * 1.6);
        cell.style.setProperty('--d', Math.round(d * 1.6));
        grid.appendChild(cell);
      }
    }

    if (REDUCE) return;
    const lit = [...grid.querySelectorAll('.integ-cell:not(.void)')];
    clearInterval(connectors._t);
    connectors._t = setInterval(() => {
      if (document.hidden || !lit.length) return;
      const c = lit[Math.floor(Math.random() * lit.length)];
      c.classList.add('flash');
      setTimeout(() => c.classList.remove('flash'), 900);
    }, 620);
  }

  /* ── FAQ: question index + answer panel ── */
  function faq(langData){
    const index = $('#qIndex'), answer = $('#qAnswer'), label = $('#qLabel'), slide = $('#qSlide');
    if (!index) return;
    const btns = $$('.q-item');
    let activeAnswers = langData || D.ANSWERS;

    function show(i){
      if (i < 0 || i >= btns.length) return;
      btns.forEach(b => {
        const on = +b.dataset.q === i;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', String(on));
      });
      requestAnimationFrame(() => {
        const r = btns[i].getBoundingClientRect(), pr = index.getBoundingClientRect();
        slide.style.top = (r.top - pr.top) + 'px';
        slide.style.height = r.height + 'px';
      });
      const ar = window.TaharaI18N && window.TaharaI18N.current === 'ar';
      /* pad rather than prefixing a literal '0' — past nine that read "Answer · 010" */
      label.textContent = (ar ? 'الإجابة · ' : 'Answer · ') + String(i + 1).padStart(2, '0');
      answer.classList.remove('show');
      answer.innerHTML = activeAnswers[i]
        .map((l, j) => '<span class="ln"><i style="--li:' + j + '">' + l + '</i></span>').join('');
      void answer.offsetWidth;
      answer.classList.add('show');
    }
    faq.reflow = () => show(Math.max(0, btns.findIndex(x => x.classList.contains('on'))));

    if (faq._wired){
      /* language switch: just repaint whichever answer is currently open
         with the new language's text — listeners stay exactly as they were */
      activeAnswers = langData || D.ANSWERS;
      faq.reflow();
      return;
    }
    faq._wired = true;
    index.setAttribute('role','tablist');
    btns.forEach(b => b.setAttribute('role','tab'));

    btns.forEach(b => {
      b.addEventListener('click', () => show(+b.dataset.q));
      b.addEventListener('keydown', e => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const n = (+b.dataset.q + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length;
        btns[n].focus(); show(n);
      });
    });
    show(0);
  }

  /* ── pointer micro-interactions ── */
  function pointer(){
    if (REDUCE || !matchMedia('(hover:hover)').matches) return;
    $$('.rec, .res-card, .dossier-body').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    $$('[data-mag]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform =
          'translate(' + (((e.clientX - r.left - r.width/2) / r.width) * 7).toFixed(2) + 'px,' +
                         (((e.clientY - r.top - r.height/2) / r.height) * 5).toFixed(2) + 'px)';
        b.style.setProperty('--bx', (e.clientX - r.left) + 'px');
        b.style.setProperty('--by', (e.clientY - r.top) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ── platform video chapters (decorative — no video wired yet) ── */
  function pvideo(){
    const chips = $$('.pv-chip'), time = $('.pv-time');
    if (!chips.length) return;
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.classList.toggle('on', x === c));
      if (time) time.textContent = c.querySelector('.pv-t').textContent;
    }));
  }

  return { nav, mega, proof, marquee, feed, counters, countersInstant, connectors,
           faq, faqExtras, ripple, pointer, logoNode, footer, pvideo, REDUCE };
})();

/* ════════════════════════════════════════════════════════════
   TAHARA AI · connector marquee
   Two rows built from MARQUEE_ROW_1 / MARQUEE_ROW_2 in data.js, each
   duplicated exactly once (not three times — see note below) so the
   CSS translateX(-50%) loop lands seamlessly with no visible seam
   and no jump.

   Icons are real brand marks pulled from Simple Icons and tinted to a
   flat colour via the CDN URL. Hover recolours by crossfading to a
   second, differently-tinted image rather than restyling a vector —
   a raster logo can't retint the way an inline SVG can, so both
   colour states are fetched up front and swapped with opacity.
   ════════════════════════════════════════════════════════════ */
window.TaharaMarquee2 = (function(){
  const D = window.TAHARA_DATA;

  /* Full-colour marks, three deep: a local brand file if we have one, else the
     Simple Icons mark in the brand's own colour (requesting no colour suffix
     returns the official hex), else the geometric glyph. Sources mix freely,
     so the local set can be filled in one brand at a time — a local file always
     wins, which is what makes a true multi-colour mark worth adding.
     'local' | 'cdn' — 'cdn' skips straight to the CDN for every brand. */
  const LOGO_SOURCE = 'local';
  const cdnUrl   = slug => 'https://cdn.simpleicons.org/' + slug;
  const localUrl = slug => '/logos/' + slug + '.svg';

  /* Why exactly 2x, not 3x: the loop keyframe animates the track from
     translateX(0) to translateX(-50%). For that to be seamless, -50%
     must land exactly on the boundary between one full copy of the
     content and the next — which is true only when the track holds
     precisely two copies. Three copies would have the animation stop
     a third of the way into the third copy, producing a visible skip
     back on every loop. Two is not a minimum to round up from — it's
     the exact number the -50% math requires. */

  function glyphFallback(el, glyph){
    const markup = D.GLYPH[glyph] || D.GLYPH.hex;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = markup;
    el.insertBefore(svg, el.firstChild);
  }

  function chip(name){
    const glyph = D.MARQUEE_GLYPH[name] || 'hex';
    const slug = D.MARQUEE_SLUG[name];
    const el = document.createElement('div');
    el.className = 'mchip';
    el.tabIndex = 0;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', name);

    if (slug){
      const base = document.createElement('img');
      base.className = 'mlogo base';
      base.decoding = 'async';
      base.alt = name;

      /* last resort: no mark at this slug anywhere, draw the geometric glyph */
      const useGlyph = () => { base.remove(); glyphFallback(el, glyph); };

      if (LOGO_SOURCE === 'local'){
        base.addEventListener('error', () => {
          base.addEventListener('error', useGlyph, { once: true });
          base.src = cdnUrl(slug);
        }, { once: true });
        base.src = localUrl(slug);
      } else {
        base.addEventListener('error', useGlyph, { once: true });
        base.src = cdnUrl(slug);
      }

      el.appendChild(base);
    } else {
      glyphFallback(el, glyph);
    }

    const tip = document.createElement('span');
    tip.className = 'tip';
    tip.textContent = name;
    el.appendChild(tip);
    return el;
  }

  function buildRow(trackId, names){
    const track = document.getElementById(trackId);
    if (!track || !names) return;
    names.concat(names).forEach(name => track.appendChild(chip(name)));
  }

  function init(){
    buildRow('marqTrack1', D.MARQUEE_ROW_1);
    buildRow('marqTrack2', D.MARQUEE_ROW_2);
  }

  return { init };
})();

/* ════════════════════════════════════════════════════════════
   TAHARA AI · framework drawer
   Clicking a seal opens the mapping detail. Focus is moved into the
   panel and returned to the seal on close.
   ════════════════════════════════════════════════════════════ */
window.TaharaDrawer = (function(){
  const D = window.TAHARA_DATA;
  const $  = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let activeDetail = D.FRAMEWORK_DETAIL;
  let currentName = null;
  let repaint = null;

  function init(){
    const drawer = $('#drawer'), scrim = $('#drawerScrim'), close = $('#drawerX');
    const kind = $('#drawerKind'), title = $('#drawerTitle');
    const lede = $('#drawerLede'), list = $('#drawerList');
    if (!drawer) return;

    let opener = null;

    function paint(name){
      const detail = activeDetail[name];
      if (!detail) return;
      currentName = name;
      kind.textContent  = detail[0];
      title.textContent = name;   /* standard names stay in Latin script by design */
      lede.textContent  = detail[1];
      list.innerHTML = detail[2].map((line, i) =>
        '<li style="--i:' + i + '">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.4 8.4 6.6 11.6 12.8 4.8"/></svg>' +
        line + '</li>').join('');
    }
    repaint = () => { if (currentName) paint(currentName); };

    function open(name, from){
      if (!activeDetail[name]) return;
      opener = from || null;
      paint(name);
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      scrim.classList.add('on');
      close.focus();
    }

    function shut(){
      if (!drawer.classList.contains('open')) return;
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      scrim.classList.remove('on');
      if (opener){ opener.focus(); opener = null; }
    }

    $$('.seal').forEach(seal => {
      const name = seal.querySelector('.v').textContent.trim();
      /* A seal with no mapping detail has nothing to open — open() would bail
         silently, so leave it inert rather than advertising a dead click. */
      if (!activeDetail[name]){ seal.classList.add('seal-inert'); return; }
      seal.setAttribute('role', 'button');
      seal.tabIndex = 0;
      seal.setAttribute('aria-label', name + ', open mapping detail');
      seal.addEventListener('click', () => open(name, seal));
      seal.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(name, seal); }
      });
    });

    close.addEventListener('click', shut);
    scrim.addEventListener('click', shut);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });

    /* keep tabbing inside the panel while it is open */
    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = [...drawer.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
  }

  return {
    init,
    setLocale(detailMap){
      activeDetail = detailMap || D.FRAMEWORK_DETAIL;
      if (repaint) repaint();
    }
  };
})();

/* ════════════════════════════════════════════════════════════
   TAHARA AI · language switcher (EN / AR)

   Scope of this pass, agreed before building:
     · full text translation + document direction (dir=rtl) for all
       real content — nav, hero, section copy, cards, FAQ, footer
     · decorative motion (3D lattice, marquee scroll, radar sweep,
       isometric stack fly-in) is left exactly as-is — it has no
       reading direction, so mirroring it would be motion for its
       own sake rather than a translation of anything
     · standard/framework names (ISO/IEC 42001, OWASP LLM Top 10)
       and connector/brand names (Slack, GitHub, OpenAI…) stay in
       English/Latin script — normal practice in enterprise software
     · the Arabic text below is an AI-drafted first pass. Treat it as
       a strong draft, not final copy — have a native speaker review
       it before this goes in front of real customers, particularly
       the compliance/legal terminology.
   ════════════════════════════════════════════════════════════ */
window.TaharaI18N = (function(){
  const STORE_KEY = 'tahara-lang';
  const ARABIC_FONT_ID = 'tahara-ar-font';
  const ARABIC_FONT_HREF =
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';

  /* ── flat dictionary for every data-i18n tagged element ── */
  const I18N = {
    'nav.platform':   { en:'Platform',  ar:'المنصة' },
    'nav.lifecycle':  { en:'Lifecycle', ar:'دورة الحياة' },
    'nav.architecture':{ en:'Architecture', ar:'البنية' },
    'nav.resources':  { en:'Resources', ar:'الموارد' },
    'nav.faq':        { en:'FAQ', ar:'الأسئلة الشائعة' },

    'res.tc.t': { en:'Trust center', ar:'مركز الثقة' },
    'res.tc.d': { en:'Our own posture, public', ar:'وضعنا الأمني الخاص، بشكل علني' },
    'res.bl.t': { en:'Blog', ar:'المدوّنة' },
    'res.bl.d': { en:'Notes on AI assurance', ar:'ملاحظات حول ضمان الذكاء الاصطناعي' },
    'res.dc.t': { en:'Documentation', ar:'التوثيق' },
    'res.dc.d': { en:'API and integration guides', ar:'أدلة الواجهة البرمجية والتكامل' },
    'nav.signin':     { en:'Sign in', ar:'تسجيل الدخول' },
    'nav.signup':     { en:'Sign up', ar:'إنشاء حساب' },

    'cta.demo':    { en:'Request a demo', ar:'اطلب عرضًا توضيحيًا' },
    'cta.explore': { en:'Explore platform', ar:'استكشف المنصة' },
    'cta.seehow':  { en:'See how it works', ar:'شاهد كيف يعمل' },
    'cta.browse':  { en:'Browse connectors', ar:'تصفح الموصلات' },
    'cta.askteam': { en:'Ask our team', ar:'اسأل فريقنا' },
    'cta.talkeng': { en:'Talk to an engineer', ar:'تحدث مع مهندس' },
    'cta.title':   { en:'Put your AI under control.', ar:'ضع الذكاء الاصطناعي لديك تحت السيطرة.' },
    'cta.body':    { en:'Thirty minutes on your own estate: what we would find, and what we would block.',
                     ar:'ثلاثون دقيقة على بيئتك الخاصة: ما الذي سنكتشفه، وما الذي سنمنعه.' },

    'ribbon.tag':  { en:'Free', ar:'مجاني' },
    'ribbon.text': { en:'Run an AI surface check on your endpoint', ar:'شغّل فحص سطح الذكاء الاصطناعي على نقطتك الطرفية' },
    'surface.kicker': { en:'Surface check', ar:'فحص السطح' },
    'surface.title':  { en:'See what your AI exposes', ar:'اطّلع على ما يكشفه ذكاؤك الاصطناعي' },
    'surface.desc':   { en:'Point us at a public endpoint. We map the models, agents and prompts behind it, then rank what an attacker would reach for first.',
                        ar:'وجِّهنا إلى نقطة طرفية عامة. نرسم النماذج والوكلاء والطلبات خلفها، ثم نرتّب ما قد يستهدفه المهاجم أولًا.' },
    'surface.cta':    { en:'Run check', ar:'شغّل الفحص' },
    'surface.note':   { en:'Illustrative preview. Nothing is sent from your browser.', ar:'معاينة توضيحية. لا يُرسَل شيء من متصفحك.' },

    'hero.title': { en:'Know what your AI did, and <span class="accent">prove it</span>.',
                    ar:'اعرف ما فعله ذكاؤك الاصطناعي، و<span class="accent">أثبت ذلك</span>.' },
    'hero.built': { en:'Know what your AI did, and', ar:'اعرف ما فعله ذكاؤك الاصطناعي، و' },
    'hero.lede': { en:'Discovery, live enforcement and audit-ready evidence.',
                   ar:'الاكتشاف والإنفاذ الحي وأدلة جاهزة للتدقيق.' },
    'hero.note': { en:'Runs in your tenancy. Nothing leaves your boundary.',
                   ar:'يعمل داخل بيئتك الخاصة. لا شيء يغادر حدودك.' },

    'eyebrow.platform':    { en:'The platform', ar:'المنصة' },
    'eyebrow.whatwedo':    { en:'What we do', ar:'ما الذي نقوم به' },
    'eyebrow.architecture':{ en:'Architecture', ar:'البنية' },
    'eyebrow.alignment':   { en:'Alignment', ar:'التوافق' },
    'eyebrow.answers':     { en:'Answers', ar:'الإجابات' },

    'stmt.title': { en:'Complete enterprise AI management.',
                    ar:'إدارة متكاملة للذكاء الاصطناعي في المؤسسات.' },
    'stmt.desc':  { en:'The layers every enterprise builds to adopt AI with confidence, from data foundation to governed transformation.',
                    ar:'الطبقات التي تبنيها كل مؤسسة لتبنّي الذكاء الاصطناعي بثقة، من أساس البيانات إلى التحوّل المحكوم.' },

    'platform.title': { en:'One record of truth.',
                        ar:'سجل حقيقة واحد.' },
    'platform.lede':  { en:'Discovery, enforcement and evidence on one timeline.',
                        ar:'الاكتشاف والإنفاذ والأدلة على جدول زمني واحد.' },

    'rec.discovery.title': { en:'Find the AI nobody registered.', ar:'اعثر على الذكاء الاصطناعي الذي لم يسجّله أحد.' },
    'rec.discovery.desc':  { en:'Every model, agent, MCP server and key is mapped, owned and risk-tiered, then probed the way an attacker would.',
                             ar:'كل نموذج ووكيل وخادم MCP ومفتاح مُخطَّط ومملوك ومصنَّف حسب المخاطر، ثم مختبَر بالطريقة التي يتّبعها مهاجم.' },
    'rec.runtime.title':   { en:'Stop unsafe calls while they run.', ar:'أوقف الاستدعاءات غير الآمنة أثناء تشغيلها.' },
    'rec.runtime.desc':    { en:'Allow, redact, escalate or block before the model ever sees it.',
                             ar:'السماح أو التنقيح أو التصعيد أو الحظر قبل أن يصل الأمر إلى النموذج أصلًا.' },
    'rec.evidence.title':  { en:'Evidence an auditor can read alone.', ar:'أدلة يمكن للمدقق قراءتها بمفرده.' },
    'rec.evidence.desc':   { en:'Append-only log, packaged against the control it satisfies.',
                             ar:'سجلّ إلحاقي فقط، مُجهَّز مقابل الضابط الذي يستوفيه.' },

    'lifecycle.title': { en:'Cover the whole life of a model.', ar:'تغطية دورة حياة النموذج بأكملها.' },
    'lifecycle.lede':  { en:'Four stages, one engagement, each handing the next its evidence.',
                         ar:'أربع مراحل، تكليف واحد، وكل مرحلة تسلّم التالية أدلتها.' },

    'dossier.assess.title':  { en:'Risk assessment and treatment', ar:'تقييم المخاطر ومعالجتها' },
    'dossier.assess.b1': { en:'Risk tiering for models and agents', ar:'تصنيف المخاطر للنماذج والوكلاء' },
    'dossier.assess.b2': { en:'Bias, robustness and privacy tests', ar:'اختبارات التحيّز والمتانة والخصوصية' },
    'dossier.assess.cta':{ en:'See the method', ar:'اطّلع على المنهجية' },

    'dossier.govern.title':  { en:'Governance system', ar:'نظام الحوكمة' },
    'dossier.govern.b1': { en:'Policy set aligned to ISO/IEC 42001', ar:'مجموعة سياسات متوافقة مع ISO/IEC 42001' },
    'dossier.govern.b2': { en:'Approvals with evidence attached', ar:'موافقات مرفق بها الأدلة' },
    'dossier.govern.cta':{ en:'See the framework', ar:'اطّلع على الإطار' },

    'dossier.test.title':    { en:'Adversarial testing', ar:'الاختبار العداءي' },
    'dossier.test.b1': { en:'Jailbreak sets mapped to OWASP LLM Top 10', ar:'مجموعات اختراق مطابقة لقائمة OWASP LLM Top 10' },
    'dossier.test.b2': { en:'Tool-chain and agent abuse cases', ar:'حالات إساءة استخدام سلسلة الأدوات والوكلاء' },
    'dossier.test.cta':{ en:'See the test set', ar:'اطّلع على مجموعة الاختبار' },

    'dossier.monitor.title': { en:'Continuous monitoring', ar:'المراقبة المستمرة' },
    'dossier.monitor.b1': { en:'Drift, refusal and grounding failures', ar:'الانحراف والرفض وإخفاقات الإسناد الواقعي' },
    'dossier.monitor.b2': { en:'Policy hits and overrides', ar:'مطابقات السياسات وتجاوزاتها' },
    'dossier.monitor.cta':{ en:'See the signals', ar:'اطّلع على المؤشرات' },

    'stack.title': { en:'Assurance runs the full depth of the stack.', ar:'يعمل الضمان عبر العمق الكامل للمنظومة.' },
    'stack.lede':  { en:'A guardrail at one layer is easy to walk around. Tahara instruments five, then reads them as one.',
                     ar:'يسهل الالتفاف حول حاجز حماية في طبقة واحدة. تُجهّز Tahara خمس طبقات، ثم تقرأها ككيان واحد.' },
    'stack.assembling': { en:'Assembling 05 layers', ar:'تجميع 05 طبقات' },
    'stack.item5.title': { en:'Governance and assurance', ar:'الحوكمة والضمان' },
    'stack.item5.desc':  { en:'Policy, approvals, risk register, evidence pack.', ar:'السياسات والموافقات وسجل المخاطر وحزمة الأدلة.' },
    'stack.item4.title': { en:'Runtime guardrails', ar:'حواجز الحماية أثناء التشغيل' },
    'stack.item4.desc':  { en:'Inline checks on prompts, responses and tool calls.', ar:'فحوصات مباشرة على الطلبات والردود واستدعاءات الأدوات.' },
    'stack.item3.title': { en:'Agents and orchestration', ar:'الوكلاء والتنسيق' },
    'stack.item3.desc':  { en:'Identity, scope and spend limits per agent.', ar:'الهوية والنطاق وحدود الإنفاق لكل وكيل.' },
    'stack.item2.title': { en:'Models and tools', ar:'النماذج والأدوات' },
    'stack.item2.desc':  { en:'Approved catalogue: versions, prompts, connectors.', ar:'كتالوج معتمد: الإصدارات والطلبات والموصلات.' },
    'stack.item1.title': { en:'Enterprise data', ar:'بيانات المؤسسة' },
    'stack.item1.desc':  { en:'Classification and lineage for what gets retrieved.', ar:'التصنيف ومصدر البيانات لكل ما يُسترجَع.' },
    'mark.assurance': { en:'Assurance', ar:'ضمان' },

    'principles.title':      { en:'Built for the way AI actually reaches production.', ar:'مصمَّم للطريقة الفعلية التي يصل بها الذكاء الاصطناعي إلى الإنتاج.' },
    'principles.col1.title': { en:'Adoption outruns change control.', ar:'التبنّي يتجاوز ضبط التغيير.' },
    'principles.col1.body': { en:'Teams ship an agent in an afternoon. Tahara notices, then brings it into scope.',
                              ar:'تُطلق الفرق وكيلًا في غضون ساعات. تلاحظ Tahara ذلك، ثم تُدرجه ضمن النطاق.' },
    'principles.col2.title': { en:'Security and audit read one signal.', ar:'الأمن والتدقيق يقرآن إشارة واحدة.' },
    'principles.col2.body': { en:'One stream serves the block decision and the evidence record.',
                              ar:'مصدر واحد يخدم قرار الحظر وسجلّ الأدلة معًا.' },
    'principles.col3.title': { en:'No vendor holds your policy.', ar:'لا مورّد يحتفظ بسياستك.' },
    'principles.col3.body': { en:'Change the model, keep the guardrail and the history that proves it.',
                              ar:'غيّر النموذج، واحتفظ بحاجز الحماية والسجلّ الذي يثبت ذلك.' },

    'connect.title': { en:'Sits next to the stack you already run.', ar:'يعمل إلى جانب المنظومة التي تشغّلها بالفعل.' },
    'connect.sub':   { en:'Model providers, vector stores, agent frameworks, identity and SIEM, all via your gateway or a sidecar.',
                       ar:'مزوّدو النماذج، مخازن المتجهات، أُطر الوكلاء، الهوية وأنظمة SIEM، عبر بوابتكم أو خدمة مرافقة.' },

    'frameworks.title': { en:'Aligned to the frameworks your regulator reads.', ar:'متوافق مع الأطر التي تعتمدها جهتكم التنظيمية.' },
    'frameworks.lede':  { en:'Every control ships with its mapping.', ar:'كل ضابط يأتي مصحوبًا بربطه المرجعي.' },

    /* file formats (PDF/XLSX/DOCX) are left untagged in the markup and stay
       as-is in both languages — universal file extensions, same policy as
       brand and standard names elsewhere in this dictionary */
    'guides.label':       { en:'Field guides from Tahara research', ar:'أدلة ميدانية من Tahara Research' },
    'guides.card1.kind':  { en:'Playbook', ar:'دليل عملي' },
    'guides.card1.title': { en:'Running an AI risk assessment', ar:'إجراء تقييم مخاطر الذكاء الاصطناعي' },
    'guides.card2.kind':  { en:'96 controls', ar:'96 ضابطًا' },
    'guides.card2.title': { en:'Control set for agentic systems', ar:'مجموعة ضوابط للأنظمة الوكيلة' },
    'guides.card3.kind':  { en:'Template', ar:'قالب' },
    'guides.card3.title': { en:'Evidence pack for ISO/IEC 42001', ar:'حزمة أدلة لمعيار ISO/IEC 42001' },
    'guides.seal':        { en:'Tahara Research', ar:'Tahara Research' },

    'proof.label':     { en:'Trusted by security teams at', ar:'موثوق به من قبل فرق الأمن في' },
    'standards.label': { en:'Mapped to the standards your board reads', ar:'مرتبط بالمعايير التي يطّلع عليها مجلس إدارتكم' },

    'faq.title':    { en:'Questions we get first.', ar:'الأسئلة التي نتلقّاها أولًا.' },
    'faq.stillnot': { en:'Still not covered?', ar:'لم تجد إجابتك بعد؟' },
    'faq.q1':  { en:'Where does Tahara AI run?', ar:'أين يعمل Tahara AI؟' },
    'faq.q2':  { en:'How does Tahara AI find AI agents already in use?', ar:'كيف يكتشف Tahara AI وكلاء الذكاء الاصطناعي المستخدَمين بالفعل؟' },
    'faq.q3':  { en:'Can Tahara AI govern agents built outside the platform?', ar:'هل يستطيع Tahara AI حوكمة وكلاء بُنوا خارج المنصة؟' },
    'faq.q4':  { en:'How is Tahara AI different from an AI gateway or dashboard?', ar:'ما الفرق بين Tahara AI وبوابة الذكاء الاصطناعي أو لوحة المعلومات؟' },
    'faq.q5':  { en:'What happens when a policy is broken?', ar:'ماذا يحدث عند خرق سياسة؟' },
    'faq.mostasked': { en:'Most asked', ar:'الأكثر شيوعًا' },
    'faq.helpful':   { en:'Was this helpful?', ar:'هل كانت هذه الإجابة مفيدة؟' },
    'faq.thanks':    { en:'Thanks, noted.', ar:'شكرًا، تم التسجيل.' },

    'mega.demo.k':     { en:'Guided demo', ar:'عرض توضيحي موجَّه' },
    'mega.demo.title': { en:'See Tahara in action', ar:'شاهد Tahara في العمل' },
    'mega.demo.desc':  { en:'A 30-minute walkthrough, tailored to your stack', ar:'جولة مدتها 30 دقيقة، مصمَّمة خصيصًا لمنظومتكم' },
    'mega.demo.walk':  { en:'What we walk through', ar:'ما الذي نستعرضه' },
    'mega.soon':       { en:'Coming soon', ar:'قريبًا' },

    /* the four lifecycle stage names — shared by the mega-menu demo panel
       and the dossier tabs, so they can never drift apart */
    'stage.assess':  { en:'Assess',  ar:'التقييم' },
    'stage.govern':  { en:'Govern',  ar:'الحوكمة' },
    'stage.test':    { en:'Test',    ar:'الاختبار' },
    'stage.monitor': { en:'Monitor', ar:'المراقبة' },

    /* ── create-account modal ── */
    'acct.kicker': { en:'Create account', ar:'إنشاء حساب' },
    'acct.title':  { en:'Start your first assurance run', ar:'ابدأ أول جولة ضمان لديكم' },
    'acct.desc':   { en:'Connect one environment and see what it exposes. No card needed.',
                     ar:'اربط بيئة واحدة وشاهد ما تكشفه. دون الحاجة إلى بطاقة.' },
    'acct.c1':     { en:'One environment, free while you evaluate', ar:'بيئة واحدة، مجانًا طوال فترة التقييم' },
    'acct.c2':     { en:'Runs in your tenancy, nothing leaves it', ar:'يعمل داخل بيئتكم، ولا يغادرها شيء' },
    'acct.c3':     { en:'First inventory inside a day', ar:'أول جرد خلال يوم واحد' },
    'acct.name':   { en:'Full name', ar:'الاسم الكامل' },
    'acct.org':    { en:'Organisation', ar:'المؤسسة' },
    'acct.email':  { en:'Work email', ar:'بريد العمل الإلكتروني' },
    'acct.hint1':  { en:'Use your work address. We verify the domain', ar:'استخدم عنوان عملك. نتحقّق من النطاق' },
    'acct.pw':     { en:'Password', ar:'كلمة المرور' },
    'acct.hint2':  { en:'10 characters, a number and a symbol', ar:'10 أحرف، ورقم، ورمز' },
    'acct.agree':  { en:'I agree to the terms and the privacy notice', ar:'أوافق على الشروط وإشعار الخصوصية' },
    'acct.submit': { en:'Create account', ar:'إنشاء الحساب' },
    'acct.alt':    { en:'Already have an account?', ar:'لديكم حساب بالفعل؟' },
    'acct.altlink':{ en:'Sign in', ar:'تسجيل الدخول' },
    'acct.note':   { en:'Demo interface. No account is created and nothing is sent.',
                     ar:'واجهة توضيحية. لا يُنشأ أي حساب ولا يُرسَل أي شيء.' },

    /* ── sign-in modal ── */
    'si.kicker':  { en:'Sign in', ar:'تسجيل الدخول' },
    'si.title':   { en:'Sign in to explore', ar:'سجّل الدخول للاستكشاف' },
    'si.desc':    { en:'Pick up where your last assurance run left off.', ar:'تابعوا من حيث انتهت آخر جولة ضمان لديكم.' },
    'si.keep':    { en:'Keep me signed in', ar:'أبقِ الجلسة مفتوحة' },
    'si.forgot':  { en:'Forgot password', ar:'نسيت كلمة المرور' },
    'si.submit':  { en:'Sign in', ar:'تسجيل الدخول' },
    'si.or':      { en:'or', ar:'أو' },
    'si.alt':     { en:'New to Tahara?', ar:'جديد على Tahara؟' },
    'si.altlink': { en:'Create an account', ar:'أنشئ حسابًا' },

    /* ── "One record of truth" cards ── */
    'plat.scan':      { en:'Scan', ar:'الفحص' },
    'plat.scan.l1':   { en:'agents found', ar:'وكيلًا مكتشَفًا' },
    'plat.scan.l2':   { en:'unmanaged', ar:'غير مُدار' },
    'plat.scan.l3':   { en:'governed', ar:'خاضع للحوكمة' },
    'plat.scan.h':    { en:'Expose the AI nobody approved', ar:'اكشف الذكاء الاصطناعي الذي لم يعتمده أحد' },
    'plat.scan.d':    { en:'Every model, agent, MCP server and key running in your estate, with an owner and a risk tier.',
                        ar:'كل نموذج ووكيل وخادم MCP ومفتاح يعمل في بيئتكم، مع مالك وتصنيف مخاطر.' },
    'plat.rt':        { en:'Runtime policy', ar:'سياسة وقت التشغيل' },
    'plat.rt.policy': { en:'<span class="pw">Allow</span> <span class="ptok" style="--d:0">customer records</span> <span class="pw">only when</span> <span class="ptok hot" style="--d:1">checks pass</span> <span class="pw">and</span> <span class="ptok" style="--d:2">egress is internal</span><span class="pw">.</span>',
                        ar:'<span class="pw">اسمح بـ</span> <span class="ptok" style="--d:0">سجلات العملاء</span> <span class="pw">فقط عندما</span> <span class="ptok hot" style="--d:1">تجتاز الفحوص</span> <span class="pw">و</span> <span class="ptok" style="--d:2">يكون الخروج داخليًا</span><span class="pw">.</span>' },
    'plat.rt.eval':   { en:'Policy enforced', ar:'السياسة مُنفَّذة' },
    'plat.rt.h':      { en:'Enforce before the call fires', ar:'أنفِذ قبل انطلاق الاستدعاء' },
    'plat.rt.d':      { en:'Allow, redact, escalate or block at the execution layer, not after the fact.',
                        ar:'السماح أو التنقيح أو التصعيد أو الحظر في طبقة التنفيذ، لا بعد وقوع الأمر.' },
    'plat.audit':        { en:'Audit trail', ar:'مسار التدقيق' },
    'plat.audit.sealed': { en:'Sealed', ar:'مختوم' },
    'plat.audit.h':      { en:'Evidence you can hand over', ar:'أدلة يمكنكم تسليمها' },
    'plat.audit.d':      { en:'Continuous documentation mapped to the EU AI Act, ISO/IEC 42001, NIST AI RMF and SOC 2.',
                            ar:'توثيق مستمر مرتبط بـ EU AI Act و ISO/IEC 42001 و NIST AI RMF و SOC 2.' },

    /* ── assurance dashboard tab strip ── */
    'dash.tab.discover':    { en:'Discover', ar:'الاكتشاف' },
    'dash.tab.govern':      { en:'Govern', ar:'الحوكمة' },
    'dash.tab.adversarial': { en:'Adversarial', ar:'الاختبار العدائي' },
    'dash.tab.guardrails':  { en:'Guardrails', ar:'حواجز الحماية' },

    /* ── framework seals: the category label only. The value beneath it
       (ISO/IEC 42001 …) is also the drawer's lookup key — never translate it ── */
    'seal.management':  { en:'Management', ar:'الإدارة' },
    'seal.security':    { en:'Security', ar:'الأمن' },
    'seal.risk':        { en:'Risk', ar:'المخاطر' },
    'seal.regulation':  { en:'Regulation', ar:'التنظيم' },
    'seal.application': { en:'Application', ar:'التطبيق' },
    'seal.adversary':   { en:'Adversary', ar:'الخصم' },

    'drawer.maps':     { en:'What Tahara maps', ar:'ما الذي ترسمه Tahara' },
    'drawer.download': { en:'Download the mapping', ar:'حمّل خريطة الربط' },
    'mark.sub':        { en:'Five layers · one record', ar:'خمس طبقات · سجلّ واحد' },

    'strip.tenancy':    { en:'Runs in your tenancy', ar:'يعمل داخل بيئتكم' },
    'strip.nomodel':    { en:'No model changes', ar:'دون تغييرات على النماذج' },
    'strip.reportweek': { en:'Report in week one', ar:'تقرير في الأسبوع الأول' },

    'footer.tagline':   { en:'Safety, governance and transparency for the AI you actually run.',
                          ar:'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
    'footer.motto':     { en:'SAFE · ETHICAL · TRANSPARENT', ar:'آمن · أخلاقي · شفّاف' },
    'footer.copyright': { en:'© 2026 Tahara AI. All rights reserved.', ar:'© 2026 Tahara AI. جميع الحقوق محفوظة.' }
  };

  /* ── AR mirrors of dynamically-built content (mega-menu, FAQ answers,
     footer links) — the SAME builder functions in ui.js read from these
     when Arabic is active, so there's exactly one code path either way ── */
  const PLATFORM_MENU_AR = [
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
      ['ملفات الارتباط والموافقة', 'قواعد اللافتات وفحوصات المتتبّعات', true ]
    ]],
    ['الفحص الأمني', [
      ['فحص إعدادات السحابة',  'إدارة الهوية والتخزين وقواعد الشبكة', false],
      ['فحص التبعيات',         'ثغرات معروفة، مُعلَّمة',        false],
      ['كشف الأسرار',          'مفاتيح مكشوفة، تُكتشف مبكرًا',   false]
    ]]
  ];

  const ANSWERS_AR = [
    ['داخل بيئتكم الخاصة. لا يطلب Tahara AI مغادرة البيانات لأنظمتكم،',
     'بل يعمل حيث توجد البنية التحتية أصلًا، ولا يقرأ إلا ما مُنح إذنًا برؤيته،',
     'ولا يحتفظ ببيانات الاعتماد إطلاقًا.'],
    ['لا يعتمد Tahara AI على ما هو موثَّق، بل يتحقّق مما هو قائم فعلًا.',
     'يقرأ الإعدادات وسجلات الوصول الفعلية مباشرة،',
     'فيظهر كل ما يعمل حقًا، سواء سُجِّل يومًا أو لم يُسجَّل.'],
    ['نعم. لا يشترط Tahara AI أن يكون الوكيل مبنيًا عليه أو منشورًا من خلاله،',
     'أو موصولًا به بطريقة خاصة. إنه يقرأ البيئة التي يعمل فيها الوكيل أصلًا،',
     'فيدخل كل ما هو نشط ضمن النطاق، بغضّ النظر عن مكان بنائه أو طريقته.'],
    ['تقف البوابة أمام حركة المرور، وتعرض لوحة المعلومات ما جرى الإبلاغ عنه سلفًا.',
     'لا يفعل Tahara AI أيًّا منهما، بل يتحقّق باستقلالية من النظام الفعلي مقابل ما يُدّعى وما هو موثَّق،',
     'ولا يعتبر الأمر مُعالَجًا إلا بعد تأكيد أحد المعنيين.',
     'صُمِّم ليلتقط ما تكتفي لوحة المعلومات بعرضه دون تدقيق.'],
    ['يرفع Tahara AI العلامة فور اكتشافها، لا انتظارًا للمراجعة المجدولة التالية.',
     'تُسجَّل كل مخالفة بحالتها ومالكها،',
     'مع سجلّ يبقى مفتوحًا حتى تُعالَج.']
  ];

  const FOOTER_LINKS_AR = [
    ['المنصة', [
      ['الاكتشاف', '#platform'], ['حواجز الحماية أثناء التشغيل', '#platform'],
      ['محرك السياسات', '#platform'], ['حزم الأدلة', '#platform']
    ]],
    ['دورة الحياة', [
      ['التقييم', '#lifecycle'], ['الحوكمة', '#lifecycle'],
      ['الاختبار', '#lifecycle'], ['المراقبة', '#lifecycle']
    ]],
    ['الموارد', [
      ['أدلة العمل', '#resources'], ['ربط الأطر المرجعية', '#resources'],
      ['الأسئلة الشائعة', '#faq'], ['التوثيق', '#']
    ]],
    ['الشركة', [
      ['حول الشركة', '#'], ['الوظائف', '#'], ['التواصل', '#'], ['الخصوصية', '#']
    ]]
  ];

  const FRAMEWORK_DETAIL_AR = {
    'ISO/IEC 42001': ['نظام إدارة الذكاء الاصطناعي',
      'معيار نظام الإدارة للذكاء الاصطناعي: السياسة والأهداف والأدوار ومعالجة المخاطر والتحسين المستمر.',
      ['ضوابط الملحق A مرتبطة بأدلة المنصة','قوالب تقييم الأثر',
       'الأهداف والأدوار مسجَّلة مقابل المالكين','مسار التدقيق الداخلي والمراجعة']],
    'ISO/IEC 27001': ['أمن المعلومات',
      'إدارة أمن المعلومات. حيث تلامس أنظمة الذكاء الاصطناعي بيانات منظَّمة أو شخصية، تظل هذه الضوابط سارية.',
      ['أدلة التحكم بالوصول للنماذج والوكلاء','آليات التسجيل والمراقبة',
       'سجلّات الموردين والأطراف الثالثة','ضبط التغيير على إصدارات النماذج']],
    'NIST AI RMF': ['إطار المخاطر',
      'إطار طوعي منظَّم حول الحوكمة والتخطيط والقياس والإدارة.',
      ['الحوكمة: مجموعة السياسات ومسار الموافقة','التخطيط: الجرد والملكية وتصنيف المخاطر',
       'القياس: الانحراف والرفض ونتائج الاختبار العدائي','الإدارة: خطط المعالجة وإعادة الاختبار']],
    'EU AI Act': ['التنظيم',
      'تتدرّج الالتزامات حسب مستوى المخاطر. تحمل الأنظمة عالية المخاطر واجبات توثيق وتسجيل ورقابة ودقة.',
      ['تصنيف المخاطر لكل نظام','التوثيق الفني المُجمَّع من السجلّ',
       'تسجيل الأحداث التلقائي المحتفَظ به','الرقابة البشرية المسجَّلة عند نقاط القرار']],
    'OWASP LLM': ['مخاطر التطبيق',
      'المنظور الأمني التطبيقي لأنظمة النماذج اللغوية الكبيرة، وتضمّ الفئات التي يختبرها الفريق الأحمر.',
      ['اختبارات حقن الطلبات، المباشرة وغير المباشرة','فحوصات إفشاء المعلومات الحسّاسة',
       'حالات الصلاحية المفرطة وإساءة استخدام الأدوات','النتائج مُقيَّمة ومُعاد اختبارها بعد الإصلاح']],
    'MITRE ATLAS': ['تكتيكات الخصم',
      'قاعدة معرفة بالتكتيكات والأساليب الفعلية المستخدَمة ضد أنظمة الذكاء الاصطناعي.',
      ['محاكاة هجمات مرتبطة بأساليب ATLAS','فجوات التغطية مُبرَزة لكل نظام',
       'آليات الكشف موجَّهة إلى مركز العمليات الأمنية لديكم','جدول متكرر، وليس تمرينًا سنويًا']],
    'AIUC-1': ['اعتماد الوكلاء',
      'معيار اعتماد لوكلاء الذكاء الاصطناعي، مصمَّم ليقيس المشتري وكلاء كل مورّد بالمعيار نفسه.',
      ['ضوابط الوكلاء مرتبطة بأدلة المنصة','كل نتيجة مرتبطة بالضابط الذي تمسّه',
       'الأدلة مُجهَّزة لتدقيق الاعتماد','يُعاد الفحص باستمرار، لا عند التدقيق فقط']]
  };

  let current = 'en';

  let firstStatic = true;
  function applyStatic(lang){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const entry = I18N[key];
      if (entry && entry[lang]) el.textContent = entry[lang];
    });
    /* Elements whose copy contains markup (e.g. the hero headline's
       <span class="accent">) can't go through textContent — they need
       innerHTML. Skip this on the very first English render so the word-mask
       split (data-split) applied at boot survives for the entrance animation;
       it runs on every language switch after that. */
    if (!(firstStatic && lang === 'en')){
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const entry = I18N[key];
        if (entry && entry[lang]) el.innerHTML = entry[lang];
      });
    }
    firstStatic = false;
  }

  function ensureArabicFont(){
    if (document.getElementById(ARABIC_FONT_ID)) return;
    const link = document.createElement('link');
    link.id = ARABIC_FONT_ID;
    link.rel = 'stylesheet';
    link.href = ARABIC_FONT_HREF;
    document.head.appendChild(link);
  }

  function setToggleState(lang){
    const sw = document.getElementById('langSwitch');
    if (!sw) return;
    sw.querySelectorAll('.ls-opt').forEach(o => o.classList.toggle('on', o.dataset.lang === lang));
  }

  function apply(lang){
    current = lang;
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (lang === 'ar') ensureArabicFont();
    applyStatic(lang);
    document.dispatchEvent(new CustomEvent('tahara:i18n', { detail: lang }));
    setToggleState(lang);
    try { localStorage.setItem(STORE_KEY, lang); } catch(_){ }

    /* rebuild the array-driven sections in the new language — same
       builder functions as English, just pointed at the AR data */
    if (window.TaharaUI){
      if (window.TaharaUI.mega)  window.TaharaUI.mega(lang === 'ar' ? PLATFORM_MENU_AR : null);
      if (window.TaharaUI.faq)   window.TaharaUI.faq(lang === 'ar' ? ANSWERS_AR : null);
      if (window.TaharaUI.footer) window.TaharaUI.footer(lang === 'ar' ? FOOTER_LINKS_AR : null);
      if (window.TaharaDrawer && window.TaharaDrawer.setLocale)
        window.TaharaDrawer.setLocale(lang === 'ar' ? FRAMEWORK_DETAIL_AR : null);
    }
    /* the assurance dashboard keeps its own AR copy — see the MODULES_AR overlay */
    if (window.TaharaDash && window.TaharaDash.setLocale) window.TaharaDash.setLocale(lang);
  }

  function init(){
    const sw = document.getElementById('langSwitch');
    let saved = 'en';
    try { saved = localStorage.getItem(STORE_KEY) || 'en'; } catch(_){ }
    if (sw){
      sw.addEventListener('click', () => apply(current === 'en' ? 'ar' : 'en'));
    }
    apply(saved);  /* ui.js builders have already run once in English by this
                       point in the boot sequence, so this call is what actually
                       switches them to Arabic if that's what was saved */
  }

  return { init, apply, get current(){ return current; } };
})();

/* ════════════════════════════════════════════════════════════
   TAHARA AI · boot + scroll engine
   The stack no longer tracks scroll position rigidly. Scroll sets a
   target; a continuous rAF loop eases the live value toward it, so
   wheel steps and trackpad flicks arrive as one continuous motion.
   ════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const UI = window.TaharaUI, ST = window.TaharaStack;
  const REDUCE = UI.REDUCE;
  const clamp = (v,a,b) => v < a ? a : v > b ? b : v;
  const $  = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ── 1 · split headings into masked words ── */
  function split(el){
    const frag = document.createDocumentFragment(); let i = 0;
    (function walk(node, cls){
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3){
          n.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok.trim()){ if (tok) frag.appendChild(document.createTextNode(' ')); return; }
            const o = document.createElement('span'); o.className = 'w' + (cls ? ' ' + cls : '');
            const s = document.createElement('span'); s.className = 'wi';
            s.style.setProperty('--wi', i++); s.textContent = tok;
            o.appendChild(s); frag.appendChild(o);
          });
        } else if (n.nodeType === 1) walk(n, n.getAttribute('class') || '');
      });
    })(el, '');
    el.textContent = ''; el.appendChild(frag);
  }
  $$('[data-split]').forEach(split);

  const mw = $('#markWord');
  if (mw && !mw.querySelector('img')){
    const txt = mw.textContent; mw.textContent = '';
    [...txt].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ml'; s.style.setProperty('--li', i);
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      mw.appendChild(s);
    });
  }

  /* ── 2 · reveal on entry ── */
  const SEL = '.r, .r-fade, [data-split], .frames, .integ, .rec, .dossier, .res-card, .scale, .scale-wrap, .close-cta';
  const targets = $$(SEL);
  if (REDUCE || !('IntersectionObserver' in window)) targets.forEach(t => t.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin:'0px 0px -10% 0px', threshold:.06 });
    targets.forEach(t => io.observe(t));
  }

  /* ── 3 · one-off setup ── */
  UI.nav(); UI.mega(); UI.proof(); UI.marquee(); UI.faq(); UI.faqExtras(); UI.footer(); UI.pvideo();
  window.TaharaI18N && window.TaharaI18N.init();
  UI.connectors(); UI.pointer(); UI.ripple();
  const consoleEl = $('#console');
  if (document.getElementById('feedList')) UI.feed(consoleEl);   /* feed removed by the dashboard */
  $$('.spark path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength())));
  $$('.mark-ring circle').forEach(c => {
    try { c.style.setProperty('--rl', Math.ceil(c.getTotalLength())); }
    catch(_){ c.style.setProperty('--rl', 880); }
  });
  if (window.TaharaScene) window.TaharaScene.init($('#scene3d'));

  /* ── lifecycle journey rail ── */
  const journey = $('#journey');
  const jsvg = journey && journey.querySelector('svg');
  const cards = $$('.dossier');
  let jstops = [], jrun = null, jdot = null, jx0 = 0, jx1 = 0;

  function buildJourney(){
    if (!jsvg || !cards.length) return;
    const b = journey.getBoundingClientRect();
    if (b.width < 10) return;
    const W = Math.round(b.width), H = 34, y = 17;
    jsvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    jsvg.removeAttribute('preserveAspectRatio');
    const xs = cards.map(c => {
      const r = c.getBoundingClientRect();
      return Math.round(r.left - b.left + r.width / 2);
    });
    jx0 = xs[0]; jx1 = xs[xs.length - 1];
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    jsvg.innerHTML = '';
    jsvg.appendChild(mk('line', { class:'rail', x1:jx0, y1:y, x2:jx1, y2:y }));
    jrun = mk('line', { class:'run', x1:jx0, y1:y, x2:jx1, y2:y });
    jrun.style.setProperty('--len', Math.max(1, jx1 - jx0));
    jsvg.appendChild(jrun);
    jstops = xs.map(x => { const c = mk('circle', { class:'stop', cx:x, cy:y, r:6.5 }); jsvg.appendChild(c); return c; });
    jdot = mk('circle', { class:'dot', cx:jx0, cy:y, r:4.5 });
    jsvg.appendChild(jdot);
  }

  function paintJourney(){
    if (!jsvg || !jrun || !cards.length) return;
    /* The four cards sit in one row, so their own heights cannot drive a
       vertical progress. Map the rail to the row's travel through the
       viewport instead — it fills while the row is on screen. */
    const vh = innerHeight;
    const row = $('#life').getBoundingClientRect();
    const p = clamp((vh * 0.85 - row.top) / (row.height + vh * 0.70), 0, 1);
    journey.style.setProperty('--jp', p.toFixed(3));
    journey.style.setProperty('--jd', p > 0.02 && p < 0.995 ? 1 : 0);
    if (jdot) jdot.setAttribute('cx', (jx0 + (jx1 - jx0) * p).toFixed(1));
    const active = Math.min(cards.length - 1, Math.floor(p * cards.length));
    jstops.forEach((st, i) => st.classList.toggle('lit', p > 0 && i <= active));
    cards.forEach((c, i) => {
      /* three exclusive states — a card that has already passed must
         look visibly different from the one currently active, or the
         two read as equally "on" with nothing to tell them apart */
      c.classList.toggle('done', p > 0 && i < active);
      c.classList.toggle('live', p > 0 && i === active);
      c.classList.toggle('dim', p > 0 && i > active);
    });
  }

  const svg   = $('#stackSvg');
  const stackStage = $('.stack-stage');
  const track = $('#stackTrack');
  const pin   = $('.stack-pin');
  const mark  = $('#stackMark');
  const mword = $('#markWord');
  const rail  = $('#pinRail');
  const pct   = $('#pinPct');
  const items = $$('.stack-item');
  ST.build(svg);
  const layers = ST.layers;

  /* ── geometry cache ───────────────────────────────────────
     The track's scroll position and the section's size change only on
     resize / reflow, never on scroll. Measuring them once — instead of
     calling getBoundingClientRect()/offsetHeight every animation frame —
     removes a forced synchronous layout from the hot loop, which is the
     main reason the assembly felt steppy while scrolling.
     ───────────────────────────────────────────────────────── */
  let mTrackTop = 0, mTrackLen = 1, mSvgTop = 0, mVH = innerHeight, mWide = innerWidth > 1000;
  function measure(){
    if (!track) return;
    const y = scrollY || pageYOffset;
    mVH   = innerHeight;
    mWide = innerWidth > 1000;
    const tr = track.getBoundingClientRect();
    mTrackTop = tr.top + y;                       /* track's absolute document top */
    mTrackLen = Math.max(1, track.offsetHeight - mVH);
    if (svg){ const sr = svg.getBoundingClientRect(); mSvgTop = sr.top + y; }
  }
  measure();

  /* ── 4 · smoothed stack state ─────────────────────────────
     live — what is on screen this frame
     want — where scroll says it should be
     Each frame the live value covers a fraction of the remaining
     distance, turning discrete scroll deltas into one glide.
     ───────────────────────────────────────────────────────── */
  const live = { e:[0,0,0,0,0], m:0, pp:0 };
  const want = { e:[0,0,0,0,0], m:0, pp:0, p:0 };
  /* Damping is expressed per 60fps frame but applied against real
     elapsed time, so the motion settles in the same wall-clock
     window on a 30Hz laptop, a 60Hz monitor or a 120Hz display. */
  const EASE_POS = 0.115;  // slab travel — lower is smoother and lazier
  const EASE_M   = 0.105;  // converge and mark
  const EASE_UI  = 0.18;   // rail and percentage
  let kPos = EASE_POS, kM = EASE_M, kUI = EASE_UI, lastT = 0;

  let hoverLock = null, flashed = false, raf = 0, alive = false, staticMark = false;

  /* ── text reveal / typewriter state ───────────────────────────
     Each layer's number, label and description are hidden until the
     layer assembles, then typed out in sync with it. After the whole
     stack is assembled the layers become click-to-toggle.
     mode: 'scroll' (follow assembly) | 'show' (timed replay) | 'hidden'
     ───────────────────────────────────────────────────────────── */
  let assembledOnce = false;
  const TW_MS = 620;                                   /* hover type-in speed */
  /* after assembly, hovering a layer reveals only its text; hoverLock holds
     the layer under the cursor, selT0 when its typewriter started. */
  let selT0 = 0, selHideT = 0;
  /* split each item's title + description into per-character spans so chars
     can fade in without reflowing. Re-run on language change, since the
     h4/p are data-i18n and have their text content replaced. */
  function twPrep(){
    items.forEach(it => {
      let idx = 0;
      it.querySelectorAll('h4, p').forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        const frag = document.createDocumentFragment();
        for (const ch of text){
          const s = document.createElement('span');
          s.className = 'tw';
          s.style.setProperty('--ci', idx++);
          s.textContent = ch;
          frag.appendChild(s);
        }
        el.appendChild(frag);
      });
      it._tw = idx;                                    /* total char count */
    });
  }
  twPrep();
  document.addEventListener('tahara:i18n', twPrep);

  function highlight(idx){
    const k = hoverLock !== null ? hoverLock : idx;
    items.forEach(it => it.classList.toggle('on', +it.dataset.layer === k));
    layers.forEach(l => l.classList.toggle('hot', +l.dataset.layer === k));
    svg.classList.toggle('dim', k >= 0);
  }

  function readTargets(){
    const y = scrollY || pageYOffset;
    let p;
    if (mWide && !REDUCE){
      /* -rect.top === scrollY - trackTop, from cached geometry so the
         loop performs no layout reads while scrolling */
      p = clamp((y - mTrackTop) / mTrackLen, 0, 1);
      want.m = ST.smoothstep((p - 0.84) / 0.16);
    } else {
      const svgTopVp = mSvgTop - y;               /* svg top, viewport-relative */
      p = clamp((mVH * .92 - svgTopVp) / (mVH * .62), 0, 1);
      want.m = 0;
    }
    for (let i = 0; i < 5; i++) want.e[i] = ST.entryEased(p, i);
    want.pp = p;
    want.p  = p;
  }

  function paint(now){
    let settled = true, allIn = true;

    for (let i = 0; i < 5; i++){
      const d = want.e[i] - live.e[i];
      if (Math.abs(d) < 0.0006) live.e[i] = want.e[i];
      else { live.e[i] += d * kPos; settled = false; }
      ST.write(i, live.e[i]);
      if (live.e[i] < 0.995) allIn = false;
    }
    if (allIn) assembledOnce = true;

    /* per-layer text reveal — how many characters are typed out.
       Not hovering (or still assembling): typed in sync with each slab, so
       the resting assembled state shows all. Hovering after assembly: only
       the hovered layer types out, the others hide. */
    const nowT = now || 0;
    const focus = assembledOnce && hoverLock !== null;
    items.forEach(it => {
      const li = +it.dataset.layer, asm = live.e[li];
      let rv;
      if (focus){
        rv = (li === hoverLock) ? clamp((nowT - selT0) / TW_MS, 0, 1) : 0;
        if (li === hoverLock && rv < 1) settled = false;
      } else {
        rv = asm;                                      /* scroll-synced */
      }
      if (REDUCE) rv = rv > 0.5 ? 1 : 0;
      it.style.setProperty('--seen', asm.toFixed(3));
      it.style.setProperty('--ch', (rv * (it._tw || 0)).toFixed(2));
    });
    pin.style.setProperty('--sp', live.e[0].toFixed(3));

    const dm = want.m - live.m;
    if (Math.abs(dm) < 0.0006) live.m = want.m; else { live.m += dm * kM; settled = false; }
    pin.style.setProperty('--m', live.m.toFixed(4));
    mark.classList.toggle('on', live.m > 0.20);
    if (mword) mword.classList.toggle('shine', live.m > 0.55);

    const dp = want.pp - live.pp;
    if (Math.abs(dp) < 0.0008) live.pp = want.pp; else { live.pp += dp * kUI; settled = false; }
    if (rail) rail.style.setProperty('--pp', live.pp.toFixed(4));
    if (pct)  pct.textContent = String(Math.round(live.pp * 100)).padStart(2,'0') + '%';

    /* the beam only sweeps a fully assembled stack */
    stackStage && stackStage.classList.toggle('assembled', allIn && live.m < 0.02);
    stackStage && stackStage.classList.toggle('ready', assembledOnce);

    /* one-shot flash the moment the fifth slab settles */
    if (allIn && !flashed && !REDUCE){
      flashed = true;
      svg.classList.add('assembled');
      setTimeout(() => svg.classList.remove('assembled'), 1200);
    }
    if (!allIn) flashed = false;

    /* during assembly the highlight walks with scroll; once assembled it is
       driven purely by hover (applied inside highlight() via hoverLock), so
       the box only ever appears on the layer whose text is showing */
    const pb = clamp((want.p - 0.60) / 0.20, 0, 1);
    const scrollHi = live.m > 0.02 ? -1 : (pb <= 0 ? -1 : Math.min(4, Math.floor(pb * 5)));
    highlight(assembledOnce ? -1 : scrollHi);

    return settled;
  }

  function loop(now){
    const dt = lastT ? Math.min(120, now - lastT) : 16.67;
    lastT = now;
    const f = dt / 16.67;
    kPos = 1 - Math.pow(1 - EASE_POS, f);
    kM   = 1 - Math.pow(1 - EASE_M,   f);
    kUI  = 1 - Math.pow(1 - EASE_UI,  f);

    readTargets();
    const settled = paint(now);
    if (!alive && settled){ raf = 0; lastT = 0; return; }   /* idle out when off-screen */
    raf = requestAnimationFrame(loop);
  }
  function wake(){ if (!raf){ lastT = 0; raf = requestAnimationFrame(loop); } }

  if (!REDUCE && 'IntersectionObserver' in window && track){
    new IntersectionObserver(es => {
      alive = es[0].isIntersecting;
      if (alive) wake();
    }, { rootMargin:'120% 0px 120% 0px' }).observe(track);
  } else { alive = true; }

  /* ── 5 · header, progress bar, console ── */
  let ticking = false, counted = false;
  function frame(){
    ticking = false;
    const vh = innerHeight, y = scrollY || pageYOffset;
    const header = $('#siteHeader'), prog = $('#prog');

    header.classList.toggle('stuck', y > 8);
    const max = document.documentElement.scrollHeight - vh;
    prog.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%';

    paintJourney();
    const stage = $('.console-stage');
    if (stage){
      const r = stage.getBoundingClientRect();
      const t = clamp((vh * .95 - r.top) / (vh * .55), 0, 1);
      consoleEl.style.setProperty('--t', t.toFixed(3));
      if (t > .3){
        consoleEl.classList.add('lit');
        if (!counted){ counted = true; UI.counters(); }
      }
    }
    wake();
  }
  const onScroll = () => { if (!ticking){ ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive:true });

  /* ── 5b · pointer tilt on the stack, and the scanning beam ── */
  if (stackStage && svg && !REDUCE && matchMedia('(hover:hover) and (pointer:fine)').matches){
    let tx = 0, ty = 0, wx = 0, wy = 0, traf = 0;
    stackStage.addEventListener('pointermove', e => {
      const r = stackStage.getBoundingClientRect();
      wy = ((e.clientX - r.left) / r.width  - 0.5) * 20;   /* rotateY, ±10deg */
      wx = (0.5 - (e.clientY - r.top) / r.height) * 20;    /* rotateX, ±10deg */
      if (!traf) traf = requestAnimationFrame(tilt);
    });
    stackStage.addEventListener('pointerleave', () => {
      wx = 0; wy = 0;
      if (!traf) traf = requestAnimationFrame(tilt);
    });
    function tilt(){
      tx += (wx - tx) * 0.12;
      ty += (wy - ty) * 0.12;
      svg.style.setProperty('--tx', tx.toFixed(2) + 'deg');
      svg.style.setProperty('--ty', ty.toFixed(2) + 'deg');
      traf = (Math.abs(wx - tx) > 0.02 || Math.abs(wy - ty) > 0.02)
        ? requestAnimationFrame(tilt) : 0;
    }
  }

  /* ── 6 · hover (or tap) a layer to reveal only its text ──
     Once assembled, pointing at a layer types out just that layer's text and
     hides the others; moving to another swaps it; leaving the stack (a short
     grace period, so moving between a slab and its card doesn't flicker)
     returns to the resting state where all are shown. */
  function setSel(li){
    clearTimeout(selHideT);
    if (hoverLock !== li){ hoverLock = li; selT0 = performance.now(); }
    highlight(hoverLock);
    wake();
  }
  function clearSel(){
    clearTimeout(selHideT);
    selHideT = setTimeout(() => { hoverLock = null; highlight(-1); wake(); }, 140);
  }
  items.forEach(it => {
    it.addEventListener('mouseenter', () => setSel(+it.dataset.layer));
    it.addEventListener('mouseleave', clearSel);
    it.addEventListener('click',      () => setSel(+it.dataset.layer));
  });
  layers.forEach(l => {
    l.addEventListener('mouseenter', () => setSel(+l.dataset.layer));
    l.addEventListener('mouseleave', clearSel);
    l.addEventListener('click',      () => setSel(+l.dataset.layer));
  });

  /* ── 7 · resize ── */
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      UI.connectors(); UI.faq.reflow && UI.faq.reflow(); buildJourney(); measure(); onScroll();
    }, 160);
    measure(); onScroll();
  });
  /* re-measure once fonts / late assets have settled the layout, so the
     cached track geometry matches the final page height */
  addEventListener('load', () => { measure(); onScroll(); });
  setTimeout(() => { measure(); onScroll(); }, 500);

  /* ── 7b · extras ── */
  buildJourney();
  window.TaharaDrawer && window.TaharaDrawer.init();
  window.TaharaMarquee2 && window.TaharaMarquee2.init();

  /* ── surface-check modal — opened by the ribbon, closed by X / scrim / Esc ── */
  (function(){
    const link  = document.getElementById('ribbonLink');
    const modal = document.getElementById('surfaceModal');
    const scrim = document.getElementById('surfaceScrim');
    const closeX = document.getElementById('surfaceX');
    if (!link || !modal || !scrim) return;
    let open = false;
    function set(v){
      open = v;
      modal.classList.toggle('on', v);
      scrim.classList.toggle('on', v);
      modal.setAttribute('aria-hidden', String(!v));
      scrim.setAttribute('aria-hidden', String(!v));
      document.body.style.overflow = v ? 'hidden' : '';
      const inp = modal.querySelector('.surface-input');
      if (v){ inp && setTimeout(() => inp.focus(), 80); }
      else { if (inp) inp.value = ''; link.focus(); }   /* reset the field when closed */
    }
    link.addEventListener('click', e => { e.preventDefault(); set(true); });
    closeX && closeX.addEventListener('click', () => set(false));
    scrim.addEventListener('click', () => set(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) set(false); });
  })();

  /* ── auth modals — "Sign in" opens the sign-in modal; its "Create an account"
     link swaps to the sign-up modal (and vice-versa). Closed by X / scrim / Esc.
     Illustrative only: the forms never submit, nothing is sent. ── */
  (function(){
    const signin = { m: document.getElementById('signinModal'), s: document.getElementById('signinScrim') };
    const signup = { m: document.getElementById('acctModal'),   s: document.getElementById('acctScrim') };
    if (!signin.m || !signup.m) return;
    const all = [signin, signup];
    let openM = null, lastTrigger = null;

    function hideAll(){
      all.forEach(x => { x.m.classList.remove('on'); x.s.classList.remove('on');
        x.m.setAttribute('aria-hidden','true'); x.s.setAttribute('aria-hidden','true'); });
    }
    function show(which){
      hideAll();
      which.m.classList.add('on'); which.s.classList.add('on');
      which.m.setAttribute('aria-hidden','false'); which.s.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      openM = which;
      const f = which.m.querySelector('input'); f && setTimeout(() => f.focus(), 80);
    }
    function close(){
      hideAll();
      document.body.style.overflow = '';
      openM = null;
      if (lastTrigger) lastTrigger.focus();
    }

    document.querySelectorAll('[data-signin]').forEach(t =>
      t.addEventListener('click', e => { e.preventDefault(); lastTrigger = t; show(signin); }));
    document.querySelectorAll('[data-signup]').forEach(t =>
      t.addEventListener('click', e => { e.preventDefault(); lastTrigger = t; show(signup); }));
    document.querySelectorAll('[data-open-signup]').forEach(a =>
      a.addEventListener('click', e => { e.preventDefault(); show(signup); }));
    document.querySelectorAll('[data-open-signin]').forEach(a =>
      a.addEventListener('click', e => { e.preventDefault(); show(signin); }));

    [document.getElementById('signinX'), document.getElementById('acctX')].forEach(x => x && x.addEventListener('click', close));
    all.forEach(x => x.s.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && openM) close(); });
    all.forEach(x => { const form = x.m.querySelector('form'); form && form.addEventListener('submit', e => e.preventDefault()); });

    /* sign-up password-strength meter — visual only */
    const pw = signup.m.querySelector('.acct-pw'), meter = document.getElementById('acctMeter');
    if (pw && meter){
      pw.addEventListener('input', () => {
        let n = 0;
        if (pw.value.length >= 10) n++;
        if (/\d/.test(pw.value)) n++;
        if (/[^A-Za-z0-9]/.test(pw.value)) n++;
        meter.style.width = (n / 3 * 100) + '%';
      });
    }
  })();

  /* ── assurance dashboard — 4 modules, tab-switched, animated on view / click ── */
  (function(){
    const tabs = document.getElementById('dashTabs');
    const badge = document.getElementById('dashBadge');
    const title = document.getElementById('dashTitle');
    const sub = document.getElementById('dashSub');
    const side = document.getElementById('dashSide');
    const statsEl = document.getElementById('dashStats');
    const findEl = document.getElementById('dashFinding');
    const coverEl = document.getElementById('dashCover');
    const askEl = document.getElementById('dashAsk');
    const card = document.getElementById('console');
    if (!tabs || !statsEl || !coverEl) return;

    const MODULES = [
      { badge:'Module 01 · Discover', title:'Discovery',
        sub:"What you're running, who owns it, and who is exposed by it.",
        nav:['Discover','Connect','Dashboard','Agents','Inventory','Activity feed'], active:2,
        stats:[
          {k:'Systems in scope', v:412, d:'+18 this week', tone:'', spark:[22,20,18,15,12,10,7,4]},
          {k:'Agents monitored', v:96, d:'14 with tool access', tone:'', spark:[19,20,15,17,12,13,8,7]},
          {k:'Findings open', v:6, d:'3 major', tone:'sig', spark:[16,18,9,19,7,16,6,12]} ],
        finding:{ kind:'Critical finding', t:'3 systems profile individuals with no owner on record',
          d:'Each one is in scope for EU AI Act Art. 6(3). None can claim the derogation.', cta:'Investigate' },
        coverT:'Coverage by surface',
        cover:[['Models','128',128/144,''],['Agents','96',96/144,''],['MCP servers','44',44/144,''],['Keys & tools','144',1,'']],
        ask:{ q:'Which systems have no owner on record?', chip:'High risk', tone:'' } },
      { badge:'Module 02 · Govern', title:'Applicability and evidence',
        sub:'Every control mapped to a probe, and a probe to proof.',
        nav:['Govern','Frameworks','Control mapping','Probes','Evidence','Findings'], active:2,
        stats:[
          {k:'Requirements assessed', v:61, d:'of 187 total', tone:'', spark:[21,19,17,14,12,9,7,5]},
          {k:'Conforming', v:34, suf:'%', d:'of assessed', tone:'', spark:[18,17,16,14,13,12,11,10]},
          {k:'Major findings', v:3, d:'2 new this week', tone:'sig', spark:[8,9,11,12,13,14,16,17]} ],
        finding:{ kind:'Major non-conformity', t:'Access control does not match the documented policy',
          d:'ISO 42001 A.4.2. The IAM scan contradicts the policy on file. Human review pending.', cta:'Review evidence' },
        coverT:'Conformance by framework',
        cover:[['EU AI Act','18/33',18/33,''],['ISO/IEC 42001','24/76',24/76,''],['ISO/IEC 23894','11/41',11/41,''],['NIST AI RMF','8/37',8/37,'']],
        ask:{ q:'Show me every control blocked on evidence', chip:'Unresolved', tone:'' } },
      { badge:'Module 03 · Adversarial', title:'Attack simulation',
        sub:'The OWASP LLM Top 10, run on a schedule against staging.',
        nav:['Adversarial','Test sets','OWASP LLM Top 10','Runs','Findings','Retest'], active:2,
        stats:[
          {k:'Probes · 24h', v:8412, d:'across 10 categories', tone:'', spark:[16,10,18,9,17,8,15,11]},
          {k:'Categories passing', v:5, d:'of 10', tone:'', spark:[14,13,14,12,13,12,13,12]},
          {k:'Failing', v:2, d:'injection, disclosure', tone:'sig', spark:[8,9,11,12,13,14,16,17]} ],
        finding:{ kind:'Open finding · LLM01', t:'468 of 1,204 indirect injection attempts succeeded',
          d:'Instructions hidden inside an uploaded document were followed. Re-tested every six hours.', cta:'View run detail' },
        coverT:'Pass rate by category',
        cover:[['LLM01 Prompt injection','61%',.61,'sig'],['LLM02 Disclosure','74%',.74,'sig'],['LLM06 Excessive agency','83%',.83,''],['LLM07 Prompt leakage','100%',1,'']],
        ask:{ q:'Why did LLM01 fail this run?', chip:'Highest priority', tone:'sig' } },
      { badge:'Module 04 · Guardrails', title:'Prompt inspection',
        sub:'Every prompt checked before the model sees it.',
        nav:['Guardrails','Inspection','Detectors','Policies','Prompt log','Escalations'], active:4,
        stats:[
          {k:'Inspected · 24h', v:12847, d:'prompts checked', tone:'', spark:[22,20,17,15,12,10,7,4]},
          {k:'Masked', v:1204, d:'redacted, reversible', tone:'', spark:[19,20,16,17,13,14,9,8]},
          {k:'Leaked', v:1, d:'escalated to DPO', tone:'sig', spark:[16,19,9,20,7,17,5,11]} ],
        finding:{ kind:'Escalated', t:'A national ID reached the model unmasked',
          d:'It arrived through a document the retrieval layer injected, not the typed prompt. The filter reads the prompt, not the assembled context.', cta:'View escalation' },
        coverT:'Detector hits · 24h',
        cover:[['Name (NER)','1,204',1,''],['Email','1,118',1118/1204,''],['Phone','744',744/1204,''],['National ID','28',28/1204,'sig']],
        ask:{ q:'What leaked in the last 24 hours?', chip:'Escalated', tone:'sig' } }
    ];

    /* Arabic is a TEXT-ONLY overlay: every number, sparkline and bar fraction
       still comes from MODULES above, so the two languages can never drift
       apart on the data. Framework names, LLM0x codes and NER stay Latin. */
    const MODULES_AR = [
      { badge:'الوحدة 01 · الاكتشاف', title:'الاكتشاف',
        sub:'ما الذي تشغّلونه، ومن يملكه، ومن يتعرّض له.',
        nav:['الاكتشاف','الربط','لوحة المعلومات','الوكلاء','الجرد','سجل النشاط'],
        statK:['الأنظمة ضمن النطاق','الوكلاء المراقَبون','النتائج المفتوحة'],
        statD:['+18 هذا الأسبوع','14 منها يصل إلى الأدوات','3 جوهرية'],
        kind:'نتيجة حرجة', t:'3 أنظمة تُنشئ ملفات عن أفراد دون مالك مسجَّل',
        d:'كلٌّ منها يقع ضمن نطاق EU AI Act المادة 6(3)، ولا يمكن لأيٍّ منها الاستفادة من الاستثناء.',
        coverT:'التغطية حسب السطح',
        coverL:['النماذج','الوكلاء','خوادم MCP','المفاتيح والأدوات'],
        askQ:'ما الأنظمة التي بلا مالك مسجَّل؟', askChip:'مخاطر عالية', cta:'تحقيق' },
      { badge:'الوحدة 02 · الحوكمة', title:'قابلية التطبيق والأدلة',
        sub:'كل ضابط مرتبط باختبار، وكل اختبار بدليل.',
        nav:['الحوكمة','الأطر','ربط الضوابط','الاختبارات','الأدلة','النتائج'],
        statK:['المتطلبات المُقيَّمة','المطابقة','النتائج الجوهرية'],
        statD:['من أصل 187','من المُقيَّم','2 جديدة هذا الأسبوع'],
        kind:'عدم مطابقة جوهري', t:'التحكم في الوصول لا يطابق السياسة الموثَّقة',
        d:'ISO 42001 A.4.2. فحص إدارة الهوية يناقض السياسة المحفوظة. المراجعة البشرية قيد الانتظار.',
        coverT:'المطابقة حسب الإطار',
        coverL:['EU AI Act','ISO/IEC 42001','ISO/IEC 23894','NIST AI RMF'],
        askQ:'أرني كل ضابط محظور على الدليل', askChip:'غير محلول', cta:'مراجعة الدليل' },
      { badge:'الوحدة 03 · الاختبار العدائي', title:'محاكاة الهجمات',
        sub:'قائمة OWASP LLM Top 10، تُنفَّذ وفق جدول على بيئة التجهيز.',
        nav:['الاختبار العدائي','مجموعات الاختبار','OWASP LLM Top 10','الجولات','النتائج','إعادة الاختبار'],
        statK:['الاختبارات · 24 ساعة','الفئات الناجحة','الفئات الراسبة'],
        statD:['عبر 10 فئات','من أصل 10','الحقن والإفشاء'],
        kind:'نتيجة مفتوحة · LLM01', t:'نجحت 468 محاولة حقن غير مباشر من أصل 1,204',
        d:'اتُّبعت تعليمات مخفية داخل مستند مرفوع. تُعاد الاختبارات كل ست ساعات.',
        coverT:'معدل النجاح حسب الفئة',
        coverL:['LLM01 حقن الطلبات','LLM02 إفشاء المعلومات','LLM06 الصلاحية المفرطة','LLM07 تسريب الطلبات'],
        askQ:'لماذا فشل LLM01 في هذه الجولة؟', askChip:'أولوية قصوى', cta:'عرض تفاصيل الجولة' },
      { badge:'الوحدة 04 · حواجز الحماية', title:'فحص الطلبات',
        sub:'كل طلب يُفحص قبل أن يصل إلى النموذج.',
        nav:['حواجز الحماية','الفحص','الكواشف','السياسات','سجل الطلبات','التصعيدات'],
        statK:['المفحوصة · 24 ساعة','المُخفاة','المُسرَّبة'],
        statD:['طلبًا جرى فحصه','مُنقَّحة وقابلة للاسترجاع','صُعِّدت إلى مسؤول حماية البيانات'],
        kind:'مُصعَّد', t:'وصل رقم هوية وطنية إلى النموذج دون إخفاء',
        d:'وصل عبر مستند أدرجته طبقة الاسترجاع، لا عبر الطلب المكتوب. المرشِّح يقرأ الطلب، لا السياق المُجمَّع.',
        coverT:'إصابات الكواشف · 24 ساعة',
        coverL:['الاسم (NER)','البريد الإلكتروني','الهاتف','رقم الهوية الوطنية'],
        askQ:'ما الذي تسرَّب خلال آخر 24 ساعة؟', askChip:'مُصعَّد', cta:'عرض التصعيد' }
    ];

    /* i18n.init() has already run by the time this IIFE executes, so read the
       restored language rather than assuming English — otherwise a reload with
       Arabic saved paints the dashboard in English until the toggle is used. */
    let lang = window.TaharaI18N && window.TaharaI18N.current === 'ar' ? 'ar' : 'en';
    let modIdx = 0;

    /* the module as it should read in the current language */
    function view(i){
      const m = MODULES[i];
      if (lang !== 'ar') return m;
      const a = MODULES_AR[i];
      return { badge:a.badge, title:a.title, sub:a.sub, nav:a.nav, active:m.active,
        stats: m.stats.map((s,j)=>Object.assign({}, s, { k:a.statK[j], d:a.statD[j] })),
        finding:{ kind:a.kind, t:a.t, d:a.d, cta:a.cta },
        coverT:a.coverT,
        cover: m.cover.map((r,j)=>[a.coverL[j], r[1], r[2], r[3]]),
        ask:{ q:a.askQ, chip:a.askChip, tone:m.ask.tone } };
    }

    const XS = [0,14,28,42,56,70,84,100];
    const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    function sparkSVG(pts, tone){
      const d = pts.map((y,i)=>(i?'':'M')+XS[i]+' '+y).join(' ');
      const col = tone==='sig' ? '#b5651d' : '#114086';
      return '<svg class="dash-spark" viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true"><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    /* build a module in its pre-animation state (0 counts, empty bars) */
    function render(m){
      badge.textContent = m.badge.toUpperCase();
      title.textContent = m.title;
      sub.textContent = m.sub;
      side.innerHTML = m.nav.map((n,idx)=> idx===0
        ? '<div class="dash-nav-mod"><span class="dash-ring"></span>'+esc(n)+'</div>'
        : '<a class="dash-nav-item'+(idx===m.active?' on':'')+'" href="#" onclick="return false">'+esc(n)+'</a>').join('');
      statsEl.innerHTML = m.stats.map(s=>
        '<div class="dash-card"><div class="dash-card-k">'+esc(s.k)+'</div>'+
        '<div class="dash-card-v" data-v="'+s.v+'" data-suf="'+(s.suf||'')+'">0'+(s.suf||'')+'</div>'+
        '<div class="dash-card-foot"><span class="dash-card-d'+(s.tone==='sig'?' sig':'')+'">'+esc(s.d)+'</span>'+
        sparkSVG(s.spark,s.tone)+'</div></div>').join('');
      findEl.innerHTML = '<span class="dash-kicker"><i></i>'+esc(m.finding.kind).toUpperCase()+'</span>'+
        '<div class="dash-finding-b"><h4>'+esc(m.finding.t)+'</h4><p>'+esc(m.finding.d)+'</p>'+
        '<a class="dash-finding-cta" href="#" onclick="return false">'+esc(m.finding.cta)+' <span class="arw">→</span></a></div>';
      coverEl.innerHTML = '<span class="dash-cover-t">'+esc(m.coverT).toUpperCase()+'</span>'+
        m.cover.map(r=>'<div class="dash-bar-row"><span class="dash-bar-l">'+esc(r[0])+'</span>'+
          '<span class="dash-bar-v">'+esc(r[1])+'</span>'+
          '<span class="dash-bar-track"><i class="dash-bar-fill'+(r[3]==='sig'?' sig':'')+'" data-frac="'+r[2]+'"></i></span></div>').join('');
      if (askEl) askEl.innerHTML =
        '<p class="dash-ask-q">'+esc(m.ask.q)+'<i class="dash-caret"></i></p>'+
        '<div class="dash-ask-foot">'+
          '<span class="dash-avatars"><i>M</i><i>A</i><i>S</i><b>+3</b></span>'+
          '<span class="dash-ask-tag'+(m.ask.tone==='sig'?' sig':'')+'">'+esc(m.ask.chip)+'</span>'+
          '<button class="dash-ask-send" type="button" aria-label="Send"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'+
        '</div>';
    }

    /* animate the current module in */
    function animate(){
      statsEl.querySelectorAll('.dash-card-v').forEach(el=>{
        const target = +el.dataset.v, suf = el.dataset.suf||'', t0 = performance.now(), dur = 1000;
        (function step(now){
          const p = Math.min(1,(now-t0)/dur), e = 1-Math.pow(1-p,3);
          el.textContent = Math.round(target*e).toLocaleString('en-US')+suf;
          if (p<1) requestAnimationFrame(step);
        })(t0);
      });
      statsEl.querySelectorAll('.dash-spark path').forEach(p=>{
        const len = p.getTotalLength();
        p.style.transition='none'; p.style.strokeDasharray=len; p.style.strokeDashoffset=len;
        p.getBoundingClientRect();
        p.style.transition='stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)'; p.style.strokeDashoffset='0';
      });
      coverEl.querySelectorAll('.dash-bar-fill').forEach(el=>{
        const w = Math.max(0,Math.min(1,+el.dataset.frac))*100;
        el.style.transition='none'; el.style.width='0%'; el.getBoundingClientRect();
        el.style.transition='width .9s cubic-bezier(.16,1,.3,1)'; el.style.width=w+'%';
      });
    }

    render(view(0));
    tabs.querySelectorAll('.dash-tab').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        tabs.querySelectorAll('.dash-tab').forEach(b=>b.classList.toggle('on', b===btn));
        modIdx = +btn.dataset.mod;
        render(view(modIdx));
        animate();
      });
    });

    /* Unlike the mega-menu/FAQ/footer/drawer, the AR copy lives in this IIFE
       rather than in the i18n module, so the hook takes the language code and
       repaints whichever tab is currently open. */
    window.TaharaDash = { setLocale(l){ lang = l === 'ar' ? 'ar' : 'en'; render(view(modIdx)); animate(); } };
    /* first scroll into view animates the default module */
    if ('IntersectionObserver' in window && card){
      new IntersectionObserver((es,obs)=>{ if (es[0].isIntersecting){ animate(); obs.disconnect(); } }, { threshold:.2 }).observe(card);
    } else { animate(); }
  })();

  /* ── platform "Scan" card — count the numbers up when it scrolls into view ── */
  (function(){
    const plat = document.querySelector('.plat');
    if (!plat) return;
    function run(){
      plat.querySelectorAll('.pn[data-v]').forEach(el=>{
        const target = +el.dataset.v, suf = el.dataset.suf||'', t0 = performance.now(), dur = 1100;
        (function step(now){
          const p = Math.min(1,(now-t0)/dur), e = 1-Math.pow(1-p,3);
          el.textContent = Math.round(target*e).toLocaleString('en-US')+suf;
          if (p<1) requestAnimationFrame(step);
        })(t0);
      });
      /* type out the audit-trail search query */
      const pq = plat.querySelector('.pq');
      if (pq){
        const full = pq.textContent; let i = 0; pq.textContent = '';
        (function type(){ pq.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(type, 55); })();
      }
    }
    if ('IntersectionObserver' in window){
      new IntersectionObserver((es,obs)=>{ if (es[0].isIntersecting){ run(); obs.disconnect(); } }, { threshold:.3 }).observe(plat);
    } else run();
  })();

  /* ── hero rotating word — soft blur cross-fade through the list, navy accent.
     On wide screens the slot is pre-sized to the widest word so the static
     "Built for AI" never shifts as words swap. ── */
  (function(){
    const wrap = document.getElementById('heroRot');
    const el   = document.getElementById('heroRotWord');
    if (!wrap || !el) return;
    const EN = ['govern it.','test it.','prove it.','defend it.'];
    const AR = ['احكمها.','اختبرها.','أثبتها.','دافع عنها.'];
    const list = () => (document.documentElement.getAttribute('dir') === 'rtl') ? AR : EN;
    let i = 0, swapping = false;
    function fit(){
      wrap.style.minWidth = '';
      if (innerWidth <= 700) return;               /* let it wrap naturally on phones */
      const cur = el.textContent;
      let max = 0;
      list().forEach(w => { el.textContent = w; if (el.offsetWidth > max) max = el.offsetWidth; });
      el.textContent = cur;
      wrap.style.minWidth = Math.ceil(max) + 'px';
    }
    el.textContent = list()[0];
    fit();
    addEventListener('load', fit);
    addEventListener('resize', fit);
    function next(){
      if (document.hidden) return;                 /* pause in a background tab */
      swapping = true;
      el.classList.add('out');                     /* current word drifts up + blurs out */
      setTimeout(() => {
        i = (i + 1) % list().length;
        el.textContent = list()[i];
        el.classList.add('pre'); el.classList.remove('out');   /* seat below, no transition */
        void el.offsetWidth;                       /* reflow so the ease-in plays */
        el.classList.remove('pre');                /* new word eases up into place */
        swapping = false;
      }, 460);
    }
    setInterval(next, 2600);
    document.addEventListener('tahara:i18n', () => { if (!swapping){ el.textContent = list()[i]; fit(); } });
  })();

  /* ── resources dropdown (compact) — opens on hover (wide) and click ── */
  (function(){
    const wrap = document.getElementById('resWrap');
    const btn  = document.getElementById('resBtn');
    if (!wrap || !btn) return;
    let dopen = false, hideT = 0;
    const wide = () => matchMedia('(hover:hover) and (pointer:fine)').matches && innerWidth > 860;
    const set = v => {
      dopen = v; wrap.classList.toggle('open', v); btn.setAttribute('aria-expanded', String(v));
      if (v) document.dispatchEvent(new CustomEvent('tahara:menu-open', { detail:'resources' }));
    };
    /* close this one if the platform mega (or any other menu) opens */
    document.addEventListener('tahara:menu-open', e => { if (e.detail !== 'resources') set(false); });
    btn.addEventListener('click', e => { e.preventDefault(); set(!dopen); });
    wrap.addEventListener('mouseenter', () => { if (wide()){ clearTimeout(hideT); set(true); } });
    wrap.addEventListener('mouseleave', () => { if (wide()){ clearTimeout(hideT); hideT = setTimeout(() => set(false), 160); } });
    document.addEventListener('click', e => { if (dopen && !wrap.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dopen){ set(false); btn.focus(); } });
  })();

  /* ── 8 · boot ── */
  if (REDUCE){
    consoleEl.style.setProperty('--t', 1);
    consoleEl.classList.add('lit');
    UI.countersInstant();
    pin && (pin.style.setProperty('--m', 0), pin.style.setProperty('--sp', 1));
    layers.forEach(l => l.style.setProperty('--e', 1));
    items.forEach(it => { it.style.setProperty('--seen', 1); it.style.setProperty('--ch', (it._tw || 0)); });
    assembledOnce = true;
    stackStage && stackStage.classList.add('ready');
    mark && mark.classList.add('on');
    journey && journey.style.setProperty('--jp', 1);
    cards.forEach(c => c.classList.remove('dim'));
  } else {
    frame();
    wake();
  }
})();

/* ── narrow-screen header ────────────────────────────────────
   On a phone the header can't hold the brand, the language switch, the demo
   button AND the burger — everything wraps and the brand breaks onto two
   lines. Below 700px the switch moves into the drawer, leaving the demo
   button as the only call to action in the bar.

   The node is MOVED, not cloned: its listeners were bound directly at boot
   (langSwitch by id) and survive relocation, where a clone would arrive inert
   and a duplicate id would break getElementById.
   ────────────────────────────────────────────────────────── */
(function(){
  const nav   = document.querySelector('nav');
  const links = document.getElementById('navLinks');
  const right = nav && nav.querySelector('.nav-right');
  const lang  = document.getElementById('langSwitch');
  const demo  = right && right.querySelector('.btn');
  if (!links || !right || !lang || !demo) return;

  const mq = window.matchMedia('(max-width:700px)');
  function place(){
    if (mq.matches){
      if (lang.parentElement !== links) links.appendChild(lang);
    } else if (lang.parentElement !== right){
      right.insertBefore(lang, demo);        /* restore original order: */
    }                                        /* lang · demo · burger      */
  }
  place();
  mq.addEventListener ? mq.addEventListener('change', place) : mq.addListener(place);
})();

