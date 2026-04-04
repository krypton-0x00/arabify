"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Upload, BookOpen, FileJson, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  _count: { cards: number };
  updatedAt: string;
}

export default function DecksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({ name: "", description: "" });
  const [importOpen, setImportOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [importJson, setImportJson] = useState("");
  const [fileName, setFileName] = useState("");
  const [importMode, setImportMode] = useState<"text" | "file">("file");

  const { data: decks, isLoading } = useQuery({
    queryKey: ["decks"],
    queryFn: () => fetch("/api/decks").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newDeck) =>
      fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setIsCreateOpen(false);
      setNewDeck({ name: "", description: "" });
    },
  });

  const importMutation = useMutation({
    mutationFn: ({ deckId, cards }: { deckId: string; cards: any[] }) =>
      fetch(`/api/decks/${deckId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setImportOpen(false);
      setImportJson("");
      setFileName("");
      setSelectedDeck(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/decks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setImportJson(JSON.stringify(json, null, 2));
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      const cards = JSON.parse(importJson);
      if (Array.isArray(cards) && selectedDeck) {
        importMutation.mutate({ deckId: selectedDeck, cards });
      }
    } catch {
      alert("Invalid JSON format");
    }
  };

  const downloadSampleJson = () => {
    const sample = [
      { front: "وَجْه", back: "Face", notes: "Pronounced 'wajh'" },
      { front: "رَأْس", back: "Head" },
      { front: "فَم", back: "Mouth" },
      { front: "يَد", back: "Hand" },
      { front: "عَيْن", back: "Eye" },
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-vocabulary.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Decks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your flashcard decks
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Deck
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading decks...
        </div>
      ) : decks?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gold" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No decks yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first deck to start learning Arabic vocabulary
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-gradient-gold text-white btn-glow">
            <Plus className="w-4 h-4 mr-2" />
            Create Deck
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Import Cards Button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="gap-2 border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="w-4 h-4" />
              Import Cards (Bulk)
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks?.map((deck: Deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                className="group relative rounded-2xl border border-border bg-card p-6 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-teal/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-gold transition-colors">{deck.name}</h3>
                {deck.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {deck.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 rounded-full bg-teal/10 text-teal font-medium">
                    {deck._count.cards} cards
                  </span>
                </div>
                
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDeck(deck.id);
                      setImportOpen(true);
                    }}
                    title="Import cards to this deck"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm("Delete this deck?")) {
                        deleteMutation.mutate(deck.id);
                      }
                    }}
                    title="Delete deck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Create Deck Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create New Deck</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(newDeck);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-sm font-medium">Name</Label>
              <Input
                value={newDeck.name}
                onChange={(e) =>
                  setNewDeck({ ...newDeck, name: e.target.value })
                }
                placeholder="e.g., Arabic Basics"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description (optional)</Label>
              <Input
                value={newDeck.description}
                onChange={(e) =>
                  setNewDeck({ ...newDeck, description: e.target.value })
                }
                placeholder="A brief description..."
                className="h-11"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-gold text-white">
                {createMutation.isPending ? "Creating..." : "Create Deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import JSON Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Cards</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Deck Selector */}
            <div className="space-y-2">
              <Label>Select Deck</Label>
              <select
                className="w-full h-10 px-3 py-2 text-sm border border-border rounded-lg bg-input"
                value={selectedDeck || ""}
                onChange={(e) => setSelectedDeck(e.target.value)}
              >
                <option value="">Choose a deck...</option>
                {decks?.map((deck: Deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name} ({deck._count.cards} cards)
                  </option>
                ))}
              </select>
            </div>

            {/* Import Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={importMode === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => setImportMode("file")}
                className="flex-1 gap-2"
              >
                <FileJson className="w-4 h-4" />
                Upload File
              </Button>
              <Button
                variant={importMode === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setImportMode("text")}
                className="flex-1 gap-2"
              >
                <FileText className="w-4 h-4" />
                Paste JSON
              </Button>
            </div>

            {importMode === "file" ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Upload a JSON file with your vocabulary. Format:
                </p>
                <pre className="text-xs bg-secondary p-3 rounded-lg overflow-x-auto">
{`[
  {"front": "وَجْه", "back": "Face"},
  {"front": "رَأْس", "back": "Head", "notes": "..."}
]`}
                </pre>
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {fileName || "Choose JSON File"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Paste your JSON vocabulary list:
                </p>
                <textarea
                  className="w-full h-40 p-3 text-sm border border-border rounded-lg bg-input"
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='[{"front": "وَجْه", "back": "Face"}]'
                />
              </div>
            )}

            {importJson && (
              <div className="text-xs text-muted-foreground">
                {(() => {
                  try {
                    const parsed = JSON.parse(importJson);
                    if (Array.isArray(parsed)) {
                      return `${parsed.length} cards ready to import`;
                    }
                  } catch {}
                  return null;
                })()}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={downloadSampleJson}>
                Download Sample
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setImportOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importJson || importMutation.isPending || !selectedDeck}
              >
                {importMutation.isPending ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}