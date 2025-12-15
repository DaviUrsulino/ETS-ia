// src/components/FlashcardItem.tsx
import React from "react";

interface FlashcardProps {
  index: number;
  front: string;
  back: string;
}

export function FlashcardItem({ index, front, back }: FlashcardProps) {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-colors shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className="text-emerald-400 text-xs font-bold uppercase mb-2">
        Pergunta {index + 1}
      </p>
      <h3 className="font-medium text-zinc-100 mb-3 text-lg">
        {front}
      </h3>
      <div className="h-px bg-zinc-800 w-full mb-3" />
      <p className="text-zinc-400 text-sm">
        {back}
      </p>
    </div>
  );
}