// src/app/page.tsx
"use client";

import { useState } from "react";
import { Upload, BookOpen, BrainCircuit, Loader2 } from "lucide-react";
// Importamos a função do nosso serviço novo
import { gerarFlashcardsAction } from "../services/aiService";

// Definindo o tipo para não usar "any" (Coisa de Clean Code!)
interface Flashcard {
  front: string;
  back: string;
}

export default function Home() {
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]); 
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!text) return alert("Digite algum texto para estudar!");
    
    setLoading(true);
    setFlashcards([]); // Limpa cards antigos

    try {
      // --- MUDANÇA AQUI ---
      // Em vez de fetch('/api/generate'), chamamos direto a função segura:
      const cardsGerados = await gerarFlashcardsAction(text);
      
      if (cardsGerados && cardsGerados.length > 0) {
        setFlashcards(cardsGerados);
      } else {
        alert("A IA não conseguiu gerar flashcards com esse texto. Tente outro.");
      }
      // --------------------

    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-full mb-4">
          <BrainCircuit className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Estude com IA (Clean Arch)
        </h1>
      </div>

      <div className="w-full max-w-4xl flex gap-6 flex-col md:flex-row">
        
        {/* Lado Esquerdo: Entrada */}
        <div className="flex-1 space-y-4">
          <textarea 
            className="w-full h-80 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Cole aqui o texto da sua aula..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <BookOpen className="w-5 h-5" />}
            {loading ? "A IA está pensando..." : "Gerar Flashcards"}
          </button>
        </div>

        {/* Lado Direito: Saída (Flashcards) */}
        <div className="flex-1 h-80 md:h-auto overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          
          {flashcards.length === 0 && !loading && (
            <div className="h-full flex items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl p-8">
              <p>Os cards aparecerão aqui</p>
            </div>
          )}

          {flashcards.map((card, index) => (
            <div key={index} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-colors shadow-lg">
              <p className="text-emerald-400 text-xs font-bold uppercase mb-2">Pergunta {index + 1}</p>
              <h3 className="font-medium text-zinc-100 mb-3 text-lg">{card.front}</h3>
              <div className="h-px bg-zinc-800 w-full mb-3" />
              <p className="text-zinc-400 text-sm">{card.back}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}