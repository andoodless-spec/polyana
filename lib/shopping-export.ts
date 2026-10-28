import { fmt } from "./data";
import { groupProducts } from "./products";

// Fixed 3:4 artwork. Larger shopping lists are balanced across two columns.
export async function createShoppingPng(items: any[], from: string, to: string) {
  await document.fonts.ready;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Не удалось подготовить список продуктов.");
  c.width = 1200;
  c.height = 1600;
  const css = getComputedStyle(document.documentElement);
  const get = (key: string, fallback: string) => css.getPropertyValue(key).trim() || fallback;
  const paper = get("--menu-paper", "#faf6e9");
  const rule = get("--menu-rule", "#ded8bb");
  const ink = get("--ink", "#354730");
  const muted = get("--muted", "#848b75");
  const accent = get("--forest-leaf", "#8fa277");
  const twoColumns = items.length >= 12;
  const colCount = twoColumns ? 2 : 1;
  const colWidth = twoColumns ? 485 : 1000;
  const colX = twoColumns ? [90, 625] : [100];
  const fontSize = twoColumns ? 18 : 23;
  const lineHeight = twoColumns ? 25 : 31;
  const top = 410;
  const cursors = Array(colCount).fill(top);
  const lastGroup: string[] = Array(colCount).fill("");
  const rows: any[] = [];

  const wrap = (value: unknown, width: number) => {
    ctx.font = `${fontSize}px "Brand Pixel", monospace`;
    const words = String(value ?? "").split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  };

  const groups = groupProducts(items);
  for (const group of groups) {
    for (const item of group.items) {
      const column = cursors.indexOf(Math.min(...cursors));
      const x = colX[column];
      let y = cursors[column];
      if (lastGroup[column] !== group.name) {
        rows.push({ kind: "group", x, y, width: colWidth, name: group.name || "Продукты" });
        y += 35;
        lastGroup[column] = group.name;
      }
      const amountWidth = 110;
      const lines = wrap(item.name, colWidth - amountWidth - 85);
      const h = Math.max(58, lines.length * lineHeight + 19);
      rows.push({ kind: "item", x, y, width: colWidth, h, item, lines });
      cursors[column] = y + h;
    }
  }
  const maxY = Math.max(...cursors, top + 1);
  const scale = Math.min(1, 980 / Math.max(1, maxY - top));

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = rule;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 1144, 1544);
  ctx.strokeRect(43, 43, 1114, 1514);
  const text = (value: string, x: number, y: number, size: number, color = ink, align: CanvasTextAlign = "left") => {
    ctx.font = `${size}px "Brand Pixel", monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
  };
  ctx.fillStyle = accent;
  ctx.fillRect(594, 69, 7, 52);
  ctx.fillRect(572, 82, 25, 8);
  ctx.fillRect(601, 96, 24, 8);
  ctx.fillRect(578, 108, 21, 8);
  text("ДЛЯ МАЛЕНЬКОЙ ДОМАШНЕЙ КУХНИ", 600, 175, 18, muted, "center");
  text("За продуктами", 600, 250, 58, ink, "center");
  const label = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  text(label(from) + (to > from ? " — " + label(to) : ""), 600, 300, 21, muted, "center");
  text(`${items.filter((s) => !s.done && !s.have).length} купить · ${items.filter((s) => s.done).length} куплено · ${items.filter((s) => s.have && !s.done).length} есть дома`, 600, 345, 18, muted, "center");

  if (!items.length) {
    text("Здесь есть место для нужных мелочей.", 600, 500, 24, muted, "center");
  } else {
    ctx.save();
    ctx.translate(0, top * (1 - scale));
    ctx.scale(scale, scale);
    for (const row of rows) {
      if (row.kind === "group") {
        text(row.name, row.x, row.y + 24, twoColumns ? 19 : 23, accent);
        ctx.strokeStyle = rule;
        ctx.beginPath();
        ctx.moveTo(row.x, row.y + 32);
        ctx.lineTo(row.x + row.width, row.y + 32);
        ctx.stroke();
        continue;
      }
      const { item, x, y, width, h, lines } = row;
      ctx.strokeStyle = item.done ? accent : rule;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y + 7, 19, 19);
      if (item.done) {
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 16);
        ctx.lineTo(x + 8, y + 21);
        ctx.lineTo(x + 17, y + 10);
        ctx.stroke();
      }
      lines.forEach((line: string, i: number) => text(line, x + 30, y + 23 + i * lineHeight, fontSize, item.done ? muted : ink));
      const amount = item.qty !== "" ? `${fmt(item.qty)} ${item.unit || ""}`.trim() : "";
      if (amount) text(amount, x + width - 5, y + 23, fontSize, ink, "right");
      if (item.have && !item.done) text("есть дома", x + width - 5, y + 45, twoColumns ? 13 : 16, accent, "right");
      ctx.strokeStyle = rule;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(x, y + h - 4);
      ctx.lineTo(x + width, y + h - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  text("Всё нужное — в одном листочке", 600, 1518, 20, muted, "center");
  return c.toDataURL("image/png");
}
