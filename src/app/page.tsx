"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame, BookOpen, Brain, BarChart3, ArrowRight, Moon, Sun, Sparkles, Loader2 } from "lucide-react";
import { config } from "@/config";
import { useState, useLayoutEffect } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useLayoutEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const currentTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(currentTheme as "light" | "dark");
    
    // Check session by calling an API
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(!!data?.user);
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setCheckingSession(false));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = () => {
    fetch('/api/auth/signout', { method: 'POST' })
      .then(() => {
        setIsLoggedIn(false);
        window.location.href = '/';
      });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-coral/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient-gold">{config.name}</h1>
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-secondary">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {checkingSession ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/decks">
                  <Button variant="ghost" className="hover:bg-secondary">Dashboard</Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-gold/30 text-gold hover:bg-gold/10"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-secondary">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-gold text-white btn-glow hover:opacity-90">Get Started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold px-4 py-2 rounded-full text-sm mb-6">
            <Flame className="w-4 h-4" />
            <span>Master Arabic vocabulary with spaced repetition</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Learn Arabic,<br />
            <span className="text-gradient-gold">One Card at a Time</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Import your vocabulary lists, study with scientifically-proven flashcards, 
            and track your progress. Like Anki, but built for Arabic learners.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Link href="/decks">
                <Button size="lg" className="bg-gradient-teal text-white btn-glow-teal gap-2 px-8">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="bg-gradient-gold text-white btn-glow gap-2 px-8">
                  Start Learning Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-12 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-teal" />
              <span>44+ Cards</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>Spaced Repetition</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-coral" />
              <span>Track Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4">Everything you need to learn</h3>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Powerful features designed to help you master Arabic vocabulary efficiently
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<BookOpen className="w-8 h-8" />}
              iconBg="bg-gold/10"
              iconColor="text-gold"
              title="Import Cards"
              description="Upload JSON files with your Arabic vocabulary. We'll create flashcards instantly."
            />
            <FeatureCard 
              icon={<Brain className="w-8 h-8" />}
              iconBg="bg-teal/10"
              iconColor="text-teal"
              title="Spaced Repetition"
              description="SM-2 algorithm ensures you review cards at the optimal time for retention."
            />
            <FeatureCard 
              icon={<Flame className="w-8 h-8" />}
              iconBg="bg-coral/10"
              iconColor="text-coral"
              title="Daily Goals"
              description="Set targets and track your streak. Stay motivated with daily learning goals."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8" />}
              iconBg="bg-sage/10"
              iconColor="text-sage"
              title="Progress Stats"
              description="View detailed analytics. Track mastery, retention, and learning velocity."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-gold/10 via-secondary to-teal/10 border border-gold/20">
            <h3 className="text-3xl font-bold mb-4">Ready to start your journey?</h3>
            <p className="text-muted-foreground mb-8">
              Join thousands of Arabic learners using {config.name} to build their vocabulary.
            </p>
            {!isLoggedIn && (
              <Link href="/register">
                <Button size="lg" className="bg-gradient-gold text-white btn-glow px-8">
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} {config.name}. Built with Next.js & Prisma.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, iconBg, iconColor, title, description }: { 
  icon: React.ReactNode; 
  iconBg: string;
  iconColor: string;
  title: string; 
  description: string 
}) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4 ${iconColor} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="font-semibold mb-2 text-foreground">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}