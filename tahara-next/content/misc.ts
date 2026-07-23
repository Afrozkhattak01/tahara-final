export const STANDARDS: string[] = ['ISO/IEC 42001','ISO/IEC 27001','NIST AI RMF','EU AI Act',
                     'OWASP LLM Top 10','MITRE ATLAS','SOC 2','GDPR'];

export const FEED: [html: string, chipClass: string, label: string][] = [
    ['<b>claims-triage-agent</b> → customer_pii.address · out of scope', 'chip-block', 'Blocked'],
    ['<b>support-copilot</b> · injection pattern matched',               'chip-block', 'Blocked'],
    ['<b>finance-summariser</b> · 3 account numbers removed',            'chip-pass',  'Redacted'],
    ['<b>mistral-small</b> seen in eu-west-1 · no owner',                'chip-log',   'Registered'],
    ['<b>hr-assistant</b> · system prompt leak attempt',                 'chip-block', 'Blocked'],
    ['<b>vendor-bot</b> → contracts.pdf · within scope',                 'chip-pass',  'Allowed'],
    ['<b>eval-runner</b> · new model version detected',                  'chip-log',   'Registered'],
    ['<b>sql-copilot</b> · unbounded DELETE rejected',                   'chip-block', 'Blocked']
  ];

export const SHOW_PROOF_BAR = true;
export const CUSTOMER_SLOTS = 6;
export const CUSTOMERS: [name: string, file: string][] = [];
