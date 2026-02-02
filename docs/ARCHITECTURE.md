# Architecture

> Gift Reveal – An animated UI/UX experience for opening digital gift cards.

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Svelte + SvelteKit | 5.x |
| Animation | Motion One | 10.x |
| Styling | Modern CSS | Native nesting + custom properties |
| Build | Vite | 5.x |
| Language | TypeScript | 5.x |

---

## Why These Choices?

### Svelte over React/Vue

| Reason | Impact |
|--------|--------|
| **Compiles away** | ~5kb runtime vs React's ~40kb |
| **Built-in transitions** | `transition:`, `animate:` directives are first-class |
| **Scoped CSS by default** | No CSS-in-JS library needed |
| **Reactive by design** | Theming with CSS variables "just works" |
| **File-based routing** | SvelteKit handles routing cleanly |

For an animation-focused product where first impressions matter, bundle size and performance are critical. Svelte compiles components to vanilla JS, eliminating framework overhead.

### Motion One over anime.js/GSAP

| Reason | Impact |
|--------|--------|
| **Tiny footprint** | 3kb vs anime.js 17kb |
| **Web Animations API** | Hardware-accelerated, browser-native |
| **Spring physics** | Natural, premium-feeling animations |
| **Async/await API** | Cleaner sequence orchestration |
| **Timeline composition** | Readable array syntax for complex reveals |

The reveal animation is our core product. Motion One provides professional-grade animation with springs and hardware acceleration at a fraction of the bundle cost.

```ts
// Example: Timeline-based reveal sequence
timeline([
  ['.bow', { y: -400, rotate: 90 }, { duration: 0.8 }],
  ['.ribbon', { x: 250, opacity: 0 }, { duration: 0.7, at: '<' }],
  ['.lid', { y: -350, rotateX: -160 }, { duration: 0.6 }],
  ['.sparkles', { scale: [0, 2, 0] }, { delay: stagger(0.05) }]
])
```

### Modern CSS over SCSS/Tailwind

| Reason | Impact |
|--------|--------|
| **Native nesting** | Supported in all modern browsers (2023+) |
| **CSS custom properties** | Runtime theming without JS |
| **No build step** | One fewer dependency |
| **Scoped by Svelte** | Component styles are isolated automatically |

We use CSS custom properties for theming, which works at runtime. SCSS's only benefit was nesting, which CSS now supports natively. Tailwind doesn't suit our animation-heavy, vanilla-DOM approach.

---

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── GiftBox/           # Base gift box component
│   │   ├── Reveal/            # Reveal screen after animation
│   │   └── effects/           # Reusable effects (confetti, sparkles, etc.)
│   │
│   ├── themes/
│   │   ├── birthday/          # Birthday theme
│   │   ├── wedding/           # Wedding theme
│   │   ├── christmas/         # Christmas theme
│   │   └── [theme]/           # Each theme is self-contained
│   │       ├── Theme.svelte   # Main theme component
│   │       ├── animations.ts  # Motion One sequences
│   │       └── styles.css     # Theme-specific styles
│   │
│   ├── services/
│   │   └── gift.service.ts    # API integration
│   │
│   └── utils/
│       └── animations.ts      # Shared animation utilities
│
├── routes/
│   ├── +layout.svelte         # App shell
│   ├── +page.svelte           # Homepage / demo
│   └── g/[code]/
│       └── +page.svelte       # Gift reveal route
│
└── app.css                    # Global styles, CSS custom properties
```

---

## Component Hierarchy

```
App
└── GiftRevealPage
    ├── ThemeWrapper              # Loads correct theme based on gift data
    │   └── [Theme]               # Birthday, Wedding, Christmas, etc.
    │       ├── GiftBox           # The animated box
    │       │   ├── Lid
    │       │   ├── Ribbon
    │       │   ├── Bow
    │       │   └── [Effects]     # Sparkles, snowflakes, etc.
    │       │
    │       └── RevealContent     # Shown after animation completes
    │           ├── VendorLogo
    │           ├── Amount
    │           └── Message
    │
    └── LoadingState / ErrorState
```

---

## Theming Architecture

Themes are self-contained and composable:

```svelte
<!-- themes/birthday/Theme.svelte -->
<script>
  import GiftBox from '$lib/components/GiftBox/GiftBox.svelte'
  import Sparkles from '$lib/components/effects/Sparkles.svelte'
  import { revealSequence } from './animations'

  export let gift
  export let onReveal

  const colors = {
    box: '#FFB6C1',
    lid: '#FF69B4',
    ribbon: '#FF1493',
    accent: '#FFD700'
  }
</script>

<GiftBox {colors} {revealSequence} {onReveal}>
  <Sparkles slot="effects" count={6} color={colors.accent} />
</GiftBox>

<style>
  /* Theme-specific overrides, scoped automatically */
</style>
```

New themes require:
1. Create folder in `src/lib/themes/[name]/`
2. Define `Theme.svelte` with colors and structure
3. Define `animations.ts` with Motion One sequences
4. Register in theme factory

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   URL       │────▶│   API       │────▶│   Theme     │
│  /g/ABC123  │     │  Gift data  │     │  Component  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Gift Model │
                    │  - code     │
                    │  - theme    │
                    │  - vendor   │
                    │  - amount   │
                    │  - message  │
                    │  - sender   │
                    └─────────────┘
```

---

## Animation Principles

1. **Sequences, not chaos** – Animations follow a timeline: bow → ribbon → lid → reveal
2. **Spring physics for delight** – Use springs for natural, bouncy movement
3. **Hardware acceleration** – Motion One uses WAAPI, keeping animations on the GPU
4. **60fps or nothing** – Test on low-end mobile devices
5. **Respect reduced motion** – Honor `prefers-reduced-motion` media query

---

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 120+ |
| Safari | 17.2+ |
| Firefox | 117+ |
| Edge | 120+ |

We target modern browsers only. This enables native CSS nesting and optimal Motion One performance.

---

## Future Opportunities

| Opportunity | Description |
|-------------|-------------|
| **Embeddable widget** | Package as web component for merchant integration |
| **Theme builder** | Visual editor for custom themes |
| **Lottie support** | Designer-created animations |
| **Sound effects** | Audio synced to animation timeline |
| **Haptic feedback** | Mobile vibration on reveal |

---

## Related Documentation

- [OVERVIEW.md](./OVERVIEW.md) – Product context and ecosystem
- [THEMING.md](./THEMING.md) – How to create new themes
- [API-INTEGRATION.md](./API-INTEGRATION.md) – Backend data contract
- [ANIMATIONS.md](./ANIMATIONS.md) – Animation patterns and conventions
