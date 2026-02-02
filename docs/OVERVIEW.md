# Gift Reveal Frontend — Overview

## What Is It?

The Gift Reveal is a dedicated web experience that transforms how recipients receive digital gift cards. Instead of a plain text SMS with a redemption code, recipients get a link to an animated, branded "unboxing" experience — making receiving a gift card feel like opening an actual present.

**Domain:** `minegavekort.app/g/{redeemKey}`

---

## The Broader User Journey

The Gift Reveal sits at a pivotal moment in the gift card lifecycle — the emotional handoff between sender and recipient:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE USER JOURNEY                               │
└─────────────────────────────────────────────────────────────────────────────┘

   SENDER JOURNEY                                         RECIPIENT JOURNEY
   ══════════════                                         ════════════════

   ┌──────────────────┐
   │  1. DISCOVERY    │   "I want to give someone a gift card"
   │     (Webshop)    │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  2. PURCHASE     │   Selects vendor, amount, pays
   │     (Webshop)    │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  3. PERSONALIZE  │   Adds recipient name, personal message,
   │     (Webshop)    │   chooses animation style, schedules delivery
   └────────┬─────────┘
            │
            │  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
            │  │         BACKEND ORCHESTRATION          │
            │  │  (api-cardadmin stores data, creates   │
            │  │   card, schedules delivery)            │
            │  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
            │
            ▼
   ┌──────────────────┐
   │  4. DELIVERY     │   SMS/Email sent at scheduled time
   │   (Backend)      │   with personalized message & link
   └────────┬─────────┘
            │
            │═══════════════════════════════════════════════▶
            │
            │                                     ┌──────────────────┐
            │                                     │  5. RECEIVE      │
            │                                     │    (SMS/Email)   │  Gets message:
            │                                     │                  │  "Kari sendt deg
            │                                     │                  │   et gavekort!"
            │                                     └────────┬─────────┘
            │                                              │
            │                                              ▼
            │                                    ╔══════════════════════╗
            │                                    ║  6. THE REVEAL       ║
            │                                    ║  ══════════════      ║
            │                                    ║  (Gift Reveal App)   ║  ◀── THIS IS
            │                                    ║                      ║      WHAT WE'RE
            │                                    ║  Animated experience ║      BUILDING
            │                                    ║  Vendor branding     ║
            │                                    ║  Personal message    ║
            │                                    ║  "Open the gift"     ║
            │                                    ╚══════════╤═══════════╝
            │                                              │
            │                                              ▼
            │                                     ┌──────────────────┐
            │                                     │  7. CLAIM        │
            │                                     │  (Mine Gavekort  │  Downloads app,
            │                                     │   App)           │  redeems code
            │                                     └────────┬─────────┘
            │                                              │
            │                                              ▼
            │                                     ┌──────────────────┐
            │                                     │  8. USE          │
            │                                     │  (In-Store/      │  Pays with gift
            │                                     │   Online)        │  card at vendor
            │                                     └──────────────────┘
```

---

## Why Does This Exist?

### The Problem

Today, receiving a gift card via SMS feels transactional and impersonal:

> "Du har mottatt et gavekort. Kode: ABC123XYZ"

This doesn't capture the emotional moment of receiving a gift.

### The Solution

Gift Reveal creates a moment of delight — the digital equivalent of unwrapping a beautifully wrapped present. The sender's thoughtfulness (their message, the vendor they chose) is presented in a memorable way.

---

## Responsibilities of Gift Reveal

| Responsibility | Description |
|----------------|-------------|
| **Present the Gift** | Display the gift card in an engaging, animated reveal experience |
| **Deliver the Emotion** | Show the sender's personal message, their name, and make the recipient feel special |
| **Represent the Brand** | Show vendor logo, colors, and branding — this is also a marketing moment for the vendor |
| **Bridge to Action** | Guide the recipient to claim their gift in the Mine Gavekort app |
| **Handle Edge Cases** | Gracefully show "already claimed" or "not found" states |

### What Gift Reveal Does NOT Do

- It doesn't process payments
- It doesn't create gift cards
- It doesn't handle redemption logic
- It doesn't store data — it's a pure display layer

---

## The Three-System Architecture (Simplified)

```
  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
  │   WEBSHOP   │         │   BACKEND   │         │ GIFT REVEAL │
  │             │         │             │         │             │
  │  "Create    │ ──────▶ │  "Store &   │ ──────▶ │  "Display   │
  │   the gift" │         │   Deliver"  │         │   the gift" │
  │             │         │             │         │             │
  │  Sender's   │         │  Data,      │         │  Recipient's│
  │  experience │         │  Scheduling │         │  experience │
  └─────────────┘         └─────────────┘         └─────────────┘
```

| System | Role | Owner |
|--------|------|-------|
| **Webshop** | Where senders buy and personalize gift cards | Existing webshop |
| **Backend** (api-cardadmin) | Stores gift data, creates cards, schedules & sends delivery | Backend team |
| **Gift Reveal** | Where recipients experience receiving the gift | This repo |

---

## Key Insight: Separation of Experiences

The gift card system now serves two distinct moments:

### 1. PDF Gift Cards (existing)

- For email delivery or downloads
- A printable/saveable document
- Uses `PrintDesignDetails`

### 2. Digital Reveal Experience (new)

- For SMS delivery primarily
- An interactive, animated web page
- Uses new gift experience fields

These are not the same thing — they serve different use cases and should remain separate.

---

## Where Gift Reveal Fits in the Ecosystem

```
                    ┌─────────────────────────────────────┐
                    │       MINE GAVEKORT ECOSYSTEM       │
                    └─────────────────────────────────────┘

    ┌───────────────────────────────────────────────────────────────┐
    │                                                               │
    │   ACQUISITION                 DELIVERY               USAGE    │
    │   ──────────                 ────────               ─────     │
    │                                                               │
    │   ┌─────────┐              ┌─────────┐           ┌─────────┐ │
    │   │ Webshop │─────────────▶│  Gift   │──────────▶│  Mine   │ │
    │   │         │              │ Reveal  │           │Gavekort │ │
    │   └─────────┘              └─────────┘           │  App    │ │
    │                                                   └─────────┘ │
    │   Where gift               Where gift            Where gift   │
    │   is purchased             is received           is used      │
    │                                                               │
    └───────────────────────────────────────────────────────────────┘
```

Gift Reveal is the **bridge** — it takes the transactional (SMS with a code) and transforms it into the experiential (an animated gift reveal), then hands off to the functional (the app where you actually use the card).

---

## Summary

Gift Reveal is a recipient-facing web experience that:

- **Transforms** a plain redemption code into an emotional gift-opening moment
- **Serves as** the first impression the recipient has of their gift
- **Bridges the gap** between "you received something" and "here's how to use it"
- **Represents** both the sender's thoughtfulness and the vendor's brand

It's a small but critical piece of the user journey that elevates the entire gift card experience from functional to delightful.

---

## Related Documentation

- [README.md](../README.md) — Quick start and project setup
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Tech stack and code structure
- [THEMING.md](./THEMING.md) — How to create new themes
- [API-INTEGRATION.md](./API-INTEGRATION.md) — Backend data contract
