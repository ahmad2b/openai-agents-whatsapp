"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  MotionConfig,
  useInView,
} from "motion/react"
import * as m from "motion/react-m"
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiEmojiStickerLine,
  RiMicLine,
  RiMore2Line,
  RiPauseLine,
  RiPhoneLine,
  RiPlayLine,
  RiRefreshLine,
  RiSendPlaneFill,
  RiUser3Fill,
  RiVideoOnLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import s from "./conversation-example.module.css"

const question = "Can you help me plan my day?"
const reply = "Of course. What’s the one thing you want to get done?"
const duration = 6500
const serverMotion = () => false
const readMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
function subscribeMotion(update: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", update)
  return () => media.removeEventListener("change", update)
}

export function ConversationExample() {
  const root = useRef<HTMLElement>(null)
  const inView = useInView(root, { amount: 0.35 })
  const reduced = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    serverMotion
  )
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const running = inView && visible && !paused && !reduced && elapsed < duration
  // Start in the same state on the server and client; preference changes never alter hydration styles.
  const time = reduced ? duration : elapsed
  const sent = time >= 2400
  const read = time >= 3100
  const typing = time >= 3500 && time < 5400
  const answered = time >= 5400
  const draft = !sent
    ? question.slice(0, Math.max(0, Math.floor((time - 450) / 60)))
    : ""
  const transition = {
    duration: reduced ? 0 : 0.24,
    ease: [0.23, 1, 0.32, 1] as const,
  }

  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", update)
    update()
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  useEffect(() => {
    if (!running) return
    let previous = performance.now()
    const timer = setInterval(() => {
      const now = performance.now()
      const delta = now - previous
      previous = now
      setElapsed((current) => Math.min(duration, current + delta))
    }, 60)
    return () => clearInterval(timer)
  }, [running])

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <figure ref={root} className={`conversation-example ${s.demo}`}>
          <figcaption className="example-heading">
            <span>WhatsApp · Animated example</span>
            <div className={s.controls}>
              {!reduced && elapsed < duration ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={
                    paused
                      ? "Play example conversation"
                      : "Pause example conversation"
                  }
                  onClick={() => setPaused((p) => !p)}
                >
                  {paused ? <RiPlayLine /> : <RiPauseLine />}
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Replay example conversation"
                onClick={() => {
                  setElapsed(0)
                  setPaused(false)
                }}
                disabled={Boolean(reduced)}
              >
                <RiRefreshLine />
              </Button>
            </div>
          </figcaption>
          <div className={s.window} data-running={running} aria-hidden="true">
            <header className={s.header}>
              <RiArrowLeftSLine className={s.back} />
              <span className={s.avatar}>
                <RiUser3Fill />
              </span>
              <div className={s.contact}>
                <strong>Your agent</strong>
                <span>{typing ? "typing…" : "online"}</span>
              </div>
              <div className={s.tools}>
                <RiVideoOnLine />
                <RiPhoneLine />
                <RiMore2Line />
              </div>
            </header>
            <div className={s.thread}>
              <span className={s.day}>TODAY</span>
              <AnimatePresence initial={false}>
                {sent && (
                  <m.div
                    key="question"
                    className={`${s.bubble} ${s.outgoing}`}
                    initial={{
                      opacity: 0,
                      transform: reduced ? "none" : "translateY(8px)",
                    }}
                    animate={{ opacity: 1, transform: "translateY(0px)" }}
                    transition={transition}
                  >
                    <p>{question}</p>
                    <span className={s.meta}>
                      10:24{" "}
                      {read ? (
                        <RiCheckDoubleLine className={s.read} />
                      ) : (
                        <RiCheckLine />
                      )}
                    </span>
                  </m.div>
                )}
                {typing && (
                  <m.div
                    key="typing"
                    className={`${s.bubble} ${s.incoming} ${s.typing}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span />
                    <span />
                    <span />
                  </m.div>
                )}
                {answered && (
                  <m.div
                    key="reply"
                    className={`${s.bubble} ${s.incoming}`}
                    initial={{
                      opacity: 0,
                      transform: reduced ? "none" : "translateY(8px)",
                    }}
                    animate={{ opacity: 1, transform: "translateY(0px)" }}
                    transition={transition}
                  >
                    <p>{reply}</p>
                    <span className={s.meta}>10:24</span>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
            <div className={s.composer}>
              <RiAddLine />
              <div className={s.draft}>
                <RiEmojiStickerLine />
                <span className={draft ? s.typed : s.placeholder}>
                  {draft || "Type a message"}
                </span>
                {draft ? <span className={s.caret} /> : null}
              </div>
              <span className={s.send} data-ready={Boolean(draft)}>
                {draft ? <RiSendPlaneFill /> : <RiMicLine />}
              </span>
            </div>
          </div>
          <p className="sr-only">
            Scripted example, not a live chat. You: {question} Your agent:{" "}
            {reply}
          </p>
          <p className="example-caption">
            Same WhatsApp. Your agent on the other end.
          </p>
        </figure>
      </MotionConfig>
    </LazyMotion>
  )
}
