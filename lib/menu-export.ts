import { fmt } from "./data";
import { loadMenuImage } from "./menu-image";
// Canvas rendering avoids external capture services, network fonts and hidden UI controls.
export async function createMenuPng(data: any, from: string, to: string) {
  await document.fonts.ready;
  const css = getComputedStyle(document.documentElement),
    color = (key: string, fallback: string) =>
      css.getPropertyValue(key).trim() || fallback;
  const paper = color("--menu-paper", "#faf6e9"),
    rule = color("--menu-rule", "#ded8bb"),
    ink = color("--ink", "#354730"),
    muted = color("--muted", "#848b75"),
    sage = color("--forest-leaf", "#8fa277"),
    gold = color("--forest-gold", "#c9b978");
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d")!;
  canvas.width = 1200;
  function wrap(text: string, max: number, font: string) {
    ctx.font = font;
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(" ")) {
      if (line && ctx.measureText(line + " " + word).width > max) {
        lines.push(line);
        line = word;
      } else line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    return lines;
  }
  const menu = data.menu
    .filter((m: any) => m.date >= from && m.date <= to)
    .sort((a: any, b: any) => a.date.localeCompare(b.date));
  const rows: any[] = [];
  let lastDate = "";
  let y = 390;
  for (const m of menu) {
    const d = data.dishes.find((x: any) => x.id === m.dishId);
    if (m.date !== lastDate) {
      rows.push({ type: "date", y, date: m.date });
      y += 80;
      lastDate = m.date;
    }
    const title = wrap(
      d?.title || "Блюдо в корзине",
      720,
      '37px "Brand Pixel"',
    );
    const ingredients = (d?.ingredients || []).map((i: any) => ({
      name: wrap(i.name, 730, '26px "Brand Pixel"'),
      amount:
        i.qty !== ""
          ? fmt(
              (Number(i.qty) * Number(m.portions)) / Number(d.portions || 1),
            ) +
            " " +
            i.unit
          : "не указано",
    }));
    const h =
      111 +
      title.length * 45 +
      ingredients.reduce(
        (h: any, i: any) => h + Math.max(1, i.name.length) * 39,
        0,
      );
    rows.push({ type: "dish", y, h, m, d, title, ingredients });
    y += h;
  }
  canvas.height = Math.max(720, y + 140);
  if (canvas.height > 16000)
    throw Error(
      "Для PNG выбери более короткий период: изображение получается слишком длинным.",
    );
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, 1200, canvas.height);
  ctx.strokeStyle = rule;
  ctx.lineWidth = 2;
  ctx.strokeRect(29, 29, 1142, canvas.height - 58);
  ctx.strokeRect(43, 43, 1114, canvas.height - 86);
  function text(
    t: string,
    x: number,
    y: number,
    font: string,
    c = ink,
    align: CanvasTextAlign = "left",
  ) {
    ctx.fillStyle = c;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(t, x, y);
  }
  // Tiny pixel sprigs, deliberately quiet.
  function sprig(x: number, y: number) {
    ctx.fillStyle = sage;
    ctx.fillRect(x, y, 6, 49);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x - 13 + i * 3, y + 12 + i * 11, 14 - i * 2, 5);
      ctx.fillRect(x + 5, y + 6 + i * 11, 13 - i * 2, 5);
    }
    ctx.fillStyle = gold;
    ctx.fillRect(x - 4, y - 5, 14, 10);
  }
  const artwork = await loadMenuImage(data.settings?.menuImage);
  if (artwork) {
    const scale = Math.min(
      320 / artwork.naturalWidth,
      112 / artwork.naturalHeight,
    );
    const width = artwork.naturalWidth * scale,
      height = artwork.naturalHeight * scale;
    ctx.drawImage(
      artwork,
      600 - width / 2,
      55 + (112 - height) / 2,
      width,
      height,
    );
  } else {
    sprig(567, 85);
    sprig(609, 104);
  }
  text(
    "МАЛЕНЬКАЯ ДОМАШНЯЯ КУХНЯ",
    600,
    196,
    '20px "Brand Pixel"',
    muted,
    "center",
  );
  text("Меню полянки", 600, 270, '65px "Brand Pixel"', ink, "center");
  const label = (s: string) =>
    new Date(s + "T12:00:00").toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  text(
    label(from) + (to > from ? " — " + label(to) : ""),
    600,
    320,
    '26px "Brand Pixel"',
    muted,
    "center",
  );
  text("✧  ───  ✧", 600, 355, '22px "Brand Pixel"', gold, "center");
  if (!menu.length)
    text(
      "Здесь есть место для чего-нибудь вкусного.",
      600,
      480,
      '27px "Brand Pixel"',
      muted,
      "center",
    );
  for (const r of rows) {
    if (r.type === "date") {
      text(
        new Date(r.date + "T12:00:00").toLocaleDateString("ru-RU", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        100,
        r.y + 35,
        '30px "Brand Pixel"',
        ink,
      );
      ctx.strokeStyle = rule;
      ctx.beginPath();
      ctx.moveTo(100, r.y + 53);
      ctx.lineTo(1100, r.y + 53);
      ctx.stroke();
      continue;
    }
    const course = r.d?.category || "Блюдо";
    text(course.toUpperCase(), 100, r.y + 25, '19px "Brand Pixel"', sage);
    r.title.forEach((line: string, i: number) =>
      text(line, 100, r.y + 76 + i * 45, '37px "Brand Pixel"'),
    );
    const kcal =
      r.d?.kcal !== "" && r.d?.kcal != null
        ? (r.d.kcalEstimated ? "≈" : "") + String(r.d.kcal)
        : "—";
    text(kcal, 1090, r.y + 73, '38px "Brand Pixel"', sage, "right");
    text("ккал / порц.", 1090, r.y + 99, '18px "Brand Pixel"', muted, "right");
    const start = r.y + 86 + r.title.length * 45;
    let ingredientY = start;
    for (const ing of r.ingredients) {
      ing.name.forEach((line: string, i: number) =>
        text(line, 100, ingredientY + i * 39, '26px "Brand Pixel"', muted),
      );
      text(ing.amount, 1090, ingredientY, '26px "Brand Pixel"', ink, "right");
      ingredientY += Math.max(1, ing.name.length) * 39;
    }
    text(
      r.m.portions + " порц. · граммовки на всё блюдо",
      100,
      r.y + r.h - 28,
      '21px "Brand Pixel"',
      muted,
    );
    ctx.strokeStyle = rule;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(100, r.y + r.h - 7);
    ctx.lineTo(1100, r.y + r.h - 7);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  text(
    "С заботой, твоя полянка",
    600,
    canvas.height - 75,
    '24px "Brand Pixel"',
    muted,
    "center",
  );
  return canvas.toDataURL("image/png");
}
