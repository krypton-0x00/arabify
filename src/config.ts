export const config = {
  name: "Arabify",
  description: "Master Arabic vocabulary with spaced repetition flashcards",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  keywords: ["arabic", "flashcards", "language learning", "spaced repetition"],
  
  features: {
    oauth: true,
    publicDecks: true,
    darkMode: true,
    audio: true,
    achievements: true,
  },
  
  limits: {
    maxDecks: 50,
    maxCardsPerDeck: 1000,
    newCardsPerDay: 20,
  },
  
  social: {
    twitter: "@arabify",
    github: "arabify/arabify",
  },
  
  theme: {
    colors: {
      gold: "#b8860b",
      goldLight: "#d4a843",
      sand: "#f5efe6",
      sandDark: "#e8ddd0",
      teal: "#2c6e6a",
      tealLight: "#3d8f8a",
      ink: "#1a1410",
      inkLight: "#4a3f35",
      cream: "#faf7f2",
    },
  },
} as const;

export type Config = typeof config;