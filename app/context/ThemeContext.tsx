"use client";

import React, { createContext, useContext, useSyncExternalStore, useCallback } from "react";

export type Theme = "cyan" | "corsa";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "vault_telemetry_theme";
const THEME_EVENT = "vault_theme_change";

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getThemeSnapshot(): Theme {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (savedTheme === "corsa" || savedTheme === "cyan") {
      return savedTheme;
    }
    const domTheme = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (domTheme === "corsa" || domTheme === "cyan") {
      return domTheme;
    }
  } catch {
    // Ignorar errores de acceso a localStorage en entornos restringidos
  }
  return "cyan";
}

function getThemeServerSnapshot(): Theme {
  return "cyan";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Manejo silencioso si localStorage no está disponible
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === "cyan" ? "corsa" : "cyan";
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser utilizado dentro de un ThemeProvider");
  }
  return context;
}
