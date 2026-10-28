import { fmt } from "./data";

const order = ["Салат", "Суп", "Горячее", "Закуска", "Фастфуд", "Завтрак", "Выпечка", "Другое"];

// Fixed portrait canvas (3:4); long menus flow into two balanced columns.
export async function createMenuPng(data: any, from: string, to: string) {
  await document.fonts.ready;
  const css = getComputedStyle(document.documentElement);
  const get = (key: string, fallback: string) => css.getPropertyValue(key).trim() || fallback;
  const paper = get("--menu-paper", "#faf6e9");
  const rule = get("--menu-rule", "#ded8bb");
  const ink = get("--ink", "#354730");
  const muted = get("--muted", "#848b75");
  const sage = get("--forest-leaf", "#8fa277");
  const gold = get("--forest-gold", "#c9b978");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось подготовить изображение меню.");
  canvas.width = 1200;
  canvas.height = 1600;

  const dishes = (data.menu || []).map((m: any, index: number) => ({
    ...m,
    index,
    dish: (data.dishes || []).find((d: any) => d.id === m.dishId),
  })).filter((x: any) => x.dish).sort((a: any, b: any) => {
    const ai = order.indexOf(a.dish?.category || "Другое");
    const bi = order.indexOf(b.dish?.category || "Другое");
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.index - b.index;
  });
  const twoColumns = dishes.length >= 6;
  const colCount = twoColumns ? 2 : 1;
  const colWidth = twoColumns ? 485 : 1000;
  const colX = twoColumns ? [90, 625] : [100];
  const titleSize = twoColumns ? 23 : 29;
  const bodySize = twoColumns ? 16 : 20;
  const titleLine = twoColumns ? 30 : 36;
  const bodyLine = twoColumns ? 23 : 28;
  const contentTop = 405;
  const cursors = Array(colCount).fill(contentTop);
  const lastCategory: string[] = Array(colCount).fill("");
  const rows: any[] = [];

  const wrap = (value: unknown, width: number, size: number) => {
    ctx.font = `${size}px "Brand Pixel", monospace`;
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

  for (const item of dishes) {
    const category = item.dish?.category || "Другое";
    const column = cursors.indexOf(Math.min(...cursors));
    const x = colX[column];
    let y = cursors[column];
    if (lastCategory[column] !== category) {
      rows.push({ kind: "category", x, y, width: colWidth, category });
      y += 39;
      lastCategory[column] = category;
    }
    const title = wrap(item.dish?.title || "Блюдо", colWidth - 26, titleSize);
    const ingredients = (item.dish?.ingredients || []).map((ingredient: any) => ({
      name: wrap(ingredient.name, colWidth - 125, bodySize),
      amount: ingredient.unit === "п.в."
        ? "п.в."
        : ingredient.qty !== ""
          ? `${fmt((Number(ingredient.qty) * Number(item.portions || 1)) / Number(item.dish?.portions || 1))} ${ingredient.unit || ""}`.trim()
          : "",
    }));
    const kcal = item.dish?.kcal !== "" && item.dish?.kcal != null
      ? `${item.dish.kcalEstimated ? "≈" : ""}${item.dish.kcal} ккал / порц.`
      : "Калорийность не указана";
    const ingredientHeight = ingredients.reduce((sum: number, ingredient: any) => sum + Math.max(1, ingredient.name.length) * bodyLine + 4, 0);
    const height = 20 + title.length * titleLine + 24 + ingredientHeight + 16;
    rows.push({ kind: "dish", x, y, width: colWidth, height, item, title, ingredients, kcal });
    cursors[column] = y + height + 12;
  }

  const maxY = Math.max(...cursors, contentTop + 1);
  const scale = Math.min(1, 1000 / Math.max(1, maxY - contentTop));
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = rule;
  ctx.lineWidth = 2;
  ctx.strokeRect(29, 29, 1142, 1542);
  ctx.strokeRect(43, 43, 1114, 1514);
  const text = (value: string, x: number, y: number, size: number, color = ink, align: CanvasTextAlign = "left") => {
    ctx.fillStyle = color;
    ctx.font = `${size}px "Brand Pixel", monospace`;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
  };
  const sprig = (x: number, y: number) => {
    ctx.fillStyle = sage;
    ctx.fillRect(x, y, 7, 47);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x - 14 + i * 3, y + 12 + i * 11, 13 - i * 2, 5);
      ctx.fillRect(x + 7, y + 6 + i * 11, 12 - i * 2, 5);
    }
    ctx.fillStyle = gold;
    ctx.fillRect(x - 4, y - 5, 15, 9);
  };
  sprig(565, 77);
  sprig(620, 91);
  text("МАЛЕНЬКАЯ ДОМАШНЯЯ КУХНЯ", 600, 178, 18, muted, "center");
  text("Меню полянки", 600, 252, 57, ink, "center");
  const label = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  text(`${label(from)} — ${label(to)}`, 600, 303, 22, muted, "center");
  text("✧  ───  ✧", 600, 345, 22, gold, "center");

  if (!dishes.length) {
    text("Здесь есть место для чего-нибудь вкусного.", 600, 520, 24, muted, "center");
  } else {
    ctx.save();
    ctx.translate(0, contentTop * (1 - scale));
    ctx.scale(scale, scale);
    for (const row of rows) {
      if (row.kind === "category") {
        text(row.category, row.x, row.y + 24, twoColumns ? 20 : 24, sage);
        ctx.strokeStyle = rule;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(row.x, row.y + 33);
        ctx.lineTo(row.x + row.width, row.y + 33);
        ctx.stroke();
        continue;
      }
      const { item, x, y, width, title, ingredients, kcal } = row;
      ctx.fillStyle = gold;
      ctx.fillRect(x, y + 4, 9, 9);
      title.forEach((line: string, i: number) => text(line, x + 20, y + 19 + i * titleLine, titleSize));
      const metaY = y + 19 + title.length * titleLine;
      text(`${item.portions || 1} порц. · ${kcal}`, x + 20, metaY, bodySize - 1, muted);
      let iy = metaY + 16;
      for (const ingredient of ingredients) {
        ingredient.name.forEach((line: string, i: number) => text(line, x + 20, iy + i * bodyLine, bodySize, muted));
        if (ingredient.amount) text(ingredient.amount, x + width - 5, iy, bodySize, ink, "right");
        iy += Math.max(1, ingredient.name.length) * bodyLine + 4;
      }
      ctx.strokeStyle = rule;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(x, y + row.height - 4);
      ctx.lineTo(x + width, y + row.height - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  text("С заботой, твоя полянка", 600, 1518, 20, muted, "center");
  return canvas.toDataURL("image/png");
}
