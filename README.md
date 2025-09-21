# Health Function Board

A barebones iOS-style three-page health app prototype.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Add your OpenAI API key to `.env.local`

4. Run the development server:
```bash
npm run dev
```

## Features

- **Left Screen**: Health data display (empty for now)
- **Center Screen**: AI chat with health data integration
- **Right Screen**: Generated action plans with 3 daily steps
- Swipe navigation between screens
- OpenAI integration for health reasoning
- Dummy comprehensive blood test data

## Usage

1. Start on the center chat screen
2. Ask health-related questions
3. AI will search health data and create action plans
4. Swipe left/right to navigate between screens
