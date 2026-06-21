export function safeDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString();
}

export function parseMatchDateAsUTC(dateStr: string): Date {
  if (!dateStr) return new Date();
  return new Date(dateStr.replace(" ", "T") + "Z");
}

export function isMatchUndetermined(homeTeam: string, awayTeam: string): boolean {
  if (!homeTeam || !awayTeam) return true;
  const placeholders = ["Ganador", "Segundo", "Perdedor", "Grupo", "3ro", "3er", "Winner", "Runner-up", "3rd", "Loser"];
  return placeholders.some((p) => homeTeam.includes(p) || awayTeam.includes(p));
}

export function translateTeam(engName: string, translations: Record<string, string>): string {
  if (!engName) return "";
  return translations[engName] || engName;
}

export function translateLabel(label: string): string {
  if (!label) return "";
  return label
    .replace(/Winner Group /g, "Ganador Grupo ")
    .replace(/Runner-up Group /g, "Segundo Grupo ")
    .replace(/3rd Group /g, "3ro Grupo ")
    .replace(/Winner Match /g, "Ganador Partido ")
    .replace(/Loser Match /g, "Perdedor Partido ");
}
