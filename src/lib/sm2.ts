export interface SM2Input {
  quality: number; // 0-5 (0=blackout, 5=perfect)
  repetitions: number;
  easeFactor: number;
  interval: number;
}

export interface SM2Output {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReview: Date;
  isKnown: boolean;
}

export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, repetitions, easeFactor, interval } = input;
  
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality < 3) {
    // Failed - reset repetitions
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Passed - calculate new interval
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions += 1;
  }

  // Update ease factor using SM-2 formula
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  // Card is considered "known" after 3 successful reviews with good quality
  const isKnown = newRepetitions >= 3 && quality >= 3;

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReview: addDaysToNow(newInterval),
    isKnown,
  };
}

function addDaysToNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const QUALITY_LABELS = {
  0: { label: 'Again', color: 'bg-red-500', description: 'Complete blackout' },
  2: { label: 'Hard', color: 'bg-orange-500', description: 'Difficult to recall' },
  3: { label: 'Good', color: 'bg-green-500', description: 'Correct with some effort' },
  5: { label: 'Easy', color: 'bg-blue-500', description: 'Perfect recall' },
};

export function getQualityFromButton(button: 'again' | 'hard' | 'good' | 'easy'): number {
  switch (button) {
    case 'again': return 0;
    case 'hard': return 2;
    case 'good': return 3;
    case 'easy': return 5;
  }
}