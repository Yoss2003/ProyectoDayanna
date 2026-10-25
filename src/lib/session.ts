import type { Profile } from "../types";

const PROFILE_KEY = "exploradores-perfil";
const COMPLETED_KEY = "exploradores-completadas";

export function readProfile(): Profile | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    if (!("name" in data) || !("avatar" in data)) return null;
    if (typeof data.name !== "string" || typeof data.avatar !== "string") return null;
    if (!data.name.trim()) return null;
    return { name: data.name, avatar: data.avatar };
  } catch { return null; }
}

export function saveProfile(profile: Profile): void {
  try { sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* almacenamiento no disponible */ }
}

export function readCompleted(): string[] {
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(COMPLETED_KEY) ?? "[]");
    return Array.isArray(data) ? data.filter((value): value is string => typeof value === "string") : [];
  } catch { return []; }
}

export function saveCompleted(ids: string[]): void {
  try { sessionStorage.setItem(COMPLETED_KEY, JSON.stringify(ids)); } catch { /* almacenamiento no disponible */ }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(COMPLETED_KEY);
  } catch { /* almacenamiento no disponible */ }
}
