import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { config } from "@/config";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gold font-serif">
            {config.name}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center pt-16">
        <div className="w-full max-w-md p-6">
          {children}
        </div>
      </main>

      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} {config.name}</p>
        </div>
      </footer>
    </div>
  );
}