"use client";

import { createContext } from "react";

/** Shape: { theme: "light" | "dark", toggleTheme: () => void } */
const ThemeContext = createContext(null);

export default ThemeContext;
