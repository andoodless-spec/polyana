"use client";
import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  CheckCheck,
  Leaf,
} from "lucide-react";
import { fmt } from "@/lib/data";
import MenuIllustration from "./menu-illustration";

const categoryOrder = [
  "Салат",
  "Суп",
  "Горячее",
  "Закуска",
  "Фастфуд",
  "Завтрак",
  "Выпечка",
  "Другое",
];

export default function RestaurantMenu({
  data,
  from,
  to,
  onEdit,
  onDelete,
  onMove,
  onPrepare,
  editing = false,
}: any) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const items = data.menu
    .map((m: any, order: number) => ({
      ...m,
      dish: data.dishes.find((d: any) => d.id === m.dishId),
      order,
    }))
    .sort((a: any, b: any) => {
      const ca = categoryOrder.indexOf(a.dish?.category || "Другое");
      const cb = categoryOrder.indexOf(b.dish?.category || "Другое");
      return (ca < 0 ? 99 : ca) - (cb < 0 ? 99 : cb) || a.order - b.order;
    });
  const sections = categoryOrder
    .map((category) => ({
      category,
      items: items.filter(
        (m: any) => (m.dish?.category || "Другое") === category,
      ),
    }))
    .filter((group) => group.items.length);
  const toggle = (id: string) =>
    setFlipped((old) => ({ ...old, [id]: !old[id] }));

  return (
    <section className="restaurant-menu">
      <div className="restaurant-frame">
        <header className="restaurant-heading">
          <MenuIllustration />
          <span className="eyebrow">МАЛЕНЬКАЯ ДОМАШНЯЯ КУХНЯ</span>
          <h2>Меню полянки</h2>
          <p>
            {from && to
              ? `С ${new Date(from + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })} по ${new Date(to + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`
              : "Простое, любимое, приготовленное с заботой."}
          </p>
          <span className="restaurant-ornament">✧ ─── ❧ ─── ✧</span>
        </header>
        {!items.length ? (
          <div className="empty">
            <p>Меню пока пустое. Добавь блюда кнопкой «Редактировать» ниже.</p>
          </div>
        ) : (
          sections.map(({ category, items: group }) => (
            <section className="restaurant-day" key={category}>
              <h3>{category}</h3>
              {group.map((m: any, index: number) => {
                const d = m.dish;
                return (
                  <article
                    className={`restaurant-dish ${flipped[m.id] ? "recipe-flipped" : ""} category-${category === "Суп" ? "soup" : category === "Салат" ? "salad" : "main"}`}
                    key={m.id}
                  >
                    <div className="restaurant-dish-flip-inner">
                      <div
                        className="restaurant-dish-front"
                        aria-hidden={!!flipped[m.id]}
                      >
                        <div className="restaurant-dish-top">
                          <span className="course-number">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="grow">
                            <span className="course-category">
                              {d?.category || "Блюдо"}
                            </span>
                            <button
                              className="restaurant-dish-name"
                              onClick={() => toggle(m.id)}
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
                              <small>Ккал не указаны</small>
                            )}
                          </div>
                        </div>
                        {d && (
                          <ul className="restaurant-ingredients ingredient-column">
                            {(d.ingredients || [])
                              .filter(
                                (i: any) =>
                                  !/^(вода|питьевая вода|водопроводная вода)$/i.test(
                                    i.name.trim(),
                                  ),
                              )
                              .map((ing: any, n: number) => (
                                <li key={n}>
                                  <span>{ing.name}</span>
                                  <i aria-hidden="true" />
                                  <b>
                                    {ing.unit === "п.в."
                                      ? "п.в."
                                      : ing.qty !== ""
                                        ? `${fmt((Number(ing.qty) * Number(m.portions)) / Number(d.portions || 1))} ${ing.unit}`
                                        : "не указано"}
                                  </b>
                                </li>
                              ))}
                          </ul>
                        )}
                        <footer className="restaurant-dish-footer">
                          <span>
                            <Leaf size={12} /> {m.portions} порций на выбранный
                            период
                          </span>
                          {editing && (
                            <div className="row">
                              <button
                                className="icon-btn"
                                aria-label={`Выше: ${d?.title}`}
                                onClick={() => onMove(m, -1)}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                className="icon-btn"
                                aria-label={`Ниже: ${d?.title}`}
                                onClick={() => onMove(m, 1)}
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                className={`icon-btn ${m.prepared ? "accent" : ""}`}
                                aria-label={`Отметить приготовленным: ${d?.title}`}
                                disabled={m.prepared}
                                onClick={() => onPrepare(m, d)}
                              >
                                <CheckCheck size={15} />
                              </button>
                              <button
                                className="icon-btn"
                                aria-label={`Изменить порции: ${d?.title}`}
                                onClick={() => onEdit(m)}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="icon-btn"
                                aria-label={`Убрать из меню: ${d?.title}`}
                                onClick={() => onDelete(m)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </footer>
                      </div>
                      <div
                        className="restaurant-dish-back"
                        aria-hidden={!flipped[m.id]}
                      >
                        <span className="course-category">
                          СПОСОБ ПРИГОТОВЛЕНИЯ
                        </span>
                        <button
                          className="restaurant-dish-name recipe-back-title"
                          onClick={() => toggle(m.id)}
                        >
                          {d?.title || "Рецепт"}
                        </button>
                        <button
                          className="recipe-back-text"
                          onClick={() => toggle(m.id)}
                        >
                          {d?.recipe?.trim() ||
                            "Способ приготовления пока не добавлен."}
                          {d?.notes ? `\n\n${d.notes}` : ""}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ))
        )}
        <footer className="restaurant-signature">
          С заботой, твоя полянка <Leaf size={13} />
        </footer>
      </div>
    </section>
  );
}
