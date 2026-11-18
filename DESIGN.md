# Design

## Direction

An editorial introduction followed by a focused local connection workspace. The latest user direction selects a near-black olive hero and footer, warm white display text and yellow emphasis on “WhatsApp”; the setup remains light. The subsequent user direction makes the supporting details black as well. The user requested a stronger composition inspired by Ksen Panchenko, Charbel Tannous and WeEvolveIT, while retaining the existing olive, yellow and cream color system. Borrow expressive typography, consistent alignment and contrast between chapters; keep setup immediately accessible.

The foundation remains shadcn preset `b4r0BVlDHO`, Base UI Luma, Remix icons and generated shadcn controls. The user authorized revising the initial preset presentation after seeing it in use.

## Page flow

The current approved implementation separates the public landing page at `/` from the local setup at `/setup`. The landing includes an ASCII hero, a scripted two-turn message journey, use-case instruction examples, quickstart, capability limits and FAQ. Public links are centralized in `web/lib/site.ts`. The workspace details below describe `/setup`.

- Opening: “Give your agent its WhatsApp.” One action leads to setup. An explicitly labelled WhatsApp-inspired animated conversation shows the outcome alongside the headline. It never calls the model or sends a message. Use the direct chat window rather than a phone frame to preserve readable conversation content.
- Workspace: link an account, check a real WhatsApp reply, then connect your own agent. Three accessible tabs share one workspace without an outer floating card. Pairing status controls the next action.
- A completed pairing clears the private QR and advances from Link to Test, with keyboard focus on the new instruction. Reply confirmation is a user action, separate from backend activity counters. This confirmation is local UI state and resets when the account disconnects or the page reloads.
- Details: explain the official Agent/run() boundary and disclose startup, storage and coverage details. Offline feedback also exposes the backend startup command.

Use conversational instructions and avoid repeating them in QR placeholders or section introductions. The browser-only agent test is secondary and clearly separate from WhatsApp verification. Paid calls remain explicitly labelled at the action.

## Visual system

- Color tokens are preserved, including the previously improved light muted foreground `oklch(0.50 0.031 107.3)`. Yellow colors the word “WhatsApp” in the title and marks active steps. Near-black olive frames the hero and footer; white and cream carry the setup and QR area. The supporting details and footer use near-black olive. The animated WhatsApp window has an independent scoped green, blue-grey and neutral palette, instead of adopting the site colors.
- Playfair Display regular and italic provide the editorial voice. Manrope gives instructions and controls a clear reading rhythm. Geist Mono is reserved for code and data. Fonts are self-hosted through next/font.
- Desktop pairs a large left-aligned headline with the example conversation. The connection workspace uses strong horizontal alignment and generous separation, without nested cards.
- Original broad SVG curves mark chapter transitions. Decorative geometry is hidden from assistive technology.
- Motion uses the `motion` package for a once-only compose/send/read/typing/reply sequence, with pause and replay controls. Timing pauses offscreen and when the browser tab is hidden. Decorative app chrome is not interactive, and a static transcript is available to screen readers. Setup panels use brief entrance feedback. Reduced motion presents all content immediately. Native scrolling, a skip link, themed thin scrollbars and normal keyboard/touch behavior remain intact.
- Real pairing codes are private, transient, never cached and clear on connection changes. Use synthetic QR fixtures for design verification; never capture a real owner pairing QR in screenshots.
- On mobile the headline, example and pairing areas stack. Keep the primary action above the example and preserve readable commands without horizontal overflow.

## Verification boundary

Frontend build, lint and browser checks establish local UI behavior. Synthetic pairing checks do not prove real WhatsApp delivery; the user must pair their account and verify a reply on another account’s phone. A response accepted by WAHA is not a device delivery receipt.
