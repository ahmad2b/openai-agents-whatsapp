import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Geist_Mono, Manrope, Playfair_Display } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  style: ["normal", "italic"],
})
const ui = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
})
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OpenAI Agents · WhatsApp — give your agent its WhatsApp",
  description:
    "Give your OpenAI Agents SDK agent its WhatsApp. People text it, it answers and remembers. Open-source TypeScript starter: clone it, scan one QR, done.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-serif antialiased",
        heading.variable,
        mono.variable,
        ui.variable
      )}
    >
      <body>
        {children}
        {process.env.VERCEL_ENV === "production" ? <Analytics /> : null}
      </body>
    </html>
  )
}
