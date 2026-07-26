export type Lang = 'en' | 'ar';

export const STORE_KEY = 'tahara-lang';
export const ARABIC_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap';

// Flat strings only — anything array-shaped (mega-menu, FAQ answers, footer
// links, framework drawer detail) lives with its English counterpart in its
// own content/*.ts file instead, bundled EN+AR together. This file is just
// the single-string dictionary that LanguageProvider's t(key) reads from.
//
// Scope, agreed before building:
//   · full text translation and RTL layout for all real content
//   · decorative motion (3D lattice, marquee scroll, radar sweep, isometric
//     stack fly-in) is left exactly as-is — it has no reading direction
//   · standard/framework names (ISO/IEC 42001, OWASP LLM Top 10) and
//     connector/brand names (Slack, GitHub, OpenAI…) stay in English/Latin
//     script — normal practice in enterprise software
//   · the Arabic text below is an AI-drafted first pass. Treat it as a
//     strong draft, not final copy — have a native speaker review it
//     before this goes in front of real customers, particularly the
//     compliance/legal terminology.
export const I18N: Record<string, { en: string; ar: string }> = {

    'nav.platform':   { en:'Platform',  ar:'المنصة' },
    'nav.lifecycle':  { en:'Lifecycle', ar:'دورة الحياة' },
    'nav.architecture':{ en:'Architecture', ar:'البنية' },
    'nav.resources':  { en:'Resources', ar:'الموارد' },
    'nav.faq':        { en:'FAQ', ar:'الأسئلة الشائعة' },
    'nav.signin':     { en:'Sign in', ar:'تسجيل الدخول' },

    'cta.demo':    { en:'Request a demo', ar:'اطلب عرضًا توضيحيًا' },
    'cta.seehow':  { en:'See how it works', ar:'شاهد كيف يعمل' },
    'cta.browse':  { en:'Browse connectors', ar:'تصفح الموصلات' },
    'cta.askteam': { en:'Ask our team', ar:'اسأل فريقنا' },
    'cta.talkeng': { en:'Talk to an engineer', ar:'تحدث مع مهندس' },
    'cta.title':   { en:'Put your AI under control.', ar:'ضع الذكاء الاصطناعي لديك تحت السيطرة.' },
    'cta.body':    { en:'Thirty minutes on your own estate: what we would find, and what we would block.',
                     ar:'ثلاثون دقيقة على بيئتك الخاصة: ما الذي سنكتشفه، وما الذي سنمنعه.' },

    'ribbon.text': { en:'The 2026 Agentic AI Assurance Report', ar:'تقرير ضمان الذكاء الاصطناعي الوكيل لعام 2026' },

    'hero.title': { en:'Know what your AI did, and <span class="accent">prove it</span>.',
                     ar:'اعرف ما فعله ذكاؤك الاصطناعي، و<span class="accent">أثبت ذلك</span>.' },
    'hero.lede': { en:'Discovery, live enforcement and audit-ready evidence — for every model, agent and prompt you run.',
                   ar:'الاكتشاف والإنفاذ الحي وأدلة جاهزة للتدقيق — لكل نموذج ووكيل وطلب تشغّله.' },
    'hero.note': { en:'Runs in your tenancy. Nothing leaves your boundary.',
                   ar:'يعمل داخل بيئتك الخاصة. لا شيء يغادر حدودك.' },

    'eyebrow.platform':    { en:'The platform', ar:'المنصة' },
    'eyebrow.whatwedo':    { en:'What we do', ar:'ما الذي نقوم به' },
    'eyebrow.architecture':{ en:'Architecture', ar:'البنية' },
    'eyebrow.alignment':   { en:'Alignment', ar:'التوافق' },
    'eyebrow.answers':     { en:'Answers', ar:'الإجابات' },

    'platform.title': { en:'One record of truth for every AI system you run.',
                        ar:'سجل حقيقة واحد لكل نظام ذكاء اصطناعي تشغّله.' },
    'platform.lede':  { en:'Discovery, enforcement and evidence on a single timeline.',
                        ar:'الاكتشاف والإنفاذ والأدلة على جدول زمني واحد.' },

    'rec.discovery.title': { en:'Find the AI nobody registered.', ar:'اعثر على الذكاء الاصطناعي الذي لم يسجّله أحد.' },
    'rec.discovery.desc':  { en:'Models, agents, MCP servers and keys — mapped, owned and risk-tiered, then probed the way an attacker would.',
                             ar:'النماذج والوكلاء وخوادم MCP والمفاتيح — مُخطَّطة ومملوكة ومصنّفة حسب المخاطر، ثم مختبَرة بالطريقة التي يتّبعها مهاجم.' },
    'rec.runtime.title':   { en:'Stop unsafe calls while they run.', ar:'أوقف الاستدعاءات غير الآمنة أثناء تشغيلها.' },
    'rec.runtime.desc':    { en:'Allow, redact, escalate or block — before the model ever sees it.',
                             ar:'السماح أو التنقيح أو التصعيد أو الحظر — قبل أن يصل الأمر إلى النموذج أصلًا.' },
    'rec.evidence.title':  { en:'Evidence an auditor can read alone.', ar:'أدلة يمكن للمدقق قراءتها بمفرده.' },
    'rec.evidence.desc':   { en:'Append-only log, packaged against the control it satisfies.',
                             ar:'سجلّ إلحاقي فقط، مُجهَّز مقابل الضابط الذي يستوفيه.' },

    'rec.discovery.tag':      { en:'Discovery & red team', ar:'الاكتشاف والفريق الأحمر' },
    'rec.discovery.scanning': { en:'SCANNING', ar:'جارٍ الفحص' },
    'rec.discovery.redteam':  { en:'Red team', ar:'الفريق الأحمر' },
    'rec.discovery.notek':    { en:'What the red team does', ar:'ما الذي يقوم به الفريق الأحمر' },
    'rec.discovery.notebody': { en:'Finding a system is only half of it. Every model and agent we discover is then attacked the way an outsider would — prompt injection, jailbreaks, tool-chain abuse and attempts to pull data out — and each finding is scored against OWASP LLM Top 10, handed to the owning team, and retested once it is fixed.',
                                ar:'العثور على النظام نصف المهمة فقط. كل نموذج ووكيل نكتشفه يُهاجَم بعد ذلك بالطريقة التي يتّبعها طرف خارجي — حقن الطلبات، كسر القيود، إساءة استخدام سلسلة الأدوات ومحاولات استخراج البيانات — وتُقيَّم كل نتيجة مقابل أعلى 10 مخاطر LLM حسب OWASP، وتُسلَّم إلى الفريق المالك، وتُعاد اختبارها بعد إصلاحها.' },
    'rec.discovery.stat1k':   { en:'Probes fired', ar:'عمليات فحص منفَّذة' },
    'rec.discovery.stat2k':   { en:'Findings', ar:'النتائج' },
    'rec.discovery.stat3k':   { en:'Retest', ar:'إعادة الاختبار' },
    'rec.discovery.stat3v':   { en:'Auto', ar:'تلقائي' },

    'rec.runtime.tag':    { en:'Runtime', ar:'وقت التشغيل' },
    'rec.runtime.policy': { en:'POLICY', ar:'السياسة' },

    'rec.evidence.tag':       { en:'Evidence', ar:'الأدلة' },
    'rec.evidence.sealed':    { en:'SEALED', ar:'مختوم' },
    'rec.evidence.writing':   { en:'WRITING', ar:'قيد الكتابة' },
    'rec.evidence.sealedtag': { en:'SEALED', ar:'مختوم' },

    'lifecycle.title': { en:'Cover the whole life of a model.', ar:'تغطية دورة حياة النموذج بأكملها.' },
    'lifecycle.lede':  { en:'Four stages, one engagement — each handing the next its evidence.',
                         ar:'أربع مراحل، تكليف واحد — كل مرحلة تسلّم التالية أدلتها.' },

    'dossier.assess.stage':  { en:'Assess', ar:'التقييم' },
    'dossier.assess.title':  { en:'Risk assessment and treatment', ar:'تقييم المخاطر ومعالجتها' },
    'dossier.assess.b1': { en:'Risk tiering for models and agents', ar:'تصنيف المخاطر للنماذج والوكلاء' },
    'dossier.assess.b2': { en:'Bias, robustness and privacy tests', ar:'اختبارات التحيّز والمتانة والخصوصية' },
    'dossier.assess.b3': { en:'Treatment plan with named owners', ar:'خطة معالجة بمالكين محدَّدين' },
    'dossier.assess.cta':{ en:'See the method', ar:'اطّلع على المنهجية' },

    'dossier.govern.stage':  { en:'Govern', ar:'الحوكمة' },
    'dossier.govern.title':  { en:'Governance system', ar:'نظام الحوكمة' },
    'dossier.govern.b1': { en:'Policy set aligned to ISO/IEC 42001', ar:'مجموعة سياسات متوافقة مع ISO/IEC 42001' },
    'dossier.govern.b2': { en:'Approvals with evidence attached', ar:'موافقات مرفق بها الأدلة' },
    'dossier.govern.b3': { en:'A register that stays current', ar:'سجلّ يبقى محدَّثًا باستمرار' },
    'dossier.govern.cta':{ en:'See the framework', ar:'اطّلع على الإطار' },

    'dossier.test.stage':    { en:'Test', ar:'الاختبار' },
    'dossier.test.title':    { en:'Adversarial testing', ar:'الاختبار العدائي' },
    'dossier.test.b1': { en:'Jailbreak sets mapped to OWASP LLM Top 10', ar:'مجموعات اختراق مطابقة لقائمة OWASP LLM Top 10' },
    'dossier.test.b2': { en:'Tool-chain and agent abuse cases', ar:'حالات إساءة استخدام سلسلة الأدوات والوكلاء' },
    'dossier.test.b3': { en:'Retest on every material change', ar:'إعادة اختبار عند كل تغيير جوهري' },
    'dossier.test.cta':{ en:'See the test set', ar:'اطّلع على مجموعة الاختبار' },

    'dossier.monitor.stage': { en:'Monitor', ar:'المراقبة' },
    'dossier.monitor.title': { en:'Continuous monitoring', ar:'المراقبة المستمرة' },
    'dossier.monitor.b1': { en:'Drift, refusal and grounding failures', ar:'الانحراف والرفض وإخفاقات الإسناد الواقعي' },
    'dossier.monitor.b2': { en:'Policy hits and overrides', ar:'مطابقات السياسات وتجاوزاتها' },
    'dossier.monitor.b3': { en:'Alerts routed into your SOC', ar:'تنبيهات موجَّهة إلى مركز العمليات الأمنية لديكم' },
    'dossier.monitor.cta':{ en:'See the signals', ar:'اطّلع على المؤشرات' },

    'stack.title': { en:'Assurance runs the full depth of the stack.', ar:'يعمل الضمان عبر العمق الكامل للمنظومة.' },
    'stack.lede':  { en:'A guardrail at one layer is easy to walk around. Tahara instruments five — then reads them as one.',
                     ar:'يسهل الالتفاف حول حاجز حماية في طبقة واحدة. تُجهّز Tahara خمس طبقات — ثم تقرأها ككيان واحد.' },
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
    'connect.sub':   { en:'Model providers, vector stores, agent frameworks, identity and SIEM — via your gateway or a sidecar.',
                       ar:'مزوّدو النماذج، مخازن المتجهات، أُطر الوكلاء، الهوية وأنظمة SIEM — عبر بوابتكم أو خدمة مرافقة.' },

    'frameworks.title': { en:'Aligned to the frameworks your regulator reads.', ar:'متوافق مع الأطر التي تعتمدها جهتكم التنظيمية.' },
    'frameworks.lede':  { en:'Every control ships with its mapping.', ar:'كل ضابط يأتي مصحوبًا بربطه المرجعي.' },
    'drawer.download':  { en:'Download the mapping', ar:'تنزيل ربط المعيار' },
    'drawer.maplabel':  { en:'What Tahara maps', ar:'ما الذي تربطه Tahara' },

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
    'faq.answer':   { en:'Answer', ar:'الإجابة' },
    'faq.stillnot': { en:'Still not covered?', ar:'لم تجد إجابتك بعد؟' },
    'faq.q1': { en:'How do you find AI nobody told us about?', ar:'كيف تكتشفون ذكاءً اصطناعيًا لم يُخبرنا به أحد؟' },
    'faq.q2': { en:'Does it sit in the request path?', ar:'هل يقف في مسار الطلب؟' },
    'faq.q3': { en:'What happens when an agent reaches for sensitive data?', ar:'ماذا يحدث عندما يحاول وكيل الوصول إلى بيانات حسّاسة؟' },
    'faq.q4': { en:'Can we keep our models and data private?', ar:'هل يمكننا إبقاء نماذجنا وبياناتنا خاصة؟' },
    'faq.q5': { en:'How is this different from an AI gateway?', ar:'ما الفرق بين هذا وبوابة الذكاء الاصطناعي؟' },
    'faq.q6': { en:'How long before we see something useful?', ar:'كم يستغرق ظهور نتائج مفيدة؟' },
    'faq.mostasked': { en:'Most asked', ar:'الأكثر شيوعًا' },
    'faq.helpful':   { en:'Was this helpful?', ar:'هل كانت هذه الإجابة مفيدة؟' },
    'faq.thanks':    { en:'Thanks — noted.', ar:'شكرًا — تم التسجيل.' },

    'mega.demo.k':     { en:'Guided demo', ar:'عرض توضيحي موجَّه' },
    'mega.demo.title': { en:'See Tahara in action', ar:'شاهد Tahara في العمل' },
    'mega.demo.desc':  { en:'A 30-minute walkthrough, tailored to your stack', ar:'جولة مدتها 30 دقيقة، مصمَّمة خصيصًا لمنظومتكم' },
    'mega.comingsoon': { en:'Coming soon', ar:'قريبًا' },

    'strip.tenancy':    { en:'Runs in your tenancy', ar:'يعمل داخل بيئتكم' },
    'strip.nomodel':    { en:'No model changes', ar:'دون تغييرات على النماذج' },
    'strip.reportweek': { en:'Report in week one', ar:'تقرير في الأسبوع الأول' },

    'footer.tagline':   { en:'Safety, governance and transparency for the AI you actually run.',
                          ar:'السلامة والحوكمة والشفافية للذكاء الاصطناعي الذي تشغّلونه فعليًا.' },
    'footer.motto':     { en:'SAFE · ETHICAL · TRANSPARENT', ar:'آمن · أخلاقي · شفّاف' },
    'footer.copyright': { en:'© 2026 Tahara AI. All rights reserved.', ar:'© 2026 Tahara AI. جميع الحقوق محفوظة.' }
};
