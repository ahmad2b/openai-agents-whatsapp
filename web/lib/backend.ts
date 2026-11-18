import "server-only"

const noStore = { "Cache-Control": "no-store" }

// Gateway keys and the shared backend token never enter the browser.
export async function proxySetup(request: Request, action: string) {
  const host = request.headers.get("host")
  if (!host || !["localhost:3002", "127.0.0.1:3002"].includes(host)) {
    return Response.json(
      { error: "This setup page is available on localhost:3002 only." },
      { status: 403, headers: noStore }
    )
  }
  const origin = request.headers.get("origin")
  if (
    (origin && origin !== `http://${host}`) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return Response.json(
      { error: "Use the local setup page to make this request." },
      { status: 403, headers: noStore }
    )
  }
  const allowed =
    request.method === "GET" ? ["status", "qr"] : ["session", "test"]
  if (!allowed.includes(action))
    return Response.json(
      { error: "Not found" },
      { status: 404, headers: noStore }
    )
  if (
    request.method === "POST" &&
    !request.headers.get("content-type")?.startsWith("application/json")
  ) {
    return Response.json(
      { error: "Expected JSON" },
      { status: 415, headers: noStore }
    )
  }
  const token = process.env.WEBHOOK_TOKEN
  if (!token || token.length < 32) {
    return Response.json(
      {
        error: "Run npm run setup, then npm run dev from the repository root.",
      },
      { status: 503, headers: noStore }
    )
  }
  let body: string | undefined
  if (request.method === "POST") {
    const reader = request.body?.getReader()
    const chunks: Uint8Array[] = []
    let bytes = 0
    try {
      if (reader)
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          bytes += value.byteLength
          if (bytes > 4096)
            return Response.json(
              { error: "Request too large" },
              { status: 413, headers: noStore }
            )
          chunks.push(value)
        }
    } finally {
      await reader?.cancel().catch(() => undefined)
    }
    body = Buffer.concat(chunks).toString("utf8")
  }
  try {
    const response = await fetch(
      new URL(
        `/local/${action}`,
        process.env.BACKEND_URL ?? "http://127.0.0.1:3001"
      ),
      {
        method: request.method,
        headers: {
          "X-Webhook-Token": token,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body,
        signal: AbortSignal.timeout(action === "test" ? 65_000 : 20_000),
        redirect: "error",
        cache: "no-store",
      }
    )
    if (response.status === 401) {
      await response.body?.cancel()
      return Response.json(
        {
          error:
            "Backend credentials do not match. Recreate the app container and restart npm run dev.",
        },
        { status: 502, headers: noStore }
      )
    }
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...noStore,
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    })
  } catch {
    return Response.json(
      {
        error:
          "Backend unavailable. Run docker compose up --build -d, then check again.",
      },
      { status: 503, headers: noStore }
    )
  }
}
