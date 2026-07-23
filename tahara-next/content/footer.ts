export type FooterCol = [heading: string, links: [label: string, href: string][]];

export const FOOTER_LINKS: FooterCol[] = [
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
export const FOOTER_LINKS_AR: FooterCol[] = [
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
