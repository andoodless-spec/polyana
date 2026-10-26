"use client";
import { useRef, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { ForestDetail } from "@/app/art";
import { menuImage, readMenuImage } from "@/lib/menu-image";
export default function MenuIllustration({
  value,
  onChange,
}: {
  value?: string;
  onChange: (image: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [failed, setFailed] = useState("");
  const src = menuImage(value);
  async function choose(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const image = await readMenuImage(file);
      setFailed("");
      onChange(image);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не получилось загрузить картинку.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="menu-illustration">
      {src && src !== failed ? (
        <img
          className="menu-custom-image"
          src={src}
          alt="Картинка меню"
          onError={() => setFailed(src)}
        />
      ) : (
        <ForestDetail kind="flowers" />
      )}
      <div className="menu-art-controls" aria-label="Оформление меню">
        <button
          type="button"
          className="menu-art-button"
          disabled={busy}
          onClick={() => input.current?.click()}
          title="PNG, JPEG, WebP, GIF или AVIF до 8 МБ. Картинка автоматически уменьшается и сохраняется вместе с меню."
        >
          <ImagePlus size={13} />
          {busy
            ? "Загружаем…"
            : src
              ? "Заменить картинку меню"
              : "Своя картинка меню"}
        </button>
        {src && (
          <button
            type="button"
            className="menu-art-button"
            disabled={busy}
            onClick={() => {
              onChange("");
              setError("");
              setFailed("");
            }}
          >
            <RotateCcw size={12} />
            Вернуть стандартную
          </button>
        )}
        <input
          ref={input}
          className="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          aria-label="Загрузить картинку меню"
          disabled={busy}
          onChange={(e) => void choose(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p className="menu-art-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
