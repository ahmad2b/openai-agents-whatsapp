"use client"

import { useState } from "react"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"

/** One-line (or short multi-line) command with a copy button. */
export function CopyLine({
  code,
  label = "Copy command",
  prompt = true,
}: {
  code: string
  label?: string
  prompt?: boolean
}) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked; the text stays selectable.
    }
  }
  return (
    <div className="copy-line">
      <pre>
        <code>
          {code.split("\n").map((line, i) => (
            <span key={i} className="copy-line-row">
              {prompt && !line.startsWith("#") ? (
                <span className="copy-line-prompt" aria-hidden="true">
                  $
                </span>
              ) : null}
              {line}
            </span>
          ))}
        </code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : label}
        className="copy-line-button"
      >
        {copied ? <RiCheckLine /> : <RiFileCopyLine />}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  )
}
