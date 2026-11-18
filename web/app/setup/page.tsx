import type { Metadata } from "next"
import Link from "next/link"
import { RiArrowRightUpLine } from "@remixicon/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CopyLine } from "@/components/landing/copy-line"
import { SiteFooter, SiteHeader } from "@/components/landing/site-chrome"
import { SetupFlow } from "@/components/setup-flow"
import { site } from "@/lib/site"
import "../landing.css"
import "./setup.css"

export const metadata: Metadata = {
  title: "Local setup · give your agent its WhatsApp",
  description:
    "Link the WhatsApp your agent will use, test a real reply, then switch on your OpenAI agent. Runs on your machine.",
  robots: { index: false, follow: false },
}

const details = [
  {
    q: "What connects to what?",
    a: "WhatsApp → WAHA → the Hono webhook → your agent → back to the same chat. Docker runs WAHA and the backend. The local setup page runs on your machine with Next.js and talks to the backend through a few fixed, server-side routes.",
  },
  {
    q: "Where do conversations live?",
    a: "Each sender’s last five turns stay in backend memory and reset on restart. There is no database. WAHA keeps the linked-device session in a private Docker volume, so you don’t have to scan again after a restart.",
  },
  {
    q: "What does this starter handle?",
    a: "New private text messages from other accounts. Groups, media, status updates and the agent’s own messages are ignored. It’s built to test an idea, not to run production traffic yet.",
  },
  {
    q: "Is the QR code safe to share?",
    a: "Keep it private. Scanning authorizes this gateway as a linked device for the WhatsApp account on the scanning phone. Only scan with the account you want to connect. The local setup page clears the QR when the connection changes.",
  },
  {
    q: "How do I unlink or start over?",
    a: "Remove the device from WhatsApp → Linked devices on the agent’s phone. To also erase the local session, run docker compose down --volumes, then link again here.",
  },
]

export default function SetupPage() {
  const hosted = Boolean(process.env.VERCEL_ENV)

  return (
    <div className="landing setup-page">
      <a href="#setup" className="skip-link">
        Skip to setup
      </a>
      <SiteHeader page="setup" />

      <main>
        <section className="lp-wrap st-hero" aria-labelledby="st-title">
          <div>
            <span className="lp-kicker">Local setup</span>
            <h1 id="st-title">
              Hand your agent
              <br />
              <em>its WhatsApp.</em>
            </h1>
            <p className="lp-lede">
              Link the WhatsApp your agent will use, test a real reply from
              another account, then switch on your agent. Run the setup on your
              computer; API keys stay server-side.
            </p>
          </div>
          <aside className="st-before" aria-labelledby="before-title">
            <h2 id="before-title">Before you start</h2>
            <ul>
              <li>
                <strong>The backend is running.</strong> From the repository
                root:
                <CopyLine
                  code="docker compose up --build -d"
                  label="Copy backend start command"
                />
              </li>
              <li>
                <strong>A WhatsApp account for the agent.</strong> A spare
                number works best, so your personal chats stay separate.
              </li>
              <li>
                <strong>A second account to test from.</strong> The agent
                ignores messages from its own number.
              </li>
              <li>
                <strong>No OpenAI key yet.</strong> Echo mode proves the wiring
                for free.
              </li>
            </ul>
          </aside>
        </section>

        <section
          className="setup-section"
          aria-label="Link and test your WhatsApp account"
        >
          {hosted ? (
            <div className="lp-wrap st-local-guide" id="setup">
              <span className="lp-kicker">Run it locally</span>
              <h2>
                Pair on <em>your computer.</em>
              </h2>
              <p>
                This website introduces the project. To link WhatsApp, run the
                starter locally and open its setup page. No OpenAI key is needed
                for your first echo reply.
              </p>
              <CopyLine
                code={
                  "git clone https://github.com/ahmad2b/openai-agents-whatsapp.git\ncd openai-agents-whatsapp\nnpm ci\nnpm run setup\nnpm run web:install\ndocker compose up --build -d\nnpm run dev"
                }
                label="Copy local setup commands"
              />
              <p className="st-requirements">
                You’ll need Node.js 22+ and Docker Compose.
              </p>
              <a className="lp-button" href="http://localhost:3002/setup">
                Open local setup <RiArrowRightUpLine aria-hidden="true" />
              </a>
            </div>
          ) : (
            <SetupFlow />
          )}
        </section>

        <section
          className="lp-wrap lp-section lp-rule lp-split"
          aria-labelledby="details-title"
        >
          <div className="lp-head">
            <span className="lp-kicker">Under the hood</span>
            <h2 id="details-title">
              Keep your agent.
              <br />
              <em>Add the conversation.</em>
            </h2>
            <p>
              The official Agents SDK still runs your agent. This starter only
              handles the WhatsApp side: incoming messages, each sender’s
              memory, and replies to the right person.
            </p>
            <div className="st-links">
              <Link className="lp-link" href="/#how">
                Watch one message travel
              </Link>
              <a
                className="lp-link"
                href={`${site.repository}#make-it-your-agent`}
                target="_blank"
                rel="noreferrer"
              >
                Make it your agent <RiArrowRightUpLine aria-hidden="true" />
              </a>
            </div>
          </div>
          <Accordion className="lp-faq">
            {details.map((d) => (
              <AccordionItem key={d.q} value={d.q}>
                <AccordionTrigger>{d.q}</AccordionTrigger>
                <AccordionContent>
                  <p>{d.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <SiteFooter page="setup" />
    </div>
  )
}
