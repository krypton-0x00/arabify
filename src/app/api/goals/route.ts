import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getToday, isSameDay } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const today = getToday();

    // Get today's goal
    const todayGoal = await prisma.goal.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    // Get settings for default target
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    const defaultTarget = settings?.dailyGoal || 20;

    // If no goal for today, return default
    if (!todayGoal) {
      return NextResponse.json({
        date: today.toISOString(),
        target: defaultTarget,
        completed: 0,
        progress: 0,
      });
    }

    return NextResponse.json({
      date: todayGoal.date.toISOString(),
      target: todayGoal.target,
      completed: todayGoal.completed,
      progress: Math.round((todayGoal.completed / todayGoal.target) * 100),
    });
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { target } = body;

    if (!target || typeof target !== "number") {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    const today = getToday();

    const goal = await prisma.goal.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: { target },
      create: {
        userId,
        date: today,
        target,
        completed: 0,
      },
    });

    // Update settings
    await prisma.userSettings.upsert({
      where: { userId },
      update: { dailyGoal: target },
      create: {
        userId,
        dailyGoal: target,
        newCardsPerDay: 10,
        theme: "system",
        language: "en",
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}