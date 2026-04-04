"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Card {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  name: string;
  cards: Card[];
  _count?: { cards: number };
}

interface QuizQuestion {
  id: string;
  question: string;
  questionIsArabic: boolean;
  correctAnswer: string;
  options: string[];
}

export default function QuizPage() {
  const queryClient = useQueryClient();
  const [selectedDeck, setSelectedDeck] = useState<string>("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizMode, setQuizMode] = useState<"ar-en" | "en-ar" | "mixed">("mixed");
  const [questionCount, setQuestionCount] = useState(10);

  const { data: decks, isLoading } = useQuery({
    queryKey: ["decks"],
    queryFn: () => fetch("/api/decks").then((r) => r.json()),
  });

  const { data: allCards } = useQuery({
    queryKey: ["all-cards", selectedDeck],
    queryFn: () => 
      selectedDeck 
        ? fetch(`/api/decks/${selectedDeck}`).then((r) => r.json())
        : Promise.resolve({ cards: [] }),
    enabled: !!selectedDeck,
  });

  const generateQuestions = () => {
    const cards = allCards?.cards || [];
    if (cards.length < 4) {
      alert("Deck needs at least 4 cards for a quiz");
      return;
    }

    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, cards.length));
    
    const quizQuestions: QuizQuestion[] = selected.map((card: Card) => {
      // Randomly decide direction: AR→EN or EN→AR
      let questionIsArabic = true;
      if (quizMode === "en-ar") questionIsArabic = false;
      else if (quizMode === "mixed") questionIsArabic = Math.random() > 0.5;

      const question = questionIsArabic ? card.front : card.back;
      const correctAnswer = questionIsArabic ? card.back : card.front;

      // Get 3 wrong answers
      const otherCards = cards.filter((c: Card) => c.id !== card.id);
      const wrongAnswers = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c: Card) => questionIsArabic ? c.back : c.front);

      // Shuffle all options
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        id: card.id,
        question,
        questionIsArabic,
        correctAnswer,
        options,
      };
    });

    setQuestions(quizQuestions);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizStarted(true);
  };

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === questions[currentIndex].correctAnswer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz finished
      setQuizStarted(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Quiz in progress
  if (quizStarted && currentQuestion) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/quiz">
              <Button variant="ghost" size="icon" onClick={() => setQuizStarted(false)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="font-semibold">Quiz</h1>
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="text-lg font-bold text-teal">
              {score.correct}/{score.total}
            </div>
          </div>

          <Progress value={progress} className="mb-8" />

          {/* Question */}
          <div className="p-8 rounded-2xl border border-border bg-card text-center mb-6">
            <p className="text-sm text-muted-foreground mb-4">
              {currentQuestion.questionIsArabic ? "What does this mean?" : "What is this?"}
            </p>
            <p className={cn(
              "text-3xl md:text-4xl font-semibold",
              currentQuestion.questionIsArabic && "arabic"
            )}>
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              
              let buttonClass = "border-gold/30 hover:border-gold hover:bg-gold/10";
              if (showResult) {
                if (isCorrect) buttonClass = "border-teal bg-teal/20 text-teal";
                else if (isSelected) buttonClass = "border-red-500 bg-red-500/20 text-red-500";
              }

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={cn(
                    "p-4 h-auto text-lg font-normal justify-start",
                    buttonClass
                  )}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                >
                  {isSelected && showResult && (
                    isCorrect 
                      ? <CheckCircle className="w-5 h-5 mr-2 text-teal" />
                      : <XCircle className="w-5 h-5 mr-2 text-red-500" />
                  )}
                  <span className={cn(
                    !isSelected && !showResult && "text-lg",
                    isCorrect && !isSelected && "text-teal"
                  )}>
                    {option}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Result + Next */}
          {showResult && (
            <div className="text-center animate-slide-up">
              <p className={cn(
                "text-lg font-semibold mb-4",
                selectedAnswer === currentQuestion.correctAnswer 
                  ? "text-teal" 
                  : "text-red-500"
              )}>
                {selectedAnswer === currentQuestion.correctAnswer 
                  ? "Correct!" 
                  : `Incorrect - The answer is: ${currentQuestion.correctAnswer}`}
              </p>
              <Button variant="teal" onClick={nextQuestion} className="gap-2">
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quiz finished - show results
  if (score.total > 0 && !quizStarted) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="p-8 rounded-2xl border border-border bg-card mb-6">
            <div className={cn(
              "text-6xl font-bold mb-4",
              percentage >= 80 ? "text-teal" : 
              percentage >= 50 ? "text-gold" : "text-red-500"
            )}>
              {percentage}%
            </div>
            <p className="text-lg text-muted-foreground">
              You got {score.correct} out of {score.total} correct
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="coral" onClick={generateQuestions} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Link href="/quiz">
              <Button variant="outline">
                Change Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Quiz</h1>
          <p className="text-muted-foreground mt-1">
            Test your vocabulary knowledge
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          {/* Deck Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Deck</label>
            <select
              className="w-full h-10 px-3 py-2 text-sm border border-border rounded-lg bg-input"
              value={selectedDeck}
              onChange={(e) => setSelectedDeck(e.target.value)}
            >
              <option value="">All your cards</option>
              {decks?.map((deck: Deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name} ({deck._count?.cards || 0} cards)
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">Quiz Direction</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={quizMode === "mixed" ? "teal" : "outline"}
                size="sm"
                onClick={() => setQuizMode("mixed")}
              >
                Mixed
              </Button>
              <Button
                variant={quizMode === "ar-en" ? "coral" : "outline"}
                size="sm"
                onClick={() => setQuizMode("ar-en")}
              >
                Arabic → English
              </Button>
              <Button
                variant={quizMode === "en-ar" ? "sage" : "outline"}
                size="sm"
                onClick={() => setQuizMode("en-ar")}
              >
                English → Arabic
              </Button>
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <Button 
            variant="gold"
            onClick={generateQuestions}
            disabled={!selectedDeck && (!decks?.length || decks.reduce((acc: number, d: Deck) => acc + (d._count?.cards || 0), 0) < 4)}
            className="w-full gap-2"
          >
            <Brain className="w-4 h-4" />
            Start Quiz
          </Button>

          {selectedDeck && allCards?.cards?.length < 4 && (
            <p className="text-sm text-red-500 text-center">
              Selected deck needs at least 4 cards
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-2xl font-bold text-gold">
              {decks?.reduce((acc: number, d: Deck) => acc + (d._count?.cards || 0), 0) || 0}
            </p>
            <p className="text-sm text-muted-foreground">Total Cards</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-2xl font-bold text-teal">{decks?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Decks</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="text-2xl font-bold">
              {decks?.reduce((acc: number, d: Deck) => acc + (d._count?.cards || 0), 0) >= 4 ? "✓" : "✗"}
            </p>
            <p className="text-sm text-muted-foreground">Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}