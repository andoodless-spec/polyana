"use client";
import { Shopping } from "./widgets";
import { CuratedArt } from "@/components/curated-art";
import { Leaf } from "lucide-react";
export default function ShoppingSheet({
  shoppingProps,
  from,
  to,
  onClear,
  artwork = "fern",
}: any) {
  const items = shoppingProps.shopping,
    remaining = items.filter((s: any) => !s.done && !s.have).length;
  const label = (s: string) =>
    new Date(s + "T12:00:00").toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
  return (
    <section className="restaurant-menu shopping-sheet">
      <div className="restaurant-frame">
        <header className="restaurant-heading">
          <CuratedArt
            slot="shoppingArt"
            value={artwork}
            className="curated-small-art"
          />
          <span className="eyebrow">ДЛЯ МАЛЕНЬКОЙ ДОМАШНЕЙ КУХНИ</span>
          <h2>За продуктами</h2>
          <p>
            {label(from)}
            {to > from ? " — " + label(to) : ""}
          </p>
          <span className="restaurant-ornament">✧ ─── ❧ ─── ✧</span>
        </header>
        <div className="shopping-sheet-summary">
          <span>
            <b>{remaining}</b> осталось купить
          </span>
          <span>
            <b>{items.filter((s: any) => s.done).length}</b> куплено
          </span>
          <span>
            <b>{items.filter((s: any) => s.have && !s.done).length}</b> есть
            дома
          </span>
        </div>
        <Shopping {...shoppingProps} grouped />
        <button className="text-link shopping-clear" onClick={onClear}>
          Убрать купленное / сбросить отметки
        </button>
        <footer className="restaurant-signature">
          Всё нужное — в одном листочке <Leaf size={13} />
        </footer>
      </div>
    </section>
  );
}
