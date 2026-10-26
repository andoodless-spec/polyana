import { chromium, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
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
    .locator((await p.viewportSize()).width > 800 ? ".sidebar" : ".mobile-nav")
    .getByRole("button", { name: "Кухонька", exact: true })
    .click();
await nav();
await expect(
  p.getByRole("button", { name: "Своя картинка меню", exact: true }),
).toBeVisible();
const artwork = async (color) =>
  Buffer.from(
    await p.evaluate((color) => {
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 800;
      const ctx = c.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, c.width, c.height);
      return c.toDataURL("image/png").split(",")[1];
    }, color),
    "base64",
  );
await p
  .getByLabel("Загрузить картинку меню", { exact: true })
  .setInputFiles({
    name: "art.png",
    mimeType: "image/png",
    buffer: await artwork("#628b8c"),
  });
await expect(
  p.getByRole("img", { name: "Картинка меню", exact: true }),
).toBeVisible();
await expect
  .poll(async () =>
    p.evaluate(() =>
      JSON.parse(
        localStorage.getItem("polyanka-demo"),
      ).settings.menuImage?.startsWith("data:image/webp;base64,"),
    ),
  )
  .toBe(true);
const stored = await p.evaluate(
  () => JSON.parse(localStorage.getItem("polyanka-demo")).settings.menuImage,
);
const dimensions = await p
  .getByRole("img", { name: "Картинка меню", exact: true })
  .evaluate((e) => [e.naturalWidth, e.naturalHeight]);
if (dimensions[0] > 640 || dimensions[1] > 400)
  throw Error("Artwork not resized");
await p.reload();
await p.getByRole("heading", { name: "Мой уголок", exact: false }).waitFor();
await nav();
await expect(
  p.getByRole("img", { name: "Картинка меню", exact: true }),
).toHaveAttribute("src", stored);
// Invalid, oversized and unreadable files must not replace the current artwork.
for (const file of [
  {
    name: "not-image.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  },
  { name: "broken.png", mimeType: "image/png", buffer: Buffer.from("broken") },
  {
    name: "too-large.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(8_000_001),
  },
]) {
  await p
    .getByLabel("Загрузить картинку меню", { exact: true })
    .setInputFiles(file);
  await expect(p.locator(".menu-art-error")).toBeVisible();
  await expect(
    p.getByRole("img", { name: "Картинка меню", exact: true }),
  ).toHaveAttribute("src", stored);
}
await p
  .getByLabel("Загрузить картинку меню", { exact: true })
  .setInputFiles({
    name: "replacement.png",
    mimeType: "image/png",
    buffer: await artwork("#8c9c70"),
  });
await expect(
  p.getByRole("img", { name: "Картинка меню", exact: true }),
).not.toHaveAttribute("src", stored);
await expect(p.locator(".menu-art-error")).toHaveCount(0);
const dl = p.waitForEvent("download");
await p.getByRole("button", { name: "В PNG", exact: true }).click();
await (await dl).saveAs("test-artifacts/v3-custom-menu-export.png");
const png = readFileSync("test-artifacts/v3-custom-menu-export.png").toString(
  "base64",
);
const pixel = await p.evaluate(async (base64) => {
  const image = new Image();
  image.src = "data:image/png;base64," + base64;
  await image.decode();
  const c = document.createElement("canvas");
  c.width = image.width;
  c.height = image.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(image, 0, 0);
  return [...ctx.getImageData(600, 100, 1, 1).data];
}, png);
if (
  Math.abs(pixel[0] - 140) > 8 ||
  Math.abs(pixel[1] - 156) > 8 ||
  Math.abs(pixel[2] - 112) > 8
)
  throw Error("Custom artwork missing in PNG: " + pixel);
await p.setViewportSize({ width: 320, height: 740 });
if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  throw Error("Artwork overflow320");
await p
  .getByRole("button", { name: "Вернуть стандартную", exact: true })
  .click();
await expect(
  p.getByRole("img", { name: "Картинка меню", exact: true }),
).toHaveCount(0);
await expect(p.locator(".menu-illustration .forest-detail")).toBeVisible();
await expect
  .poll(async () =>
    p.evaluate(
      () =>
        JSON.parse(localStorage.getItem("polyanka-demo")).settings.menuImage,
    ),
  )
  .toBe("");
await p.getByRole("button", { name: "Мои блюда", exact: true }).click();
await p.getByRole("button", { name: "Подсказка и промпт для разбора" }).click();
await expect(p.getByLabel("Промпт для ИИ")).toContainText("«полянка»");
console.log(
  "Menu artwork: lowercase brand/title/prompt, upload/compression, persistence, replace, invalid/oversized/unreadable handling, custom PNG pixel,320px and reset passed. Errors:",
  errors,
);
await browser.close();
if (errors.length) process.exit(1);
