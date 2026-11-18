"use client"

import { useState } from "react"

type UseCase = {
  id: string
  name: string
  who: string
  instructions: string
  ask: string
}

// Each use case only changes the agent's instructions. Tools are yours to add.
const USE_CASES: UseCase[] = [
  {
    id: "store",
    name: "Store support",
    who: "Shops answering the same ten questions all day",
    instructions:
      "You answer for Acme Store. Shipping: US 2–4 days, Canada 5–7. Free over $60. Returns free within 30 days. Never invent order status.",
    ask: "Do you ship to Canada?",
  },
  {
    id: "clinic",
    name: "Clinic front desk",
    who: "Clinics, salons and studios with a busy phone line",
    instructions:
      "You are the front desk of Riverside Dental. Share opening hours, prices and prep instructions. For appointments, ask for a preferred day and say staff will confirm.",
    ask: "What time do you open Saturday?",
  },
  {
    id: "team",
    name: "Team handbook",
    who: "Teams whose staff live on WhatsApp, not the intranet",
    instructions:
      "You answer staff questions using the handbook below. Quote the policy section you used. If the handbook does not say, tell them to ask HR.",
    ask: "How many leave days do I get?",
  },
  {
    id: "tutor",
    name: "Course tutor",
    who: "Educators and cohort courses",
    instructions:
      "You are a patient tutor for an intro Python course. Give hints before answers. Keep replies short enough to read on a phone.",
    ask: "Why does my loop never stop?",
  },
  {
    id: "leads",
    name: "Lead qualifier",
    who: "Agencies and real estate with inbound chats",
    instructions:
      "You qualify inbound leads for a property agency. Ask budget, area and move-in date, one question at a time. Then summarise and say an agent will follow up.",
    ask: "Hi, saw your listing in Marina",
  },
  {
    id: "events",
    name: "Event concierge",
    who: "Conferences, weddings and meetups",
    instructions:
      "You help guests of DevConf 2027. Share the schedule, venue directions and wifi. Keep answers to two sentences.",
    ask: "Where is the keynote?",
  },
]

export function UseCaseExplorer() {
  const [active, setActive] = useState(USE_CASES[0])
  return (
    <div className="usecases">
      <div className="usecases-list" role="tablist" aria-label="Use cases">
        {USE_CASES.map((u, i) => (
          <button
            key={u.id}
            type="button"
            role="tab"
            id={`uc-${u.id}`}
            aria-selected={active.id === u.id}
            aria-controls="usecase-panel"
            onClick={() => setActive(u)}
          >
            <span className="usecases-num">0{i + 1}</span>
            <span className="usecases-name">{u.name}</span>
            <span className="usecases-who">{u.who}</span>
          </button>
        ))}
      </div>
      <div
        className="usecases-panel"
        id="usecase-panel"
        role="tabpanel"
        aria-labelledby={`uc-${active.id}`}
      >
        <div className="usecases-file">
          <span>agent/agent.ts</span>
          <span className="usecases-diff">1 line changed</span>
        </div>
        <pre key={active.id}>
          <code>
            <span className="tok-k">const</span>
            {" agent = "}
            <span className="tok-k">new</span>
            {" Agent({\n  name: "}
            <span className="tok-s">{"'WhatsApp assistant'"}</span>
            {",\n  model,\n"}
            <span className="code-changed">
              {"  instructions: "}
              <span className="tok-s">{`'${active.instructions}'`}</span>
              {","}
            </span>
            {"  modelSettings: { maxTokens: 1024, store: false },\n});"}
          </code>
        </pre>
        <div className="usecases-try">
          <span>Then someone texts</span>
          <p className="bubble bubble-them">{active.ask}</p>
        </div>
        <p className="usecases-note">
          Already have an agent? Replace this whole block with yours. Using
          another framework? Implement one <code>Reply</code> function:
          conversation in, text out.
        </p>
      </div>
    </div>
  )
}
