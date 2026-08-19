/* Connector names and logo slugs are language-independent — brand names
   stay in Latin script in both EN and AR, per the i18n scope notes. */
export const GLYPH: Record<string, string> = {
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

export const MARQUEE_ROW_1: string[] = ['OpenAI','Anthropic','Gemini','AWS','Azure','Google Cloud',
                          'Hugging Face','Meta','Mistral','Ollama','Cohere','AI21'];
export const MARQUEE_ROW_2: string[] = ['PostgreSQL','MongoDB','Redis','Snowflake','Grafana','Cloudflare',
                          'Datadog','Prometheus','Okta','Slack','GitHub','GitLab','Jira','Confluence'];
export const MARQUEE_GLYPH: Record<string, string> = {
    'OpenAI':'spark','Anthropic':'hex','Gemini':'spark','AWS':'cloud','Azure':'cloud','Google Cloud':'cloud',
    'Hugging Face':'box','Meta':'hex','Mistral':'spark','Ollama':'hex','Cohere':'spark','AI21':'hex',
    'PostgreSQL':'db','MongoDB':'db','Redis':'db','Snowflake':'db','Grafana':'pulse','Cloudflare':'shield',
    'Datadog':'pulse','Prometheus':'pulse','Okta':'key','Slack':'chat','GitHub':'code','GitLab':'code',
    'Jira':'table','Confluence':'table'
  };
export const MARQUEE_SLUG: Record<string, string> = {
    'OpenAI':'openai','Anthropic':'anthropic','Gemini':'googlegemini','AWS':'amazonwebservices',
    'Azure':'microsoftazure','Google Cloud':'googlecloud','Hugging Face':'huggingface','Meta':'meta',
    'Mistral':'mistralai','Ollama':'ollama','Cohere':'cohere',
    'PostgreSQL':'postgresql','MongoDB':'mongodb','Redis':'redis','Snowflake':'snowflake',
    'Grafana':'grafana','Cloudflare':'cloudflare','Datadog':'datadog','Prometheus':'prometheus',
    'Okta':'okta','Slack':'slack','GitHub':'github','GitLab':'gitlab','Jira':'jira','Confluence':'confluence'
    /* 'AI21' intentionally omitted — no reliable single-colour mark available;
       it renders its geometric glyph, which is the correct behaviour here. */
  };
