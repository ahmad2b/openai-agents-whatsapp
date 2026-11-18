import { proxySetup } from "@/lib/backend"

export const runtime = "nodejs"
type Context = { params: Promise<{ action: string }> }

export async function GET(request: Request, context: Context) {
  return proxySetup(request, (await context.params).action)
}
export async function POST(request: Request, context: Context) {
  return proxySetup(request, (await context.params).action)
}
