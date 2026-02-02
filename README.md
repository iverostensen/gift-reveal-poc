# Gift Reveal

An animated UI/UX experience for opening digital gift cards.

Recipients tap a link, watch a delightful unwrapping animation, and discover their gift. Themed for birthdays, weddings, holidays, and more.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## User Flow

1. **Receive link** – Gift recipient gets SMS/email with link to `/g/{CODE}`
2. **See gift box** – Animated gift box with sender's name
3. **Tap to reveal** – Triggers themed animation sequence (~1.2s)
4. **Gift revealed** – Amount, message, and redemption button

## Demo Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with iMessage preview mockup |
| `/g/TEST1234` | Birthday theme |
| `/g/TESTBRYL` | Wedding theme |
| `/g/TESTUSED` | Already redeemed state |
| `/g/TESTERR1` | Error: not found |
| `/g/TESTEXP1` | Error: expired |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Svelte + SvelteKit |
| Animation | Motion One |
| Styling | Modern CSS |
| Build | Vite |
| Language | TypeScript |

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed reasoning.

## Project Structure

```
src/
├── lib/
│   ├── components/      # Reusable UI components
│   ├── themes/          # Gift box themes (birthday, wedding, etc.)
│   ├── services/        # API integration
│   └── utils/           # Shared utilities
├── routes/              # SvelteKit file-based routing
└── app.css              # Global styles
```

## Available Themes

| Theme | Occasion | Colors |
|-------|----------|--------|
| 🎂 Birthday | Birthdays | Pink & gold |
| 💒 Wedding | Weddings | White & rose gold |
| 🎄 Christmas | Holidays | Red, green & gold |
| 🎈 Balloon | General | Pink gradient |
| 👔 Father's Day | Father's Day | Navy & brown |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Svelte type checking |
| `npm run lint` | Lint code |

## Environment Variables

```bash
# .env.local
VITE_API_URL=https://api.example.com
VITE_USE_MOCKS=true
```

## Documentation

| Doc | Description |
|-----|-------------|
| [OVERVIEW.md](./docs/OVERVIEW.md) | Product context and ecosystem |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Tech decisions and structure |
| [THEMING.md](./docs/THEMING.md) | How to create new themes |
| [API-INTEGRATION.md](./docs/API-INTEGRATION.md) | Backend data contract |
| [ANIMATIONS.md](./docs/ANIMATIONS.md) | Animation patterns |

## Browser Support

Chrome 120+, Safari 17.2+, Firefox 117+, Edge 120+

---

## License

Proprietary – All rights reserved.
