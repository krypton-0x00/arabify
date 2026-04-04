"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Play, Copy, Check } from "lucide-react";

interface SharedCard {
  id: string;
  front: string;
  back: string;
  image: string | null;
  notes: string | null;
}

interface SharedDeck {
  id: string;
  name: string;
  description: string | null;
  cards: SharedCard[];
  user: { name: string | null };
}

export default function SharedDeckPage() {
  const params = useParams();
  const shareCode = params.shareCode as string;
  const [deck, setDeck] = useState<SharedDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${shareCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDeck(data.deck);
        }
      })
      .catch(() => setError("Failed to load deck"))
      .finally(() => setLoading(false));
  }, [shareCode]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading deck...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Deck Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!deck) return null;

  const currentCard = deck.cards[currentIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>
      </header>

      {/* Deck Info */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-teal/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
          {deck.description && (
            <p className="text-muted-foreground">{deck.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Created by {deck.user.name || "Anonymous"}
          </p>
        </div>

        {/* Study Mode */}
        {deck.cards.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Card {currentIndex + 1} of {deck.cards.length}</span>
              <span>{deck.cards.length} cards</span>
            </div>

            {/* Flashcard */}
            <div
              className="min-h-[300px] rounded-2xl border border-border bg-card p-8 flex items-center justify-center cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="text-center">
                <p className={`text-3xl font-semibold ${!isFlipped && /^[\u0600-\u06FF]/.test(currentCard.front) ? "arabic" : ""}`}>
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
                {currentCard.notes && isFlipped && (
                  <p className="text-sm text-muted-foreground mt-4 italic">
                    {currentCard.notes}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  {isFlipped ? "Tap to hide" : "Tap to reveal"}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="gold"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex((prev) => Math.min(deck.cards.length - 1, prev + 1));
                }}
                disabled={currentIndex === deck.cards.length - 1}
              >
                {currentIndex === deck.cards.length - 1 ? "Done" : "Next"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            This deck has no cards yet.
          </div>
        )}
      </div>
    </div>
  );
}
