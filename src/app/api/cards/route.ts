import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get("deckId");

    if (!deckId) {
      return NextResponse.json({ error: "deckId is required" }, { status: 400 });
    }

    const cards = await prisma.card.findMany({
      where: {
        deckId,
        userId: session.user.id,
      },
      include: {
        progress: {
          where: { userId: session.user.id },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { front, back, frontAudio, backAudio, image, notes, deckId } = body;

    if (!front || !back || !deckId) {
      return NextResponse.json(
        { error: "front, back and deckId are required" },
        { status: 400 }
      );
    }

    // Verify deck ownership
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId: session.user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Check card limit per deck
    const cardCount = await prisma.card.count({
      where: { deckId },
    });

    if (cardCount >= 1000) {
      return NextResponse.json(
        { error: "Maximum card limit (1000) reached for this deck" },
        { status: 400 }
      );
    }

    const card = await prisma.card.create({
      data: {
        front,
        back,
        frontAudio,
        backAudio,
        image,
        notes,
        deckId,
        userId: session.user.id,
      },
      include: {
        progress: {
          where: { userId: session.user.id },
        },
      },
    });

    // Create initial progress entry
    await prisma.cardProgress.create({
      data: {
        cardId: card.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 });
  }
}