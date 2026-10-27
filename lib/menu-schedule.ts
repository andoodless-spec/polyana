export type MenuPlacement = { date: string; portions: number };

export function validMenuDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T12:00:00Z");
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s;
}

function normalizeDate(raw: string) {
  const value = raw.trim().replace(/^дата\s*:\s*/i, "");
  const dotted = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted)
    return `${dotted[3]}-${dotted[2].padStart(2, "0")}-${dotted[1].padStart(2, "0")}`;
  return value;
}

function parseScheduleRow(raw: string): [string, string] | null {
  const line = raw
    .trim()
    .replace(/^[-*•]\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "");
  if (!line) return null;

  let date = "";
  let amount = "";
  const columns = line.split("|");
  if (columns.length === 2) {
    [date, amount] = columns.map((part) => part.trim());
  } else {
    const match = line.match(
      /^(.*?)\s*(?:—|–|−|:)\s*(\d+(?:[.,]\d+)?)\s*(?:порц(?:ия|ии|ий)?\.?|порций)?$/i,
    );
    if (!match) return null;
    date = match[1].trim();
    amount = match[2].trim();
  }
  const portion = amount.match(
    /^(\d+(?:[.,]\d+)?)(?:\s*порц(?:ия|ии|ий)?\.?|\s*порций)?$/i,
  );
  return [normalizeDate(date), (portion?.[1] || amount).replace(",", ".")];
}

export function parseMenuSchedule(text: string) {
  const schedule: MenuPlacement[] = [];
  const scheduleErrors: string[] = [];
  const seen = new Set<string>();

  for (const raw of text.split("\n")) {
    if (!raw.trim()) continue;
    const parsed = parseScheduleRow(raw);
    if (!parsed) {
      scheduleErrors.push(raw.trim());
      continue;
    }
    const [date, portionText] = parsed;
    const portions = Number(portionText);
    if (
      !validMenuDate(date) ||
      !portionText ||
      !Number.isFinite(portions) ||
      portions <= 0 ||
      portions > 1000
    ) {
      scheduleErrors.push(raw.trim());
      continue;
    }
    const key = date + "|" + portions;
    if (!seen.has(key)) {
      schedule.push({ date, portions });
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
