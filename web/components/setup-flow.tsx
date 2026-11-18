"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  RiArrowRightLine,
  RiCheckLine,
  RiInformationLine,
  RiQrCodeLine,
  RiRefreshLine,
  RiSendPlaneLine,
} from "@remixicon/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CommandBlock } from "@/components/command-block"

type Status = {
  mode: "echo" | "openai"
  model: string | null
  session: string
  activity: {
    accepted: number
    replied: number
    failed: number
    pending: number
    processing: boolean
    lastOutcome: string | null
  }
}

const sessionLabels: Record<string, string> = {
  NOT_STARTED: "Not linked",
  STOPPED: "Stopped",
  STARTING: "Starting",
  SCAN_QR_CODE: "Scan QR",
  WORKING: "Connected",
  FAILED: "Connection failed",
  UNAVAILABLE: "Gateway unavailable",
  UNKNOWN: "Checking gateway",
}

async function jsonRequest(path: string, body?: object) {
  const response = await fetch(`/api/setup/${path}`, {
    ...(body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(path === "test" ? 70_000 : 25_000),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? "Request failed. Try again.")
  return data
}

export function SetupFlow() {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const qrRef = useRef<string | null>(null)
  const focusAfterPairing = useRef(false)
  const testHeading = useRef<HTMLHeadingElement>(null)
  const [tab, setTab] = useState("connect")
  const [phoneConfirmed, setPhoneConfirmed] = useState(false)
  const [text, setText] = useState("Say hello in one short sentence.")
  const [answer, setAnswer] = useState<string | null>(null)
  const [answerMode, setAnswerMode] = useState<string | null>(null)

  const clearQr = useCallback(() => {
    if (qrRef.current) URL.revokeObjectURL(qrRef.current)
    qrRef.current = null
    setQr(null)
  }, [])

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch("/api/setup/status", {
          cache: "no-store",
          signal: signal ?? AbortSignal.timeout(25_000),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        if (signal?.aborted) return
        setStatus(data)
        setConnectionError(null)
        if (data.session === "WORKING" && qrRef.current) {
          focusAfterPairing.current = true
          setTab((current) => (current === "connect" ? "test" : current))
        }
        if (data.session !== "WORKING") setPhoneConfirmed(false)
        if (data.session !== "SCAN_QR_CODE") clearQr()
      } catch (error) {
        if (signal?.aborted) return
        setStatus(null)
        clearQr()
        setConnectionError(
          error instanceof Error
            ? error.message
            : "Could not reach the backend."
        )
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [clearQr]
  )

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    async function tick() {
      await refresh(controller.signal)
      if (!controller.signal.aborted) timer = setTimeout(tick, 4000)
    }
    void tick()
    return () => {
      controller.abort()
      clearTimeout(timer)
      if (qrRef.current) URL.revokeObjectURL(qrRef.current)
    }
  }, [refresh])

  useEffect(() => {
    if (tab === "test" && focusAfterPairing.current) {
      focusAfterPairing.current = false
      testHeading.current?.focus({ preventScroll: true })
    } else if (tab !== "test") {
      focusAfterPairing.current = false
    }
  }, [tab])

  async function start() {
    setBusy("session")
    setActionError(null)
    try {
      await jsonRequest("session", {})
      await refresh()
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not start WhatsApp."
      )
    } finally {
      setBusy(null)
    }
  }

  async function generateQr() {
    setBusy("qr")
    setActionError(null)
    clearQr()
    try {
      const response = await fetch("/api/setup/qr", {
        cache: "no-store",
        signal: AbortSignal.timeout(25_000),
      })
      if (!response.ok) throw new Error((await response.json()).error)
      const image = URL.createObjectURL(await response.blob())
      qrRef.current = image
      setQr(image)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not load the QR. Try again."
      )
    } finally {
      setBusy(null)
    }
  }

  async function test(event: React.FormEvent) {
    event.preventDefault()
    setBusy("test")
    setActionError(null)
    setAnswer(null)
    try {
      const data = await jsonRequest("test", { text })
      setAnswer(data.answer)
      setAnswerMode(data.mode)
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Agent test failed. Try again."
      )
    } finally {
      setBusy(null)
    }
  }

  const linked = status?.session === "WORKING"
  const canStart =
    status && ["NOT_STARTED", "STOPPED", "FAILED"].includes(status.session)
  const canQr = status?.session === "SCAN_QR_CODE"

  return (
    <section
      id="setup"
      className="setup-workspace scroll-mt-6"
      aria-labelledby="setup-title"
    >
      <div className="setup-heading">
        <h2 id="setup-title" className="font-heading">
          Let’s get you
          <br />
          <em>connected.</em>
        </h2>
        <p>
          Start with an echo.
          <br />
          Bring your agent when you’re ready.
        </p>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(String(value))
          setActionError(null)
        }}
      >
        <TabsList
          variant="line"
          className="setup-steps"
          aria-label="Setup steps"
        >
          <TabsTrigger value="connect">
            <span className="step-number">
              {linked ? <RiCheckLine aria-label="Account linked" /> : "01"}
            </span>
            Link account
          </TabsTrigger>
          <TabsTrigger value="test">
            <span className="step-number">
              {phoneConfirmed ? (
                <RiCheckLine aria-label="Reply confirmed" />
              ) : (
                "02"
              )}
            </span>
            Test a reply
          </TabsTrigger>
          <TabsTrigger value="agent">
            <span className="step-number">03</span>Use your agent
          </TabsTrigger>
        </TabsList>
        <div className="setup-toolbar">
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            {loading ? (
              <>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
              </>
            ) : (
              <>
                <Badge variant={status ? "secondary" : "outline"}>
                  {status ? "Backend online" : "Backend offline"}
                </Badge>
                <Badge variant={linked ? "default" : "outline"}>
                  {status
                    ? (sessionLabels[status.session] ?? "Unknown state")
                    : "WhatsApp not checked"}
                </Badge>
                {status ? (
                  <Badge variant="outline">
                    {status.mode === "echo"
                      ? "Echo · no model charges"
                      : `AI · ${status.model}`}
                  </Badge>
                ) : null}
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Refresh connection status"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RiRefreshLine />
          </Button>
        </div>
        {connectionError ? (
          <Alert variant="destructive">
            <RiInformationLine />
            <AlertTitle>Start the backend to continue</AlertTitle>
            <AlertDescription>
              <p>{connectionError}</p>
              <CommandBlock code="docker compose up --build -d" />
            </AlertDescription>
          </Alert>
        ) : null}
        {status?.session === "UNAVAILABLE" ? (
          <Alert>
            <RiInformationLine />
            <AlertTitle>Hono is running; WAHA is not reachable</AlertTitle>
            <AlertDescription>
              Check the WAHA container, then refresh the connection status.
            </AlertDescription>
          </Alert>
        ) : null}
        {actionError ? (
          <Alert variant="destructive">
            <RiInformationLine />
            <AlertTitle>That step did not complete</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        ) : null}
        <TabsContent value="connect" className="setup-panel">
          <div className="pairing-layout">
            <div className="setup-instruction">
              <h3 className="setup-panel-title font-heading">
                {linked
                  ? "Your account is connected."
                  : "Link the account your agent will use."}
              </h3>
              <p className="max-w-prose leading-7 text-muted-foreground">
                {linked
                  ? "Your account is ready. Use another WhatsApp account to check that a message gets a reply."
                  : "Open WhatsApp on your phone. Choose Linked devices → Link a device, then scan the code here."}
              </p>
              <div className="flex flex-wrap gap-3">
                {linked ? (
                  <Button onClick={() => setTab("test")}>
                    Test the connection
                    <RiArrowRightLine data-icon="inline-end" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => void (canQr ? generateQr() : start())}
                    disabled={busy !== null || (!canStart && !canQr)}
                  >
                    {busy !== null || status?.session === "STARTING" ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <RiQrCodeLine data-icon="inline-start" />
                    )}
                    {busy === "qr"
                      ? "Loading your QR…"
                      : busy === "session" || status?.session === "STARTING"
                        ? "Starting WhatsApp…"
                        : canQr
                          ? qr
                            ? "Refresh QR"
                            : "Show QR code"
                          : status?.session === "FAILED"
                            ? "Retry connection"
                            : "Start linking"}
                  </Button>
                )}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Use a dedicated demo account. Keep the pairing code private.
              </p>
            </div>
            <div className="pairing-code">
              {qr && !linked ? (
                <Image
                  src={qr}
                  unoptimized
                  width={240}
                  height={240}
                  alt="Private QR for linking your WhatsApp account"
                  className="size-60 max-w-full object-contain"
                />
              ) : (
                <Empty className="p-2">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      {linked ? <RiCheckLine /> : <RiQrCodeLine />}
                    </EmptyMedia>
                    <EmptyTitle>
                      {linked ? "Connected" : "Ready when you are"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {linked
                        ? "You’re ready to test a reply."
                        : "Show your code to link this account."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="test" className="setup-panel">
          <div className="test-layout">
            <div className="flex flex-col items-start gap-5">
              <h3
                ref={testHeading}
                tabIndex={-1}
                className="setup-panel-title font-heading"
              >
                The best test? A real message.
              </h3>
              <p className="leading-7 text-muted-foreground">
                Message the number you just linked. Your own messages are
                ignored, so use a second account or ask a friend. Check for the
                reply on that phone.
              </p>
              {!linked ? (
                <Alert>
                  <RiInformationLine />
                  <AlertTitle>Link WhatsApp first</AlertTitle>
                  <AlertDescription>
                    Go back to Link to connect your account before sending a
                    message.
                  </AlertDescription>
                </Alert>
              ) : null}
              {phoneConfirmed ? (
                <Alert>
                  <RiCheckLine />
                  <AlertTitle>You’ve tested a WhatsApp reply.</AlertTitle>
                  <AlertDescription>
                    Ready to replace the echo with your own agent?
                  </AlertDescription>
                </Alert>
              ) : null}
              <Button
                onClick={() =>
                  phoneConfirmed ? setTab("agent") : setPhoneConfirmed(true)
                }
                disabled={!linked}
              >
                {phoneConfirmed ? "Connect my agent" : "I received the reply"}
                <RiArrowRightLine data-icon="inline-end" />
              </Button>
            </div>
            <div className="activity-summary">
              <h4>On this backend session</h4>
              <dl className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Messages accepted</dt>
                  <dd className="font-mono tabular-nums">
                    {status ? status.activity.accepted : "—"}
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between gap-4">
                  <dt>Replies accepted by WAHA</dt>
                  <dd className="font-mono tabular-nums">
                    {status ? status.activity.replied : "—"}
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between gap-4">
                  <dt>Failed or uncertain attempts</dt>
                  <dd className="font-mono tabular-nums">
                    {status ? status.activity.failed : "—"}
                  </dd>
                </div>
              </dl>
              <p className="text-sm leading-6 text-muted-foreground">
                Counts reset on backend restart. WAHA accepting a reply request
                does not confirm phone delivery.
              </p>
              {status?.activity.processing ? (
                <p className="flex items-center gap-2 text-sm" role="status">
                  <Spinner />
                  Preparing a reply…
                </p>
              ) : null}
            </div>
            <Accordion className="browser-test-disclosure">
              <AccordionItem value="browser-test">
                <AccordionTrigger>
                  Want to test just the agent here?
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex min-w-0 flex-col gap-5">
                    <p className="leading-7 text-muted-foreground">
                      Try the agent without WhatsApp. This makes a single-turn
                      request and does not save a conversation.
                    </p>
                    <form
                      onSubmit={test}
                      className="flex flex-col items-start gap-4"
                    >
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="test-message">
                            Your test message
                          </FieldLabel>
                          <Textarea
                            id="test-message"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            maxLength={1000}
                            rows={3}
                            required
                            disabled={busy === "test"}
                          />
                          <FieldDescription>
                            {status?.mode === "openai"
                              ? "This test makes a paid OpenAI call with your configured model."
                              : "Echo mode uses no OpenAI calls."}
                          </FieldDescription>
                        </Field>
                      </FieldGroup>
                      <Button
                        type="submit"
                        disabled={!status || !text.trim() || busy !== null}
                      >
                        {busy === "test" ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <RiSendPlaneLine data-icon="inline-start" />
                        )}
                        {busy === "test"
                          ? "Waiting for the answer…"
                          : status?.mode === "openai"
                            ? "Run paid AI test"
                            : "Run echo test"}
                      </Button>
                    </form>
                    {answer ? (
                      <Alert>
                        <RiCheckLine />
                        <AlertTitle>
                          {answerMode === "echo"
                            ? "Echo response"
                            : "Agent response"}
                        </AlertTitle>
                        <AlertDescription className="break-words whitespace-pre-wrap">
                          {answer}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
        <TabsContent value="agent" className="setup-panel">
          <div className="agent-layout">
            <div className="setup-instruction">
              <h3 className="setup-panel-title font-heading">
                Make the replies your own.
              </h3>
              <p className="leading-7 text-muted-foreground">
                Set your key and model in the root .env file, then recreate the
                backend container. Keep credentials in that file; this page
                never receives them.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Edit agent/agent.ts to bring your own agent. The official SDK
                runner stays in place. OpenAI calls are paid; use
                ALLOWED_CHAT_IDS in .env if you want to limit who can message
                it.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setTab("test")
                  void refresh()
                }}
              >
                Check the configured agent
                <RiArrowRightLine data-icon="inline-end" />
              </Button>
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <CommandBlock
                code={
                  "# Edit .env\nAGENT_MODE=openai\nOPENAI_API_KEY=your-private-key\nOPENAI_MODEL=your-model-id"
                }
              />
              <CommandBlock code="docker compose up -d --force-recreate app" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
