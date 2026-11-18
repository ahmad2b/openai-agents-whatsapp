import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/landing/site-chrome"
import "./landing.css"

export default function NotFound() {
  return (
    <div className="landing">
      <SiteHeader page="home" />
      <main className="lp-wrap lp-404">
        <span className="lp-kicker">404 · No reply</span>
        <h1>
          This message
          <br />
          <em>didn’t arrive.</em>
        </h1>
        <p className="lp-lede">
          The page you’re looking for isn’t here. It may have moved, or the link
          may be old.
        </p>
        <div className="lp-hero-actions">
          <Link className="lp-button" href="/">
            Back to the start
          </Link>
          <Link className="lp-button lp-button-ghost" href="/#start">
            Get started
          </Link>
        </div>
      </main>
      <SiteFooter page="setup" />
    </div>
  )
}
