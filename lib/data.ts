import { parseMenuSchedule } from "./menu-schedule";
export const today = () => new Date().toLocaleDateString("en-CA");
export const uid = () => crypto.randomUUID();
export const tabs = [
  { id: "home", name: "Мой уголок", icon: "home" },
  { id: "diary", name: "Дневник", icon: "book" },
  { id: "kitchen", name: "Кухонька", icon: "pot" },
  { id: "shelf", name: "Полка", icon: "shelf" },
];
export const categories = [
  "Суп",
  "Горячее",
  "Салат",
  "Фастфуд",
  "Завтрак",
  "Выпечка",
  "Другое",
];
export const mediaTypes = ["Книги", "Фильмы", "Мультфильмы", "Сериалы", "Игры"];
export const blocks = ["notes", "tasks", "kitchen", "progress", "birthdays"];
export const blockNames: any = {
  notes: "Бережно сохранённое",
  tasks: "Небольшие дела",
  kitchen: "Кухонька",
  progress: "В процессе",
  birthdays: "Скоро праздник",
};
export function emptyData() {
  return {
    schema: 1,
    notes: [],
    tasks: [],
    birthdays: [],
    dishes: [],
    menu: [],
    shopping: [],
    fridge: [],
    media: [],
    ideas: [],
    trash: [],
    settings: {
      theme: "sage",
      mode: "day",
      dishView: "text",
      menuImage: "",
      headerArt: "meadow",
      menuArt: "flowers",
      shoppingArt: "fern",
      faviconArt: "leaf",
      nav: ["home", "diary", "kitchen", "shelf"],
      blocks: [...blocks],
      hidden: [],
      lockTroubles: true,
      reduceMotion: false,
    },
  } as any;
}
export function demoData() {
  const d = emptyData();
  const day = today();
  d.notes = [
    {
      id: "n1",
      title: "Не обязательно всё успевать",
      text: "Можно двигаться в своём темпе. Сегодня хочется оставить немного места для простых вещей: тёплого чая, прогулки и хорошей истории.",
      date: day,
      kind: "thoughts",
      pinned: true,
    },
    {
      id: "n2",
      title: "Маленькое хорошее",
      text: "Запомнить это чувство, когда утро начинается без спешки. Открытое окно, тихая музыка и никаких больших планов.",
      date: day,
      kind: "thoughts",
      pinned: true,
    },
  ];
  d.tasks = [
    { id: "t1", text: "Немного прогуляться", done: false },
    { id: "t2", text: "Полить цветы", done: true },
    { id: "t3", text: "Выбрать что-нибудь на вечер", done: false },
  ];
  d.dishes = [
    {
      id: "d1",
      title: "Крем-суп из тыквы",
      category: "Суп",
      portions: 2,
      kcal: 230,
      ingredients: [
        { name: "Тыква", qty: 400, unit: "г" },
        { name: "Сливки", qty: 100, unit: "мл" },
        { name: "Лук", qty: 1, unit: "шт" },
      ],
      recipe:
        "Нарезать овощи, отварить до мягкости. Добавить сливки и измельчить блендером.",
      liked: true,
    },
    {
      id: "d2",
      title: "Паста с сыром и зеленью",
      category: "Горячее",
      portions: 2,
      kcal: 420,
      ingredients: [
        { name: "Макароны", qty: 160, unit: "г" },
        { name: "Пармезан", qty: 60, unit: "г" },
        { name: "Зелень", qty: 10, unit: "г" },
      ],
      recipe:
        "Отварить пасту. Смешать с тёртым сыром, зеленью и небольшим количеством воды от варки.",
      liked: true,
    },
    {
      id: "d3",
      title: "Салат с моцареллой",
      category: "Салат",
      portions: 2,
      kcal: 210,
      ingredients: [
        { name: "Помидоры", qty: 250, unit: "г" },
        { name: "Моцарелла", qty: 125, unit: "г" },
      ],
      recipe: "Нарезать помидоры и моцареллу, смешать. Заправить по вкусу.",
      liked: true,
    },
  ];
  d.menu = [
    { id: "m1", date: day, dishId: "d1", portions: 2 },
    { id: "m2", date: day, dishId: "d3", portions: 2 },
  ];
  d.shopping = [
    { id: "s1", name: "Хлеб", qty: 1, unit: "шт", done: false },
    { id: "s2", name: "Яблоки", qty: 500, unit: "г", done: false },
  ];
  d.fridge = [
    { id: "f1", name: "Тыква", qty: 500, unit: "г" },
    { id: "f2", name: "Чай", qty: "", unit: "" },
  ];
  let b = new Date();
  b.setDate(b.getDate() + 5);
  d.birthdays = [
    {
      id: "b1",
      name: "Саша",
      date: b.toLocaleDateString("en-CA"),
      remind: 7,
      ideas: "Красивая чашка и хороший чай",
    },
  ];
  d.media = [
    {
      id: "v1",
      title: "Ходячий замок",
      type: "Мультфильмы",
      status: "process",
      rating: 0,
      review: "",
      recommend: "unknown",
      again: "unknown",
      progress: "Продолжить уютным вечером",
      color: "#96a381",
    },
    {
      id: "v2",
      title: "Маленький принц",
      type: "Книги",
      status: "process",
      rating: 0,
      review: "",
      recommend: "unknown",
      again: "unknown",
      progress: "На середине книги",
      color: "#c3ae84",
    },
    {
      id: "v3",
      title: "Stardew Valley",
      type: "Игры",
      status: "process",
      rating: 0,
      review: "",
      recommend: "unknown",
      again: "unknown",
      progress: "Первое лето на ферме",
      color: "#8c9d8c",
    },
    {
      id: "v4",
      title: "Мой сосед Тоторо",
      type: "Мультфильмы",
      status: "done",
      rating: 5,
      review:
        "Очень тёплая история. Хочется сохранить это ощущение спокойствия.",
      recommend: "yes",
      again: "yes",
      color: "#8c9d78",
    },
  ];
  return d;
}
export function normalize(s: string) {
  return s.toLowerCase().replaceAll("ё", "е").trim();
}
export function ingredientMatch(name: string, query: string) {
  const n = normalize(name),
    q = normalize(query);
  return (
    n.includes(q) ||
    (q === "сыр" &&
      [
        "пармезан",
        "моцарелла",
        "чеддер",
        "гауда",
        "фета",
        "сулугуни",
        "брынза",
      ].some((x) => n.includes(x)))
  );
}
export function parseIngredients(text: string) {
  return text
    .split("\n")
    .filter((x) => x.trim())
    .map((raw) => {
      const line = raw
        .trim()
        .replace(/^[-*•]\s*/, "")
        .replace(/^\|+|\|+$/g, "")
        .replace(/\*\*/g, "")
        .replace(/__/g, "");
      const parts = line.split("|").map((x) => x.trim());
      if (parts.length >= 2) {
        const amount = (parts[1] || "").toLowerCase();
        const unit = (parts[2] || "").toLowerCase();
        const byTaste =
          ["п.в.", "пв", "по вкусу"].includes(amount) ||
          ["п.в.", "пв", "по вкусу"].includes(unit);
        return {
          name: parts[0],
          qty:
            byTaste ||
            parts[1] === "" ||
            isNaN(Number(parts[1].replace(",", ".")))
              ? ""
              : Number(parts[1].replace(",", ".")),
          unit: byTaste ? "п.в." : parts[2] || "",
        };
      }
      const m = line.match(/^(.+?)\s*[—–:]\s*(\d+(?:[.,]\d+)?)\s*(.*)$/);
      return m
        ? {
            name: m[1].trim(),
            qty: Number(m[2].replace(",", ".")),
            unit: m[3].trim(),
          }
        : { name: line.trim(), qty: "", unit: "" };
    });
}
export function parseRecipes(text: string) {
  const normalized = text.replace(/\r\n?/g, "\n");
  const chunks = normalized
    .split(
      /\n\s*---+\s*\n|\n(?=\s*(?:[-*]\s*)?(?:\*\*)?Название(?:\*\*)?:\s*)/i,
    )
    .filter((s) =>
      /^\s*(?:[-*]\s*)?(?:\*\*)?Название(?:\*\*)?:/i.test(s.trim()),
    );
  return chunks.map((source) => {
    const lines = source.trim().split("\n"),
      first = lines.shift() || "";
    const d: any = {
      title: first
        .replace(/^\s*(?:[-*]\s*)?(?:\*\*)?Название(?:\*\*)?:\s*/i, "")
        .replace(/\*\*/g, "")
        .trim(),
      category: "Другое",
      portions: "",
      kcal: "",
      ingredients: [],
      recipe: "",
      notes: "",
      schedule: [],
      scheduleErrors: [],
      kcalEstimated: false,
      source,
      liked: false,
    };
    let section = "notes";
    const ing: string[] = [];
    const plan: string[] = [];
    for (const rawLine of lines) {
      const line = rawLine
        .trim()
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/^[-*•]\s*/, "");
      if (/^Итоговая стоимость покупок(?:\s+ориентировочно)?\s*:/i.test(line)) {
        section = "summary";
        continue;
      }
      if (section === "summary") continue;
      let m;
      if ((m = line.match(/^Категория:\s*(.*)$/i))) {
        const c = m[1].trim();
        d.category = categories.includes(c) ? c : "Другое";
        if (c && !categories.includes(c))
          d.notes += "\nКатегория из исходника: " + c;
        section = "notes";
      } else if ((m = line.match(/^Порци[ияй]:\s*(.*)$/i))) {
        const n = Number(m[1].trim().replace(",", "."));
        d.portions = m[1].trim() && Number.isFinite(n) && n > 0 ? n : "";
        section = "notes";
      } else if (
        (m = line.match(/^(?:Ккал на порцию|Калорийность):\s*(.*)$/i))
      ) {
        const val = m[1].trim(),
          n = Number(val.replace(",", "."));
        d.kcal = val && Number.isFinite(n) && n >= 0 ? n : "";
        if (val && d.kcal === "")
          d.notes += "\nКалорийность из исходника: " + val;
        section = "notes";
      } else if ((m = line.match(/^Ккал приблизительно:\s*(.*)$/i))) {
        d.kcalEstimated = /^(да|yes|true)$/i.test(m[1].trim());
        section = "notes";
      } else if (
        (m = line.match(/^(?:В меню|Даты меню|Расписание меню):\s*(.*)$/i))
      ) {
        section = "schedule";
        if (m[1]) plan.push(m[1]);
      } else if ((m = line.match(/^Ингредиенты:\s*(.*)$/i))) {
        section = "ingredients";
        if (m[1]) ing.push(m[1]);
      } else if ((m = line.match(/^(?:Приготовление|Рецепт):\s*(.*)$/i))) {
        section = "recipe";
        if (m[1]) d.recipe += m[1] + "\n";
      } else if ((m = line.match(/^Примечания:\s*(.*)$/i))) {
        section = "notes";
        if (m[1]) d.notes += "\n" + m[1];
      } else if (section === "schedule") plan.push(line);
      else if (section === "ingredients")
        ing.push(line.replace(/^[-•]\s*/, ""));
      else if (section === "recipe") d.recipe += line + "\n";
      else d.notes += "\n" + line;
    }
    Object.assign(d, parseMenuSchedule(plan.join("\n")));
    d.scheduleText = plan.join("\n").trim();
    d.ingredients = parseIngredients(ing.join("\n"));
    d.recipe = d.recipe.trim();
    d.notes = d.notes.trim();
    return d;
  });
}
export function shoppingFor(data: any, from: string, to: string) {
  const map = new Map<string, any>();
  for (const m of data.menu.filter(
    (x: any) => x.date >= from && x.date <= to,
  )) {
    const d = data.dishes.find((x: any) => x.id === m.dishId);
    if (!d) continue;
    for (const ing of d.ingredients) {
      let unit = normalize(ing.unit || "");
      let qty =
        ing.qty === ""
          ? ""
          : (Number(ing.qty) * Number(m.portions)) / Number(d.portions || 1);
      if (unit === "кг") {
        unit = "г";
        if (qty !== "") qty = Number(qty) * 1000;
      }
      if (unit === "л") {
        unit = "мл";
        if (qty !== "") qty = Number(qty) * 1000;
      }
      const key = normalize(ing.name) + "|" + unit;
      if (map.has(key) && qty !== "" && map.get(key).qty !== "")
        map.get(key).qty += qty;
      else if (!map.has(key))
        map.set(key, {
          id: "auto:" + key,
          name: ing.name,
          qty,
          unit,
          auto: true,
          done: !!data.shopping.find((x: any) => x.id === "auto:" + key)?.done,
          have:
            data.shopping.find((x: any) => x.id === "auto:" + key)?.have ??
            data.fridge.some(
              (x: any) =>
                normalize(x.name) === normalize(ing.name) &&
                (x.qty === "" || Number(x.qty) > 0),
            ),
        });
    }
  }
  return [
    ...map.values(),
    ...data.shopping.filter((x: any) => !x.id.startsWith("auto:")),
  ];
}
export function validBackup(d: any) {
  return (
    d &&
    d.schema === 1 &&
    [
      "notes",
      "tasks",
      "birthdays",
      "dishes",
      "menu",
      "shopping",
      "fridge",
      "media",
      "ideas",
      "trash",
    ].every((k) => Array.isArray(d[k])) &&
    d.settings &&
    Array.isArray(d.settings.blocks) &&
    Array.isArray(d.settings.nav) &&
    Array.isArray(d.settings.hidden) &&
    d.dishes.every(
      (x: any) => Array.isArray(x.ingredients) && Number(x.portions) > 0,
    ) &&
    d.notes.every(
      (x: any) => typeof x.text === "string" && typeof x.date === "string",
    )
  );
}

export const fmt = (x: any) =>
  x === "" ? "" : Math.round(Number(x) * 10) / 10;
export const nextBirthday = (b: any) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const [_, m, d] = b.date.split("-").map(Number);
  const n = new Date(now.getFullYear(), m - 1, d);
  if (n < now) n.setFullYear(n.getFullYear() + 1);
  return Math.round((+n - +now) / 86400000);
};
