// Local calendar export: no external account or silent calendar writes.
function escapeIcs(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function fold(line: string) {
  let out = "",
    part = "";
  for (const c of line) {
    if (new TextEncoder().encode(part + c).length > 70) {
      out += part + "\r\n ";
      part = "";
    }
    part += c;
  }
  return out + part;
}
export function calendarText(items: any[]) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z/, "Z");
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//polyanka//Birthday Calendar//RU",
      "CALSCALE:GREGORIAN",
      ...items.flatMap((b) => [
        "BEGIN:VEVENT",
        "UID:" + escapeIcs(b.id || crypto.randomUUID()) + "@svoya-polyanka",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + b.date.replaceAll("-", ""),
        "RRULE:FREQ=YEARLY",
        "SUMMARY:" + escapeIcs("День рождения: " + b.name),
        "DESCRIPTION:" + escapeIcs(b.ideas || ""),
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:День рождения",
        "TRIGGER:-P" + Math.max(0, Number(b.remind) || 0) + "D",
        "END:VALARM",
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ]
      .map(fold)
      .join("\r\n") + "\r\n"
  );
}
export function exportBirthdays(items: any[]) {
  if (!items.length) return;
  const url = URL.createObjectURL(
    new Blob([calendarText(items)], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = items.length === 1 ? "birthday.ics" : "polyanka-birthdays.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
