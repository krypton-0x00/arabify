import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface ImportCard {
  front: string;
  back: string;
  notes?: string;
  image?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: deckId } = await params;
    
    const body = await request.json();
    const { cards } = body as { cards: ImportCard[] };

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "Invalid cards format" }, { status: 400 });
    }

    // Verify deck ownership
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Get existing fronts to avoid duplicates
    const existingCards = await prisma.card.findMany({
      where: { deckId },
      select: { front: true },
    });
    const existingFronts = new Set(existingCards.map((c: { front: string }) => c.front));

    // Filter out duplicates and create new cards
    const newCards = cards.filter((c) => !existingFronts.has(c.front));

    if (newCards.length === 0) {
      return NextResponse.json(
        { error: "All cards already exist in this deck" },
        { status: 400 }
      );
    }

    // Create cards with progress
    const createdCards = await prisma.card.createManyAndReturn({
      data: newCards.map((card) => ({
        front: card.front,
        back: card.back,
        notes: card.notes || null,
        image: card.image || null,
        deckId,
        userId,
      })),
    });

    // Create progress entries for all new cards
    const progressData = createdCards.map((card: { id: string }) => ({
      cardId: card.id,
      userId,
    }));

    await prisma.cardProgress.createMany({
      data: progressData,
    });

    return NextResponse.json({
      imported: createdCards.length,
      skipped: cards.length - createdCards.length,
      cards: createdCards,
    });
  } catch (error) {
    console.error("Error importing cards:", error);
    return NextResponse.json({ error: "Failed to import cards" }, { status: 500 });
  }
}