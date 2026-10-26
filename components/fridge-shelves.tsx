"use client";
import { Pencil, X, Plus, Leaf } from "lucide-react";
import { ProductArt } from "./product-art";
import { productKind } from "@/lib/products";
import { fmt } from "@/lib/data";
export default function FridgeShelves({ items, onEdit, onRemove, onAdd }: any) {
  const sections = [
    {
      name: "Молочное и маленькие запасы",
      caption: "Верхняя полка",
      items: items.filter((i: any) =>
        ["carton", "cheese", "eggs", "jar"].includes(productKind(i.name)),
      ),
    },
    {
      name: "Напитки и то, что под рукой",
      caption: "Средняя полка",
      items: items.filter((i: any) =>
        ["bottle", "bag"].includes(productKind(i.name)),
      ),
    },
    {
      name: "Овощи, фрукты и зелень",
      caption: "Нижний ящик",
      items: items.filter((i: any) => productKind(i.name) === "produce"),
    },
  ];
  return (
    <section className="fridge-cabinet" aria-label="Полки холодильника">
      <header className="fridge-cabinet-heading">
        <span className="fridge-light" />
        <span className="eyebrow">ДОМАШНИЕ ЗАПАСЫ</span>
        <p>Маленький порядок на каждой полке</p>
        <Leaf size={17} />
      </header>
      <div className="fridge-door-handle" aria-hidden="true" />
      {sections.map((s, i) => (
        <section className={"fridge-shelf fridge-shelf-" + i} key={s.name}>
          <div className="fridge-shelf-label">
            <span>{s.caption}</span>
            <small>{s.name}</small>
          </div>
          <div className="fridge-products">
            {s.items.map((item: any) => (
              <article className="fridge-product" key={item.id}>
                <button
                  className="fridge-product-open"
                  title={"Изменить запас: " + item.name}
                  onClick={() => onEdit(item)}
                >
                  <ProductArt name={item.name} />
                  <strong>{item.name}</strong>
                  <small>
                    {item.qty !== ""
                      ? fmt(item.qty) + " " + item.unit
                      : "Есть дома"}
                  </small>
                </button>
                <div className="fridge-product-tools">
                  <button
                    className="icon-btn"
                    aria-label={"Изменить запас: " + item.name}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    className="icon-btn"
                    aria-label={"Закончилось: " + item.name}
                    onClick={() => onRemove(item)}
                  >
                    <X size={13} />
                  </button>
                </div>
              </article>
            ))}
            {!s.items.length && (
              <button className="fridge-empty-slot" onClick={onAdd}>
                <Plus size={20} />
                <span>Здесь есть место</span>
              </button>
            )}
          </div>
          <div className="fridge-glass" aria-hidden="true" />
        </section>
      ))}
      <footer className="fridge-cabinet-footer">
        Количество можно менять вручную · точность до грамма не обязательна
      </footer>
    </section>
  );
}
