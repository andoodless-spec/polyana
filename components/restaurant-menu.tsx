"use client";
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  CheckCheck,
  Leaf,
} from "lucide-react";
import { fmt } from "@/lib/data";
import { ForestDetail } from "@/app/art";
import MenuIllustration from "./menu-illustration";
export default function RestaurantMenu({
  data,
  from,
  to,
  onOpen,
  onEdit,
  onDelete,
  onMove,
  onPrepare,
  onMenuImageChange,
}: any) {
  const items = data.menu.filter((m: any) => m.date >= from && m.date <= to),
    dates = [...new Set(items.map((m: any) => m.date))].sort() as string[];
  return (
    <section className="restaurant-menu">
      <div className="restaurant-frame">
        <header className="restaurant-heading">
          <MenuIllustration
            value={data.settings.menuImage}
            onChange={onMenuImageChange}
          />
          <span className="eyebrow">МАЛЕНЬКАЯ ДОМАШНЯЯ КУХНЯ</span>
          <h2>Меню полянки</h2>
          <p>Простое, любимое, приготовленное с заботой.</p>
          <span className="restaurant-ornament">✧ ─── ❧ ─── ✧</span>
        </header>
        {!items.length && (
          <div className="empty">
            <ForestDetail kind="mushroom" />
            <p>
              Сегодня можно придумать что-нибудь вкусное.
              <br />
              Добавь первое блюдо кнопкой «В меню».
            </p>
          </div>
        )}
        {dates.map((date) => (
          <section className="restaurant-day" key={date}>
            <h3>
              {new Date(date + "T12:00:00").toLocaleDateString("ru-RU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            {items
              .filter((m: any) => m.date === date)
              .map((m: any, i: number) => {
                const d = data.dishes.find((x: any) => x.id === m.dishId);
                return (
                  <article
                    className={
                      "restaurant-dish category-" +
                      (d?.category === "Суп"
                        ? "soup"
                        : d?.category === "Салат"
                          ? "salad"
                          : "main")
                    }
                    key={m.id}
                  >
                    <div className="restaurant-dish-top">
                      <span className="course-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="grow">
                        <span className="course-category">
                          {d?.category || "Блюдо в корзине"}
                        </span>
                        <button
                          className="restaurant-dish-name"
                          onClick={() => d && onOpen(d)}
                        >
                          {d?.title || "Блюдо удалено"}
                        </button>
                      </div>
                      <div className="course-calories">
                        {d?.kcal !== "" && d?.kcal != null ? (
                          <>
                            <strong>
                              {d.kcalEstimated ? "≈" : ""}
                              {d.kcal}
                            </strong>
                            <small>ккал / порц.</small>
                          </>
                        ) : (
                          <small>
                            Ккал
                            <br />
                            не указаны
                          </small>
                        )}
                      </div>
                    </div>
                    <ul className="restaurant-ingredients ingredient-column">
                      {d?.ingredients.map((ing: any, n: number) => (
                        <li key={n}>
                          <span>{ing.name}</span>
                          <i aria-hidden="true" />
                          <b>
                            {ing.qty !== ""
                              ? fmt(
                                  (Number(ing.qty) * Number(m.portions)) /
                                    Number(d.portions || 1),
                                ) +
                                " " +
                                ing.unit
                              : "не указано"}
                          </b>
                        </li>
                      ))}
                    </ul>
                    <footer className="restaurant-dish-footer">
                      <span>
                        <Leaf size={12} /> {m.portions} порц. · граммовки на всё
                        блюдо
                      </span>
                      <div className="row">
                        <button
                          className="icon-btn"
                          aria-label={"Переместить выше: " + d?.title}
                          onClick={() => onMove(m, -1)}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          aria-label={"Переместить ниже: " + d?.title}
                          onClick={() => onMove(m, 1)}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          className={"icon-btn " + (m.prepared ? "accent" : "")}
                          title={
                            m.prepared
                              ? "Уже приготовлено"
                              : "Приготовила — проверить списание запасов"
                          }
                          disabled={m.prepared}
                          onClick={() => onPrepare(m, d)}
                        >
                          <CheckCheck size={15} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Изменить день и порции"
                          onClick={() => onEdit(m)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Убрать из меню"
                          onClick={() => onDelete(m)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </footer>
                  </article>
                );
              })}
          </section>
        ))}
        <footer className="restaurant-signature">
          С заботой, твоя полянка <Leaf size={13} />
        </footer>
      </div>
    </section>
  );
}
