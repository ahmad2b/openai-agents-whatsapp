"use client"

import { useState } from "react"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export function CommandBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }
  return (
    <div className="relative min-w-0 rounded-xl bg-muted p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Terminal · repository root
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={copied ? "Commands copied" : "Copy commands"}
          onClick={copy}
        >
          {copied ? <RiCheckLine /> : <RiFileCopyLine />}
        </Button>
      </div>
      <pre className="overflow-x-auto font-mono text-xs leading-7 sm:text-sm">
        <code>{code}</code>
      </pre>
      {failed ? (
        <p className="mt-2 text-sm" role="status">
          Copy unavailable. Select the commands to copy them.
        </p>
      ) : null}
    </div>
  )
}
