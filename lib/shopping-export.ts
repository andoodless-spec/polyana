import { fmt } from "./data";
import { groupProducts } from "./products";
export async function createShoppingPng(
  items: any[],
  from: string,
  to: string,
) {
  await document.fonts.ready;
  const c = document.createElement("canvas"),
    ctx = c.getContext("2d")!;
  c.width = 1200;
  const css = getComputedStyle(document.documentElement),
    get = (k: string, f: string) => css.getPropertyValue(k).trim() || f;
  const paper = get("--menu-paper", "#faf6e9"),
    rule = get("--menu-rule", "#ded8bb"),
    ink = get("--ink", "#354730"),
    muted = get("--muted", "#848b75"),
    accent = get("--forest-leaf", "#8fa277");
  const rows: any[] = [];
  let y = 380;
  function wrap(t: string, width: number) {
    ctx.font = '28px "Brand Pixel"';
    const lines: string[] = [];
    let line = "";
    for (const w of t.split(" ")) {
      if (line && ctx.measureText(line + " " + w).width > width) {
        lines.push(line);
        line = w;
      } else line += (line ? " " : "") + w;
    }
    if (line) lines.push(line);
    return lines;
  }
  for (const g of groupProducts(items)) {
    rows.push({ kind: "group", name: g.name, y });
    y += 70;
    for (const item of g.items) {
      const lines = wrap(item.name, 660),
        h = Math.max(90, lines.length * 38 + 35);
      rows.push({ kind: "item", item, lines, y, h });
      y += h;
    }
    y += 25;
  }
  c.height = Math.max(720, y + 120);
  if (c.height > 16000) throw Error("Для PNG выбери более короткий список.");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = rule;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 1144, c.height - 56);
  ctx.strokeRect(43, 43, 1114, c.height - 86);
  const text = (
    t: string,
    x: number,
    y: number,
    font: string,
    color = ink,
    align: CanvasTextAlign = "left",
  ) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(t, x, y);
  };
  ctx.fillStyle = accent;
  ctx.fillRect(594, 72, 7, 68);
  ctx.fillRect(572, 85, 25, 8);
  ctx.fillRect(601, 99, 24, 8);
  ctx.fillRect(578, 114, 21, 8);
  text(
    "ДЛЯ МАЛЕНЬКОЙ ДОМАШНЕЙ КУХНИ",
    600,
    185,
    '20px "Brand Pixel"',
    muted,
    "center",
  );
  text("За продуктами", 600, 255, '65px "Brand Pixel"', ink, "center");
  const label = (s: string) =>
    new Date(s + "T12:00:00").toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  text(
    label(from) + (to > from ? " — " + label(to) : ""),
    600,
    305,
    '25px "Brand Pixel"',
    muted,
    "center",
  );
  text(
    `${items.filter((s) => !s.done && !s.have).length} купить  ·  ${items.filter((s) => s.done).length} куплено  ·  ${items.filter((s) => s.have && !s.done).length} есть дома`,
    600,
    345,
    '23px "Brand Pixel"',
    muted,
    "center",
  );
  for (const row of rows) {
    if (row.kind === "group") {
      text(row.name, 100, row.y + 35, '31px "Brand Pixel"', accent);
      continue;
    }
    const { item, y, h, lines } = row;
    ctx.strokeStyle = item.done ? accent : rule;
    ctx.lineWidth = 2;
    ctx.strokeRect(100, y + 11, 23, 23);
    if (item.done) {
      ctx.beginPath();
      ctx.moveTo(104, y + 22);
      ctx.lineTo(111, y + 29);
      ctx.lineTo(121, y + 15);
      ctx.stroke();
    }
    lines.forEach((line: string, i: number) => {
      text(
        line,
        149,
        y + 32 + i * 38,
        '28px "Brand Pixel"',
        item.done ? muted : ink,
      );
      if (item.done) {
        const w = ctx.measureText(line).width;
        ctx.strokeStyle = muted;
        ctx.beginPath();
        ctx.moveTo(149, y + 22 + i * 38);
        ctx.lineTo(149 + w, y + 22 + i * 38);
        ctx.stroke();
      }
    });
    text(
      item.qty !== "" ? fmt(item.qty) + " " + item.unit : "",
      1090,
      y + 32,
      '27px "Brand Pixel"',
      ink,
      "right",
    );
    if (item.have && !item.done)
      text("есть дома", 1090, y + 62, '19px "Brand Pixel"', accent, "right");
    ctx.strokeStyle = rule;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(100, y + h - 12);
    ctx.lineTo(1100, y + h - 12);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (!items.length)
    text(
      "Здесь есть место для нужных мелочей.",
      600,
      460,
      '27px "Brand Pixel"',
      muted,
      "center",
    );
  text(
    "Всё нужное — в одном листочке",
    600,
    c.height - 68,
    '24px "Brand Pixel"',
    muted,
    "center",
  );
  return c.toDataURL("image/png");
}
