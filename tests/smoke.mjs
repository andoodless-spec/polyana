import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("test-artifacts", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1024 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://localhost:3000");
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
const nav = async (name) => {
  await p
    .locator(".sidebar")
    .getByRole("button", { name, exact: true })
    .click();
};
await p.screenshot({
  path: "test-artifacts/v2-home-desktop.png",
  fullPage: true,
});
// Home task editing stays inline and does not open any dialog or focus an input.
await p
  .getByRole("button", { name: "Редактировать дело", exact: true })
  .first()
  .click();
await expect(p.getByRole("dialog")).toHaveCount(0);
await expect(p.getByLabel("Текст дела", { exact: true })).toBeVisible();
if (
  await p.evaluate(() =>
    ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName),
  )
)
  throw Error("Task editor focused automatically");
await p.getByLabel("Текст дела", { exact: true }).fill("Тихая прогулка");
await p.getByLabel("Текст дела", { exact: true }).press("Enter");
await p.getByRole("button", { name: "Записать мысль", exact: true }).click();
await expect(p.getByRole("dialog")).toHaveCount(0);
await p.getByLabel("Заголовок записи").fill("Проверочная мысль");
await p.getByLabel("Твои слова").fill("Мои слова сохраняются.");
await p.getByRole("button", { name: "Режим чтения", exact: true }).click();
await expect(
  p.getByRole("heading", { name: "Проверочная мысль" }),
).toBeVisible();
await p
  .getByRole("button", { name: "Маленькие трудности", exact: true })
  .click();
await expect(p.getByRole("button", { name: "Открыть вкладку" })).toBeVisible();
await p.getByRole("button", { name: "Открыть вкладку" }).click();
await p.getByRole("button", { name: "Новая запись", exact: true }).click();
await p.getByLabel("Заголовок записи").fill("Закрытое наблюдение");
await p.getByLabel("Твои слова").fill("Отдельное состояние");
await p.getByRole("button", { name: "Режим чтения" }).click();
await nav("Мой уголок");
await expect(p.getByText("Закрытое наблюдение", { exact: true })).toHaveCount(
  0,
);
await nav("Дневник");
await p
  .getByRole("button", { name: "Маленькие трудности", exact: true })
  .click();
await expect(p.getByRole("button", { name: "Открыть вкладку" })).toBeVisible();
await p.getByRole("button", { name: "Мысли", exact: true }).click();
await p.getByRole("button", { name: "Поиск", exact: true }).click();
if (
  await p.evaluate(() =>
    ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName),
  )
)
  throw Error("Search focused automatically");
await p.getByLabel("Поиск по дневнику").fill("Проверочная");
await expect(
  p.getByRole("button", { name: /Проверочная мысль/ }),
).toBeVisible();
await p.getByLabel("Поиск по дневнику").fill("Закрытое");
await expect(
  p.getByRole("button", { name: /Закрытое наблюдение/ }),
).toHaveCount(0);
await nav("Кухонька");
await p.screenshot({
  path: "test-artifacts/v2-menu-desktop.png",
  fullPage: true,
});
const dl = p.waitForEvent("download");
await p.getByRole("button", { name: "В PNG", exact: true }).click();
const png = await dl;
await png.saveAs("test-artifacts/menu-export.png");
await p.getByRole("button", { name: "Мои блюда", exact: true }).click();
await p.getByRole("button", { name: "Коллекция", exact: true }).click();
await p.getByRole("button", { name: "Поиск блюд и фильтры" }).click();
await p.getByLabel("Поиск по продуктам").fill("сыр");
await expect(p.locator(".dish-card")).toHaveCount(2);
await p.getByRole("button", { name: "Поиск блюд и фильтры" }).click();
await expect(p.getByLabel("Поиск по продуктам")).toHaveCount(0);
await expect(p.locator(".dish-card")).toHaveCount(2);
await p.getByRole("button", { name: "Сбросить", exact: true }).click();
await expect(p.locator(".dish-card")).toHaveCount(3);
await p.getByRole("button", { name: "Покупки", exact: true }).click();
await p.getByRole("button", { name: "Отметить «Куплено»" }).first().click();
await expect(
  p.getByRole("button", { name: "Снять отметку «Куплено»" }),
).toHaveCount(1);
await p.reload();
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await nav("Кухонька");
await p.getByRole("button", { name: "Покупки", exact: true }).click();
await expect(
  p.getByRole("button", { name: "Снять отметку «Куплено»" }),
).toHaveCount(1);
await p.getByRole("button", { name: "Что есть дома", exact: true }).click();
await expect(p.getByText("Тыква", { exact: true })).toBeVisible();
await nav("Полка");
await expect(p.locator(".section-tabs")).toHaveCount(0);
await p.screenshot({
  path: "test-artifacts/v2-shelf-desktop.png",
  fullPage: true,
});
await p.getByRole("button", { name: "Поиск и фильтры полки" }).click();
await p.getByLabel("Категория на полке").selectOption("Книги");
await expect(p.locator(".shelf-object:not(.book-spine)")).toHaveCount(0);
// All three night palettes must genuinely differ.
await p.getByRole("button", { name: "Настройки", exact: true }).click();
await p.getByRole("button", { name: "Тихий лес", exact: true }).click();
const palettes = [];
for (const theme of ["Шалфей", "Мох", "Овёс"]) {
  await p.getByRole("button", { name: theme, exact: true }).click();
  palettes.push(
    await p.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--paper"),
    ),
  );
}
if (new Set(palettes).size !== 3) throw Error("Night palettes are identical");
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await nav("Дневник");
await p.screenshot({
  path: "test-artifacts/v2-oat-night-desktop.png",
  fullPage: true,
});
console.log(
  "Smoke: inline edits, locked privacy, search, purchases, PNG, night palettes passed. Errors:",
  errors,
);
await b.close();
if (errors.length) process.exit(1);
