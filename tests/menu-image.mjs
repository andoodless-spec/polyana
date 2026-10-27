import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:3000");
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await expect(p).toHaveTitle("полянка — место, где можно быть собой");
await expect(p.locator(".brand")).toHaveText("полянка.");
const nav = async () =>
  p
    .locator(".sidebar")
    .getByRole("button", { name: "Кухонька", exact: true })
    .click();
await nav();
const dish = p.locator(".restaurant-dish").first();
await expect(dish).toBeVisible();
await expect(dish.locator(".recipe-flip-trigger").first()).toHaveText(
  "Как приготовить",
);
await dish.getByRole("button", { name: "Как приготовить" }).click();
await expect(dish).toHaveClass(/recipe-flipped/);
await expect(dish.locator(".restaurant-dish-back")).toContainText("Нарезать");
await dish.getByRole("button", { name: "Вернуться к блюду" }).click();
await expect(dish).not.toHaveClass(/recipe-flipped/);
await expect(p.locator(".menu-illustration svg")).toBeVisible();
await expect(p.locator(".menu-art-controls input[type=file]")).toHaveCount(0);
await expect(p.getByLabel("Промпт для ИИ")).toHaveCount(0);
const beforeIcon = await p
  .locator('link[data-polyanka-favicon="true"]')
  .getAttribute("href");
await p.getByRole("button", { name: "Настройки", exact: true }).click();
await expect(p.locator(".art-picker-faviconArt button")).toHaveCount(4);
await expect(p.locator(".art-picker-headerArt button")).toHaveCount(4);
await expect(p.locator(".art-picker-menuArt button")).toHaveCount(4);
await expect(p.locator(".art-picker-shoppingArt button")).toHaveCount(4);
await p.locator(".art-picker-menuArt button").nth(2).click();
await p.locator(".art-picker-headerArt button").nth(1).click();
await p.locator(".art-picker-shoppingArt button").nth(2).click();
await p.locator(".art-picker-faviconArt button").nth(2).click();
await expect(
  p.locator('link[data-polyanka-favicon="true"]'),
).not.toHaveAttribute("href", beforeIcon);
await expect
  .poll(() =>
    p.evaluate(
      () => JSON.parse(localStorage.getItem("polyanka-demo")).settings.menuArt,
    ),
  )
  .toBe("teapot");
await expect
  .poll(() =>
    p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("polyanka-demo")).settings.headerArt,
    ),
  )
  .toBe("garden");
await expect
  .poll(() =>
    p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("polyanka-demo")).settings.shoppingArt,
    ),
  )
  .toBe("apple");
await expect
  .poll(() =>
    p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("polyanka-demo")).settings.faviconArt,
    ),
  )
  .toBe("mushroom");
await p.getByRole("button", { name: "Закрыть", exact: true }).click();
await p.getByRole("button", { name: "Мои блюда", exact: true }).click();
await expect(p.locator(".sub-tabs button").first()).toHaveText(
  "Разобрать текст",
);
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
  "Menu card flip, return, built-in 4-choice art galleries, persistent preferences, dynamic favicon, no custom uploads/prompt panel, p.v. parsing and 320px layout passed. Errors:",
  errors,
);
await browser.close();
if (errors.length) process.exit(1);
