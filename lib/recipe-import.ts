import { normalize, uid } from "./data";
import { validMenuDate } from "./menu-schedule";

export function recipeIdentity(r: any) {
  return JSON.stringify({
    title: normalize(r.title || ""),
    category: r.category,
    portions: Number(r.portions),
    kcal: r.kcal === "" || r.kcal == null ? "" : Number(r.kcal),
    kcalEstimated: !!r.kcalEstimated,
    ingredients: (r.ingredients || []).map((i: any) => ({
      name: normalize(i.name),
      qty: i.qty === "" ? "" : Number(i.qty),
      unit: normalize(i.unit || ""),
    })),
    recipe: r.recipe || "",
    notes: r.notes || "",
  });
}

export function applyRecipeImport(
  d: any,
  recipes: any[],
  options: {
    addToMenu: boolean;
    replaceMenu?: boolean;
    period?: { from: string; to: string };
  },
  makeId = uid,
) {
  if (!recipes.length) throw Error("Подборка пуста.");
  const period = options.period || d.menuPeriod;
  if (
    options.addToMenu &&
    (!period ||
      !validMenuDate(period.from) ||
      !validMenuDate(period.to) ||
      period.to < period.from)
  )
    throw Error("Укажи корректный общий период меню: с какой даты по какую.");
  const prepared = recipes.map((r) => {
    if (
      !r.title?.trim() ||
      !Number.isFinite(Number(r.portions)) ||
      Number(r.portions) < 1 ||
      Number(r.portions) > 1000 ||
      (r.kcal !== "" &&
        (!Number.isFinite(Number(r.kcal)) || Number(r.kcal) < 0)) ||
      (r.ingredients || []).some(
        (i: any) =>
          i.qty !== "" &&
          (!Number.isFinite(Number(i.qty)) || Number(i.qty) < 0),
      )
    )
      throw Error(
        "Проверь названия, порции (1–1000), калории и количества продуктов.",
      );
    return {
      ...r,
      portions: Number(r.portions),
      kcal: r.kcal === "" ? "" : Number(r.kcal),
    };
  });
  let removed = 0,
    added = 0,
    created = 0,
    reused = 0;
  if (options.addToMenu && options.replaceMenu) {
    const old = d.menu.slice();
    removed = old.length;
    d.trash.unshift(
      ...old.map((item: any) => ({
        id: makeId(),
        collection: "menu",
        item,
        deletedAt: new Date().toISOString(),
      })),
    );
    d.menu = [];
  }
  if (options.addToMenu) d.menuPeriod = { ...period };
  const keys = new Map(d.dishes.map((r: any) => [recipeIdentity(r), r]));
  for (const r of prepared) {
    const key = recipeIdentity(r);
    let dish: any = keys.get(key);
    if (!dish) {
      const {
        schedule,
        scheduleErrors,
        scheduleText,
        ingredientText,
        ...recipe
      } = r;
      dish = { ...recipe, id: makeId() };
      d.dishes.push(dish);
      keys.set(key, dish);
      created++;
    } else {
      reused++;
      if (
        r.source &&
        r.source !== dish.source &&
        !(dish.sourceHistory || []).includes(r.source)
      )
        dish.sourceHistory = [...(dish.sourceHistory || []), r.source];
    }
    if (options.addToMenu) {
      const existing = d.menu.find((m: any) => m.dishId === dish.id);
      if (existing) existing.portions = r.portions;
      else {
        d.menu.push({ id: makeId(), dishId: dish.id, portions: r.portions });
        added++;
      }
    }
  }
  return { created, reused, added, removed, period };
}
