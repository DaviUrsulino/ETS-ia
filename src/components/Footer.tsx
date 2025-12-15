// src/components/Footer.tsx
'use client';
export default function Footer() {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-auto py-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="font-body text-sm opacity-80">
          ETS - Easy To Study © {new Date().getFullYear()}
        </p>
        <p className="text-xs opacity-60">
          Desenvolvido com tecnologia Gemini AI
        </p>
      </div>
    </footer>
  );
}