"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Flame, BookOpen, Target, TrendingUp, Calendar, Award, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

const COLORS = ["#2c6e6a", "#b8860b", "#e07a5f"];

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

  const pieData = [
    { name: "Known", value: stats?.knownCards || 0 },
    { name: "Learning", value: stats?.learningCards || 0 },
    { name: "New", value: Math.max(0, (stats?.totalCards || 0) - (stats?.knownCards || 0) - (stats?.learningCards || 0)) },
  ].filter(d => d.value > 0);

  const weeklyChartData = stats?.weeklyActivity?.map((day: any) => ({
    day: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
    completed: day.completed,
    target: day.target,
  })) || [];

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
          value={`${stats?.streak || 0}`}
          subtext={`days • Best: ${stats?.longestStreak || 0}`}
          color="text-gold"
          bgColor="bg-gold/10"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Today's Goal"
          value={`${todayProgress.completed}/${todayProgress.target}`}
          subtext={`${Math.round(progressPercent)}% complete`}
          color="text-teal"
          bgColor="bg-teal/10"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="Due Today"
          value={stats?.dueToday || 0}
          subtext="cards to review"
          color="text-coral"
          bgColor="bg-coral/10"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Retention"
          value={`${stats?.retention || 0}%`}
          subtext="accuracy rate"
          color="text-sage"
          bgColor="bg-sage/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold" />
            Weekly Activity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--card)", 
                    border: "1px solid var(--border)",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="completed" name="Completed" fill="#2c6e6a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#b8860b" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card Distribution */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal" />
            Card Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--card)", 
                      border: "1px solid var(--border)",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No cards yet</p>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deck Stats */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gold" />
          Progress by Deck
        </h3>
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
                        {deck.known}/{deck.total} cards
                      </span>
                    </div>
                    <Progress value={deck.mastery} className="h-2" />
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gold">
                      {deck.mastery}%
                    </span>
                    <p className="text-xs text-muted-foreground">mastery</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <Clock className="w-8 h-8 mx-auto text-teal mb-3" />
          <p className="text-3xl font-bold text-teal">{stats?.totalCards || 0}</p>
          <p className="text-sm text-muted-foreground">Total Cards</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <Award className="w-8 h-8 mx-auto text-gold mb-3" />
          <p className="text-3xl font-bold text-gold">{stats?.knownCards || 0}</p>
          <p className="text-sm text-muted-foreground">Cards Mastered</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <TrendingUp className="w-8 h-8 mx-auto text-sage mb-3" />
          <p className="text-3xl font-bold text-sage">{stats?.retention || 0}%</p>
          <p className="text-sm text-muted-foreground">Retention Rate</p>
        </div>
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
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className={`${bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
    </div>
  );
}