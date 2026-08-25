// API base URL (uses Vite env var in production, falls back to localhost)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const API_BASE_URL = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

// Common regex patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
};

// App constants
export const APP_NAME = "Pragati";
export const TOKEN_KEY = "auth_token";

// Status constants (if used in UI)
export const STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  LOADING: "loading",
};