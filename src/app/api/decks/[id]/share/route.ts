import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deck = await prisma.deck.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const shareCode = nanoid(10);

    const updatedDeck = await prisma.deck.update({
      where: { id },
      data: {
        isPublic: true,
        isShared: true,
        shareCode,
      },
    });

    return NextResponse.json({ shareCode, deck: updatedDeck });
  } catch (error) {
    console.error("Error sharing deck:", error);
    return NextResponse.json({ error: "Failed to share deck" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deck = await prisma.deck.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const updatedDeck = await prisma.deck.update({
      where: { id },
      data: {
        isPublic: false,
        isShared: false,
        shareCode: null,
      },
    });

    return NextResponse.json({ deck: updatedDeck });
  } catch (error) {
    console.error("Error unsharing deck:", error);
    return NextResponse.json({ error: "Failed to unshare deck" }, { status: 500 });
  }
}
