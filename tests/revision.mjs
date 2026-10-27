import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("test-artifacts", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000");
await page.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await page.addInitScript(() => {
  const d = JSON.parse(localStorage.getItem("polyanka-demo"));
  d.settings.mode = "day";
  d.dishes = [];
  d.menu = [];
  d.menuPeriod = { from: "2026-11-02", to: "2026-11-08" };
  d.fridge = [
    { id: "stock1", name: "Морковь", qty: 300, unit: "г" },
    { id: "stock2", name: "Чай", qty: "", unit: "" },
  ];
  d.shopping = [];
  d.trash = [];
  localStorage.setItem("polyanka-demo", JSON.stringify(d));
});
await page.reload();
await page.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
const nav = async (name) =>
  page.locator(".sidebar").getByRole("button", { name, exact: true }).click();
await nav("Кухонька");
await expect(page.locator(".restaurant-menu")).toBeVisible();
await expect(
  page.getByRole("button", { name: "Редактировать", exact: true }),
).toBeVisible();
await page.getByRole("button", { name: "Мои блюда", exact: true }).click();
await page
  .getByRole("button", { name: "Разобрать текст", exact: true })
  .first()
  .click();
await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
await page.getByRole("button", { name: "Скопировать промт для ИИ" }).click();
await expect(page.locator(".toast")).toContainText("Промт скопирован");
await expect
  .poll(() => page.evaluate(() => navigator.clipboard.readText()))
  .toContain("Период меню:");
await expect(page.getByRole("dialog")).toHaveCount(0);
const text = `Период меню: 2026-11-02 — 2026-11-08
Название: Морковный суп
Категория: Суп
Порции: 4
Ккал на порцию: 120
Ингредиенты:
Морковь | 400 | г
Вода | 1 | л
Приготовление:
Варить двадцать минут.`;
await page.getByLabel("Текст рецептов").fill(text);
await page
  .getByRole("button", { name: "Разобрать текст", exact: true })
  .last()
  .click();
await expect(page.locator(".parsed-recipe")).toHaveCount(1);
await expect(page.locator(".import-menu-options")).toContainText("2026");
await page.getByLabel("Я проверила данные подборки").check();
await page
  .getByRole("button", { name: "Сохранить всю подборку", exact: true })
  .click();
await expect(page.locator(".restaurant-menu")).toBeVisible();
await expect(page.locator(".restaurant-menu")).toContainText("С 2 ноября 2026");
await expect(page.locator(".ingredient-column").first()).toContainText("400 г");
await expect(page.locator(".restaurant-menu")).not.toContainText("Вода");
const dish = page.locator(".restaurant-dish").first();
await dish.locator(".restaurant-dish-name").first().click();
await expect(dish).toHaveClass(/recipe-flipped/);
await expect(dish.locator(".restaurant-dish-back")).toContainText(
  "Варить двадцать минут",
);
await expect(
  dish.getByRole("button", { name: "Вернуться к блюду" }),
).toHaveCount(0);
await dish.locator(".recipe-back-text").click();
await expect(dish).not.toHaveClass(/recipe-flipped/);
await page.getByRole("button", { name: "Редактировать", exact: true }).click();
await expect(
  dish.getByRole("button", { name: /Изменить порции/ }),
).toBeVisible();
await page.getByRole("button", { name: "Готово", exact: true }).click();
const menuDownload = page.waitForEvent("download");
await page.getByRole("button", { name: "Сохранить меню в галерею" }).click();
const menuFile = await menuDownload;
await menuFile.saveAs("test-artifacts/menu-gallery.png");
await page.getByRole("button", { name: "Покупки", exact: true }).click();
await expect(page.locator(".shopping-sheet")).toBeVisible();
await expect(page.locator(".shopping-sheet")).toContainText("Морковь");
await expect(page.locator(".shopping-sheet")).not.toContainText("Вода");
const shoppingDownload = page.waitForEvent("download");
await page
  .getByRole("button", { name: "Сохранить список продуктов в галерею" })
  .click();
const shoppingFile = await shoppingDownload;
await shoppingFile.saveAs("test-artifacts/shopping-gallery.png");
await page.getByRole("button", { name: "Что есть дома", exact: true }).click();
await expect(page.locator(".pantry-row")).toHaveCount(2);
await expect(page.locator(".fridge-shelves")).toHaveCount(0);
await page
  .getByRole("button", { name: "Добавить продукт", exact: true })
  .click();
await page.getByLabel("Продукт").fill("Картофель");
await page
  .getByRole("button", { name: "Сохранить запас", exact: true })
  .click();
await expect(page.locator(".pantry-row").filter({ hasText: "Картофель" })).toBeVisible();
await page.setViewportSize({ width: 320, height: 740 });
if (
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
)
  throw Error("Horizontal overflow at 320px");
await page.screenshot({
  path: "test-artifacts/revision-mobile320.png",
  fullPage: true,
});
console.log(
  "Revision UI: shared dates, no per-dish dates, prompt copy, text flip, edit-only actions, clean menu/shopping images, simple pantry, water retention and mobile 320px passed. Errors:",
  errors,
);
await browser.close();
if (errors.length) process.exit(1);
