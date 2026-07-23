/* Questions themselves are flat I18N keys (faq.q1..faq.q6) — only the
   multi-line answers need a language-specific array here. */
export const QUESTION_KEYS = ['faq.q1','faq.q2','faq.q3','faq.q4','faq.q5','faq.q6'];

export const ANSWERS: string[][] = [
    ['Tahara reads signals your estate already produces — gateway traffic, cloud AI usage,',
     'keys sitting in the secret store, and model references in code and CI.',
     'Each finding arrives with a proposed owner and a suggested risk tier.'],
    ['Only for enforcement. Discovery and monitoring are entirely passive.',
     'Inline control runs through your existing gateway or a sidecar, and',
     'fail-open or fail-closed is set per policy — not for the whole deployment.'],
    ['The call is checked against the agent’s declared scope and the data’s classification.',
     'Tahara can allow it, redact fields, require step-up approval from a named human,',
     'or block it outright — and the reason is recorded either way.'],
    ['Yes. Tahara deploys inside your own tenancy or on-premises.',
     'Prompts, responses and documents stay within your boundary, and',
     'nothing passing through the platform is used to train anything.'],
    ['A gateway routes traffic and enforces rate limits.',
     'Tahara adds the layer above it — the register, the risk assessment,',
     'the approval trail and the evidence pack — reading your gateway as one input.'],
    ['A first discovery report usually lands within a week,',
     'and in most estates that is the part which changes the conversation.',
     'Enforcement on an initial policy set follows in two to four weeks.']
  ];
export const ANSWERS_AR: string[][] = [
    ['تقرأ Tahara الإشارات التي تنتجها بيئتكم أصلًا — حركة مرور البوابة، استخدام خدمات الذكاء الاصطناعي السحابية،',
     'المفاتيح المخزَّنة في مخزن الأسرار، وإشارات النماذج داخل الشيفرة وأنظمة CI.',
     'تصل كل نتيجة مع مالك مقترَح ومستوى مخاطر مقترَح.'],
    ['فقط عند الإنفاذ. الاكتشاف والمراقبة سلبيّان تمامًا.',
     'يعمل التحكّم المباشر عبر بوابتكم الحالية أو خدمة مرافقة، ويُحدَّد',
     'الفشل المفتوح أو المغلق لكل سياسة على حدة — وليس للنشر بأكمله.'],
    ['يُفحص الاستدعاء مقابل النطاق المعلَن للوكيل وتصنيف البيانات المستهدَفة.',
     'يمكن لـ Tahara السماح به أو إخفاء الحقول أو طلب موافقة تصعيدية من شخص محدَّد،',
     'أو حظره تمامًا — ويُسجَّل السبب في الحالتين.'],
    ['نعم. تُنشَر Tahara داخل بيئتكم الخاصة أو محليًا.',
     'تبقى الطلبات والردود والمستندات ضمن حدودكم، ولا',
     'يُستخدم أي شيء يمرّ عبر المنصة لتدريب أي نموذج.'],
    ['البوابة توجّه حركة المرور وتفرض حدود المعدّل.',
     'تضيف Tahara الطبقة فوقها — السجلّ وتقييم المخاطر،',
     'ومسار الموافقات وحزمة الأدلة — وتقرأ بوابتكم كأحد مدخلاتها.'],
    ['عادة ما يصدر تقرير الاكتشاف الأول خلال أسبوع،',
     'وفي معظم البيئات يكون هذا الجزء هو ما يغيّر مسار الحوار.',
     'يتبعه الإنفاذ على مجموعة سياسات أولية خلال أسبوعين إلى أربعة أسابيع.']
  ];
