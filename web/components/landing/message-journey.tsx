"use client"

import { useEffect, useRef, useState } from "react"
import { RiPauseLine, RiPlayLine, RiRefreshLine } from "@remixicon/react"

type Node = "phone" | "webhook" | "adapter" | "agent" | "reply"

const NODES: { id: Node; label: string; sub: string }[] = [
  { id: "phone", label: "WhatsApp", sub: "Any phone" },
  { id: "webhook", label: "WAHA → webhook", sub: "Hono, token-checked" },
  { id: "adapter", label: "Adapter", sub: "Filter · dedupe · memory" },
  { id: "agent", label: "Your agent", sub: "Agents SDK run()" },
  { id: "reply", label: "Same chat", sub: "sendText(from, answer)" },
]

const STEPS: Record<Node, { title: string; file: string; code: string }> = {
  phone: {
    title: "A customer texts your agent’s WhatsApp from any phone.",
    file: "compose.yaml",
    code: "WHATSAPP_HOOK_URL: http://app:3001/webhook\nWHATSAPP_HOOK_EVENTS: message",
  },
  webhook: {
    title:
      "WAHA runs WhatsApp Web inside Docker and forwards the message to your webhook, authenticated with a shared secret token.",
    file: "index.ts",
    code: "app.use('/webhook', authenticate);\nconst status = handler.accept(event);",
  },
  adapter: {
    title:
      "The adapter validates it, drops duplicates and adds this sender’s recent turns.",
    file: "whatsapp/messages.ts",
    code: "const previous = histories.get(message.from) ?? [];\nconst input = [...previous, { role: 'user', content: message.body }];",
  },
  agent: {
    title: "Your OpenAI Agents SDK agent runs on that conversation.",
    file: "agent/agent.ts",
    code: "const result = await run(agent, input, { signal, maxTurns: 2 });\nreturn result.finalOutput;",
  },
  reply: {
    title:
      "The answer goes back to the same chat. Only the inbound message decides where.",
    file: "whatsapp/messages.ts",
    code: "// The destination comes only from the validated inbound message.\nawait options.sendText(message.from, answer);",
  },
}

const TURNS = [
  {
    ask: "Hi! Do you ship to Canada?",
    answer:
      "Yes 🇨🇦 Canada takes 5–7 business days, and shipping is free over $60.",
  },
  {
    ask: "And if it doesn’t fit?",
    answer:
      "Returns are free within 30 days for Canada too. Want me to send the return steps?",
  },
]

const ORDER: Node[] = ["phone", "webhook", "adapter", "agent", "reply"]
const TOTAL = ORDER.length * TURNS.length
const STEP_MS = 2300

export function MessageJourney() {
  const [tick, setTick] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let first = true
    const io = new IntersectionObserver(
      ([e]) => {
        // Reduced motion: no autoplay; show the finished conversation instead.
        if (
          first &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          setPlaying(false)
          setTick(TOTAL - 1)
        }
        first = false
        setInView(e.isIntersecting)
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !inView) return
    const id = setTimeout(
      () => setTick((t) => (t + 1) % TOTAL),
      tick === TOTAL - 1 ? STEP_MS * 2.5 : STEP_MS
    )
    return () => clearTimeout(id)
  }, [tick, playing, inView])

  const turn = Math.floor(tick / ORDER.length)
  const stage = tick % ORDER.length
  const node = ORDER[stage]
  const step = STEPS[node]
  // Messages visible in the phone at this moment.
  const bubbles: { from: "them" | "agent"; text: string }[] = []
  TURNS.forEach((t, i) => {
    if (i < turn || (i === turn && stage >= 0))
      bubbles.push({ from: "them", text: t.ask })
    if (i < turn || (i === turn && stage === 4))
      bubbles.push({ from: "agent", text: t.answer })
  })
  const typing = stage === 3
  const memory = turn * 2 // messages already remembered for this sender

  function jump(i: number) {
    setPlaying(false)
    setTick(turn * ORDER.length + i)
  }

  return (
    <div ref={rootRef} className="journey">
      <div className="journey-phone" aria-hidden="true">
        <div className="journey-phone-head">
          <span className="journey-avatar">A</span>
          <span>
            <strong>Acme Store</strong>
            <small>{typing ? "typing…" : "online"}</small>
          </span>
        </div>
        <div className="journey-chat">
          {bubbles.map((b, i) => (
            <p key={`${i}-${b.text}`} className={`bubble bubble-${b.from}`}>
              {b.text}
            </p>
          ))}
          {typing ? (
            <p className="bubble bubble-agent bubble-typing">
              <span />
              <span />
              <span />
            </p>
          ) : null}
        </div>
        <div className="journey-input">Message</div>
      </div>

      <ol className="journey-track" aria-label="Path of one message">
        {NODES.map((n, i) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => jump(i)}
              data-state={i < stage ? "done" : i === stage ? "active" : "idle"}
              aria-current={i === stage ? "step" : undefined}
            >
              <span className="journey-index">0{i + 1}</span>
              <span className="journey-label">{n.label}</span>
              <span className="journey-sub">{n.sub}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="journey-code">
        <div className="journey-code-head">
          <span>
            Turn {turn + 1} of 2 · step {stage + 1} of 5
          </span>
          <span className="journey-controls">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
            >
              {playing ? <RiPauseLine /> : <RiPlayLine />}
            </button>
            <button
              type="button"
              onClick={() => {
                setTick(0)
                setPlaying(true)
              }}
              aria-label="Restart walkthrough"
            >
              <RiRefreshLine />
            </button>
          </span>
        </div>
        <p className="journey-title" aria-live="polite">
          {step.title}
        </p>
        <div className="journey-file">{step.file}</div>
        <pre>
          <code>{step.code}</code>
        </pre>
        <div className="journey-memory">
          <span>Memory for this sender</span>
          <span className="journey-memory-bar" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <i
                key={i}
                data-on={i < memory + (stage >= 4 ? 2 : 0) ? "" : undefined}
              />
            ))}
          </span>
          <span className="journey-memory-count">
            {memory + (stage >= 4 ? 2 : 0)}/10 messages
          </span>
        </div>
      </div>

      <p className="sr-only">
        Example: a customer asks “Do you ship to Canada?”. The message travels
        from WhatsApp through WAHA to the webhook, the adapter adds the sender’s
        history, the agent answers, and the reply goes back to the same chat. On
        the follow-up “And if it doesn’t fit?”, the agent remembers the customer
        meant Canada.
      </p>
    </div>
  )
}
