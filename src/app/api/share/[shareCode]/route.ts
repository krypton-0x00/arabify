import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  const { shareCode } = await params;

  try {
    const deck = await prisma.deck.findFirst({
      where: {
        shareCode,
        isPublic: true,
      },
      include: {
        cards: {
          select: {
            id: true,
            front: true,
            back: true,
            image: true,
            notes: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json({ deck });
  } catch (error) {
    console.error("Error fetching shared deck:", error);
    return NextResponse.json({ error: "Failed to fetch deck" }, { status: 500 });
  }
}
