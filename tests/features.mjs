import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("test-artifacts", { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
let errors = [];
p.on("pageerror", (e) => {
  errors.push(e.message);
  console.error("BROWSER", e.message);
});
await p.goto("http://localhost:3000");
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
const nav = async (name) => {
  await p
    .locator(".mobile-nav")
    .getByRole("button", { name, exact: true })
    .click();
};
await nav("Дневник");
await expect(p.locator(".journal-paper")).toBeVisible();
await p.screenshot({
  path: "test-artifacts/v2-journal-mobile.png",
  fullPage: true,
});
const initialHeight = await p
  .locator(".journal-paper")
  .evaluate((e) => e.getBoundingClientRect().height);
await p.getByRole("button", { name: "Новая запись", exact: true }).click();
await expect(p.getByRole("dialog")).toHaveCount(0);
console.log(
  "active after new",
  await p.evaluate(() => document.activeElement.tagName),
);
await p.getByLabel("Заголовок записи", { exact: true }).fill("Длинная запись");
const text =
  "Тихая полянка. Не нужно торопиться, можно идти в своём темпе.\n\n".repeat(
    26,
  );
await p.getByLabel("Твои слова", { exact: true }).fill(text);
await p.getByRole("button", { name: "Режим чтения", exact: true }).click();
await expect
  .poll(async () =>
    JSON.parse(
      await p.evaluate(() => localStorage.getItem("polyanka-demo")),
    ).notes.some((n) => n.title === "Длинная запись" && n.text === text),
  )
  .toBe(true);
console.log(
  "height",
  initialHeight,
  await p
    .locator(".journal-paper")
    .evaluate((e) => e.getBoundingClientRect().height),
  "arrows",
  await p.locator(".journal-v2 .page-arrows").innerText(),
);
// Go to the beginning, then collect all pages belonging to this note.
while (
  !(await p
    .getByRole("button", { name: "Предыдущая страница", exact: true })
    .isDisabled())
)
  await p
    .getByRole("button", { name: "Предыдущая страница", exact: true })
    .click();
let combined = "",
  count = 0,
  sheets = [];
while (count < 100) {
  const title = await p.locator(".book-note-heading h2").innerText();
  if (title !== "Длинная запись") break;
  combined += await p
    .getByLabel("Текст страницы", { exact: true })
    .textContent();
  sheets.push(await p.locator(".stack-right i").count());
  const height = await p
    .locator(".journal-paper")
    .evaluate((e) => e.getBoundingClientRect().height);
  if (height !== initialHeight) throw Error("Book height changed");
  const overflow = await p.locator(".journal-workspace").evaluate((e) => {
    const t = e.querySelector(".journal-reading-text");
    return t && t.scrollHeight > t.clientHeight + 1;
  });
  if (overflow) throw Error("Visible text overflow");
  count++;
  if (
    await p
      .getByRole("button", { name: "Следующая страница", exact: true })
      .isDisabled()
  )
    break;
  await p
    .getByRole("button", { name: "Следующая страница", exact: true })
    .click();
}
console.log(
  "note pages",
  count,
  "preserved",
  combined === text,
  "stack counts",
  [...new Set(sheets)],
);
if (combined !== text) throw Error("Note text lost in pagination");
await p.getByRole("button", { name: "Список дел", exact: true }).click();
await p
  .getByRole("button", { name: "Редактировать дело", exact: true })
  .first()
  .click();
await expect(p.getByRole("dialog")).toHaveCount(0);
await p.getByLabel("Текст дела", { exact: true }).fill("Дело без окна");
await p.getByLabel("Текст дела", { exact: true }).press("Enter");
await expect(p.getByText("Дело без окна", { exact: true })).toBeVisible();
await p.getByRole("button", { name: "Дни рождения", exact: true }).click();
await p.getByRole("button", { name: "Добавить день рождения" }).click();
await expect(p.getByRole("dialog")).toHaveCount(0);
await p.getByLabel("Имя", { exact: true }).fill("Лесная подруга");
await p.getByLabel("Дата рождения", { exact: true }).fill("2000-12-20");
await p.getByRole("button", { name: "Сохранить", exact: true }).click();
const dl = p.waitForEvent("download");
await p.getByRole("button", { name: "Все дни рождения в календарь" }).click();
console.log("calendar", (await dl).suggestedFilename());
await nav("Кухонька");
console.log("tabs", await p.locator(".kitchen-main-tabs").innerText());
await expect(p.locator(".restaurant-menu")).toBeVisible();
await expect(p.locator(".restaurant-ingredients").first()).toContainText("400");
await p.screenshot({
  path: "test-artifacts/v2-menu-mobile.png",
  fullPage: true,
});
await p.getByRole("button", { name: "Мои блюда", exact: true }).click();
await expect(p.locator(".sub-tabs button").first()).toHaveText(
  "Разобрать текст",
);
await p.getByRole("button", { name: "Подсказка и промпт для разбора" }).click();
await expect(p.getByLabel("Промпт для ИИ")).toContainText(
  "ПОЛНУЮ последнюю согласованную подборку",
);
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await p
  .getByLabel("Текст рецептов")
  .fill(
    "Название: Первый суп\nКатегория: Суп\nПорции: 2\nКкал на порцию: 120\nИнгредиенты:\nМорковь | 200 | г\nПриготовление:\nВарить.\nПримечания:\nБез соли.\nНазвание: Второй салат\nКатегория: Салат\nПорции: 1\nИнгредиенты:\nСыр | 50 | г\nПриготовление:\nСмешать.",
  );
await p
  .getByRole("button", { name: "Разобрать текст", exact: true })
  .last()
  .click();
await expect(p.locator(".parsed-recipe")).toHaveCount(2);
await p.getByLabel("Я проверила данные подборки").check();
await p.getByRole("button", { name: "Сохранить всю подборку" }).click();
await expect(
  p.getByRole("button", { name: "Первый суп", exact: true }),
).toBeVisible();
await expect(
  p.getByRole("textbox", { name: "Поиск по продуктам" }),
).toHaveCount(0);
await p.getByRole("button", { name: "Поиск блюд и фильтры" }).click();
console.log(
  "active after search",
  await p.evaluate(() => document.activeElement.tagName),
);
await p.getByLabel("Поиск по продуктам").fill("сыр");
await expect(
  p.getByRole("button", { name: "Второй салат", exact: true }),
).toBeVisible();
await nav("Полка");
await expect(p.locator(".section-tabs")).toHaveCount(0);
await expect(p.getByLabel("Поиск по полке")).toHaveCount(0);
await p.getByRole("button", { name: "Поиск и фильтры полки" }).click();
await p.getByLabel("Категория на полке").selectOption("Книги");
await expect(p.locator(".shelf-object:not(.book-spine)")).toHaveCount(0);
await p.screenshot({
  path: "test-artifacts/v2-shelf-mobile.png",
  fullPage: true,
});
await p.getByRole("button", { name: "Настройки", exact: true }).click();
await p.getByRole("button", { name: "Тихий лес", exact: true }).click();
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await nav("Дневник");
await p.screenshot({ path: "test-artifacts/v2-night.png", fullPage: true });
await p.setViewportSize({ width: 320, height: 740 });
for (const name of ["Мой уголок", "Дневник", "Кухонька", "Полка"]) {
  await nav(name);
  if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error("Overflow at320 " + name);
}
console.log("Errors", errors);
await b.close();
if (errors.length) process.exit(1);
