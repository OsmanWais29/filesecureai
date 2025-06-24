
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    // Try to get the theme from localStorage
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      
      // Check if there's a saved theme or if the user prefers dark mode
      if (savedTheme) {
        setTheme(savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Save the theme to localStorage whenever it changes
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
    
    // Apply the theme to the document
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes first
    root.classList.remove('dark', 'light');
    root.removeAttribute('data-theme');
    body.classList.remove('dark', 'light');
    
    // Add transition class for smooth theme switching
    root.classList.add('dark-mode-transition');
    body.classList.add('theme-transition');
    
    if (theme === 'system') {
      // Check system preference
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        body.classList.add('dark');
      } else {
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        body.classList.add('light');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      body.classList.add('dark');
    } else {
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      body.classList.add('light');
    }
    
    // Remove transition class after animation completes
    const transitionTimeout = setTimeout(() => {
      root.classList.remove('dark-mode-transition');
      body.classList.remove('theme-transition');
    }, 300);
    
    return () => clearTimeout(transitionTimeout);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
