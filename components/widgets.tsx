"use client";
import { useState } from "react";
import { Check, Pencil, X, Plus, ArrowRight, Cake } from "lucide-react";
import { nextBirthday, fmt } from "@/lib/data";
import { groupProducts } from "@/lib/products";
import { MediaJacket } from "./media-jacket";
export function Tasks({
  compact = false,
  data,
  mutate,
  quickTask,
  setQuickTask,
  addTask,
  open,
  remove,
}: any) {
  const [editingId, setEditingId] = useState("");
  const list = compact ? data.tasks.slice(0, 4) : data.tasks;
  return (
    <>
      <div className="task-list">
        {list.map((t: any) => (
          <div className={"task-row " + (t.done ? "done" : "")} key={t.id}>
            <button
              className="check"
              aria-label={t.done ? "Снять отметку" : "Выполнить дело"}
              aria-pressed={t.done}
              onClick={() =>
                mutate((d) => {
                  d.tasks.find((x: any) => x.id === t.id).done = !t.done;
                })
              }
            >
              {t.done && <Check size={13} />}
            </button>
            {editingId === t.id ? (
              <input
                className="inline-task-edit"
                aria-label="Текст дела"
                value={t.text}
                onChange={(e) =>
                  mutate((d) => {
                    d.tasks.find((x: any) => x.id === t.id).text =
                      e.target.value;
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") setEditingId("");
                }}
              />
            ) : (
              <span>{t.text}</span>
            )}
            <button
              className="icon-btn subtle"
              title={editingId === t.id ? "Готово" : "Редактировать дело"}
              onClick={() => setEditingId(editingId === t.id ? "" : t.id)}
            >
              {editingId === t.id ? <Check size={14} /> : <Pencil size={14} />}
            </button>
            {!compact && (
              <>
                <button
                  className="icon-btn subtle"
                  title="Удалить дело"
                  onClick={() => remove("tasks", t.id)}
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      {!data.tasks.length && (
        <p className="muted">Можно начать с одного небольшого дела.</p>
      )}
      <form className="quick-add" onSubmit={addTask}>
        <Plus size={15} />
        <input
          aria-label="Новое дело"
          placeholder="Добавить маленькое дело…"
          value={quickTask}
          onChange={(e) => setQuickTask(e.target.value)}
        />
        {quickTask && (
          <button type="submit" className="icon-btn" aria-label="Добавить">
            <ArrowRight size={16} />
          </button>
        )}
      </form>
    </>
  );
}
export function Shopping({
  compact = false,
  grouped = false,
  shopping,
  markBought,
  setShop,
  quickShop,
  setQuickShop,
  addShopping,
  remove,
}: any) {
  return (
    <>
      <div className="shopping-list">
        {(grouped
          ? groupProducts(shopping)
          : [{ name: "", items: compact ? shopping.slice(0, 4) : shopping }]
        ).map((group) => (
          <section className="shopping-product-group" key={group.name}>
            {group.name && <h3>{group.name}</h3>}
            {group.items.map((s: any) => (
              <div
                key={s.id}
                className={"shopping-row " + (s.done ? "done" : "")}
              >
                <button
                  className="check"
                  aria-label={
                    s.done ? "Снять отметку «Куплено»" : "Отметить «Куплено»"
                  }
                  aria-pressed={s.done}
                  onClick={() => markBought(s)}
                >
                  {s.done && <Check size={13} />}
                </button>
                <span className="grow">
                  {s.name}
                  <small>
                    {s.unit === "п.в."
                      ? "п.в."
                      : s.qty !== ""
                        ? fmt(s.qty) + " " + s.unit
                        : ""}
                  </small>
                </span>
                {s.done ? (
                  <span className="tiny muted">Куплено</span>
                ) : (
                  <button
                    className={"tag " + (s.have ? "selected" : "")}
                    onClick={() => setShop(s, "have", !s.have)}
                  >
                    {s.have ? "Есть дома" : "Уже есть?"}
                  </button>
                )}
                {!compact && !s.auto && (
                  <button
                    className="icon-btn"
                    title="Удалить продукт"
                    onClick={() => remove("shopping", s.id)}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
      {!shopping.length && (
        <p className="muted">Добавь продукты или составь меню.</p>
      )}
      <form className="quick-add" onSubmit={addShopping}>
        <Plus size={15} />
        <input
          aria-label="Добавить продукт"
          placeholder="Допиши что-нибудь…"
          value={quickShop}
          onChange={(e) => setQuickShop(e.target.value)}
        />
        {quickShop && (
          <button className="icon-btn" aria-label="Добавить продукт">
            <ArrowRight size={16} />
          </button>
        )}
      </form>
    </>
  );
}
export function ShelfObjects({ items, mini = false, open }: any) {
  return (
    <div className={"shelf-objects " + (mini ? "mini" : "")}>
      {items.map((m: any, i: number) => (
        <button
          key={m.id}
          className={
            "shelf-object media-jacket " +
            (m.type === "Книги"
              ? "book-spine"
              : m.type === "Игры"
                ? "game-case"
                : m.type === "Сериалы"
                  ? "series-case"
                  : m.type === "Мультфильмы"
                    ? "cartoon-case"
                    : "tape-case")
          }
          style={
            {
              "--object-color":
                m.color || ["#97a689", "#c3b18f", "#91a199", "#b6ba99"][i % 4],
              "--object-height":
                (m.type === "Книги"
                  ? 145 + (i % 3) * 13
                  : m.type === "Игры"
                    ? 115
                    : m.type === "Сериалы"
                      ? 150
                      : m.type === "Мультфильмы"
                        ? 127
                        : 137) + "px",
            } as any
          }
          title={`${m.title} · ${m.type}${m.rating ? " · " + m.rating + " из 5" : ""}`}
          data-category={m.type}
          onClick={() => open("mediaView", m)}
        >
          <MediaJacket item={m} />
        </button>
      ))}
    </div>
  );
}
export function BirthdayList({ compact = false, data, open }: any) {
  const items = [...data.birthdays].sort(
    (a: any, b: any) => nextBirthday(a) - nextBirthday(b),
  );
  return (
    <>
      {(compact ? items.slice(0, 2) : items).map((b: any) => (
        <button
          className="birthday-row"
          key={b.id}
          onClick={() => open("birthday", b)}
        >
          <div className="birthday-date">
            <strong>{new Date(b.date + "T12:00:00").getDate()}</strong>
            <span>
              {new Date(b.date + "T12:00:00")
                .toLocaleDateString("ru-RU", { month: "short" })
                .replace(".", "")}
            </span>
          </div>
          <span>
            <strong>{b.name}</strong>
            <small>
              {nextBirthday(b) === 0
                ? "Сегодня!"
                : `Через ${nextBirthday(b)} дн.`}
              {b.ideas ? " · есть идея подарка" : ""}
            </small>
          </span>
          <Cake size={19} />
        </button>
      ))}
      {!items.length && (
        <p className="muted">Сохрани важные даты — они появятся здесь.</p>
      )}
    </>
  );
}
