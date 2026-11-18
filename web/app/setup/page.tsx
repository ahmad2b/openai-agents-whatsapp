import type { Metadata } from "next"
import Link from "next/link"
import {
  RiArrowDownLine,
  RiArrowRightUpLine,
  RiGithubLine,
  RiWhatsappLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CommandBlock } from "@/components/command-block"
import { SetupFlow } from "@/components/setup-flow"
import { ConversationExample } from "@/components/conversation-example"
import { SectionDivider } from "@/components/section-divider"

const repository = "https://github.com/ahmad2b/openai-agents-whatsapp"

export const metadata: Metadata = {
  title: "Local setup · OpenAI Agents WhatsApp",
  robots: { index: false, follow: false },
}

export default function Page() {
  return (
    <>
      <a href="#setup" className="skip-link">
        Skip to setup
      </a>
      <header className="opening dark">
        <div className="page-width site-header">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium"
            aria-label="OpenAI Agents WhatsApp home"
          >
            <RiWhatsappLine className="size-6" />
            <span>
              OpenAI Agents <span className="brand-connector">/</span> WhatsApp
            </span>
          </Link>
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            render={<a href={repository} target="_blank" rel="noreferrer" />}
          >
            <RiGithubLine data-icon="inline-start" />
            <span className="hidden sm:inline">View on </span>GitHub
            <RiArrowRightUpLine data-icon="inline-end" />
          </Button>
        </div>
      </header>
      <main>
        <section aria-labelledby="intro-title" className="hero-surface dark">
          <div className="page-width hero-content">
            <div className="hero-copy">
              <h1 id="intro-title" className="font-heading">
                Give your
                <br />
                agent its
                <br />
                <em>WhatsApp.</em>
              </h1>
              <p className="hero-description">
                Your agent, one message away.
                <br />
                In the chat people already use.
              </p>
              <Button
                nativeButton={false}
                size="lg"
                render={<a href="#setup" />}
              >
                Connect my WhatsApp
                <RiArrowDownLine data-icon="inline-end" />
              </Button>
              <p className="hero-note">Try it without an OpenAI key.</p>
            </div>
            <ConversationExample />
            <div className="hero-colophon">
              <span>
                OpenAI Agents SDK <span aria-hidden="true">↔</span> WAHA
              </span>
              <span>TypeScript. Self-hosted. Yours to build on.</span>
            </div>
          </div>
          <SectionDivider />
        </section>

        <section
          className="setup-section"
          aria-label="Link and test your WhatsApp account"
        >
          <SetupFlow />
        </section>

        <section
          id="how-it-works"
          className="details-surface dark"
          aria-labelledby="architecture-title"
        >
          <SectionDivider reverse />
          <div className="page-width details-content grid gap-8 md:grid-cols-[1fr_1.3fr] md:gap-20">
            <div>
              <h2
                id="architecture-title"
                className="font-heading text-4xl leading-tight sm:text-5xl"
              >
                Keep your agent.
                <br />
                <em>Add the conversation.</em>
              </h2>
              <p className="mt-5 max-w-prose leading-7 text-muted-foreground">
                Keep the official SDK’s Agent and run(). The adapter handles
                incoming messages, separate chat context and replies to the
                right person.
              </p>
              <Button
                nativeButton={false}
                variant="link"
                className="mt-4 px-0"
                render={
                  <a
                    href={`${repository}#make-it-your-agent`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                Make it yours
                <RiArrowRightUpLine data-icon="inline-end" />
              </Button>
            </div>
            <Accordion>
              <AccordionItem value="local">
                <AccordionTrigger>
                  Need to start the project locally?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4 leading-7">
                    Clone the repo and open its folder. You’ll need Node.js 22+
                    and Docker Compose. Then run:
                  </p>
                  <CommandBlock
                    code={
                      "npm ci\nnpm run setup\nnpm run web:install\ndocker compose up --build -d\nnpm run dev"
                    }
                  />
                  <p className="mt-4 leading-7">
                    Open localhost:3002. Echo mode needs no OpenAI key.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="flow">
                <AccordionTrigger>What connects to what?</AccordionTrigger>
                <AccordionContent>
                  <p className="leading-7">
                    WhatsApp → WAHA → Hono → your agent → the same chat. Docker
                    runs WAHA and the agent backend. Next.js runs this local
                    setup page. API credentials stay server-side.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="storage">
                <AccordionTrigger>
                  Where are conversations stored?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="leading-7">
                    Each sender has their own last five completed turns in
                    backend memory. History, pending work and duplicate tracking
                    reset on restart. There’s no application database. WAHA’s
                    linked-device state stays in a private Docker volume.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="limits">
                <AccordionTrigger>
                  What does this starter support?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="leading-7">
                    Fresh private text messages from other accounts. Groups,
                    media and your own messages are ignored. WAHA is an
                    unofficial linked-account integration; use a dedicated demo
                    account. This starter does not provide durable production
                    messaging.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
      <footer className="footer-surface dark">
        <div className="page-width site-footer">
          <p>Built with OpenAI Agents SDK & WAHA.</p>
          <a
            className="hover:underline"
            href={`${repository}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
          >
            Open source. MIT licensed.
          </a>
        </div>
      </footer>
    </>
  )
}
