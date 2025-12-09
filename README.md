# Live Avatar Demo - Enhanced Features

Updated build configuration.

This is an enhanced Next.js demo project for HeyGen Live Avatar with additional features including:

- Message history tracking
- Enhanced settings panel with Emotion and Language controls
- Export chat log functionality
- LiveAvatarAPI branding
- NavBar with header and author information
- Fullscreen support
- Session timer
- Voice/Text chat toggle

## Getting Started

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Configure your API keys in `app/api/secrets.ts`:
   - Set your `API_KEY`
   - Set your `AVATAR_ID`
   - Set your `CONTEXT_ID`
   - Optionally configure `ELEVENLABS_API_KEY` and `OPENAI_API_KEY` for custom mode

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Full Avatar Session**: Start a complete interactive avatar session
- **Message History**: View all conversation messages with timestamps
- **Settings Panel**: Configure avatar, language, emotion, and other settings
- **Export Chat Log**: Download conversation history as a .txt file
- **Session Management**: Control session start/stop and voice/text modes

## Deployment

This project can be deployed to Vercel. If using a monorepo structure, configure Vercel with:
- Root Directory: `apps/demo`
- Build Command: `npm run build` (from the demo directory)
- Output Directory: `.next`
