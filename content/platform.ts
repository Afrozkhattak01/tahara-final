export type PlatformItem = [mono: string, title: string, desc: string, soon: boolean, splitBefore?: boolean];
export type PlatformCol = [heading: string, items: PlatformItem[]];

export const PLATFORM_MENU: PlatformCol[] = [
    ['Governance', [
      ['AE',  'Applicability engine',      'Which laws apply, and why',             false],
      ['GA',  'Gap assessment',            "What's missing, ranked by risk",        false],
      ['SoA', 'Statement of applicability','Every control, justified',              false],
      ['EL',  'Evidence locker',           'Proof, stored and dated',               false],
      ['AL',  'Audit ledger',              'Tamper-proof history',                  false],
      ['VR',  'Vendor risk',               'Track third-party AI vendors',          true ],
      ['AR',  'Access reviews',            'Who can touch what, checked regularly', true ]
    ]],
    ['Adversarial', [
      ['AS',  'Attack simulation',         'Scheduled, staging only',               false],
      ['10',  'OWASP LLM top 10',          'Every category, tracked',               false],
      ['RT',  'Red-team scheduling',       'Recurring, not annual',                 false],
      ['FR',  'Findings register',         'Every result, kept',                    false]
    ]],
    ['PII guardrails', [
      ['PI',  'Prompt inspection',         'Checked before the model sees it',      false],
      ['MR',  'Masking & redaction',       'Reversible, on our side only',          false],
      ['BD',  'Bilingual detection',       'English and Roman Urdu',                false],
      ['CC',  'Cookie & consent',          'Banner rules, tracker checks',          true ]
    ]],
    ['Vulnerability + resources', [
      ['CC',  'Cloud config scan',         'IAM, storage, network rules',           false],
      ['DC',  'Dependency checks',         'Known CVEs, flagged',                   false],
      ['SD',  'Secret detection',          'Exposed keys, caught early',            false],
      ['TC',  'Trust center',              'Our own posture, public',               false, true],
      ['DPO', 'DPO contact',               'Talk to our data officer',              false],
      ['BL',  'Blog',                      'Notes on AI assurance',                 false],
      ['DC',  'Documentation',             'API and integration guides',            false],
      ['AP',  'Audit programs',            'Scope, run, and report an audit',       true ]
    ]]
  ];
export const PLATFORM_MENU_AR: PlatformCol[] = [
    ['الحوكمة', [
      ['AE',  'محرك الانطباق',        'ما القوانين المنطبقة، ولماذا',        false],
      ['GA',  'تقييم الفجوات',        'ما الناقص، مرتّبًا حسب المخاطر',      false],
      ['SoA', 'بيان الانطباق',        'كل ضابط، مبرَّر',                    false],
      ['EL',  'خزانة الأدلة',         'إثبات، مخزَّن ومؤرَّخ',              false],
      ['AL',  'سجلّ التدقيق',         'سجلّ غير قابل للتلاعب',              false],
      ['VR',  'مخاطر المورّدين',       'تتبّع موردي الذكاء الاصطناعي الخارجيين', true],
      ['AR',  'مراجعات الوصول',       'من يمكنه الوصول لماذا، بمراجعة دورية', true]
    ]],
    ['الاختبار العدائي', [
      ['AS', 'محاكاة الهجوم', 'مجدولة، في بيئة التجربة فقط', false],
      ['10', 'أعلى 10 مخاطر LLM حسب OWASP', 'كل فئة، متتبَّعة', false],
      ['RT', 'جدولة الفريق الأحمر', 'متكررة، وليست سنوية', false],
      ['FR', 'سجلّ النتائج', 'كل نتيجة، محفوظة', false]
    ]],
    ['ضوابط حماية البيانات الشخصية', [
      ['PI', 'فحص الطلبات', 'يُفحص قبل وصوله إلى النموذج', false],
      ['MR', 'الإخفاء والتنقيح', 'قابل للعكس، من جانبنا فقط', false],
      ['BD', 'الكشف ثنائي اللغة', 'الإنجليزية والعربية بالحروف اللاتينية', false],
      ['CC', 'ملفات تعريف الارتباط والموافقة', 'قواعد اللافتات وفحوصات المتتبّعات', true]
    ]],
    ['الفحص الأمني والموارد', [
      ['CC', 'فحص إعدادات السحابة', 'إدارة الهوية والتخزين وقواعد الشبكة', false],
      ['DC', 'فحص التبعيات', 'ثغرات معروفة، مُعلَّمة', false],
      ['SD', 'كشف الأسرار', 'مفاتيح مكشوفة، تُكتشف مبكرًا', false],
      ['TC', 'مركز الثقة', 'وضعنا الأمني الخاص، بشكل علني', false, true],
      ['DPO', 'التواصل مع مسؤول حماية البيانات', 'تحدَّث مع مسؤول البيانات لدينا', false],
      ['BL', 'المدوّنة', 'ملاحظات حول ضمان الذكاء الاصطناعي', false],
      ['DC', 'التوثيق', 'أدلة الواجهة البرمجية والتكامل', false],
      ['AP', 'برامج التدقيق', 'تحديد نطاق التدقيق وتنفيذه وإعداد تقاريره', true]
    ]]
  ];
