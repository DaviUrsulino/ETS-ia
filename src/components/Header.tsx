// src/components/Header.tsx
'use client';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { BookOpen, Moon, Sun, Menu, X } from 'lucide-react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-header border-b border-[var(--border)] sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-[90%] mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* LOGO ETS */}
          <div className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
            <div className="bg-primary/20 p-2 rounded-lg">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl leading-none">ETS</h1>
          </div>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-8">
            <button className="font-display hover:text-primary transition-colors">Sobre</button>
            <button className="font-display hover:text-primary transition-colors">Planos</button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--card)] transition-all"
            >
              {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>
          </nav>

          {/* MENU MOBILE */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 border-t border-[var(--border)] pt-4">
            <button className="block w-full text-left font-display">Sobre</button>
            <button onClick={toggleTheme} className="flex items-center gap-2 w-full font-display">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}