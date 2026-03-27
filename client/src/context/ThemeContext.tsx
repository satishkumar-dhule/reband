import { createContext, useContext, useEffect, useState } from "react";

// Pro Max themes - Ultra Premium UI/UX
export const themes = [
  // Gen Z themes
  { id: "genz-dark", name: "Gen Z Dark", category: "genz", description: "Pure black with neon accents" },
  { id: "genz-light", name: "Gen Z Light", category: "genz", description: "Pure white with vibrant accents" },
  // UI/UX Pro Max themes
  { id: "pro-midnight", name: "Pro Midnight", category: "pro-max", description: "Deep midnight blue with gold accents" },
  { id: "pro-aurora", name: "Pro Aurora", category: "pro-max", description: "Aurora borealis inspired gradients" },
  { id: "pro-obsidian", name: "Pro Obsidian", category: "pro-max", description: "Sleek obsidian black with diamond accents" },
  { id: "pro-sapphire", name: "Pro Sapphire", category: "pro-max", description: "Royal sapphire with silver highlights" },
  { id: "pro-emerald", name: "Pro Emerald", category: "pro-max", description: "Rich emerald with platinum accents" },
  { id: "pro-ruby", name: "Pro Ruby", category: "pro-max", description: "Luxurious ruby with rose gold" },
  { id: "pro-amethyst", name: "Pro Amethyst", category: "pro-max", description: "Royal amethyst with pearl accents" },
] as const;

export type Theme = typeof themes[number]["id"];

export const themeCategories = [
  { id: "genz", name: "Gen Z" },
  { id: "pro-max", name: "UI/UX Pro Max" },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
  themes: typeof themes;
  themeCategories: typeof themeCategories;
  autoRotate: boolean;
  setAutoRotate: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved && themes.some(t => t.id === saved)) {
      return saved as Theme;
    }
    return 'pro-midnight';
  });

  const [autoRotate, setAutoRotate] = useState(false);
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (themes.some(t => t.id === newTheme)) {
          setThemeState(newTheme);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('genz-dark', 'genz-light', 'pro-midnight', 'pro-aurora', 'pro-obsidian', 'pro-sapphire', 'pro-emerald', 'pro-ruby', 'pro-amethyst', 'dark', 'light');
    
    // Add new theme class
    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
    
    // Set dark/light for compatibility
    if (theme.includes('dark') || theme.includes('midnight') || theme.includes('obsidian') || theme.includes('sapphire')) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(current => current.includes('dark') || current.includes('midnight') || current.includes('obsidian') ? 'pro-aurora' : 'pro-midnight');
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeState(themes[nextIndex].id);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme,
      cycleTheme, 
      themes, 
      themeCategories,
      autoRotate,
      setAutoRotate
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
