import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'day' | 'night';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('study-app-theme');
    return (saved as Theme) || 'day';
  });

  useEffect(() => {
    localStorage.setItem('study-app-theme', theme);
    document.documentElement.classList.remove('day', 'night');
    document.documentElement.classList.add(theme);
    
    // Apply system theme colors for browser UI
    if (theme === 'night') {
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#fdfcfb';
      document.body.style.color = '#1a1a1a';
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'day' ? 'night' : 'day');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
