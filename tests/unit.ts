import assert from "node:assert/strict";
import {
  parseRecipes,
  parseIngredients,
  shoppingFor,
  emptyData,
  ingredientMatch,
} from "../lib/data";
import { calendarText } from "../lib/calendar";
import { parseMenuSchedule, validMenuDate } from "../lib/menu-schedule";
import { productKind } from "../lib/products";
const r = parseRecipes(
  "Название: Суп\nКатегория: Суп\nПорции:\nКкал на порцию:\nИнгредиенты:\nВода | 1 | л\nПриготовление:\nВарить.\nПримечания:\nСвой текст.\nНазвание: Салат\nПорции: 2\nИнгредиенты:\nСыр | 30 | г",
);
assert.equal(r.length, 2);
assert.equal(r[0].portions, "");
assert.equal(r[0].kcal, "");
assert.equal(r[0].notes, "Свой текст.");
assert.equal(r[0].recipe, "Варить.");
assert.equal(r[1].ingredients[0].name, "Сыр");
assert(ingredientMatch("Пармезан", "сыр"));
assert(!ingredientMatch("Творог", "сыр"));
const d = emptyData();
d.dishes = [
  {
    id: "a",
    portions: 2,
    ingredients: [{ name: "Молоко", qty: 1, unit: "л" }],
  },
  {
    id: "b",
    portions: 1,
    ingredients: [{ name: "Молоко", qty: 300, unit: "мл" }],
  },
];
d.menu = [
  { id: "m1", date: "2026-10-26", dishId: "a", portions: 1 },
  { id: "m2", date: "2026-10-26", dishId: "b", portions: 1 },
];
const shopping = shoppingFor(d, "2026-10-26", "2026-10-26");
assert.equal(shopping[0].qty, 800);
assert.equal(shopping[0].unit, "мл");

const ics = calendarText([
  {
    id: "b1",
    name: "Маша, подруга",
    date: "2000-12-20",
    remind: 7,
    ideas: "Чай; книга",
  },
]);
assert(ics.includes("RRULE:FREQ=YEARLY"));
assert(ics.includes("TRIGGER:-P7D"));
assert(ics.includes("Маша\\, подруга"));
assert(!ics.includes("undefined"));
console.log(
  "Unit: recipe batches, missing values, notes, product groups, quantities, ICS passed",
);

// Period-based menu imports: validation precedes all changes, safe defaults,
// content deduplication, explicit date-scoped replacement and retained sources.
import { applyRecipeImport } from "../lib/recipe-import";
assert(validMenuDate("2028-02-29"));
for (const date of ["2026-02-29", "2026-04-31", "2026-13-01", "26-11-02"])
  assert(!validMenuDate(date));
const schedule = parseMenuSchedule(
  "2026-11-02 | 1.5\n2026-11-02 | 1,5\n2026-11-03 | 0\n2026-11-04 | Infinity\n2026-02-30 | 2\n2026-11-05 | 1001\n2026-11-06 | 2 | extra",
);
assert.deepEqual(schedule.schedule, [{ date: "2026-11-02", portions: 1.5 }]);
assert.equal(schedule.scheduleErrors.length, 5);
const textPlan =
  "Название: Тестовый суп\nКатегория: Суп\nПорции: 2\nКкал на порцию: 120\nКкал приблизительно: да\nВ меню:\n2026-11-02 | 3\n2026-11-04 | 2\nИнгредиенты:\nМорковь | 200 | г\nПриготовление:\nВарить.\nПримечания:\nСвой комментарий.";
const plan = parseRecipes(textPlan);
assert.equal(plan[0].kcalEstimated, true);
assert.equal(plan[0].schedule.length, 2);
assert.equal(plan[0].recipe, "Варить.");
assert.equal(plan[0].notes, "Свой комментарий.");
assert.equal(plan[0].source, textPlan);
let counter = 0;
const ids = () => "test" + ++counter;
const target = emptyData();
target.menu = [
  { id: "old", date: "2026-11-02", dishId: "old-dish", portions: 1 },
  { id: "outside", date: "2026-12-01", dishId: "old-dish", portions: 1 },
];
const options = { addToMenu: true, replaceDates: false };
const first = applyRecipeImport(target, plan, options, ids);
assert.equal(first.created, 1);
assert.equal(first.added, 2);
assert.equal(first.removed, 0);
assert.equal(target.menu.length, 4);
assert.equal(target.trash.length, 0);
const again = applyRecipeImport(target, plan, options, ids);
assert.equal(again.created, 0);
assert.equal(again.reused, 1);
assert.equal(again.added, 0);
assert.equal(target.dishes.length, 1);
const replacement = applyRecipeImport(
  target,
  plan,
  { ...options, replaceDates: true },
  ids,
);
assert.equal(replacement.removed, 3);
assert.equal(target.menu.length, 3);
assert.equal(target.menu[0].id, "outside");
assert.equal(target.trash.length, 3);
assert.equal(target.trash[0].collection, "menu");
const before = JSON.stringify(target);
for (const patch of [
  { scheduleText: "2026-02-30 | 2" },
  { portions: Infinity },
  { portions: "" },
  { kcal: -3 },
  { ingredients: [{ name: "Морковь", qty: -1, unit: "г" }] },
]) {
  assert.throws(() =>
    applyRecipeImport(
      target,
      [plan[0], { ...plan[0], ...patch }],
      { ...options, replaceDates: true },
      ids,
    ),
  );
  assert.equal(JSON.stringify(target), before);
}
const nextPlan = parseRecipes(
  textPlan.replace("2026-11-04 | 2", "2026-11-06 | 2"),
);
applyRecipeImport(target, nextPlan, options, ids);
assert.equal(target.dishes.length, 1);
assert.equal(target.dishes[0].source, textPlan);
assert.deepEqual(target.dishes[0].sourceHistory, [nextPlan[0].source]);
const recipesOnly = emptyData();
applyRecipeImport(
  recipesOnly,
  plan,
  { addToMenu: false, replaceDates: true },
  ids,
);
assert.equal(recipesOnly.menu.length, 0);
assert.equal(recipesOnly.dishes.length, 1);
const noDates = parseRecipes(
  textPlan.replace(/В меню:\n.*?Ингредиенты:/s, "Ингредиенты:"),
);
assert.equal(noDates[0].schedule.length, 0);
assert.equal(noDates[0].ingredients[0].qty, 200);
console.log(
  "Unit: dated plans, real dates, fractional portions, atomic validation, deduplication, explicit replacement and sources passed",
);

import { menuImage } from "../lib/menu-image";
assert.equal(menuImage(undefined), "");
assert.equal(menuImage("https://example.com/image.png"), "");
assert.equal(menuImage("data:image/svg+xml;base64,PHN2Zz4="), "");
assert.equal(
  menuImage("data:image/webp;base64,UklGRg=="),
  "data:image/webp;base64,UklGRg==",
);
assert.equal(menuImage("data:image/png;base64," + "A".repeat(600000)), "");

const taste = parseIngredients(
  "Паприка | п.в. |\n**Горчица** | п.в. |\nУксус | 5 | мл",
);
assert.equal(taste[0].qty, "");
assert.equal(taste[0].unit, "п.в.");
assert.equal(taste[1].unit, "п.в.");
assert.equal(taste[2].qty, 5);
const markdownMenu = parseRecipes(`**Название:** Курица с рисом
**Категория:** Горячее
**Порции:** 2
**Ккал на порцию:** 430
**В меню:**
- 2026-11-02 | 2
2026-11-05 — 2 порции
**Ингредиенты:**
- Курица | 300 | г
- Рис | 100 | г
- Паприка | п.в. |
**Приготовление:**
Запечь.
Итоговая стоимость покупок ориентировочно: 18 €`);
assert.equal(markdownMenu.length, 1);
assert.equal(markdownMenu[0].title, "Курица с рисом");
assert.equal(markdownMenu[0].ingredients[2].unit, "п.в.");
assert.deepEqual(markdownMenu[0].schedule, [
  { date: "2026-11-02", portions: 2 },
  { date: "2026-11-05", portions: 2 },
]);
assert.equal(markdownMenu[0].scheduleErrors.length, 0);
assert(!markdownMenu[0].notes.includes("Итоговая стоимость"));

const tasteShopping = emptyData();
tasteShopping.dishes = [
  {
    id: "taste",
    portions: 2,
    ingredients: [{ name: "Паприка", qty: "", unit: "п.в." }],
  },
];
tasteShopping.menu = [
  { id: "taste-menu", date: "2026-11-02", dishId: "taste", portions: 3 },
];
const tasteList = shoppingFor(tasteShopping, "2026-11-02", "2026-11-02");
assert.equal(tasteList[0].qty, "");
assert.equal(tasteList[0].unit, "п.в.");
for (const [product, kind] of [
  ["Курица", "meat"],
  ["Лосось", "fish"],
  ["Хлеб", "bread"],
  ["Грибы", "mushroom"],
  ["Фасоль", "grains"],
  ["Мята", "herbs"],
]) {
  assert.equal(productKind(product), kind);
}

const scheduleVariants = parseMenuSchedule(
  `2026-12-01 | 2\n- 2026-12-02 — 3 порции\n01.12.2026 | 2,5`,
);
assert.deepEqual(scheduleVariants.schedule, [
  { date: "2026-12-01", portions: 2 },
  { date: "2026-12-02", portions: 3 },
  { date: "2026-12-01", portions: 2.5 },
]);
assert.equal(scheduleVariants.scheduleErrors.length, 0);
assert.equal(parseMenuSchedule("следующий вторник | 2").schedule.length, 0);
assert.equal(
  parseMenuSchedule("следующий вторник | 2").scheduleErrors.length,
  1,
);
