import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getToday, subDays, isSameDay } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total stats
    const [totalCards, knownCards, streak, settings] = await Promise.all([
      prisma.card.count({ where: { userId } }),
      prisma.cardProgress.count({ where: { userId, isKnown: true } }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.userSettings.findUnique({ where: { userId } }),
    ]);

    // Get today's progress
    const today = getToday();
    const todayGoal = await prisma.goal.findUnique({
      where: {
        userId_date: { userId, date: today },
      },
    });

    // Get cards due today
    const now = new Date();
    const dueToday = await prisma.cardProgress.count({
      where: {
        userId,
        nextReview: { lte: now },
        isKnown: false,
      },
    });

    // Get weekly activity (last 7 days)
    const weekAgo = subDays(today, 7);
    const weekGoals = await prisma.goal.findMany({
      where: {
        userId,
        date: { gte: weekAgo },
      },
      orderBy: { date: "asc" },
    });

    const weeklyActivity: Array<{ date: string; completed: number; target: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const goal = weekGoals.find((g: { date: Date }) => isSameDay(new Date(g.date), day));
      weeklyActivity.push({
        date: day.toISOString().split("T")[0],
        completed: goal?.completed || 0,
        target: goal?.target || settings?.dailyGoal || 20,
      });
    }

    // Get mastery by deck
    const decks = await prisma.deck.findMany({
      where: { userId },
      include: {
        cards: {
          include: {
            progress: { where: { userId } },
          },
        },
      },
    });

    const deckStats = decks.map((deck: { id: string; name: string; cards: Array<{ progress: Array<{ isKnown: boolean }> }> }) => {
      const total = deck.cards.length;
      const known = deck.cards.filter((c) => c.progress[0]?.isKnown).length;
      const mastery = total > 0 ? Math.round((known / total) * 100) : 0;

      return {
        id: deck.id,
        name: deck.name,
        total,
        known,
        mastery,
      };
    });

    // Calculate retention rate
    const totalReviews = await prisma.cardProgress.aggregate({
      where: { userId, totalReviews: { gt: 0 } },
      _sum: { totalReviews: true, correctCount: true },
    });

    const retention = totalReviews._sum.totalReviews 
      ? Math.round((totalReviews._sum.correctCount! / totalReviews._sum.totalReviews!) * 100)
      : 0;

    return NextResponse.json({
      totalCards,
      knownCards,
      learningCards: totalCards - knownCards,
      dueToday,
      streak: streak?.current || 0,
      longestStreak: streak?.longest || 0,
      todayProgress: {
        completed: todayGoal?.completed || 0,
        target: todayGoal?.target || settings?.dailyGoal || 20,
      },
      weeklyActivity,
      deckStats,
      retention,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}