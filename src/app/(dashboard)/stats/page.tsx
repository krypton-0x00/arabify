"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Flame, BookOpen, Target, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

interface StatsData {
  totalCards: number;
  knownCards: number;
  learningCards: number;
  dueToday: number;
  streak: number;
  longestStreak: number;
  todayProgress: {
    completed: number;
    target: number;
  };
  weeklyActivity: Array<{
    date: string;
    completed: number;
    target: number;
  }>;
  deckStats: Array<{
    id: string;
    name: string;
    total: number;
    known: number;
    mastery: number;
  }>;
  retention: number;
}

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading statistics...
      </div>
    );
  }

  const todayProgress = stats?.todayProgress || { completed: 0, target: 20 };
  const progressPercent = Math.min(
    (todayProgress.completed / todayProgress.target) * 100,
    100
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress
        </p>
      </div>

      {/* Today's Progress */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Current Streak"
          value={`${stats?.streak || 0} days`}
          subtext={`Best: ${stats?.longestStreak || 0} days`}
          color="text-gold"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Today's Progress"
          value={`${todayProgress.completed}/${todayProgress.target}`}
          subtext={`${Math.round(progressPercent)}% complete`}
          color="text-teal"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          label="Due Today"
          value={stats?.dueToday || 0}
          subtext="cards to review"
          color="text-orange-500"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Retention Rate"
          value={`${stats?.retention || 0}%`}
          subtext="accuracy"
          color="text-blue-500"
        />
      </div>

      {/* Weekly Activity */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold" />
            Weekly Activity
          </h3>
          <div className="space-y-3">
            {stats?.weeklyActivity?.map((day: any, i: number) => {
              const percent = Math.min((day.completed / day.target) * 100, 100);
              const dayName = new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
              });
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-12">
                    {dayName}
                  </span>
                  <div className="flex-1">
                    <Progress value={percent} className="h-2" />
                  </div>
                  <span className="text-sm w-16 text-right">
                    {day.completed}/{day.target}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold" />
            Learning Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Total Cards</span>
                <span className="font-medium">{stats?.totalCards || 0}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Known</span>
                <span className="font-medium text-teal">
                  {stats?.knownCards || 0}
                </span>
              </div>
              <Progress
                value={
                  stats?.totalCards
                    ? (stats.knownCards / stats.totalCards) * 100
                    : 0
                }
                className="h-2"
                indicatorClassName="bg-teal"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Learning</span>
                <span className="font-medium text-gold">
                  {stats?.learningCards || 0}
                </span>
              </div>
              <Progress
                value={
                  stats?.totalCards
                    ? (stats.learningCards / stats.totalCards) * 100
                    : 0
                }
                className="h-2"
                indicatorClassName="bg-gold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deck Stats */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Progress by Deck</h3>
        {stats?.deckStats?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No decks yet. Create one to start tracking progress!
          </p>
        ) : (
          <div className="space-y-4">
            {stats?.deckStats?.map((deck: any) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{deck.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {deck.known}/{deck.total}
                      </span>
                    </div>
                    <Progress value={deck.mastery} className="h-2" />
                  </div>
                  <span className="text-lg font-bold text-gold">
                    {deck.mastery}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
  );
}