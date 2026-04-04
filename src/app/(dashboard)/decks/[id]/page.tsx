"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Play, Trash2, BookOpen } from "lucide-react";

interface Card {
  id: string;
  front: string;
  back: string;
  notes: string | null;
  image: string | null;
  progress?: Array<{
    isKnown: boolean;
    interval: number;
  }>;
}

interface DeckDetail {
  id: string;
  name: string;
  description: string | null;
  cards: Card[];
}

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deckId = params.id as string;
  
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", notes: "" });

  const { data: deck, isLoading } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => fetch(`/api/decks/${deckId}`).then((r) => r.json()),
  });

  const createCardMutation = useMutation({
    mutationFn: (data: typeof newCard) =>
      fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, deckId }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      setIsAddCardOpen(false);
      setNewCard({ front: "", back: "", notes: "" });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) =>
      fetch(`/api/cards/${cardId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading deck...
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Deck not found</p>
        <Link href="/decks">
          <Button variant="outline">Back to Decks</Button>
        </Link>
      </div>
    );
  }

  const knownCount = deck.cards.filter((c: Card) => c.progress?.[0]?.isKnown).length;
  const progress = deck.cards.length > 0 ? (knownCount / deck.cards.length) * 100 : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/decks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{deck.name}</h1>
          {deck.description && (
            <p className="text-muted-foreground mt-1">{deck.description}</p>
          )}
        </div>
        <Link href={`/study/${deckId}`}>
          <Button variant="teal" className="gap-2" disabled={deck.cards.length === 0}>
            <Play className="w-4 h-4" />
            Study
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-2xl font-bold">{deck.cards.length}</p>
          <p className="text-sm text-muted-foreground">Total Cards</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-2xl font-bold text-teal">{knownCount}</p>
          <p className="text-sm text-muted-foreground">Known</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-2xl font-bold text-gold">{deck.cards.length - knownCount}</p>
          <p className="text-sm text-muted-foreground">To Learn</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>Mastery</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Add Card Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Cards</h2>
        <Button variant="gold" onClick={() => setIsAddCardOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Card
        </Button>
      </div>

      {/* Cards List */}
      {deck.cards.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No cards yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first flashcard to start learning
          </p>
          <Button onClick={() => setIsAddCardOpen(true)}>
            Add Card
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deck.cards.map((card: Card) => (
            <div
              key={card.id}
              className="relative p-4 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl arabic text-ink">{card.front}</span>
                {card.progress?.[0]?.isKnown && (
                  <span className="text-xs bg-teal/10 text-teal px-2 py-1 rounded-full">
                    Known
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{card.back}</p>
              {card.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {card.notes}
                </p>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-red-500 opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => deleteCardMutation.mutate(card.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createCardMutation.mutate(newCard);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Arabic Word</Label>
              <Input
                value={newCard.front}
                onChange={(e) =>
                  setNewCard({ ...newCard, front: e.target.value })
                }
                placeholder="وَجْه"
                dir="rtl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>English Translation</Label>
              <Input
                value={newCard.back}
                onChange={(e) =>
                  setNewCard({ ...newCard, back: e.target.value })
                }
                placeholder="Face"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={newCard.notes}
                onChange={(e) =>
                  setNewCard({ ...newCard, notes: e.target.value })
                }
                placeholder="Additional notes..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCardOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={createCardMutation.isPending}>
                {createCardMutation.isPending ? "Adding..." : "Add Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}