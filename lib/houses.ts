/**
 * Casas de Hogwarts: metadatos visuales para la temática Harry Potter.
 * El valor `key` coincide con el CHECK de la columna `teams.house` en la BD.
 */
export type HouseKey = "gryffindor" | "slytherin" | "ravenclaw" | "hufflepuff";

export interface House {
  key: HouseKey;
  name: string;
  crest: string; // emoji-escudo representativo
  /** Clases Tailwind para una "píldora"/badge de la casa. */
  badge: string;
  /** Color de acento (borde izquierdo de la fila, etc.). */
  accent: string;
}

export const HOUSES: Record<HouseKey, House> = {
  gryffindor: {
    key: "gryffindor",
    name: "Gryffindor",
    crest: "🦁",
    badge: "bg-red-900/90 text-amber-200 border border-amber-500/40",
    accent: "border-l-red-800",
  },
  slytherin: {
    key: "slytherin",
    name: "Slytherin",
    crest: "🐍",
    badge: "bg-green-900/90 text-emerald-100 border border-emerald-400/30",
    accent: "border-l-green-800",
  },
  ravenclaw: {
    key: "ravenclaw",
    name: "Ravenclaw",
    crest: "🦅",
    badge: "bg-blue-900/90 text-amber-100 border border-blue-300/30",
    accent: "border-l-blue-800",
  },
  hufflepuff: {
    key: "hufflepuff",
    name: "Hufflepuff",
    crest: "🦡",
    badge: "bg-yellow-400/90 text-yellow-950 border border-yellow-700/40",
    accent: "border-l-yellow-500",
  },
};

export const HOUSE_OPTIONS = Object.values(HOUSES);

export function getHouse(key: string | null | undefined): House | null {
  if (!key) return null;
  return HOUSES[key as HouseKey] ?? null;
}
