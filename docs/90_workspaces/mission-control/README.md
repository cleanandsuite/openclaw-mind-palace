# OpenClaw Mission Control

A cyberpunk-styled React/Next.js dashboard for monitoring and controlling the AlgoTrader algorithmic trading system.

## Features

- **Live Signal Display** - Real-time @ES futures price with Bollinger Band analysis
- **Confidence Meter** - Visual confidence score (0-100%) with color-coded signals
- **Signal Badge** - Clear BUY/SELL/HOLD indicators with neon styling
- **Live Terminal** - Scrollable log stream with color-coded messages
- **Control Panel** - Auto-execution toggle and emergency kill switch
- **Dark Mode** - Cyberpunk aesthetic with neon green/red accents

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (optional animations)
- date-fns (time formatting)

## Installation

```bash
cd mission-control
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
mission-control/
├── app/
│   ├── globals.css      # Tailwind + custom cyberpunk styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard component
├── public/              # Static assets
├── package.json
├── tailwind.config.js   # Custom cyberpunk theme
├── tsconfig.json
└── README.md
```

## Customization

### Colors
Edit `tailwind.config.js` to modify cyberpunk colors:

```js
colors: {
  cyber: {
    accent: '#00ff88',   // Neon green
    danger: '#ff0044',   // Neon red
    warning: '#ffaa00',  // Neon yellow
    info: '#00aaff',     // Neon blue
    black: '#0a0a0f',    // Background
    dark: '#12121a',     // Card background
    gray: '#1a1a25',     // Border color
  }
}
```

### Signal Generation
Modify the `generateDummySignal()` function in `app/page.tsx` to connect to real data:
- Replace dummy data with WebSocket connection to Rithmic
- Update `price_data` with real market data
- Adjust `bollinger_bands` calculation as needed

## License

MIT
