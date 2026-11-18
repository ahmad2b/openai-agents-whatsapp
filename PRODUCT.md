# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers connecting their OpenAI Agents SDK agent to an existing WhatsApp account and testing it locally.

## Product Purpose

Give your agent its WhatsApp. Powered by the OpenAI Agents SDK and WAHA. Users bring an existing account and number; this project does not provision either.

## Operating Context

The user starts the Hono backend and WAHA with Docker Compose, then runs a local Next.js development server. The public landing page explains the project; the guided local pairing and testing flow lives at /setup. The UI builds on shadcn preset b4r0BVlDHO.

## Capabilities and Constraints

Private text messages, official SDK agent execution, per-sender in-memory context, sender-bound replies. No separate database. Docker sessions volume preserves WAHA account state. Browser testing calls the configured agent without sending WhatsApp messages. Actual WhatsApp verification requires another sender account. Keys remain server-side. No Docker socket or paid calls during development verification.

## Evidence on Hand

TypeScript and synthetic local webhook/SDK checks passed before the frontend phase. Real pairing and a live model round trip have not been verified in this starter.

## Product Principles

- Keep the agent and transport independently understandable.
- Show actual connection and processing state.
- Keep setup local and credentials out of browser responses.
- Preserve the terminal walkthrough as an alternative.
