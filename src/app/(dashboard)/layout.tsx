import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  Target, 
  Settings, 
  LogOut,
  Flame,
  Plus,
  Brain
} from "lucide-react";
import { config } from "@/config";
import { getToday } from "@/lib/utils";

async function getStreak(userId: string) {
  const streak = await prisma.streak.findUnique({
    where: { userId },
  });
  return streak?.current || 0;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const streak = await getStreak(session.user.id);

  const navItems = [
    { href: "/decks", icon: LayoutDashboard, label: "Decks" },
    { href: "/quiz", icon: Brain, label: "Quiz" },
    { href: "/stats", icon: BarChart3, label: "Statistics" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/" className="text-xl font-bold text-gold font-serif">
            {config.name}
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <Link href="/decks">
            <Button className="w-full gap-2" size="sm">
              <Plus className="w-4 h-4" />
              New Deck
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Streak Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-gold" />
            <span>{streak} day{streak !== 1 ? 's' : ''} streak</span>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-medium">
                {session.user.name?.[0] || session.user.email?.[0]}
              </div>
              <div className="text-sm">
                <p className="font-medium">{session.user.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
            <form action="/api/auth/signout" method="POST">
              <Button variant="ghost" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}