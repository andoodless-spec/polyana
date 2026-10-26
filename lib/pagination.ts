export type TextPage = { text: string; start: number; end: number };
// Measure real text in an element with the same font/width as the visible page.
// Preserve every character; never trim whitespace or silently shrink the font.
export function paginateText(
  text: string,
  probe: HTMLElement,
  width: number,
  height: number,
): TextPage[] {
  if (!text) return [{ text: "", start: 0, end: 0 }];
  probe.style.width = width + "px";
  const fits = (part: string) => {
    probe.textContent = part + "\u200b";
    return probe.getBoundingClientRect().height <= height - 3;
  };
  const result: TextPage[] = [];
  let start = 0;
  while (start < text.length) {
    let lo = 1,
      hi = text.length - start,
      best = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fits(text.slice(start, start + mid))) {
        best = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    let end = Math.min(text.length, start + best);
    if (end < text.length) {
      const candidate = text.slice(start, end);
      let boundary = -1;
      for (let i = candidate.length - 1; i > candidate.length * 0.7; i--) {
        if (/\s/.test(candidate[i])) {
          boundary = i + 1;
          break;
        }
      }
      if (boundary > 0) end = start + boundary;
      // Avoid cutting between UTF-16 surrogate halves.
      if (end > start && /[\uD800-\uDBFF]/.test(text[end - 1])) end--;
    }
    if (end <= start) end = Math.min(text.length, start + 2);
    result.push({ text: text.slice(start, end), start, end });
    start = end;
  }
  probe.textContent = "";
  return result;
}
