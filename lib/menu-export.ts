import { fmt } from "./data";
const order = [
  "Салат",
  "Суп",
  "Горячее",
  "Закуска",
  "Фастфуд",
  "Завтрак",
  "Выпечка",
  "Другое",
];
const water = (s: string) =>
  /^(?:вода|питьевая вода|водопроводная вода)$/i.test(s.trim());

// Canvas export contains only the designed menu content; no screen controls are captured.
export async function createMenuPng(data: any, from: string, to: string) {
  await document.fonts.ready;
  const css = getComputedStyle(document.documentElement),
    get = (key: string, fallback: string) =>
      css.getPropertyValue(key).trim() || fallback,
    paper = get("--menu-paper", "#faf6e9"),
    rule = get("--menu-rule", "#ded8bb"),
    ink = get("--ink", "#354730"),
    muted = get("--muted", "#848b75"),
    sage = get("--forest-leaf", "#8fa277"),
    gold = get("--forest-gold", "#c9b978");
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d")!;
  canvas.width = 1200;
  const font = (size: number) => `${size}px "Brand Pixel"`;
  function wrap(text: string, width: number, size: number) {
    ctx.font = font(size);
    const lines: string[] = [];
    let line = "";
    for (const word of String(text).split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }
  const dishes = data.menu
    .map((m: any, index: number) => ({
      ...m,
      index,
      dish: data.dishes.find((d: any) => d.id === m.dishId),
    }))
    .sort((a: any, b: any) => {
      const ai = order.indexOf(a.dish?.category || "Другое"),
        bi = order.indexOf(b.dish?.category || "Другое");
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.index - b.index;
    });
  const groups = order
    .map((category) => ({
      category,
      items: dishes.filter(
        (x: any) => (x.dish?.category || "Другое") === category,
      ),
    }))
    .filter((x) => x.items.length);
  const blocks: any[] = [];
  let y = 395;
  for (const group of groups) {
    blocks.push({ type: "category", category: group.category, y });
    y += 70;
    for (const item of group.items) {
      const ingredients = (item.dish?.ingredients || [])
        .filter((i: any) => !water(i.name))
        .map((i: any) => ({
          name: wrap(i.name, 720, 24),
          amount:
            i.unit === "п.в."
              ? "п.в."
              : i.qty !== ""
                ? `${fmt((Number(i.qty) * Number(item.portions)) / Number(item.dish?.portions || 1))} ${i.unit}`
                : "не указано",
        }));
      const title = wrap(item.dish?.title || "Блюдо удалено", 820, 34);
      const h =
        106 +
        title.length * 43 +
        ingredients.reduce(
          (n: number, i: any) => n + Math.max(1, i.name.length) * 35,
          0,
        );
      blocks.push({ type: "dish", y, h, item, title, ingredients });
      y += h + 15;
    }
  }
  canvas.height = Math.max(720, y + 150);
  if (canvas.height > 16000)
    throw Error("Меню слишком большое для одного изображения.");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = rule;
  ctx.lineWidth = 2;
  ctx.strokeRect(29, 29, 1142, canvas.height - 58);
  ctx.strokeRect(43, 43, 1114, canvas.height - 86);
  const text = (
    t: string,
    x: number,
    y: number,
    size: number,
    color = ink,
    align: CanvasTextAlign = "left",
  ) => {
    ctx.fillStyle = color;
    ctx.font = font(size);
    ctx.textAlign = align;
    ctx.fillText(t, x, y);
  };
  function sprig(x: number, y: number) {
    ctx.fillStyle = sage;
    ctx.fillRect(x, y, 6, 42);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x - 13 + i * 3, y + 12 + i * 10, 13 - i * 2, 5);
      ctx.fillRect(x + 5, y + 5 + i * 10, 12 - i * 2, 5);
    }
    ctx.fillStyle = gold;
    ctx.fillRect(x - 4, y - 5, 14, 10);
  }
  sprig(565, 85);
  sprig(610, 100);
  text("МАЛЕНЬКАЯ ДОМАШНЯЯ КУХНЯ", 600, 190, 20, muted, "center");
  text("Меню полянки", 600, 268, 62, ink, "center");
  const label = (s: string) =>
    new Date(s + "T12:00:00").toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  text(`${label(from)} — ${label(to)}`, 600, 320, 24, muted, "center");
  text("✧  ───  ✧", 600, 356, 22, gold, "center");
  if (!dishes.length)
    text(
      "Здесь есть место для чего-нибудь вкусного.",
      600,
      480,
      27,
      muted,
      "center",
    );
  for (const b of blocks) {
    if (b.type === "category") {
      text(b.category.toUpperCase(), 95, b.y + 30, 27, sage);
      ctx.strokeStyle = rule;
      ctx.beginPath();
      ctx.moveTo(95, b.y + 45);
      ctx.lineTo(1100, b.y + 45);
      ctx.stroke();
      continue;
    }
    const { item } = b;
    const d = item.dish;
    b.title.forEach((line: string, i: number) =>
      text(line, 95, b.y + 40 + i * 43, 34),
    );
    text(`${item.portions} порций`, 1095, b.y + 37, 22, sage, "right");
    const kcal =
      d?.kcal !== "" && d?.kcal != null
        ? `${d.kcalEstimated ? "≈" : ""}${d.kcal} ккал / порц.`
        : "Калорийность не указана";
    text(kcal, 1095, b.y + 67, 18, muted, "right");
    let iy = b.y + 58 + b.title.length * 43;
    for (const ing of b.ingredients) {
      ing.name.forEach((line: string, i: number) =>
        text(line, 120, iy + i * 35, 23, muted),
      );
      text(ing.amount, 1085, iy, 23, ink, "right");
      iy += Math.max(1, ing.name.length) * 35;
    }
    ctx.strokeStyle = rule;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(95, b.y + b.h);
    ctx.lineTo(1100, b.y + b.h);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  text("С заботой, твоя полянка", 600, canvas.height - 75, 23, muted, "center");
  return canvas.toDataURL("image/png");
}
