"use client";

import { useContext } from "react";
import ThemeContext from "@/lib/context/themeContext";

export default function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
