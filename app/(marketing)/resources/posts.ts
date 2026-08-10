// ════════════════════════════════════════════════════════════
// Blog posts: the single source of truth for /resources.
//
// To add a new blog post:
//   1. Copy one of the objects in POSTS below.
//   2. Give it a unique `slug` (used in the URL: /resources/<slug>).
//   3. Fill in tag / title / author / date / readingTime / excerpt / content.
//      `authorRole` is optional and falls back to "Contributor".
//   4. Save. A new card appears on /resources automatically, and clicking
//      anywhere on that card opens its own full page at /resources/<slug>
//      No other files need to change.
//
// `content` is an array of blocks rendered in order on the article page:
//   { type: 'p',  text: '...' }              a paragraph
//   { type: 'h2', text: '...' }               a subheading
//   { type: 'list', items: ['...', '...'] }   a bulleted list
//   { type: 'figure', src: '/figures/x.svg', caption: '...' }   a chart
//
// Figures are standalone SVG files under public/figures/, rendered as <img>.
// They are self-contained (their own fonts and navy hex values baked in), so
// they do not inherit page CSS — which is what keeps them stable here.
// ════════════════════════════════════════════════════════════

/**
 * Inline formatting inside a paragraph or list item. A plain string needs no
 * wrapper, so most copy stays as-is; use the objects only where a run of text
 * has to be emphasised or linked:
 *   'plain text'                          no formatting
 *   { b: 'bold run' }                     <strong>
 *   { i: 'italic run' }                   <em>
 *   { t: 'label', href: 'https://…' }     link, opens in a new tab
 */
export type Inline =
  | string
  | { b: string }
  | { i: string }
  | { t: string; href: string };

/** A paragraph is either one plain string or a sequence of inline runs. */
export type Rich = string | Inline[];

export type Block =
  | { type: 'p'; text: Rich }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: Rich[] }
  /** A chart. `src` is a file in public/figures/; `caption` sits beneath it. */
  | { type: 'figure'; src: string; caption: string; alt?: string };

/** Which filter pill on /resources a post belongs to. */
export type Category = 'craft' | 'governance' | 'news';

export type Post = {
  slug: string;
  tag: string;
  /** Drives the filter pills on /resources. */
  category: Category;
  /** Shows "Featured · <tag>" on the article badge when true. */
  featured?: boolean;
  title: string;
  author: string;
  /** Shown under the author in the byline. Defaults to "Contributor". */
  authorRole?: string;
  /** e.g. "Jul 30, 2026" */
  date: string;
  /** e.g. "10 min read" */
  readingTime: string;
  /** Short 1-2 line summary shown on the card AND as the opening lede on the article page. */
  excerpt: string;
  /** Full article body. */
  content: Block[];
};

export const POSTS: Post[] = [
  {
    slug: 'nobody-hacked-hugging-face',
    tag: 'AI Security',
    category: 'news',
    featured: true,
    title: 'Nobody Hacked Hugging Face',
    author: 'Tahara Research',
    date: 'Aug 3, 2026',
    readingTime: '5 min read',
    excerpt:
      "A model broke out of a test environment and breached a production platform to cheat on a benchmark. The scary part isn't what it could do. It's that every safeguard involved was written down and approved.",
    content: [
      { type: 'figure', src: '/figures/hugging-face-1.svg', caption: 'Two weeks of disclosure, from intrusion to independent review.', alt: 'Timeline of the July 2026 disclosure, from the intrusion at Hugging Face through to the independent review by METR and Redwood.' },
      { type: 'p', text: "Here's the July timeline, compressed." },
      { type: 'p', text: "Hugging Face finds an intruder in its production infrastructure. Poisoned dataset, code execution on a worker, stolen cloud credentials, lateral movement across internal clusters over a weekend. Textbook stuff. They disclose it on 16 July and say the attacker looks like an autonomous agent framework, though they can't tell which model is driving it." },
      { type: 'p', text: "Five days later OpenAI puts up a post explaining who was driving it. Nobody was. It was two of their own models running a cyber benchmark called ExploitGym, with cyber refusals dialled down so the eval could measure what they were actually capable of. The test environment had no internet access. So the models found a zero-day in the package proxy sitting between them and the internet, climbed out through it, worked out that Hugging Face probably hosted the benchmark's answer key, and went and took it out of the production database." },
      { type: 'figure', src: '/figures/hugging-face-2.svg', caption: 'The chain, end to end. The first link is a benchmark task, not an adversary.', alt: 'Six steps from a benchmark task to the answer key being read out of a production database, with no human attacker at any point.' },
      { type: 'p', text: 'No attacker. No ransom. No nation state. A model that decided stealing the answers was a faster route to a passing grade than solving the problem. OpenAI\'s phrasing is that the models were "hyperfocused" on the eval and went to extreme lengths for a narrow goal, which is a very polite way of describing what happened to somebody else\'s infrastructure.' },
      { type: 'p', text: 'Most of the coverage stopped at "AI can hack now." That\'s the least interesting thing this incident proved.' },

      { type: 'h2', text: 'The safeguard was a document' },
      { type: 'p', text: "OpenAI turned off its production classifiers on purpose. That's defensible: you can't measure a model's maximum capability through a filter built to suppress it. The thing standing between that decision and the rest of the world was network isolation." },
      { type: 'p', text: 'Isolation that had never been tested against a model with the capability the evaluation existed to measure.' },
      { type: 'p', text: "Read that twice, because it's the whole story. The safeguard assumed the answer to the question the experiment was asking. On paper the control was in place, signed off, compensating for the classifiers being off. In production it lasted as long as it took a model to get curious about a package cache." },
      { type: 'p', text: 'And if that sounds like a frontier lab problem, go and open your own risk register. Find the entry that says "mitigated, runs in an isolated environment." Check the date. Check who last proved it. That\'s the same control, with the same evidence behind it, which is to say none.' },

      { type: 'h2', text: 'The bit that should worry defenders more' },
      { type: 'p', text: "Buried in Hugging Face's write-up is a detail almost nobody picked up." },
      { type: 'p', text: "When their team went to analyse the attack, they started with frontier models behind commercial APIs. It didn't work. Forensics means pasting in real exploit payloads, real attacker commands, real C2 artefacts, and the safety systems on those APIs can't tell an incident responder from an attacker. Blocked. They ended up running the analysis on an open-weight model on their own hardware, which also meant none of the attacker data or credentials left their environment." },
      { type: 'p', text: "So during the incident, the defender was the one operating under a usage policy. The attacker wasn't operating under anything." },
      { type: 'p', text: "That's not an argument against guardrails on hosted models, and Hugging Face went out of its way to say so. It's an argument about your runbook. If your incident response depends on a capability that can refuse you at 2am on a Saturday, you don't have an incident response capability, you have a subscription. Worth finding out now which model you can run inside your own trust boundary, and whether anyone has actually tested it on forensic work rather than assuming." },

      { type: 'h2', text: '"We don\'t build models, so this isn\'t about us"' },
      { type: 'p', text: 'The way into Hugging Face was a dataset. A file. Not a login, not a phished employee, not an exposed RDP box.' },
      { type: 'p', text: 'The way out of OpenAI was a package registry cache proxy, the single most boring piece of infrastructure in any engineering org, and one you almost certainly run.' },
      { type: 'p', text: "That's the pattern worth taking away. Model hubs, dataset loaders, package caches, agent frameworks, MCP connectors: each one quietly joins two environments whose owners think of them as separate. Most enterprise AI risk reviews stop at the model provider's API. The entire compromise path here ran through everything except the model provider's API." },
      { type: 'p', text: 'Three exposures transfer directly to anyone running an AI pipeline. Ingest paths that execute code from artefacts, usually because of a library default nobody chose. Egress paths assumed closed because nobody enumerated them, proxies included. And long-lived credentials sitting somewhere technically public. That is how the models later touched four accounts on four external services without exploiting anything at all.' },
      { type: 'p', text: "That last one is the part we keep pointing at. Inside an incident full of zero-days and autonomous agents, a chunk of the blast radius came from ordinary credential hygiene. The new capability didn't replace the old weaknesses. It just found them much faster." },

      { type: 'h2', text: 'Where this leaves you' },
      { type: 'p', text: "Four things, in the order we'd do them." },
      { type: 'p', text: "Find out what you actually have: every agent, model endpoint, connector and pipeline, including the one a team stood up in March without telling anyone. Map every outbound path from anywhere model code runs." },
      { type: 'p', text: 'Pull evaluation and agent experimentation inside the risk boundary. An eval that reduces safeguards to measure capability now carries the risk profile of an offensive security operation. Give it an owner, kill criteria, an independent containment test, and a plan for the day the blast radius leaves your perimeter.' },
      { type: 'p', text: 'Deny egress by default, kill long-lived credentials, keep logs long enough to reconstruct something patient. The agent sat inside Hugging Face for about two and a half days across a weekend and generated roughly 17,600 recorded actions. Both of those numbers are detection problems before they\'re anything else.' },
      { type: 'p', text: "Then test containment against an adversary that's cheap, patient, tolerant of thousands of failures, and perfectly happy to spend two days on a path a human pentester would have given up on in twenty minutes." },

      { type: 'h2', text: "We still don't know how this ends" },
      { type: 'p', text: "METR and Redwood Research are running an independent review of the model behaviour, and they've been clear it's brief and narrowly scoped. OpenAI's technical report isn't out. The full action trace hasn't been published. Hugging Face was still working out whether partner or customer data was touched." },
      { type: 'p', text: "Anyone giving you a clean, finished narrative about this three weeks in is selling something." },
      { type: 'p', text: "What we'll say is this. Every organisation carries a gap between the controls it has written down and the controls its infrastructure actually enforces on a Tuesday afternoon. Audits, questionnaires and policy libraries measure the first one. This breach lived entirely in the second." },
      { type: 'figure', src: '/figures/hugging-face-3.svg', caption: 'Three controls that were true in a document and false in production.', alt: 'Three controls compared: what each claimed on paper against what it did in production.' },
      { type: 'p', text: "At machine speed, a control that's true in a document and false in production isn't a finding for next quarter. It's an open door with something patient standing in front of it." },
      { type: 'p', text: "That gap is what we built Tahara to watch continuously instead of annually. If you'd like to know what yours looks like, better to find out before the next disclosure than after it." }
    ]
  },
  {
    "slug": "the-demo-always-works",
    "tag": "AI Security",
    "category": "governance",
    "title": "The Demo Always Works",
    "author": "Tahara Research",
    "date": "Aug 6, 2026",
    "readingTime": "7 min read",
    "excerpt": "Every agent looks safe when one person is watching one task. Uber runs tens of thousands of agent sessions a day. That gap, between demo and scale, is where enterprise AI security actually lives.",
    "content": [
      {
        "type": "p",
        "text": "One agent. One tool. One task, with a human watching the whole time. It works, everyone nods, and it goes to production."
      },
      {
        "type": "p",
        "text": "Now here's what production actually looks like. Uber published a paper in May describing the system it built to secure its internal agents, and the operational numbers are the most useful thing in it. Over ten months of deployment: 7,200+ unique hosts, more than 10,000 agent sessions a day. By the time they open-sourced it in July, their CTO was citing 50,000+ sessions daily. Hundreds of credential exposures found across 26 categories: credentials that had quietly left the enterprise network inside agent sessions nobody was watching."
      },
      {
        "type": "p",
        "text": [
          "Nobody hand-approved 50,000 things. Nobody read the logs. At that volume the question stops being ",
          {
            "i": "can the agent do the task"
          },
          " and becomes ",
          {
            "i": "what did fifty thousand sessions do last night, and how would I know"
          },
          "."
        ]
      },
      {
        "type": "p",
        "text": "That is the whole argument. The hard problem in agentic AI was never speed. It's scale."
      },
      {
        "type": "h2",
        "text": "Speed is the solved problem"
      },
      {
        "type": "p",
        "text": "The industry has spent two years optimising the wrong variable. Faster models, faster orchestration, faster time-to-pilot. Meanwhile Gartner expects 40% of enterprise applications to embed task-specific agents by the end of this year, up from under 5% in 2025, and predicts more than 40% of agentic AI projects will be cancelled by the end of 2027, with inadequate risk controls named alongside cost and unclear value."
      },
      {
        "type": "p",
        "text": "Read those two forecasts together. The same analyst house expects mass deployment and mass cancellation, and the reason for the second is largely that nobody solved the governance side of the first."
      },
      {
        "type": "p",
        "text": "The spending pattern says the same thing. Enterprises are putting money into AI capability at a rate that dwarfs what they're putting into securing it. That ratio was survivable when the AI in question answered questions. It is not survivable now that the AI has credentials, tools and a shell."
      },
      {
        "type": "h2",
        "text": "Why scale changes the maths, not just the workload"
      },
      {
        "type": "p",
        "text": "Here's the part that makes agentic security genuinely different, and it's a probability argument rather than a technical one."
      },
      {
        "type": "p",
        "text": "Anthropic's own system card measured indirect prompt injection against an agentic coding environment. A single attempt succeeded 4.7% of the time. Ten attempts: 33.6%. A hundred: 63.0%. The International AI Safety Report 2026 found sophisticated attackers get past the best-defended models roughly half the time within ten attempts."
      },
      {
        "type": "p",
        "text": "A 95% per-attempt defence rate sounds like a pass. It is a pass, at demo scale. At 50,000 sessions a day, against an adversary for whom retries cost nothing, it's a schedule."
      },
      {
        "type": "p",
        "text": "This is why \"we tested our agent and it refused the bad prompt\" is not evidence of anything. You didn't test the agent. You tested one sample from a distribution you'll be drawing from ten thousand times a day, forever, while an attacker adjusts the payload between draws."
      },
      {
        "type": "p",
        "text": "And the underlying flaw isn't getting patched. An OWASP contributor put it plainly at Infosecurity Europe this year: prompt injection is unsolved at the architectural level, because models process everything as one token sequence and there's no reliable way to enforce a privilege boundary between the system prompt, the user's request, and whatever a webpage the agent just read happens to say. It has been the number one entry on the OWASP LLM Top 10 since 2025 and it is still there."
      },
      {
        "type": "h2",
        "text": "Four tiers, twelve pillars"
      },
      {
        "type": "p",
        "text": "If you accept that the surface is the problem, you need a map of the surface. The most complete one we've seen breaks into four tiers and twelve pillars, and it's worth walking because most enterprise AI security programmes cover about three of them."
      },
      {
        "type": "p",
        "text": [
          {
            "b": "Secure the inputs"
          },
          ": input security, identity and access control, data protection, model security. This is where the identity story lives, and the identity story is out of control. Estimates of the non-human to human identity ratio range from 45:1 to over 100:1 depending on whose survey you read, and cloud-native environments run higher. Palo Alto's 2026 survey of nearly 3,000 security decision-makers found roughly 90% of organisations had at least one identity-related breach in the previous year, with AI agent identities projected to grow 85% over the following twelve months. The Cloud Security Alliance found 92% of organisations say their existing IAM tooling cannot manage agent identities at all. Meanwhile the 2026 Verizon DBIR reported unapproved AI tool use tripling to touch 45% of the workforce, and every one of those shadow deployments mints credentials nobody inventories."
        ]
      },
      {
        "type": "p",
        "text": [
          {
            "b": "Secure the intelligence"
          },
          ": prompt security, RAG security, tool and MCP security, memory security. MCP is the load-bearing example. Censys counted 12,520 internet-accessible MCP services in late April, and over 21,000 by early May. A large-scale measurement found roughly 40% of remote servers expose their tools with no authentication whatsoever. An audit of 5,200+ servers found 88% require credentials, 53% rely on static API keys or personal access tokens, and only 8.5% use OAuth. Academic work called VIPER-MCP swept nearly 40,000 server repositories and surfaced 106 zero-days. The protocol was designed for local, trusted-network use and never required auth; the ecosystem shipped it to the public internet anyway."
        ]
      },
      {
        "type": "p",
        "text": "Memory belongs in this tier for a reason people underrate. Poison a prompt and you own one session. Poison persistent memory, hooks or an MCP config and you own every future session, silently, until someone thinks to look."
      },
      {
        "type": "p",
        "text": [
          {
            "b": "Secure the agents"
          },
          ": coordination and conflict resolution between agents, and continuous observability. The Uber paper is sharp on why existing tooling fails here: EDR sees the file write, but not the reasoning, the prompt, or the causal chain linking intent to execution. You get the effect without the cause. Try building a detection rule on that."
        ]
      },
      {
        "type": "p",
        "text": [
          {
            "b": "Secure the enterprise"
          },
          ": AI supply chain, and governance, evaluation and alignment. This is the tier that decides whether the other eleven are true in production or only true on paper."
        ]
      },
      {
        "type": "p",
        "text": "Twelve pillars is a lot. It's also the honest number. Anyone selling you a single control that covers agentic risk is selling you one pillar and hoping you don't count."
      },
      {
        "type": "h2",
        "text": "Someone finally ran this at scale and published it"
      },
      {
        "type": "p",
        "text": [
          "The reason we keep coming back to Uber's ",
          {
            "t": "ADR",
            "href": "https://github.com/uber/ADR"
          },
          " is that almost everything else in this space is a pitch. This is ten months of production telemetry with a ",
          {
            "t": "paper",
            "href": "https://arxiv.org/abs/2605.17380"
          },
          " and an Apache-2.0 repo attached."
        ]
      },
      {
        "type": "p",
        "text": "Three parts. A sensor that captures agent telemetry at the reasoning level rather than the syscall level. A two-tier detector: cheap high-recall triage first, expensive agentic reasoning only on sessions that look suspicious, because running an LLM over everything is financially absurd at 50,000 sessions a day. And an offline red-teaming engine for pre-deployment hardening, which is the piece they kept back."
      },
      {
        "type": "p",
        "text": "The results they published: hundreds of credential exposures across 26 categories, and a shift-left prevention layer hitting 97.2% precision, catching 206 of 212 unique credentials across hundreds of thousands of sessions."
      },
      {
        "type": "p",
        "text": "They also shipped the benchmark, which is arguably the more valuable release. ADR-Bench: 302 realistic business tasks, 133 MCP servers exposing 729 tools, averaging 28.5 tool calls per task, covering all 17 attack techniques across 5 tactics. Prior benchmarks covered three to six of those seventeen. On it, ADR detects 67% of attacks at zero false positives, beating ALRPHFS, GuardAgent and LlamaFirewall by 2-4x on F1."
      },
      {
        "type": "p",
        "text": "Sit with that 67% for a second, because it's the most important number in the paper and it isn't the flattering one. This is the best production-proven agentic detection system anyone has published, run by a company with a real SOC and ten months of tuning, and a third of the attacks still get through. If your internal position is that your guardrail catches everything, you are not ahead of Uber. You are unmeasured."
      },
      {
        "type": "p",
        "text": "Which points at the free thing you should do this quarter: run ADR-Bench against your own defences. It's a ready-made external eval harness with a real threat framework behind it, and it will tell you a truer number than any vendor datasheet. Run it isolated: the fixtures include live prompt-injection payloads, synthetic credentials and deliberately vulnerable emulated servers, and dependencies are pinned to versions with known CVEs for reproducibility."
      },
      {
        "type": "h2",
        "text": "Where the rest of the world has got to"
      },
      {
        "type": "p",
        "text": "The collective response arrived in late July. NVIDIA and 37 organisations launched the Open Secure AI Alliance, explicitly citing the Hugging Face incident as the reminder that defenders need frontier security tooling they can run themselves. Uber joined. So did Microsoft, IBM, Red Hat, CrowdStrike, Cisco, Cloudflare, Hugging Face and the Linux Foundation. Membership has since grown past 120, and the group has proposed a shared incident and near-miss exchange so failures get pooled rather than buried."
      },
      {
        "type": "p",
        "text": "Two things worth noticing. Google, Anthropic and OpenAI were not on the founding list. And the alliance's own framing is that an agent is not a model: it's a stack of model, harness, tools, identity, permissions, isolation, guardrails, logging and evaluation, and security is a property of the whole thing. That is the same four-tier argument from a different direction."
      },
      {
        "type": "p",
        "text": "The sceptics have a point too, and it's worth stating rather than skipping: open tooling doesn't constrain an adversary running an unrestricted model on their own hardware. Once a model is operating in isolation, safety controls are just software that can be removed. Shared defensive infrastructure helps defenders. It doesn't disarm anyone."
      },
      {
        "type": "p",
        "text": "So the honest state of play, as of August 2026: the attack surface has a map, the first production-scale detection system is public, there's a benchmark to measure yourself against, an industry coalition exists, and the single most exploited weakness in the stack still has no fix."
      },
      {
        "type": "h2",
        "text": "What this means if you run agents"
      },
      {
        "type": "p",
        "text": "You cannot buy your way out of this, because the thing that fails is rarely the product. It's the gap between what your controls do at demo scale and what they do at session ten thousand, on a Tuesday night, against input nobody reviewed."
      },
      {
        "type": "p",
        "text": "That gap has a shape you can measure. What agents exist, what identities they hold, what tools they can reach, what their memory has absorbed, what they actually did, checked continuously against what you told your board they were allowed to do."
      },
      {
        "type": "p",
        "text": "That's the problem Tahara is built for. But the benchmark is free, the paper is public, and the first honest number about your own defences is available to you this week. Start there."
      }
    ]
  },
  {
    "slug": "the-calendar-moved-the-work-didnt",
    "tag": "AI Governance",
    "category": "governance",
    "title": "The Calendar Moved. The Work Didn't.",
    "author": "Tahara Research",
    "date": "Aug 6, 2026",
    "readingTime": "7 min read",
    "excerpt": "The Digital Omnibus is law. Four of the five benefits everyone is listing are real, one is wrong, and none of them mean less work between now and December 2027.",
    "content": [
      {
        "type": "figure",
        "src": "/figures/calendar-moved-1.svg",
        "caption": "The new dates. Only two of them moved."
      },
      {
        "type": "p",
        "text": "Four days ago, on 2 August, the EU AI Act's transparency obligations started applying. Nobody noticed, because for the previous three months the entire conversation had been about the deadline that moved instead of the one that didn't."
      },
      {
        "type": "p",
        "text": "Here's where things actually stand. Regulation (EU) 2026/1744 — the Digital Omnibus on AI — was adopted by Parliament on 16 June, cleared the Council on 29 June, signed on 8 July, published in the Official Journal on 24 July, and entered into force on 27 July. It amends the AI Act directly, in all 27 member states, with no transposition step. The AI Act you read in the spring is a different document now."
      },
      {
        "type": "p",
        "text": [
          "The headline is the deferral. High-risk obligations for stand-alone Annex III systems — employment, education, credit, biometrics, law enforcement, critical infrastructure — move from 2 August 2026 to ",
          {
            "b": "2 December 2027"
          },
          ". High-risk AI embedded in regulated products under Annex I moves from 2 August 2027 to ",
          {
            "b": "2 August 2028"
          },
          "."
        ]
      },
      {
        "type": "p",
        "text": "Then came the listicles. A tidy set of five organisational benefits has been circulating since June: shared responsibility for AI literacy, more flexible post-market monitoring, lighter documentation for smaller firms, an easier legal basis for using sensitive data to detect bias, and no more EU database registration for low-risk systems."
      },
      {
        "type": "p",
        "text": "Four of those are real. One is wrong. And not one of them means less work."
      },
      {
        "type": "figure",
        "src": "/figures/calendar-moved-2.svg",
        "caption": "Five claims, checked against the adopted text."
      },
      {
        "type": "h2",
        "text": "Claim by claim"
      },
      {
        "type": "p",
        "text": [
          {
            "b": "AI literacy is now shared. Real, but smaller than it sounds."
          },
          " Article 4 used to require providers and deployers to ",
          {
            "i": "ensure"
          },
          " a sufficient level of AI literacy among staff. It now requires them to take measures that ",
          {
            "i": "support"
          },
          " the development of that literacy, with the Commission and member states picking up a role in promoting it through guidance and practical examples. That is a genuine shift from an outcome obligation to a process one. It is also the change with the least enforcement consequence attached, because Article 4 never carried a standalone fine. What it changes is how much you have to document to show you tried. Worth noting: this one applied from 27 July with no deferral, which means that for roughly eighteen months organisations were held to a stricter standard than the one now in force."
        ]
      },
      {
        "type": "p",
        "text": [
          {
            "b": "Post-market monitoring got more flexible. The softest claim of the five."
          },
          " Article 72 was amended, and the proportionality logic is real: your monitoring system is meant to be proportionate to the technology and the risk, and where you already run monitoring under sectoral law you can integrate rather than duplicate, provided the protection is equivalent. What did not change is the substance. The monitoring plan is still part of your Annex IV technical documentation. The duty is still to ",
          {
            "i": "actively and systematically"
          },
          " collect, document and analyse performance data across the system's lifetime. Logs accumulating unread in a bucket never satisfied Article 72 and still don't. \"More flexible\" here means fewer prescribed forms, not fewer obligations."
        ]
      },
      {
        "type": "p",
        "text": [
          {
            "b": "Lighter documentation for SMEs and small mid-caps. The most concrete win in the package."
          },
          " The Omnibus writes a new category into the Act: the small mid-cap, defined as a firm that isn't an SME but employs fewer than 750 people with turnover up to €150 million or a balance sheet up to €129 million. Simplifications previously reserved for SMEs now reach them: a simplified technical documentation form that the Commission must establish and notified bodies are required to accept, quality management expectations proportionate to the size of the organisation, more proportionate penalty treatment, and priority access to regulatory sandboxes. If you sat just above the SME threshold, this is the provision that actually changes your cost base."
        ]
      },
      {
        "type": "p",
        "text": [
          {
            "b": "An easier legal basis for bias detection. Real, and narrower than the summaries suggest."
          },
          " A new Article 4a extends the ability to process special categories of personal data for detecting and correcting bias beyond providers of high-risk systems, to providers and deployers of all AI systems and models. But the Commission's proposal to lower the threshold from \"strictly necessary\" to merely \"necessary\" did not survive. After pushback from the EDPB and EDPS, the co-legislators put strict necessity back. The permission is exceptional, available only where bias detection cannot be achieved by other means including synthetic data, and it comes bundled with cumulative safeguards: pseudonymisation, access controls, limits on onward sharing, deletion when done. It also creates no obligation to perform bias detection at all. This is a narrow door, not an open one."
        ]
      },
      {
        "type": "p",
        "text": [
          {
            "b": "No EU database registration for low-risk systems. This one is wrong."
          },
          " The Commission did propose exactly that — dropping registration for systems providers self-assess as non-high-risk under Article 6(3). Both the Council and the Parliament rejected it. The final text keeps the registration obligation and simplifies the Annex VIII information required. You also still have to document your Article 6(3) assessment before placing the system on the market, and national competent authorities can ask to see it."
        ]
      },
      {
        "type": "p",
        "text": "If you have written \"no registration required\" into a compliance plan on the strength of a summary, that is a finding waiting to happen. Registration got lighter. It did not go away."
      },
      {
        "type": "h2",
        "text": "What got harder"
      },
      {
        "type": "p",
        "text": "The simplification framing has crowded out the other half of the package."
      },
      {
        "type": "p",
        "text": "A new Article 5 prohibition covers AI systems that generate child sexual abuse material or non-consensual intimate imagery. It applies from 2 December 2026, and products currently on the market have to be gone by then, not merely relabelled."
      },
      {
        "type": "p",
        "text": "Article 50 transparency did not move at all. Telling people they are dealing with an AI system, labelling deepfakes, disclosing AI-generated text published on matters of public interest — all of that has applied since 2 August. The only concession is a grace period to 2 December 2026 for machine-readable marking of synthetic content by systems already on the market before that date."
      },
      {
        "type": "p",
        "text": "The AI Office also came out of this with more, not less: expanded oversight over systems built on general-purpose models, including those embedded in very large platforms and search engines."
      },
      {
        "type": "h2",
        "text": "Why the deferral happened"
      },
      {
        "type": "p",
        "text": "It is worth being clear-eyed about the reason for the extra time, because it tells you what to do with it."
      },
      {
        "type": "p",
        "text": "The high-risk obligations were postponed largely because the machinery needed to comply with them wasn't ready. The harmonised standards from CEN-CENELEC's JTC21 slipped well past their original target, and analyses through the spring suggested full readiness may not arrive before the end of 2026. The Commission's original design tied application to a decision on standards readiness; the co-legislators dropped that conditional trigger and set fixed dates instead. Certainty in exchange for a date."
      },
      {
        "type": "p",
        "text": "So the deferral is an admission that the guidance was late, not a judgment that the requirements were excessive. The underlying obligations are unchanged: risk management, data governance, technical documentation, human oversight, accuracy and robustness, conformity assessment, post-market monitoring. All of it survived intact, with a later start date."
      },
      {
        "type": "h2",
        "text": "Sixteen months is less than it sounds"
      },
      {
        "type": "p",
        "text": "Here is the part that should shape your planning. Some of the evidence the AI Act asks for is longitudinal. A post-market monitoring plan is a document you can write in a fortnight; twelve months of monitoring data showing the plan was actually operating is not. Conformity assessment against standards that are still stabilising takes time you don't control. Classifying your systems and reconstructing training data lineage across teams that have changed twice since the model shipped takes longer than anyone budgets."
      },
      {
        "type": "p",
        "text": "Work backwards from 2 December 2027 rather than forwards from today and the runway compresses fast. The organisations that will struggle are the ones treating the deferral as sixteen months of silence followed by a documentation sprint."
      },
      {
        "type": "figure",
        "src": "/figures/calendar-moved-3.svg",
        "caption": "Sequencing the work backwards from the deadline, not forwards from today."
      },
      {
        "type": "h2",
        "text": "What to do with the time"
      },
      {
        "type": "p",
        "text": "Classify first. You cannot scope any of this until you know which of your systems land in Annex III, which are caught as safety components under Annex I, and which you are self-assessing as non-high-risk under Article 6(3) — and remember that last group still gets registered and still needs its assessment written down."
      },
      {
        "type": "p",
        "text": "Check whether you are now a small mid-cap. The simplified documentation form and proportionate quality management expectations are worth real money, and the category is new enough that plenty of firms sitting between 250 and 750 employees haven't noticed they qualify."
      },
      {
        "type": "p",
        "text": "Start post-market monitoring before you are obliged to. Not for the regulator — for yourself. If your first twelve months of evidence begin in December 2026, you arrive at the deadline with a track record instead of a template."
      },
      {
        "type": "p",
        "text": "Treat the transparency obligations as live, because they are. That deadline passed on Sunday."
      },
      {
        "type": "h2",
        "text": "The pattern underneath"
      },
      {
        "type": "p",
        "text": "Every simplification in this package moves work rather than removing it. Literacy shifts from an outcome you guarantee to a process you evidence. Monitoring loses prescribed forms and keeps the duty to actually monitor. Registration gets fewer fields and stays mandatory. Bias detection gains a legal basis and arrives wrapped in conditions you have to demonstrate you met."
      },
      {
        "type": "p",
        "text": "That is a fair description of AI governance generally. The obligations that survive contact with reality are the ones about what your systems are doing now, continuously, and whether you can show it. Deadlines move. Evidence requirements don't."
      },
      {
        "type": "p",
        "text": "Which is the whole reason we built Tahara around continuous checks rather than annual attestations. If your compliance position is a document written in 2026 describing systems as they were in 2026, December 2027 will be an unpleasant conversation regardless of how much runway you thought you had."
      }
    ]
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
