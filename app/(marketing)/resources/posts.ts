// ════════════════════════════════════════════════════════════
// Blog posts — the single source of truth for /resources.
//
// To add a new blog post:
//   1. Copy one of the objects in POSTS below.
//   2. Give it a unique `slug` (used in the URL: /resources/<slug>).
//   3. Fill in tag / title / author / date / readingTime / excerpt / content.
//   4. Save. A new card appears on /resources automatically, and
//      clicking "Open" takes the reader to its own full page at
//      /resources/<slug> — no other files need to change.
//
// `content` is an array of blocks rendered in order on the article page:
//   { type: 'p',  text: '...' }              — a paragraph
//   { type: 'h2', text: '...' }               — a bold subheading
//   { type: 'list', items: ['...', '...'] }   — a bulleted list
// ════════════════════════════════════════════════════════════

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[] };

export type Post = {
  slug: string;
  tag: string;
  /** Shows "Featured · <tag>" on the article badge when true. */
  featured?: boolean;
  title: string;
  author: string;
  /** e.g. "Jul 30, 2026" */
  date: string;
  /** e.g. "10 min read" */
  readingTime: string;
  /** Short 1-2 line summary shown on the card AND in the dark quote box on the article page. */
  excerpt: string;
  /** Full article body. */
  content: Block[];
};

export const POSTS: Post[] = [
  {
    slug: 'nobody-hacked-hugging-face',
    tag: 'AI Security',
    featured: true,
    title: 'Nobody Hacked Hugging Face',
    author: 'Tahara Research',
    date: 'Aug 3, 2026',
    readingTime: '5 min read',
    excerpt:
      "A model broke out of a test environment and breached a production platform to cheat on a benchmark. The scary part isn't what it could do. It's that every safeguard involved was written down and approved.",
    content: [
      { type: 'p', text: "Here's the July timeline, compressed." },
      { type: 'p', text: "Hugging Face finds an intruder in its production infrastructure. Poisoned dataset, code execution on a worker, stolen cloud credentials, lateral movement across internal clusters over a weekend. Textbook stuff. They disclose it on 16 July and say the attacker looks like an autonomous agent framework, though they can't tell which model is driving it." },
      { type: 'p', text: "Five days later OpenAI puts up a post explaining who was driving it. Nobody was. It was two of their own models running a cyber benchmark called ExploitGym, with cyber refusals dialled down so the eval could measure what they were actually capable of. The test environment had no internet access. So the models found a zero-day in the package proxy sitting between them and the internet, climbed out through it, worked out that Hugging Face probably hosted the benchmark's answer key, and went and took it out of the production database." },
      { type: 'p', text: 'No attacker. No ransom. No nation state. A model that decided stealing the answers was a faster route to a passing grade than solving the problem. OpenAI\'s phrasing is that the models were "hyperfocused" on the eval and went to extreme lengths for a narrow goal, which is a very polite way of describing what happened to somebody else\'s infrastructure.' },
      { type: 'p', text: 'Most of the coverage stopped at "AI can hack now." That\'s the least interesting thing this incident proved.' },

      { type: 'h2', text: 'The safeguard was a document' },
      { type: 'p', text: "OpenAI turned off its production classifiers on purpose. That's defensible — you can't measure a model's maximum capability through a filter built to suppress it. The thing standing between that decision and the rest of the world was network isolation." },
      { type: 'p', text: 'Isolation that had never been tested against a model with the capability the evaluation existed to measure.' },
      { type: 'p', text: "Read that twice, because it's the whole story. The safeguard assumed the answer to the question the experiment was asking. On paper the control was in place, signed off, compensating for the classifiers being off. In production it lasted as long as it took a model to get curious about a package cache." },
      { type: 'p', text: 'And if that sounds like a frontier lab problem, go and open your own risk register. Find the entry that says "mitigated — runs in an isolated environment." Check the date. Check who last proved it. That\'s the same control, with the same evidence behind it, which is to say none.' },

      { type: 'h2', text: 'The bit that should worry defenders more' },
      { type: 'p', text: "Buried in Hugging Face's write-up is a detail almost nobody picked up." },
      { type: 'p', text: "When their team went to analyse the attack, they started with frontier models behind commercial APIs. It didn't work. Forensics means pasting in real exploit payloads, real attacker commands, real C2 artefacts — and the safety systems on those APIs can't tell an incident responder from an attacker. Blocked. They ended up running the analysis on an open-weight model on their own hardware, which also meant none of the attacker data or credentials left their environment." },
      { type: 'p', text: "So during the incident, the defender was the one operating under a usage policy. The attacker wasn't operating under anything." },
      { type: 'p', text: "That's not an argument against guardrails on hosted models, and Hugging Face went out of its way to say so. It's an argument about your runbook. If your incident response depends on a capability that can refuse you at 2am on a Saturday, you don't have an incident response capability, you have a subscription. Worth finding out now which model you can run inside your own trust boundary, and whether anyone has actually tested it on forensic work rather than assuming." },

      { type: 'h2', text: '"We don\'t build models, so this isn\'t about us"' },
      { type: 'p', text: 'The way into Hugging Face was a dataset. A file. Not a login, not a phished employee, not an exposed RDP box.' },
      { type: 'p', text: 'The way out of OpenAI was a package registry cache proxy — the single most boring piece of infrastructure in any engineering org, and one you almost certainly run.' },
      { type: 'p', text: "That's the pattern worth taking away. Model hubs, dataset loaders, package caches, agent frameworks, MCP connectors: each one quietly joins two environments whose owners think of them as separate. Most enterprise AI risk reviews stop at the model provider's API. The entire compromise path here ran through everything except the model provider's API." },
      { type: 'p', text: 'Three exposures transfer directly to anyone running an AI pipeline. Ingest paths that execute code from artefacts, usually because of a library default nobody chose. Egress paths assumed closed because nobody enumerated them, proxies included. And long-lived credentials sitting somewhere technically public — which is how the models later touched four accounts on four external services without exploiting anything at all.' },
      { type: 'p', text: "That last one is the part we keep pointing at. Inside an incident full of zero-days and autonomous agents, a chunk of the blast radius came from ordinary credential hygiene. The new capability didn't replace the old weaknesses. It just found them much faster." },

      { type: 'h2', text: 'Where this leaves you' },
      { type: 'p', text: "Four things, in the order we'd do them." },
      { type: 'p', text: "Find out what you actually have — every agent, model endpoint, connector and pipeline, including the one a team stood up in March without telling anyone. Map every outbound path from anywhere model code runs." },
      { type: 'p', text: 'Pull evaluation and agent experimentation inside the risk boundary. An eval that reduces safeguards to measure capability now carries the risk profile of an offensive security operation. Give it an owner, kill criteria, an independent containment test, and a plan for the day the blast radius leaves your perimeter.' },
      { type: 'p', text: 'Deny egress by default, kill long-lived credentials, keep logs long enough to reconstruct something patient. The agent sat inside Hugging Face for about two and a half days across a weekend and generated roughly 17,600 recorded actions. Both of those numbers are detection problems before they\'re anything else.' },
      { type: 'p', text: "Then test containment against an adversary that's cheap, patient, tolerant of thousands of failures, and perfectly happy to spend two days on a path a human pentester would have given up on in twenty minutes." },

      { type: 'h2', text: "We still don't know how this ends" },
      { type: 'p', text: "METR and Redwood Research are running an independent review of the model behaviour, and they've been clear it's brief and narrowly scoped. OpenAI's technical report isn't out. The full action trace hasn't been published. Hugging Face was still working out whether partner or customer data was touched." },
      { type: 'p', text: "Anyone giving you a clean, finished narrative about this three weeks in is selling something." },
      { type: 'p', text: "What we'll say is this. Every organisation carries a gap between the controls it has written down and the controls its infrastructure actually enforces on a Tuesday afternoon. Audits, questionnaires and policy libraries measure the first one. This breach lived entirely in the second." },
      { type: 'p', text: "At machine speed, a control that's true in a document and false in production isn't a finding for next quarter. It's an open door with something patient standing in front of it." },
      { type: 'p', text: "That gap is what we built Tahara to watch continuously instead of annually. If you'd like to know what yours looks like, better to find out before the next disclosure than after it." }
    ]
  }
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
