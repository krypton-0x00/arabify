import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateSM2, getQualityFromButton } from "@/lib/sm2";
import { getToday } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await params;
    const userId = session.user.id;

    // Verify deck ownership
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
      include: {
        _count: { select: { cards: true } },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Get user settings for new cards limit
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    const newCardsLimit = settings?.newCardsPerDay || 10;

    const now = new Date();

    // Get cards with progress
    const cards = await prisma.card.findMany({
      where: { deckId, userId },
      include: {
        progress: {
          where: { userId },
        },
      },
    });

    // Categorize cards
    const dueCards: typeof cards = [];
    const newCards: typeof cards = [];
    const knownCards: typeof cards = [];

    for (const card of cards) {
      const progress = card.progress[0];
      
      if (!progress) {
        newCards.push(card);
      } else if (progress.isKnown) {
        knownCards.push(card);
      } else if (new Date(progress.nextReview) <= now) {
        dueCards.push(card);
      }
    }

    // Limit new cards
    const limitedNewCards = newCards.slice(0, newCardsLimit);

    // Combine due and new cards for study
    const studyCards = [...dueCards, ...limitedNewCards];

    // Shuffle the study cards
    for (let i = studyCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [studyCards[i], studyCards[j]] = [studyCards[j], studyCards[i]];
    }

    return NextResponse.json({
      deck: {
        id: deck.id,
        name: deck.name,
        totalCards: deck._count.cards,
      },
      cards: studyCards,
      stats: {
        dueCount: dueCards.length,
        newCount: newCards.length,
        knownCount: knownCards.length,
        total: cards.length,
      },
    });
  } catch (error) {
    console.error("Error fetching study cards:", error);
    return NextResponse.json({ error: "Failed to fetch study cards" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await params;
    const userId = session.user.id;

    const body = await request.json();
    const { cardId, quality } = body;

    if (!cardId || quality === undefined) {
      return NextResponse.json({ error: "cardId and quality are required" }, { status: 400 });
    }

    // Verify card ownership
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId },
      include: {
        progress: { where: { userId } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const progress = card.progress[0];
    const qualityValue = getQualityFromButton(quality);

    // Calculate new SM-2 values
    const result = calculateSM2({
      quality: qualityValue,
      repetitions: progress?.repetitions || 0,
      easeFactor: progress?.easeFactor || 2.5,
      interval: progress?.interval || 0,
    });

    // Update progress
    const updatedProgress = await prisma.cardProgress.upsert({
      where: {
        cardId_userId: {
          cardId,
          userId,
        },
      },
      update: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReview: result.nextReview,
        lastQuality: qualityValue,
        lastReview: new Date(),
        isKnown: result.isKnown,
        isLearning: qualityValue < 3 ? true : !result.isKnown,
        lapses: qualityValue < 3 ? { increment: 1 } : undefined,
        totalReviews: { increment: 1 },
        correctCount: qualityValue >= 3 ? { increment: 1 } : undefined,
      },
      create: {
        cardId,
        userId,
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReview: result.nextReview,
        lastQuality: qualityValue,
        lastReview: new Date(),
        isKnown: result.isKnown,
        isLearning: qualityValue >= 3 ? false : true,
        totalReviews: 1,
        correctCount: qualityValue >= 3 ? 1 : 0,
      },
    });

    // Update daily goal progress
    const today = getToday();
    await prisma.goal.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        completed: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        target: 20,
        completed: 1,
      },
    });

    // Update streak
    await updateStreak(userId);

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

async function updateStreak(userId: string) {
  const today = getToday();
  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    await prisma.streak.create({
      data: {
        userId,
        current: 1,
        longest: 1,
        lastDate: today,
      },
    });
    return;
  }

  const lastDate = new Date(streak.lastDate);
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return; // Already updated today
  } else if (daysDiff === 1) {
    const newCurrent = streak.current + 1;
    await prisma.streak.update({
      where: { userId },
      data: {
        current: newCurrent,
        longest: Math.max(newCurrent, streak.longest),
        lastDate: today,
      },
    });
  } else {
    await prisma.streak.update({
      where: { userId },
      data: {
        current: 1,
        lastDate: today,
      },
    });
  }
}