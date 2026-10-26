// Frontend sync contract test with mocked API. This does NOT test a real Neon connection.
import { chromium, expect } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
let stored = null,
  v = 0,
  puts = 0,
  conflict = false;
await p.route("**/api/auth", (r) =>
  r.fulfill({
    json: {
      configured: true,
      user: { id: "test-user", email: "test@example.test" },
    },
  }),
);
await p.route("**/api/state", async (r) => {
  if (r.request().method() === "GET")
    return r.fulfill({ json: { data: stored, version: v } });
  const body = r.request().postDataJSON();
  puts++;
  if (conflict || body.version !== v)
    return r.fulfill({ status: 409, json: { error: "Конфликт версий" } });
  stored = body.data;
  v++;
  return r.fulfill({ json: { version: v } });
});
await p.goto("http://localhost:3000");
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await p.getByLabel("Новое дело", { exact: true }).fill("Облачная задача");
await p.getByLabel("Новое дело", { exact: true }).press("Enter");
await expect.poll(() => stored?.tasks.length).toBe(1);
if (stored.tasks[0].text !== "Облачная задача") throw Error("No task in cloud");
// A cloud change on another device prevents blind overwrites.
conflict = true;
v++;
stored.tasks.push({ id: "remote", text: "С другого устройства", done: false });
await p.getByLabel("Новое дело", { exact: true }).fill("Несохранённая задача");
await p.getByLabel("Новое дело", { exact: true }).press("Enter");
await expect.poll(() => puts).toBe(2);
await expect
  .poll(
    async () =>
      JSON.parse(
        await p.evaluate(() =>
          localStorage.getItem("polyanka-account-test-user"),
        ),
      )?.pending,
  )
  .toBe(true);
const before = puts;
await p.reload();
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await expect(
  p.getByText("Несохранённая задача", { exact: true }),
).toBeVisible();
await p.getByRole("button", { name: "Настройки", exact: true }).click();
await p.getByRole("button", { name: "Аккаунт и данные" }).click();
await expect(
  p.getByRole("button", { name: "2. Загрузить облачную версию" }),
).toBeVisible();
if (puts !== before) throw Error("Conflict auto-overwrote cloud on reload");
p.on("dialog", (d) => d.accept());
conflict = false;
await p.getByRole("button", { name: "2. Загрузить облачную версию" }).click();
await p
  .getByRole("dialog")
  .getByRole("button", { name: "Закрыть", exact: true })
  .click();
await expect(
  p.getByText("С другого устройства", { exact: true }),
).toBeVisible();
await expect(p.getByText("Несохранённая задача", { exact: true })).toHaveCount(
  0,
);
console.log(
  "Mocked sync: save, pending recovery, conflict protection, cloud reload passed",
);
await b.close();
