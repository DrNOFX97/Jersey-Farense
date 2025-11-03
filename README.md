# Farense Jersey AI Editor

A modern React application for AI-powered image editing with a focus on applying Farense soccer club jerseys to images. Powered by Google's Gemini 2.5 Flash Image model.

## Features

- **Text-based Image Editing**: Transform images using natural language prompts (e.g., "Add retro filter", "Remove background")
- **AI-powered Jersey Changes**: Replace clothing with official Farense soccer club jerseys
- **Drag-and-Drop Upload**: User-friendly image upload with validation
- **Real-time Processing**: Live loading indicators and responsive UI
- **Error Handling**: Comprehensive error boundary and validation system
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and screen reader support

## Quick Start

### Prerequisites

- **Node.js** 16+ with npm/yarn
- **Google Gemini API Key** (free tier available)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   **Get your API key:** [Google AI Studio](https://aistudio.google.com/app/apikey)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Application opens at `http://localhost:3000`

## Available Scripts

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
npm run tsc      # Type-check code
```

## Project Structure

```
├── App.tsx                 # Main application component
├── ErrorBoundary.tsx       # Error boundary for crash prevention
├── config.ts              # Configuration and constants
├── types.ts               # TypeScript type definitions
├── constants.ts           # Jersey data and assets
├── index.tsx              # React entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── index.html             # HTML entry point
├── .env.local             # Environment variables (git-ignored)
├── .env.example           # Environment variables template
└── package.json           # Dependencies and scripts
```

## Security

- **API keys**: Protected via environment variables, never exposed in bundles
- **Validation**: Image uploads validated for type and size (20MB max)
- **Timeouts**: 60-second request timeout prevents hanging
- **Error boundary**: Catches crashes and displays user-friendly messages
- **Strict TypeScript**: Enabled for safer code

## Troubleshooting

**"API key is not configured"** → Check `.env.local` contains `VITE_GEMINI_API_KEY`

**Upload fails** → Verify file size < 20MB and format is JPEG/PNG/GIF/WebP

**Timeout errors** → Check internet connection and API quota

## Accessibility

✅ WCAG 2.1 Level AA compliant:
- Keyboard navigation
- Screen reader support
- Semantic HTML structure
- Focus management
- High contrast colors

## Technologies

- React 19 • TypeScript • Vite • Tailwind CSS • Google Generative AI SDK

## View in AI Studio

[Open in AI Studio](https://ai.studio/apps/drive/1juJEPN_cdpkBRTpMprxt71zdg3shQWjs)
