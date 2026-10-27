import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("test-artifacts", { recursive: true });
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:3000");
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await p.addInitScript(() => {
  const d = JSON.parse(localStorage.getItem("polyanka-demo"));
  d.settings.mode = "day";
  d.media = ["Книги", "Фильмы", "Мультфильмы", "Сериалы", "Игры"].map(
    (type, i) => ({
      id: "jacket" + i,
      type,
      title: [
        "Тихие страницы",
        "Лесная история",
        "Маленький цветок",
        "Дом у озера",
        "Зелёная долина",
      ][i],
      status: "process",
      rating: 0,
      color: ["#97a689", "#8f9e96", "#baa67f", "#89917d", "#96a1a1"][i],
      review: "",
      recommend: "unknown",
      again: "unknown",
    }),
  );
  d.fridge = ["Молоко", "Сыр", "Яйца", "Чай", "Морковь", "Яблоки"].map(
    (name, i) => ({ id: "stock" + i, name, qty: i + 1, unit: "шт" }),
  );
  d.menu = [];
  d.dishes = [];
  d.shopping = [];
  d.trash = [];
  localStorage.setItem("polyanka-demo", JSON.stringify(d));
});
await p.reload();
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
const nav = async (name) =>
  p
    .locator((await p.viewportSize()).width > 800 ? ".sidebar" : ".mobile-nav")
    .getByRole("button", { name, exact: true })
    .click();
const shot = async (name) =>
  p.screenshot({ path: "test-artifacts/v3-" + name + ".png", fullPage: true });
const overflow = async (label) => {
  if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error("Horizontal overflow: " + label);
};
await expect(p.locator(".shelf-objects.mini .media-jacket")).toHaveCount(5);
await shot("home-desktop");
await nav("Полка");
for (const cls of [
  "book-spine",
  "tape-case",
  "cartoon-case",
  "series-case",
  "game-case",
])
  await expect(p.locator(".shelf-objects .media-jacket." + cls)).toHaveCount(1);
await expect(p.locator(".jacket-guide")).toHaveCount(0);
await shot("shelf-desktop");
await p
  .getByRole("button", { name: "Информация о полке", exact: true })
  .click();
await expect(p.locator(".jacket-guide .media-jacket")).toHaveCount(5);
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await p.locator(".media-jacket.game-case").click();
await expect(p.getByRole("dialog")).toContainText("Зелёная долина");
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await nav("Кухонька");
await p.getByRole("button", { name: "Покупки", exact: true }).click();
await p.getByRole("button", { name: "Что есть дома", exact: true }).click();
await expect(p.locator(".fridge-product")).toHaveCount(6);
await shot("fridge-desktop");
await p
  .locator(".fridge-product-tools")
  .getByRole("button", { name: "Изменить запас: Молоко", exact: true })
  .click();
await p.getByRole("dialog").getByLabel("Количество").fill("8");
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Сохранить запас", exact: true })
  .click();
await expect(
  p.locator(".fridge-product").filter({ hasText: "Молоко" }),
).toContainText("8 шт");
await p.getByRole("button", { name: "Закончилось: Чай", exact: true }).click();
await expect(p.locator(".fridge-product")).toHaveCount(5);
await p.getByRole("button", { name: "Мои блюда", exact: true }).click();
const text =
  "Название: Морковный суп\nКатегория: Суп\nПорции: 2\nКкал на порцию: 120\nКкал приблизительно: да\nВ меню:\n2026-11-02 | 3\n2026-11-04 | 2\nИнгредиенты:\nМорковь | 200 | г\nВода | 1 | л\nПриготовление:\nВарить двадцать минут.\nПримечания:\nСогласованная замена.";
const parse = async (t) => {
  await p.getByRole("button", { name: "Мои блюда", exact: true }).click();
  await p
    .getByRole("button", { name: "Разобрать текст", exact: true })
    .first()
    .click();
  await p.getByLabel("Текст рецептов").fill(t);
  await p
    .getByRole("button", { name: "Разобрать текст", exact: true })
    .last()
    .click();
};
const save = async () => {
  await p.getByLabel("Я проверила данные подборки").check();
  await p
    .getByRole("button", { name: "Сохранить всю подборку", exact: true })
    .click();
};
await parse(text.replace("2026-11-04 | 2", "2026-02-30 | 2"));
await expect(p.locator(".import-warning")).toContainText("2026-02-30");
await save();
await expect(p.locator(".parsed-recipe")).toHaveCount(1);
await p
  .getByLabel("Даты меню рецепта 1")
  .fill("2026-11-02 | 3\n2026-11-04 | 2");
await expect(p.getByLabel("Я проверила данные подборки")).not.toBeChecked();
await expect(
  p.getByLabel("Заменить существующее меню на эти даты"),
).not.toBeChecked();
await save();
await expect(p.locator(".restaurant-menu")).toBeVisible();
await expect(p.locator(".ingredient-column").first()).toContainText("300 г");
const menuDishCard = p.locator(".restaurant-dish").first();
await expect(menuDishCard).not.toHaveClass(/recipe-flipped/);
await menuDishCard.getByRole("button", { name: "Как приготовить" }).click();
await expect(menuDishCard).toHaveClass(/recipe-flipped/);
await expect(menuDishCard.locator(".restaurant-dish-back")).toContainText(
  "Варить двадцать минут",
);
await menuDishCard.getByRole("button", { name: "Вернуться к блюду" }).click();
await expect(menuDishCard).not.toHaveClass(/recipe-flipped/);
await expect(p.locator(".restaurant-menu")).toContainText("≈120");
await shot("menu-desktop");
const download = p.waitForEvent("download");
await p.getByRole("button", { name: "В PNG", exact: true }).click();
await (await download).saveAs("test-artifacts/v3-menu-export.png");
const state = () =>
  p.evaluate(() => JSON.parse(localStorage.getItem("polyanka-demo")));
await expect.poll(async () => (await state()).menu.length).toBe(2);
await parse(text);
await save();
await expect.poll(async () => (await state()).menu.length).toBe(2);
await expect.poll(async () => (await state()).dishes.length).toBe(1);
// Replacement affects only explicitly supplied dates; old entries are recoverable.
await parse(text.replace("2026-11-04 | 2", "2026-11-06 | 2"));
await p.getByLabel("Заменить существующее меню на эти даты").check();
await expect(p.getByLabel("Я проверила данные подборки")).not.toBeChecked();
await save();
await expect.poll(async () => (await state()).menu.length).toBe(3);
const saved = await state();
if (
  !saved.menu.some((m) => m.date === "2026-11-04") ||
  saved.trash.filter((t) => t.collection === "menu").length !== 1
)
  throw Error("Replacement scope/trash failed");
if (
  saved.dishes[0].notes !== "Согласованная замена." ||
  !saved.dishes[0].source ||
  !saved.dishes[0].sourceHistory.includes(text)
)
  throw Error("Source/notes lost");
await p.getByRole("button", { name: "Покупки", exact: true }).click();
await expect(p.locator(".shopping-sheet")).toBeVisible();
await expect(p.locator(".shopping-sheet")).toContainText("Морковь");
await shot("shopping-desktop");
const shopDownload = p.waitForEvent("download");
await p.getByRole("button", { name: "В PNG", exact: true }).click();
await (await shopDownload).saveAs("test-artifacts/v3-shopping-export.png");
await p.setViewportSize({ width: 320, height: 740 });
await overflow("shopping320");
await shot("shopping-320");
await p.getByRole("button", { name: "Что есть дома", exact: true }).click();
await overflow("fridge320");
await shot("fridge-320");
await nav("Полка");
await overflow("shelf320");
await shot("shelf-320");
await p
  .getByRole("button", { name: "Информация о полке", exact: true })
  .click();
await overflow("shelf-help320");
await shot("shelf-help-320");
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await p.getByRole("button", { name: "Настройки", exact: true }).click();
await p.getByRole("button", { name: "Тихий лес", exact: true }).click();
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await nav("Кухонька");
await p.getByRole("button", { name: "Покупки", exact: true }).click();
await p.getByRole("button", { name: "Что есть дома", exact: true }).click();
await shot("fridge-night-320");
await overflow("night-fridge320");
console.log(
  "Revision UI: real jackets/home/help, fridge editing/removal, dated import review/error/reset, duplicate reuse, safe replacement/trash, vertical scaled ingredients, menu/shopping PNG, mobile320 and night passed. Errors:",
  errors,
);
await browser.close();
if (errors.length) process.exit(1);
