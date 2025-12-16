"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Lightbulb } from "lucide-react";

interface FlashcardProps {
  index: number;
  front: string;
  back: string;
}

export function FlashcardItem({ index, front, back }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="w-full h-[320px] cursor-pointer"
      onClick={handleFlip}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.6,
          type: "tween",
          ease: "easeInOut"
        }}
        style={{ 
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%"
        }}
      >
        {/* FRENTE - PERGUNTA */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-lg overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg)"
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Questão {index + 1}
            </span>
            <div className="flex items-center gap-2">
              <div className="text-xs text-[var(--gray-text)]">
                Clique para ver resposta
              </div>
              <RefreshCw className="w-4 h-4 text-[var(--gray-text)]" />
            </div>
          </div>
          
          <div className="h-[calc(100%-80px)] flex items-center justify-center overflow-y-auto p-4">
            <div className="text-center w-full">
              <h3 className="text-xl md:text-2xl font-medium text-[var(--text)] leading-relaxed">
                {front}
              </h3>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-[var(--gray-text)] bg-[var(--card-alt)] px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
              Pergunta
            </div>
          </div>
        </div>
        
        {/* VERSO - RESPOSTA */}
        <div 
          className="absolute top-0 left-0 w-full h-full bg-[var(--card-alt)] border-2 border-[var(--primary)] rounded-2xl p-6 shadow-lg overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="bg-green-500/10 text-green-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2">
              <Lightbulb size={12} className="fill-green-500" />
              Resposta
            </span>
            <div className="flex items-center gap-2">
              <div className="text-xs text-[var(--primary)]">
                Clique para voltar
              </div>
            </div>
          </div>
          
          <div className="h-[calc(100%-80px)] flex items-center justify-center overflow-y-auto p-4">
            <div className="text-center w-full">
              <p className="text-lg md:text-xl text-[var(--text)] leading-relaxed">
                {back}
              </p>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Resposta completa
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}