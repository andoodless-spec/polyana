export type MenuPlacement = { date: string; portions: number };
export function validMenuDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T12:00:00Z");
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s;
}
export function parseMenuSchedule(text: string) {
  const schedule: MenuPlacement[] = [],
    scheduleErrors: string[] = [];
  const seen = new Set<string>();
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const [date, portions, ...extra] = line.split("|").map((x) => x.trim());
    const n = Number((portions || "").replace(",", "."));
    if (
      extra.length ||
      !validMenuDate(date) ||
      !portions ||
      !Number.isFinite(n) ||
      n <= 0 ||
      n > 1000
    ) {
      scheduleErrors.push(line);
      continue;
    }
    const key = date + "|" + n;
    if (!seen.has(key)) {
      schedule.push({ date, portions: n });
      seen.add(key);
    }
  }
  return { schedule, scheduleErrors };
}
export function scheduleText(recipe: any) {
  return (
    recipe.scheduleText ??
    (recipe.schedule || [])
      .map((p: MenuPlacement) => p.date + " | " + p.portions)
      .join("\n")
  );
}
