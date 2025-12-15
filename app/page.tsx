import { Upload, BookOpen, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-full mb-4">
          <BrainCircuit className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Estude com IA
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Transforme seus PDFs em Flashcards dinâmicos.
        </p>
      </div>

      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-10 text-center hover:bg-zinc-800/50 hover:border-blue-500 transition-all cursor-pointer group">
            <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
            <p className="text-sm font-medium text-zinc-300">
              Arraste seu PDF aqui
            </p>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            Gerar Flashcards
          </button>
        </div>
      </div>
    </main>
  );
}