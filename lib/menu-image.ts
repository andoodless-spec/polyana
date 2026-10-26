// Menu artwork is embedded in state/JSON backups: no external image URLs or services.
export function menuImage(value: unknown): string {
  return typeof value === "string" &&
    value.length <= 600_000 &&
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)
    ? value
    : "";
}
function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => {
      image.onload = image.onerror = null;
      image.src = "";
      reject(Error("Изображение не открылось. Попробуй другой файл."));
    }, 10_000);
    image.onload = () => {
      clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(Error("Изображение не открылось. Попробуй PNG, JPEG или WebP."));
    };
    image.src = src;
  });
}
export async function readMenuImage(file: File): Promise<string> {
  if (
    ![
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/avif",
    ].includes(file.type)
  )
    throw Error(
      "Выбери PNG, JPEG, WebP, GIF или AVIF. GIF сохранится как неподвижная картинка.",
    );
  if (file.size > 8_000_000)
    throw Error("Для картинки меню выбери файл меньше 8 МБ.");
  const url = URL.createObjectURL(file);
  try {
    const image = await decodeImage(url);
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 40_000_000
    )
      throw Error("Картинка слишком большая. Уменьши её и попробуй снова.");
    const scale = Math.min(
      1,
      640 / image.naturalWidth,
      400 / image.naturalHeight,
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Не получилось обработать картинку в этом браузере.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL("image/webp", 0.84);
    if (!menuImage(result))
      throw Error("Не получилось уменьшить картинку. Попробуй другой файл.");
    return result;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function loadMenuImage(
  value: unknown,
): Promise<HTMLImageElement | null> {
  const src = menuImage(value);
  if (!src) return null;
  try {
    return await decodeImage(src);
  } catch {
    return null;
  }
}
