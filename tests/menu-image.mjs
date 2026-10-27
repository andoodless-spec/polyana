import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:3000");
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await expect(p).toHaveTitle("полянка — место, где можно быть собой");
await expect(p.locator(".brand")).toHaveText("полянка.");
await expect(p.locator(".welcome .meadow")).toHaveAttribute(
  "aria-label",
  "Тихая пиксельная полянка с домиком, деревьями и цветами",
);
const nav = async () =>
  p
    .locator(".sidebar")
    .getByRole("button", { name: "Кухонька", exact: true })
    .click();
await nav();
const dish = p.locator(".restaurant-dish").first();
await expect(dish).toBeVisible();
await dish.locator(".restaurant-dish-name").first().click();
await expect(dish).toHaveClass(/recipe-flipped/);
await expect(dish.locator(".restaurant-dish-back")).toContainText("Нарезать");
await dish.locator(".recipe-back-text").click();
await expect(dish).not.toHaveClass(/recipe-flipped/);
await expect(p.locator(".menu-illustration svg")).toBeVisible();
await expect(p.locator(".menu-art-controls input[type=file]")).toHaveCount(0);
const beforeIcon = await p
  .locator('link[data-polyanka-favicon="true"]')
  .getAttribute("href");
await p.getByRole("button", { name: "Настройки", exact: true }).click();
await expect(p.locator(".art-picker")).toHaveCount(0);
await p.getByRole("button", { name: "Закрыть", exact: true }).click();
await p.getByRole("button", { name: "Мои блюда", exact: true }).click();
await expect(p.locator(".sub-tabs button").first()).toHaveText(
  "Разобрать текст",
);
await p.context().grantPermissions(["clipboard-read", "clipboard-write"]);
await p.getByRole("button", { name: "Скопировать промт для ИИ" }).click();
await expect(p.locator(".toast")).toContainText("Промт скопирован");
await expect
  .poll(() => p.evaluate(() => navigator.clipboard.readText()))
  .toContain("Период меню:");
await p.getByRole("button", { name: "Коллекция", exact: true }).click();
const collectionCard = p.locator(".recipe-collection-card").first();
await collectionCard.getByRole("button", { name: "Крем-суп из тыквы" }).click();
await expect(collectionCard).toHaveClass(/recipe-collection-flipped/);
await expect(collectionCard.locator(".collection-recipe-back")).toHaveAttribute(
  "aria-hidden",
  "false",
);
await expect(collectionCard.locator(".collection-recipe-back")).toContainText(
  "Нарезать овощи",
);
await collectionCard.locator(".collection-recipe-text").click();
await expect(collectionCard).not.toHaveClass(/recipe-collection-flipped/);
await p.getByRole("button", { name: "Разобрать текст", exact: true }).click();
await p
  .getByLabel("Текст рецептов")
  .fill(
    "Название: Рис\nКатегория: Горячее\nПорции: 2\nКкал на порцию: 200\nИнгредиенты:\nРис | 100 | г\nПаприка | п.в. |\nПриготовление:\nСварить.",
  );
await p
  .getByRole("button", { name: "Разобрать текст", exact: true })
  .last()
  .click();
await expect(p.locator(".parsed-recipe")).toHaveCount(1);
await expect(p.locator(".parsed-recipe")).toContainText("п.в.");
await p.setViewportSize({ width: 320, height: 740 });
if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  throw Error("Artwork or settings overflow 320px");
console.log(
  "Menu and collection text-driven flips, prompt copying, fixed built-in art, persistent preferences, fixed favicon, no custom uploads, p.v. parsing and 320px layout passed. Errors:",
  errors,
);
await browser.close();
if (errors.length) process.exit(1);
