import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { config } from "@/config";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includePublic = searchParams.get("public") === "true";

    const decks = await prisma.deck.findMany({
      where: {
        userId: session.user.id,
        ...(includePublic ? {} : { isPublic: false }),
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return NextResponse.json({ error: "Failed to fetch decks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, coverImage, language, targetLang } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check deck limit
    const deckCount = await prisma.deck.count({
      where: { userId: session.user.id },
    });

    if (deckCount >= config.limits.maxDecks) {
      return NextResponse.json(
        { error: `Maximum deck limit (${config.limits.maxDecks}) reached` },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.create({
      data: {
        name,
        description,
        coverImage,
        language: language || "ar",
        targetLang: targetLang || "en",
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error("Error creating deck:", error);
    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 });
  }
}