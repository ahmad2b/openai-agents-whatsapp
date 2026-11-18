# OpenAI Agents - WhatsApp

Give your OpenAI agent a WhatsApp number. Powered by WAHA.

Link an existing WhatsApp account to your OpenAI Agents SDK agent. People can message that number, ask follow-up questions, and get answers in the same conversation. You bring the account and number; this project connects them to your agent.

This minimal TypeScript project keeps the agent and WhatsApp integration in separate folders so you can change one without rewriting the other.

```text
WhatsApp → WAHA → authenticated webhook → agent → reply to the original chat
```

## 1. Set up your local project

You need Node.js 22+, Docker with Compose, and a WhatsApp account to link. The pinned WAHA image targets Linux AMD64 (including compatible Docker Desktop setups). Use a dedicated demo account. An OpenAI API key is only needed for AI agent replies.

Clone the project and create your local configuration:

```sh
git clone https://github.com/ahmad2b/openai-agents-whatsapp.git
cd openai-agents-whatsapp
npm ci
npm run setup
```

Setup creates an ignored `.env` with random API/webhook secrets. It never overwrites an existing file. Leave `AGENT_MODE=echo` for the first run.

## 2. Link a WhatsApp number to your agent

```sh
docker compose up --build -d
npm run whatsapp -- start
npm run whatsapp -- status
```

When status is `SCAN_QR_CODE`:

```sh
npm run whatsapp -- qr
```

Open `.local/qr.png` on your computer. On the account's phone, open **WhatsApp → Linked devices → Link a device** and scan it. If the QR expires, run the QR command again. Check status until it says `WORKING`.

The QR grants access to the account. Keep it private; it is not a public “chat with me” QR. Delete the PNG after pairing. Linked credentials stay in this project's Docker `sessions` volume.

## 3. Test the connection

From a **different WhatsApp account**, send a new private text message to the linked number:

```text
You: Hello
Bot: Echo: Hello
```

Self messages, groups, status updates, media and messages timestamped before app startup are ignored. The gateway may still receive account history; filtering here does not prevent that receipt.

```sh
curl http://localhost:3001/health
docker compose logs --tail=30 app
```

Health reports only that the app is running, not WhatsApp pairing or model availability. If no reply arrives, check `WORKING`, echo mode, the sender allowlist, and that you sent a fresh text from another account. App logs omit message bodies and sender IDs; gateway logs may contain private account data, so inspect them privately.

## 4. Let your agent answer

Once echo replies work, enable AI answers by editing `.env`:

```dotenv
AGENT_MODE=openai
OPENAI_API_KEY=your-private-key
OPENAI_MODEL=your-model-id
```

Choose a model available to your OpenAI project and configure spending controls in your OpenAI account. To limit who can trigger paid replies, see the optional access restriction below.

```sh
docker compose up -d --force-recreate app
```

Send “My name is Sam”, then “What is my name?”. Your agent can use the earlier message to answer the follow-up. The app keeps the last five completed turns separately for each sender, so one person's chat is not included in another's context. Restarting the app clears that memory.

Model calls cost money. Each run has a 60-second timeout, at most two agent turns, and a 1,024-token output setting; these are bounds, not a dollar budget. A reasoning model may consume output tokens before producing a visible answer. The example disables SDK tracing and requests `store: false`; message history still goes to OpenAI when you use this mode. Provider retention policies still apply.

## Make it your agent

```text
agent/
  agent.ts          Define and run the OpenAI agent
  types.ts          Framework-independent message/reply contract
whatsapp/
  client.ts         Send text through WAHA
  messages.ts       Filter, deduplicate, queue and keep per-chat memory
scripts/
  setup.mjs         Generate local secrets
  whatsapp.mjs      Start the session, check status, save a private QR
index.ts            Wire the agent and WhatsApp webhook together
compose.yaml        Run the app and gateway on a private Compose network
```

Change the instructions in `agent/agent.ts` to give the included assistant your purpose and tone. If you already have an OpenAI Agents SDK agent, replace the `new Agent(...)` definition with your agent and keep the existing run wrapper. Then rebuild the app:

```sh
docker compose up --build -d app
```

The WhatsApp code stays the same. Read `index.ts` to see the connection, and `whatsapp/messages.ts` to see how incoming messages become conversation context.

To use another agent framework, implement the small `Reply` contract and wire it into `index.ts`:

```ts
import type { Reply } from './agent/types.js';

const reply: Reply = async (messages, signal) => {
  // Call your agent here. Pass signal to cancel timed-out work.
  return `You said: ${messages.at(-1)!.content}`;
};
```

The function receives conversation messages, not WhatsApp account IDs or gateway credentials. It returns text, not a destination. The WhatsApp layer always sends to the originating chat. Never add a model-controlled reply destination.

## How it works and where state lives

1. WAHA receives a WhatsApp message and forwards it to the authenticated app webhook.
2. The WhatsApp adapter checks the message, queues it, and adds that sender's recent conversation history.
3. The official OpenAI Agents SDK `run()` executes the agent and returns its answer.
4. The adapter sends the answer to the original sender and updates that chat's history.

The SDK manages agent execution. The adapter manages WhatsApp routing, per-chat context and delivery. Sender IDs stay outside the agent input.

**No separate database runs in this starter.**

| State | Stored in | Survives app restart? |
| --- | --- | --- |
| Recent chat history | App memory | No |
| Pending messages and duplicate tracking | App memory | No |
| WAHA linked-device state | Docker `sessions` volume | Yes |
| Local configuration and API keys | Ignored `.env` file | Yes |

The WAHA volume contains sensitive account state and may include gateway-managed data; it is not an application chat-history database. Add durable storage if you need resumable chats or reliable recovery after a crash.

<details>
<summary>Optional: restrict who can message the agent</summary>

By default, all supported private senders can receive replies. To limit access during testing, set `ALLOWED_CHAT_IDS` in `.env` to comma-separated exact WhatsApp sender IDs, then recreate the app container. An ID may look like `15551234567@c.us` or a numeric `@lid` identifier. These are WhatsApp addresses, not OpenAI configuration. Match the actual sender ID; do not guess between formats. Leave this setting empty if you want replies enabled for all supported private senders.

</details>

## Know what this starter supports

- Teaching example, not a durable production messaging service. It acknowledges webhook admission before work completes; a crash can lose accepted work. No automatic delivery retries.
- One linked account (`default`), private text chats only. Input/reply text is capped at 4,000 characters; webhook bodies at 64 KiB.
- One agent run at a time, with up to 20 waiting messages. Overflow returns HTTP 503; provider retry behavior is not guaranteed. There is no per-sender fairness or rate limit.
- Up to 100 chat histories; least recently completed chat is evicted. Up to 1,000 message IDs are remembered for one hour; duplicate protection resets on restart. Duplicate deliveries after expiry can run again.
- OpenAI agent failures produce no reply. Delivery failures may be ambiguous, so the app logs a generic error and does not retry blindly. Failed/uncertain turns are not saved to history.
- WAHA is an unofficial linked-account integration, not Meta's WhatsApp Cloud API. Account restrictions, platform changes and applicable WhatsApp terms remain relevant. Review them for your use case.
- No web browsing, tools, images, public hosting, persistent chat history, durable jobs or deployment automation. Replacing the agent does not automatically isolate tools you add.

Both published ports bind to localhost. Keep them private. For production, add durable jobs/deduplication, delivery-state handling, per-sender limits, managed secrets, and a retention/deletion policy before relying on it.

## Stop or reset

```sh
docker compose down
```

This preserves the linked session. To unlink, remove the device from WhatsApp's **Linked devices** screen. Only if you intend to erase local session credentials, run `docker compose down --volumes`; you must pair again afterward.

## Verification status

TypeScript checks and synthetic local webhook/Agents SDK checks passed. Real WhatsApp pairing and a live model round trip remain unverified. Follow the echo-mode walkthrough first.

## License

[MIT](LICENSE). Keep `.env`, QR images, session volumes, logs and real messages private.

## References

- [OpenAI Agents SDK quickstart](https://developers.openai.com/api/docs/guides/agents/quickstart)
- [WAHA quickstart](https://waha.devlike.pro/docs/how-to/quick-start/)
- [WAHA message events](https://waha.devlike.pro/docs/how-to/events/)
- [WAHA configuration](https://waha.devlike.pro/docs/how-to/config/)
- [WAHA security](https://waha.devlike.pro/docs/how-to/security/)
