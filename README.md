# 成语接龙 (Chengyu Jielong)

A Capacitor-based mobile application for playing the Chinese idiom chain game.

## Features

- Play idiom chain game against the computer
- View idiom details (pinyin, derivation, explanation, examples)
- Get hints for possible next idioms
- Score tracking
- Game history display

## Project Structure

```
chengyujielong/
├── src/
│   ├── app.ts           # Main application logic
│   ├── idiomLib.ts      # Idiom library and game logic
│   ├── types.ts         # TypeScript type definitions
│   ├── main.ts          # Application entry point
│   └── styles.css       # Application styles
├── idiom.json           # Idiom data source
├── index.html           # HTML entry point
├── capacitor.config.ts  # Capacitor configuration
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies

```

## Game Rules

1. The game starts with a random idiom
2. Player must input an idiom that starts with the same pinyin as the last character of the current idiom
3. Each idiom can only be used once
4. Computer takes turns after player
5. Game ends when either player or computer cannot continue

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Sync with Capacitor:
```bash
npm run sync
```

5. Open in Android Studio:
```bash
npm run open:android
```

## Data Source

The idiom data is sourced from `idiom.json` which contains:
- word: The idiom text
- pinyin: Pronunciation
- derivation: Origin/source
- explanation: Meaning
- example: Usage example
- abbreviation: Short form

## Technology Stack

- TypeScript
- Vite
- Capacitor 6
- Vanilla JavaScript (no framework dependencies)

## License

MIT
