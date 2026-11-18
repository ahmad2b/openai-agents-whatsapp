import Link from "next/link"
import {
  RiArrowRightUpLine,
  RiArrowDownLine,
  RiGithubLine,
  RiWhatsappLine,
} from "@remixicon/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AsciiBurst } from "@/components/landing/ascii-burst"
import { CopyLine } from "@/components/landing/copy-line"
import { MessageJourney } from "@/components/landing/message-journey"
import { UseCaseExplorer } from "@/components/landing/use-case-explorer"
import { site } from "@/lib/site"
import "./landing.css"

const benefits = [
  {
    title: "Its own WhatsApp, today",
    body: "Your agent takes over a WhatsApp account you link, the way WhatsApp Web does. No Business API application before you can test.",
  },
  {
    title: "Keep your agent",
    body: "The official Agents SDK Agent and run(). Paste your agent in, or plug in any framework through one Reply function. The WhatsApp code stays the same.",
  },
  {
    title: "Each person gets their own memory",
    body: "The last five turns per sender, kept apart. Follow-up questions just work.",
  },
  {
    title: "Replies can’t be misrouted",
    body: "Your agent returns text, never a destination. The reply always goes to whoever wrote in.",
  },
  {
    title: "Try it free first",
    body: "Echo mode needs no OpenAI key. Prove the wiring, then switch one env var.",
  },
  {
    title: "Small enough to read",
    body: "About 300 lines of backend TypeScript and no database. Read it in one sitting, then make it yours.",
  },
]

const steps = [
  {
    title: "Clone and set up",
    body: "Installs dependencies and generates local secrets in an ignored .env.",
    code: `${site.cloneCommand}\ncd openai-agents-whatsapp\nnpm ci && npm run setup && npm run web:install`,
  },
  {
    title: "Start the gateway and backend",
    body: "WAHA and the agent backend run in Docker. The setup page runs on your machine.",
    code: "docker compose up --build -d\nnpm run dev",
  },
  {
    title: "Hand your agent its WhatsApp",
    body: "Open localhost:3002/setup, start WhatsApp, then scan the private QR from the agent’s phone under WhatsApp → Linked devices.",
    code: "# Open in your browser:\n# http://localhost:3002/setup",
  },
  {
    title: "Text your agent",
    body: "From another phone. Echo mode replies to prove the loop works end to end.",
    chat: true,
  },
  {
    title: "Let your agent answer",
    body: "Set three values in .env and recreate the app container. Now its WhatsApp is run by your agent.",
    code: "# .env\n# AGENT_MODE=openai\n# OPENAI_API_KEY=…\n# OPENAI_MODEL=…\ndocker compose up -d --force-recreate app",
  },
]

const faqs = [
  {
    q: "What does it cost to run?",
    a: "The code is MIT licensed and runs on your machine. Echo mode is free. In OpenAI mode you pay your normal OpenAI usage; each run is capped at two agent turns and 1,024 output tokens.",
  },
  {
    q: "Do I need a new number or SIM?",
    a: "You need a WhatsApp account for the agent. A spare number, or WhatsApp Business on a second SIM, works best so your personal chats stay separate. The phone stays linked to the agent the way WhatsApp Web does.",
  },
  {
    q: "Do I need two phones?",
    a: "You need one account that becomes the agent’s WhatsApp and a different account to text it. The agent ignores messages sent from its own WhatsApp.",
  },
  {
    q: "Can I use LangGraph, Claude, or my own backend instead?",
    a: "Yes. Implement one Reply function that takes the conversation and returns text, then wire it into index.ts. The WhatsApp side doesn’t care what produced the answer.",
  },
  {
    q: "Can I keep it running 24/7 or deploy it?",
    a: "It runs anywhere Docker runs, but the starter ships for local use: memory resets on restart and there are no retries. Always-on hosting needs a server, durable jobs and, at scale, the official Cloud API.",
    cta: true,
  },
]

const marquee = [
  "Clone",
  "Scan",
  "Text",
  "Reply",
  "Remember",
  "Swap in your agent",
  "MIT licensed",
  "Self-hosted",
]

export default function Landing() {
  return (
    <div className="landing">
      <a href="#how" className="skip-link">
        Skip to how it works
      </a>

      <header className="lp-bar">
        <Link
          href="/"
          className="lp-brand"
          aria-label="OpenAI Agents WhatsApp home"
        >
          <RiWhatsappLine aria-hidden="true" />
          <span>
            Agents <i>×</i> WhatsApp
          </span>
        </Link>
        <span className="lp-status">
          <span className="lp-dot" aria-hidden="true" /> Open source · MIT
        </span>
        <nav aria-label="Sections" className="lp-nav">
          <a href="#how">How it works</a>
          <a href="#use-cases">Use cases</a>
          <a href="#start">Get started</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a
          className="lp-pill"
          href={site.repository}
          target="_blank"
          rel="noreferrer"
        >
          <RiGithubLine aria-hidden="true" /> GitHub
        </a>
      </header>

      <main>
        {/* 1 — Promise */}
        <section className="lp-hero" aria-labelledby="hero-title">
          <AsciiBurst />
          <div className="lp-hero-inner">
            <p className="lp-badge">
              <span>New</span> OpenAI Agents SDK <i>×</i> WAHA · TypeScript
            </p>
            <h1 id="hero-title">
              Give your agent
              <br />
              its <em>WhatsApp.</em>
            </h1>
            <p className="lp-lede">
              Your OpenAI Agents SDK agent gets its own WhatsApp. People text
              it, it answers and remembers the conversation. Link an account
              with one QR scan; this open-source starter handles the rest.
            </p>
            <div className="lp-hero-actions">
              <a className="lp-button" href="#start">
                Get started <RiArrowDownLine aria-hidden="true" />
              </a>
              <a
                className="lp-button lp-button-ghost"
                href={site.repository}
                target="_blank"
                rel="noreferrer"
              >
                <RiGithubLine aria-hidden="true" /> Star on GitHub
              </a>
            </div>
            <div className="lp-hero-clone">
              <CopyLine code={site.cloneCommand} label="Copy clone command" />
            </div>
            <p className="lp-hint" aria-hidden="true">
              <span className="lp-dot" /> Click anywhere to send a message
            </p>
          </div>
        </section>

        {/* 2 — How it works */}
        <section id="how" className="lp-dark" aria-labelledby="how-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="lp-kicker">01 · How it works</span>
              <h2 id="how-title">
                Follow one message
                <br />
                <em>there and back.</em>
              </h2>
              <p>
                This is what happens each time someone texts your agent’s
                WhatsApp. Five hops, each a few lines of code. Watch the second
                question: the agent remembers the first.
              </p>
            </div>
            <MessageJourney />
          </div>
        </section>

        {/* 3 — Benefits */}
        <section
          className="lp-wrap lp-section lp-rule"
          aria-labelledby="why-title"
        >
          <div className="lp-head">
            <span className="lp-kicker">02 · Why this starter</span>
            <h2 id="why-title">
              The boring parts,
              <br />
              <em>already done.</em>
            </h2>
          </div>
          <ul className="lp-benefits">
            {benefits.map((b, i) => (
              <li key={b.title}>
                <span className="lp-num">0{i + 1}</span>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 4 — Use cases */}
        <section
          id="use-cases"
          className="lp-wrap lp-section lp-rule"
          aria-labelledby="uc-title"
        >
          <div className="lp-head">
            <span className="lp-kicker">03 · What you can build</span>
            <h2 id="uc-title">
              One line of instructions.
              <br />
              <em>A different business.</em>
            </h2>
            <p>
              Pick a use case. The only thing that changes is what you tell the
              agent.
            </p>
          </div>
          <UseCaseExplorer />
          <aside className="lp-help" aria-label="Brainstorm your use case">
            <p>
              <strong>Building something that isn’t on this list?</strong> I’d
              love to hear about it and think it through with you. No pitch,
              just two people talking about your idea.
            </p>
            <a
              className="lp-link"
              href={site.booking}
              target="_blank"
              rel="noreferrer"
            >
              Brainstorm it with me <RiArrowRightUpLine aria-hidden="true" />
            </a>
          </aside>
        </section>

        {/* 5 — Quickstart */}
        <section id="start" className="lp-dark" aria-labelledby="start-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="lp-kicker">04 · Get started</span>
              <h2 id="start-title">
                Five steps to
                <br />
                <em>first reply.</em>
              </h2>
              <p>
                You’ll need Node.js 22+, Docker with Compose, a WhatsApp account
                to become your agent’s (use a dedicated one), and a second
                account to text it from.
              </p>
            </div>
            <ol className="lp-steps">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="lp-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="lp-step-text">
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                  <div className="lp-step-code">
                    {s.chat ? (
                      <div
                        className="lp-mini-chat"
                        aria-label="You: Hello. Bot: Echo: Hello"
                      >
                        <p className="bubble bubble-them">Hello</p>
                        <p className="bubble bubble-agent">Echo: Hello</p>
                      </div>
                    ) : (
                      <CopyLine code={s.code!} label={`Copy: ${s.title}`} />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6 — Honest limits + production offer */}
        <section
          className="lp-wrap lp-section lp-split"
          aria-labelledby="edges-title"
        >
          <div className="lp-head">
            <span className="lp-kicker">05 · Honest edges</span>
            <h2 id="edges-title">
              A starter,
              <br />
              <em>not a promise.</em>
            </h2>
            <ul className="lp-edges">
              <li>
                In-memory queue and history. A restart forgets; a crash can drop
                a message.
              </li>
              <li>
                WAHA is an unofficial linked-device gateway, not Meta’s Cloud
                API. That makes it a fast way to validate your idea or MVP
                before you apply for the official API, or while you wait for
                approval.
              </li>
              <li>
                Private text chats only. Groups, media and voice notes are
                ignored.
              </li>
              <li>
                One linked account, one agent run at a time, up to 20 waiting.
              </li>
            </ul>
          </div>
          <aside className="lp-offer" aria-labelledby="offer-title">
            <span className="lp-status">
              <span className="lp-dot" aria-hidden="true" /> Going past the
              starter?
            </span>
            <h3 id="offer-title">
              I’m happy to <em>talk it through</em> with you.
            </h3>
            <p>
              Durable queues, the official Cloud API, tools that act on your
              systems, handing off to a human. I’ve worked through these before,
              and whether you’re still planning or stuck halfway, I’m glad to
              share what I’ve learned.
            </p>
            <div className="lp-hero-actions">
              <a
                className="lp-button"
                href={site.booking}
                target="_blank"
                rel="noreferrer"
              >
                Book a 15-min chat <RiArrowRightUpLine aria-hidden="true" />
              </a>
              <a
                className="lp-button lp-button-ghost"
                href={`mailto:${site.email}`}
              >
                Email me
              </a>
            </div>
          </aside>
        </section>

        {/* 7 — FAQ */}
        <section
          id="faq"
          className="lp-wrap lp-section lp-rule lp-split"
          aria-labelledby="faq-title"
        >
          <div className="lp-head">
            <span className="lp-kicker">06 · Questions</span>
            <h2 id="faq-title">
              Before you
              <br />
              <em>clone it.</em>
            </h2>
          </div>
          <Accordion className="lp-faq">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>
                  <p>{f.a}</p>
                  {"cta" in f ? (
                    <a
                      className="lp-link"
                      href={site.booking}
                      target="_blank"
                      rel="noreferrer"
                    >
                      I’m happy to talk it through with you{" "}
                      <RiArrowRightUpLine aria-hidden="true" />
                    </a>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-marquee" aria-hidden="true">
          <div>
            {[...marquee, ...marquee].map((w, i) => (
              <span key={i}>
                {w}
                <i>*</i>
              </span>
            ))}
          </div>
        </div>
        <div className="lp-wrap lp-footer-cta">
          <h2>
            Give it <em>its WhatsApp.</em>
          </h2>
          <div className="lp-hero-actions">
            <a className="lp-button lp-button-light" href="#start">
              Get started
            </a>
            <a
              className="lp-button lp-button-ghost"
              href={site.booking}
              target="_blank"
              rel="noreferrer"
            >
              Book a 15-min chat <RiArrowRightUpLine aria-hidden="true" />
            </a>
          </div>
          <p className="lp-contact">
            Hi, I’m{" "}
            <a href={site.author.url} target="_blank" rel="noreferrer">
              Ahmad
            </a>
            , and I built this starter. If you’re working on something similar,
            got stuck on a step, or just want to bounce an idea around, write to
            me at <a href={`mailto:${site.email}`}>{site.email}</a>. I read
            every email and reply myself.
          </p>
        </div>
        <div className="lp-wrap lp-footer-meta">
          <span>
            Built with the OpenAI Agents SDK and WAHA by{" "}
            <a href={site.author.url} target="_blank" rel="noreferrer">
              {site.author.name}
            </a>
            .
          </span>
          <span>
            <a
              href={`${site.repository}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer"
            >
              MIT licensed
            </a>{" "}
            ·{" "}
            <a href={site.repository} target="_blank" rel="noreferrer">
              GitHub
            </a>{" "}
            · Not affiliated with OpenAI or WhatsApp.
          </span>
        </div>
      </footer>
    </div>
  )
}
