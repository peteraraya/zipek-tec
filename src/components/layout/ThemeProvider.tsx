"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error("Failed to save theme preference to localStorage", error);
    }
  }, []);

  useEffect(() => {
    let frameId: number | undefined;

    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      const initialTheme = savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : defaultTheme;

      applyTheme(initialTheme);
      frameId = window.requestAnimationFrame(() => setThemeState(initialTheme));
    } catch (error) {
      console.error("Failed to load theme preference from localStorage", error);
      applyTheme(defaultTheme);
    }

    const syncThemeAcrossTabs = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;

      const nextTheme = event.newValue === "light" ? "light" : "dark";
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    window.addEventListener("storage", syncThemeAcrossTabs);
    return () => {
      if (frameId !== undefined) window.cancelAnimationFrame(frameId);
      window.removeEventListener("storage", syncThemeAcrossTabs);
    };
  }, [defaultTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
