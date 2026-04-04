export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

export interface Deck {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  language: string;
  targetLang: string;
  userId: string;
  isPublic: boolean;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    cards: number;
  };
}

export interface Card {
  id: string;
  front: string;
  back: string;
  frontAudio: string | null;
  backAudio: string | null;
  image: string | null;
  notes: string | null;
  deckId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardWithProgress extends Card {
  progress?: CardProgress;
}

export interface CardProgress {
  id: string;
  cardId: string;
  userId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  lastQuality: number;
  lastReview: Date | null;
  isKnown: boolean;
  isLearning: boolean;
  lapses: number;
  totalReviews: number;
  correctCount: number;
}

export interface Goal {
  id: string;
  userId: string;
  date: Date;
  target: number;
  completed: number;
}

export interface Streak {
  id: string;
  userId: string;
  current: number;
  longest: number;
  lastDate: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  dailyGoal: number;
  newCardsPerDay: number;
  theme: string;
  language: string;
}

export interface StudySession {
  deck: Deck;
  cards: CardWithProgress[];
  dueCards: CardWithProgress[];
  newCards: CardWithProgress[];
  total: number;
  remaining: number;
}

export interface ImportCardInput {
  front: string;
  back: string;
  notes?: string;
  image?: string;
}

export interface DeckStats {
  totalCards: number;
  knownCards: number;
  learningCards: number;
  dueToday: number;
  masteryPercentage: number;
}