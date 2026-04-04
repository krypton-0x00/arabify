"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, Calendar, CheckCircle, Award, Zap } from "lucide-react";

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [newTarget, setNewTarget] = useState(20);

  const { data: goal, isLoading } = useQuery({
    queryKey: ["goal"],
    queryFn: () => fetch("/api/goals").then((r) => r.json()),
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then((r) => r.json()),
  });

  const updateGoalMutation = useMutation({
    mutationFn: (target: number) =>
      fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal"] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading goals...
      </div>
    );
  }

  const completed = goal?.completed || 0;
  const target = goal?.target || 20;
  const progress = Math.min((completed / target) * 100, 100);

  // Generate last 7 days
  const days: Array<{ date: string; day: string }> = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }

  const weeklyData = stats?.weeklyActivity || days.map((d) => ({
    date: d.date,
    completed: 0,
    target,
  }));

  // Achievement logic
  const achievements = [
    {
      id: "first_card",
      name: "First Steps",
      description: "Complete your first card",
      icon: "🎯",
      earned: (stats?.totalCards || 0) > 0,
    },
    {
      id: "streak_3",
      name: "Consistent Learner",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      earned: (stats?.streak || 0) >= 3,
    },
    {
      id: "streak_7",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "⚔️",
      earned: (stats?.streak || 0) >= 7,
    },
    {
      id: "cards_50",
      name: "Vocabulary Builder",
      description: "Learn 50 cards",
      icon: "📚",
      earned: (stats?.knownCards || 0) >= 50,
    },
    {
      id: "cards_100",
      name: "Word Master",
      description: "Learn 100 cards",
      icon: "👑",
      earned: (stats?.knownCards || 0) >= 100,
    },
    {
      id: "perfect_day",
      name: "Perfect Day",
      description: "Complete 100% of daily goal",
      icon: "⭐",
      earned: progress >= 100,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Goals & Achievements</h1>
        <p className="text-muted-foreground mt-1">
          Set daily targets and earn achievements
        </p>
      </div>

      {/* Today's Goal */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gold/10">
              <Target className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold">Today's Goal</h3>
              <p className="text-sm text-muted-foreground">
                {completed} of {target} cards
              </p>
            </div>
          </div>
          
          <Progress value={progress} className="h-3 mb-4" />
          
          {progress >= 100 ? (
            <div className="flex items-center gap-2 text-teal">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Goal completed!</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {target - completed} more cards to reach your goal
            </p>
          )}
        </div>

        {/* Set Goal */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-teal/10">
              <Zap className="w-6 h-6 text-teal" />
            </div>
            <div>
              <h3 className="font-semibold">Set Daily Target</h3>
              <p className="text-sm text-muted-foreground">
                How many cards per day?
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(Number(e.target.value))}
              min={1}
              max={100}
              className="w-24"
            />
            <Button
              onClick={() => updateGoalMutation.mutate(newTarget)}
              disabled={updateGoalMutation.isPending}
            >
              {updateGoalMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="p-6 rounded-xl border border-border bg-card mb-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          Weekly Overview
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day: any, i: number) => {
            const percent = Math.min((day.completed / day.target) * 100, 100);
            const isToday = i === 6;
            return (
              <div
                key={i}
                className={`text-center p-3 rounded-lg ${
                  isToday ? "bg-gold/10 border border-gold" : "bg-secondary"
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {days[i].day}
                </p>
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                    percent >= 100
                      ? "bg-teal text-white"
                      : percent > 0
                      ? "bg-gold/20 text-gold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {day.completed}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      <div className="p-6 rounded-xl border border-border bg-card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Current Streak</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.streak || 0} consecutive days
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-500">
              {stats?.streak || 0}
            </p>
            <p className="text-sm text-muted-foreground">days</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-gold" />
          Achievements
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all ${
                achievement.earned
                  ? "border-gold/30 bg-gold/5"
                  : "border-border bg-secondary opacity-60"
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-medium">{achievement.name}</h4>
              <p className="text-xs text-muted-foreground">
                {achievement.description}
              </p>
              {achievement.earned && (
                <div className="flex items-center gap-1 mt-2 text-xs text-teal">
                  <CheckCircle className="w-3 h-3" />
                  Earned!
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}