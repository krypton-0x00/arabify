# Arabify - Arabic Vocabulary Flashcard App

A full-stack Next.js application for learning Arabic vocabulary using spaced repetition (SM-2 algorithm). Like Anki, but built specifically for Arabic learners.

## Features

- 📚 **Deck Management** - Create, edit, and organize flashcard decks
- 📥 **JSON Import** - Import vocabulary lists from JSON files
- 🧠 **Spaced Repetition** - SM-2 algorithm for optimal learning
- 🎯 **Daily Goals** - Set and track daily learning targets
- 🔥 **Streaks** - Maintain learning streaks
- 🏆 **Achievements** - Unlock achievements as you progress
- 📊 **Statistics** - Track progress, retention, and mastery
- 🌙 **Dark Mode** - System preference + manual toggle
- 🔐 **Authentication** - Email/password + OAuth support

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5
- **UI:** Tailwind CSS + Radix UI components
- **State:** TanStack Query + Zustand

## Getting Started

### 1. Clone and install dependencies

```bash
cd arabify
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your database URL and NextAuth secrets:

```
DATABASE_URL="postgresql://user:password@localhost:5432/arabify"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## JSON Import Format

To import vocabulary, create a JSON file with this structure:

```json
[
  {"front": "وَجْه", "back": "Face", "notes": "Pronounced 'wajh'"},
  {"front": "رَأْس", "back": "Head"},
  {"front": "فَم", "back": "Mouth"}
]
```

## Deployment on Vercel

1. Push your code to GitHub
2. Import project on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
arabify/
├── prisma/           # Database schema
├── src/
│   ├── app/          # Next.js App Router pages
│   │   ├── api/      # API routes
│   │   ├── (auth)/   # Login/Register pages
│   │   └── (dashboard)/ # Protected dashboard
│   ├── components/   # React components
│   ├── lib/          # Utilities (Prisma, Auth, SM-2)
│   ├── stores/       # Zustand stores
│   └── types/        # TypeScript types
├── config.ts         # Site configuration
└── package.json
```

## License

MIT