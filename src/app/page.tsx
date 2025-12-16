"use client";

import { useState } from "react";
import { Upload, BookOpen, Loader2, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion"; 
import { FlashcardItem } from "@/components/FlashcardItem";
import { gerarFlashcardsAction } from "@/services/aiService";

interface Flashcard {
  front: string;
  back: string;
}

export default function Home() {
  const [mode, setMode] = useState<"text" | "pdf">("text");
  const [text, setText] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // BLINDAGEM CONTRA ERRO HTML
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await res.text(); // Lê o HTML do erro
        console.error("Erro HTML retornado pela API:", textError);
        throw new Error("O servidor retornou um erro HTML (provavelmente 500 ou 404). Veja o console.");
      }

      const data = await res.json();
      
      if (data.error) {
        alert("Erro da API: " + data.error);
      } else if (data.text) {
        setText(data.text);
      } else {
        alert("O PDF foi lido, mas não encontramos texto nele (pode ser imagem?).");
      }

    } catch (err: any) {
      console.error("Erro no upload:", err);
      alert("Falha no upload: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    if (!text) return alert("Precisamos de conteúdo para gerar os cards!");
    setLoading(true);
    setFlashcards([]);

    try {
      const cards = await gerarFlashcardsAction(text);
      if (cards && cards.length > 0) {
        setFlashcards(cards);
      } else {
        alert("A IA não conseguiu gerar perguntas com esse texto.");
      }
    } catch (error) {
      alert("Erro ao gerar flashcards.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-500 pb-20">
      
      {/* HERO SECTION */}
      <section className="text-center py-10 md:py-16 px-4 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-6 h-6 text-primary mr-2" />
            <span className="text-primary font-bold text-sm tracking-wide">INTELIGÊNCIA ARTIFICIAL V2.5</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl mb-6 leading-tight">
            Estude qualquer coisa <br />
            <span className="text-primary">em segundos</span>
          </h1>
          
          <p className="font-body text-xl md:text-2xl opacity-70 mb-10 max-w-2xl mx-auto">
            O ETS transforma seus PDFs e resumos em flashcards inteligentes automaticamente.
          </p>
        </motion.div>

        {/* CONTROLES DE MODO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-[var(--card)] p-2 rounded-2xl shadow-xl border border-[var(--border)] inline-flex mb-8"
        >
          <button 
            onClick={() => setMode("text")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'text' ? 'bg-primary text-white shadow-lg' : 'hover:bg-[var(--card-alt)]'}`}
          >
            Texto
          </button>
          <button 
            onClick={() => setMode("pdf")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${mode === 'pdf' ? 'bg-primary text-white shadow-lg' : 'hover:bg-[var(--card-alt)]'}`}
          >
            Upload PDF
          </button>
        </motion.div>
      </section>

      {/* ÁREA PRINCIPAL */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        
        {/* LADO ESQUERDO: INPUT */}
        <div className="space-y-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-lg min-h-[500px] flex flex-col">
            
            {mode === "pdf" ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--card-alt)] hover:border-primary transition-colors cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="text-center p-6 transition-transform group-hover:scale-105">
                    <Upload className="w-16 h-16 text-primary mb-4 mx-auto" />
                    <p className="font-bold text-lg mb-2">Clique ou arraste seu PDF</p>
                    <p className="text-sm opacity-60">Extração automática de texto</p>
                </div>
                {fileName && (
                  <div className="mt-6 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg flex items-center border border-green-500/20 z-20 relative">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium truncate max-w-[200px]">{fileName}</span>
                  </div>
                )}
              </div>
            ) : (
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole seu resumo de aula, texto ou anotações aqui..."
                className="flex-1 w-full bg-transparent resize-none outline-none text-lg placeholder:opacity-40 font-body p-2"
              />
            )}

            <button 
              onClick={handleGenerate}
              disabled={loading || (!text && mode === 'text')}
              className="mt-6 w-full bg-primary hover:bg-blue-600 text-white font-display py-4 rounded-xl text-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2" /> Processando Inteligência...</>
              ) : (
                "Gerar Baralho de Estudos"
              )}
            </button>
          </div>
        </div>

        {/* LADO DIREITO: CARDS */}
        <div className="bg-[var(--card-alt)]/50 rounded-2xl p-4 border border-[var(--border)] h-[600px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {flashcards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                <div className="bg-[var(--card)] p-6 rounded-full mb-4">
                    <BookOpen className="w-12 h-12 text-[var(--text)]" />
                </div>
                <p className="font-display text-xl">Seus cards aparecerão aqui</p>
                <p className="text-sm mt-2">Aguardando conteúdo...</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                 {flashcards.map((card, idx) => (
                   <FlashcardItem key={idx} index={idx} front={card.front} back={card.back} />
                 ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}