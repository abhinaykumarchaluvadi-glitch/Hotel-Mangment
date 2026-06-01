import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('hms_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Fallback to dark mode by default for premium feel
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('hms_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('hms_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-all duration-300 relative overflow-hidden group shadow-sm"
      aria-label="Toggle Theme"
      id="theme-toggle"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400 rotate-0 transition-transform duration-500 group-hover:rotate-45" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600 rotate-0 transition-transform duration-500 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
};
