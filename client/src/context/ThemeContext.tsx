import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef, startTransition } from "react";

export const themes = [
  { id: "clean-dark", name: "Clean Dark", description: "Pure black with crisp white text" },
  { id: "clean-light", name: "Clean Light", description: "Pure white with dark text" },
] as const;

export type Theme = typeof themes[number]["id"];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
  themes: typeof themes;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const VALID_THEMES = ["clean-dark", "clean-light"] as const;
const DEFAULT_THEME: Theme = "clean-dark";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved && VALID_THEMES.includes(saved as Theme)) {
        return saved as Theme;
      }
    }
    return DEFAULT_THEME;
  });

  const isInitialMount = useRef(true);

  const setTheme = useCallback((newTheme: Theme) => {
    startTransition(() => {
      setThemeState(newTheme);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "clean-dark" ? "clean-light" : "clean-dark"));
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => (current === "clean-dark" ? "clean-light" : "clean-dark"));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("data-theme", theme);
      root.classList.remove("clean-dark", "clean-light");
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
      if (!isInitialMount.current) {
        window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
      }
      isInitialMount.current = false;
    }
  }, [theme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue && VALID_THEMES.includes(e.newValue as Theme)) {
        setThemeState(e.newValue as Theme);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isDark = theme === "clean-dark";

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      cycleTheme,
      themes,
      isDark,
    }),
    [theme, setTheme, toggleTheme, cycleTheme, isDark]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useIsDarkMode(): boolean {
  return useTheme().isDark;
}
