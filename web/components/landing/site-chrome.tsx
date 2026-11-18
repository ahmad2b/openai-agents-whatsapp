import Link from "next/link"
import {
  RiArrowRightUpLine,
  RiGithubLine,
  RiWhatsappLine,
} from "@remixicon/react"
import { site } from "@/lib/site"

const MARQUEE = [
  "Clone",
  "Scan",
  "Text",
  "Reply",
  "Remember",
  "Swap in your agent",
  "MIT licensed",
  "Self-hosted",
]

/** Sticky pill header shared by the landing page and /setup. */
export function SiteHeader({ page }: { page: "home" | "setup" }) {
  return (
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
        <span className="lp-dot" aria-hidden="true" />{" "}
        {page === "setup" ? "Local setup guide" : "Open source · MIT"}
      </span>
      <nav aria-label="Site" className="lp-nav">
        <Link href="/#how">How it works</Link>
        <Link href="/#use-cases">Use cases</Link>
        <Link href="/#start">Get started</Link>
        <Link
          href="/setup"
          aria-current={page === "setup" ? "page" : undefined}
        >
          Setup
        </Link>
        <Link href="/#faq">FAQ</Link>
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
  )
}

/** Personal contact line used in every footer. */
function ContactNote({ page }: { page: "home" | "setup" }) {
  return (
    <p className="lp-contact">
      Hi, I’m{" "}
      <a href={site.author.url} target="_blank" rel="noreferrer">
        Ahmad
      </a>
      {page === "setup"
        ? ", and I built this starter. If a step isn’t working, or you want to talk through what comes next, write to me at "
        : ", and I built this starter. If you’re working on something similar, got stuck on a step, or just want to bounce an idea around, write to me at "}
      <a href={`mailto:${site.email}`}>{site.email}</a>. I read every email and
      reply myself.
    </p>
  )
}

export function SiteFooter({ page }: { page: "home" | "setup" }) {
  return (
    <footer className="lp-footer">
      {page === "home" ? (
        <div className="lp-marquee" aria-hidden="true">
          <div>
            {[...MARQUEE, ...MARQUEE].map((w, i) => (
              <span key={i}>
                {w}
                <i>*</i>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <div
        className={
          page === "setup"
            ? "lp-wrap lp-footer-cta lp-footer-cta-compact"
            : "lp-wrap lp-footer-cta"
        }
      >
        <h2>
          {page === "home" ? (
            <>
              Give it <em>its WhatsApp.</em>
            </>
          ) : (
            <>
              Stuck on a step? <em>Ask me.</em>
            </>
          )}
        </h2>
        <div className="lp-hero-actions">
          {page === "home" ? (
            <a className="lp-button lp-button-light" href="#start">
              Get started
            </a>
          ) : (
            <a
              className="lp-button lp-button-light"
              href={`mailto:${site.email}`}
            >
              Email me
            </a>
          )}
          <a
            className="lp-button lp-button-ghost"
            href={site.booking}
            target="_blank"
            rel="noreferrer"
          >
            Book a 15-min chat <RiArrowRightUpLine aria-hidden="true" />
          </a>
        </div>
        <ContactNote page={page} />
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
  )
}
