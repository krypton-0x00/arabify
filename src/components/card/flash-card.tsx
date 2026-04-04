"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FlashCardProps {
  front: string;
  back: string;
  image?: string | null;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
  frontIsArabic?: boolean;
  backIsArabic?: boolean;
}

export function FlashCard({
  front,
  back,
  image,
  isFlipped,
  onFlip,
  className,
  frontIsArabic = true,
  backIsArabic = false,
}: FlashCardProps) {
  return (
    <div
      className={cn(
        "card-3d-container w-full max-w-md aspect-[4/3] cursor-pointer select-none",
        className
      )}
      onClick={onFlip}
    >
      <div
        className={cn(
          "card-3d relative w-full h-full",
          isFlipped && "flipped"
        )}
        style={{ perspective: "1200px" }}
      >
        {/* Front */}
        <div className="card-face card-front absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-card border border-border">
          {image && (
            <div className="absolute inset-0">
              <Image
                src={image}
                alt={front}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className={cn(
              "text-3xl md:text-4xl font-semibold text-center",
              frontIsArabic ? "arabic text-foreground" : "text-foreground"
            )}>
              {front}
            </p>
          </div>
          <div className="absolute top-4 right-4 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
            tap to flip
          </div>
        </div>

        {/* Back */}
        <div className="card-face card-back absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-ink border border-border flex items-center justify-center">
          {image && (
            <div className="absolute inset-0 opacity-20">
              <Image
                src={image}
                alt={back}
                fill
                className="object-cover grayscale"
                unoptimized
              />
            </div>
          )}
          <div className="relative z-10 text-center p-8">
            <p className={cn(
              "text-2xl md:text-3xl text-white font-medium mb-2",
              backIsArabic ? "arabic" : ""
            )}>
              {back}
            </p>
            <div className="w-10 h-px bg-gold mx-auto opacity-70" />
          </div>
        </div>
      </div>
    </div>
  );
}