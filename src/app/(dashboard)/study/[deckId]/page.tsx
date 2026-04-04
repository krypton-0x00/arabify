"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FlashCard } from "@/components/card/flash-card";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Shuffle } from "lucide-react";

type StudyMode = "ar-en" | "en-ar" | "random";

interface StudyCard {
  id: string;
  front: string;
  back: string;
  image: string | null;
  progress?: Array<{ interval: number; isKnown: boolean }>;
}

interface StudyData {
  deck: { id: string; name: string; totalCards: number };
  cards: StudyCard[];
  stats: { dueCount: number; newCount: number; knownCount: number; total: number };
}

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deckId = params.deckId as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [studyMode, setStudyMode] = useState<StudyMode>("ar-en");
  const [randomDirections, setRandomDirections] = useState<Record<string, boolean>>({});

  const { data: studyData, isLoading } = useQuery({
    queryKey: ["study", deckId],
    queryFn: () => fetch(`/api/study/${deckId}`).then((r) => r.json()),
    enabled: !!deckId,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ cardId, quality }: { cardId: string; quality: string }) =>
      fetch(`/api/study/${deckId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, quality }),
      }).then((r) => r.json()),
  });

  const currentCard = studyData?.cards?.[currentIndex];
  const totalCards = studyData?.cards?.length || 0;
  const progress = totalCards > 0 ? ((currentIndex) / totalCards) * 100 : 0;

  useEffect(() => {
    if (studyMode === "random" && currentCard && randomDirections[currentCard.id] === undefined) {
      const newDir = Math.random() > 0.5;
      setRandomDirections(prev => ({ ...prev, [currentCard.id]: newDir }));
    }
  }, [currentCard?.id, studyMode]);

  const getCardContent = useCallback(() => {
    if (!currentCard) return { front: "", back: "", image: null, frontIsArabic: true, backIsArabic: false };
    
    let useEnFirst: boolean;
    
    if (studyMode === "random") {
      useEnFirst = randomDirections[currentCard.id] ?? false;
    } else {
      useEnFirst = studyMode === "en-ar";
    }
    
    return {
      front: useEnFirst ? currentCard.back : currentCard.front,
      back: useEnFirst ? currentCard.front : currentCard.back,
      image: currentCard.image,
      frontIsArabic: !useEnFirst,
      backIsArabic: useEnFirst,
    };
  }, [currentCard, studyMode, randomDirections]);

  const cardContent = getCardContent();

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRating = useCallback((quality: "again" | "hard" | "good" | "easy") => {
    if (!currentCard || reviewMutation.isPending) return;

    reviewMutation.mutate({ cardId: currentCard.id, quality });
    setCompleted((prev) => [...prev, currentCard.id]);
    setIsFlipped(false);

    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.push(`/decks/${deckId}`);
    }
  }, [currentCard, currentIndex, totalCards, deckId, reviewMutation, router]);

  const changeMode = (mode: StudyMode) => {
    setStudyMode(mode);
    setIsFlipped(false);
    setCurrentIndex(0);
    setCompleted([]);
    if (mode !== "random") {
      setRandomDirections({});
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "1") {
        e.preventDefault();
        handleRating("again");
      } else if (e.key === "2") {
        e.preventDefault();
        handleRating("hard");
      } else if (e.key === "3") {
        e.preventDefault();
        handleRating("good");
      } else if (e.key === "4") {
        e.preventDefault();
        handleRating("easy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleRating]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading study session...</div>;
  }

  if (!studyData?.cards?.length) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/decks/${deckId}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">{studyData?.deck?.name}</h1>
        </div>
        <div className="text-center py-20">
          <CheckCircle className="w-16 h-16 mx-auto text-teal mb-4" />
          <h2 className="text-2xl font-bold mb-2">All done for today!</h2>
          <p className="text-muted-foreground mb-6">No cards due for review. Come back tomorrow!</p>
          <Link href={`/decks/${deckId}`}><Button>Back to Deck</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Mode Selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button
            variant={studyMode === "ar-en" ? "teal" : "outline"}
            size="sm"
            onClick={() => changeMode("ar-en")}
          >
            Arabic → English
          </Button>
          <Button
            variant={studyMode === "en-ar" ? "coral" : "outline"}
            size="sm"
            onClick={() => changeMode("en-ar")}
          >
            English → Arabic
          </Button>
          <Button
            variant={studyMode === "random" ? "sage" : "outline"}
            size="sm"
            onClick={() => changeMode("random")}
            className="gap-2"
          >
            <Shuffle className="w-3 h-3" /> Random
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/decks/${deckId}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="text-center">
            <h1 className="font-semibold">{studyData?.deck?.name}</h1>
            <p className="text-sm text-muted-foreground">Card {currentIndex + 1} of {totalCards}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.refresh()}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="flex justify-between text-xs text-muted-foreground mb-6">
          <span>{studyData?.stats?.dueCount} due</span>
          <span>{studyData?.stats?.newCount} new</span>
          <span>{studyData?.stats?.knownCount} known</span>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-8">
          <FlashCard
            front={cardContent.front}
            back={cardContent.back}
            image={cardContent.image}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            frontIsArabic={cardContent.frontIsArabic}
            backIsArabic={cardContent.backIsArabic}
          />
        </div>

        {/* Rating Buttons */}
        {isFlipped ? (
          <div className="animate-slide-up">
            <p className="text-center text-sm text-muted-foreground mb-4">How well did you know this?</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                variant="destructive"
                className="flex-1 min-w-[100px] shadow-lg shadow-red-500/20"
                onClick={() => handleRating("again")}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? <RotateCcw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />} Again (1)
              </Button>
              <Button
                variant="coral"
                className="flex-1 min-w-[100px]"
                onClick={() => handleRating("hard")}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? <RotateCcw className="w-4 h-4 animate-spin" /> : null} Hard (2)
              </Button>
              <Button
                variant="teal"
                className="flex-1 min-w-[100px]"
                onClick={() => handleRating("good")}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? <RotateCcw className="w-4 h-4 animate-spin" /> : null} Good (3)
              </Button>
              <Button
                variant="sage"
                className="flex-1 min-w-[100px]"
                onClick={() => handleRating("easy")}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? <RotateCcw className="w-4 h-4 animate-spin" /> : null} Easy (4)
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Tap card or press Space to reveal answer</p>
          </div>
        )}
      </div>
    </div>
  );
}