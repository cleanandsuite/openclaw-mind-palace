import { KnowledgeFolder } from "../knowledge-tree";

export const missionControlWorkspace: KnowledgeFolder = {
  id: "mission-control",
  name: "mission-control",
  purpose: "Cyberpunk-styled React/Next.js dashboard for AlgoTrader monitoring",
  color: "workspace",
  files: [
    {
      id: "mc-readme",
      name: "README.md",
      content: `# OpenClaw Mission Control

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

## Project Structure

\`\`\`
mission-control/
├── app/
│   ├── globals.css      # Tailwind + custom cyberpunk styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard component
├── package.json
├── tailwind.config.js   # Custom cyberpunk theme
├── tsconfig.json
└── README.md
\`\`\`

## Customization

### Colors
\`\`\`js
colors: {
  cyber: {
    accent: '#00ff88',   // Neon green
    danger: '#ff0044',   // Neon red
    warning: '#ffaa00',  // Neon yellow
    black: '#0a0a0f',    // Background
  }
}
\`\`\``
    }
  ]
};
