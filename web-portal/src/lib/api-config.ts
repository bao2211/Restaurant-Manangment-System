// API Configuration helper
// Allows runtime configuration via localStorage

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";
const STORAGE_KEY = "rms_api_url";

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return DEFAULT_API_URL;
  }
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, url);
  }
}

export function clearApiBaseUrl(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
