"use client";

import { createContext } from "react";

/**
 * Shape: { user: { id, email, role, employeeId } | null, loading, login, logout }
 * Split from the provider component so a plain (non-JSX) hook file can import
 * it without becoming a ".jsx" component itself — see hooks/auth/useAuth.js.
 */
const AuthContext = createContext(null);

export default AuthContext;
