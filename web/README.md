# Local setup frontend

Run commands from the repository root:

```sh
npm run web:install
npm run dev
```

Open http://localhost:3002/setup. Start the Docker backend with `docker compose up --build -d` first. The root `.env` stays server-side; no separate frontend environment file is needed.

- `app/page.tsx`: public landing page (styles in `app/landing.css`, links in `lib/site.ts`).
- `app/setup/page.tsx`: local setup flow (noindex).
- `components/setup-flow.tsx`: connection state, private QR, agent test and activity counts.
- `app/api/setup/[action]/route.ts`: fixed local API routes.
- `lib/backend.ts`: server-only authenticated Hono proxy and origin checks.
- `components/ui/`: generated shadcn Base UI components.
- `app/globals.css`: preset b4r0BVlDHO tokens; Manrope/Playfair fonts are in `app/layout.tsx`.

Browser tests run the configured agent without sending WhatsApp messages. A real WhatsApp test needs a second account. See the root README for the full walkthrough and limits.
