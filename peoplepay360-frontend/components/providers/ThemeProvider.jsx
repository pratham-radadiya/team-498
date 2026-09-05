"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeContext from "@/lib/context/themeContext";

const STORAGE_KEY = "theme";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Class-based dark mode (see globals.css's `@custom-variant dark`), so the
 * Topbar's theme button can flip it directly instead of only following the
 * OS's `prefers-color-scheme`. The actual class is set before hydration by
 * the inline script in app/layout.js (no flash of the wrong theme) — this
 * provider just picks up that same source of truth to drive the toggle UI.
 */
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
