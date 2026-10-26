import { normalize, uid } from "./data";
import { parseMenuSchedule, scheduleText } from "./menu-schedule";
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
// Caller supplies a draft (e.g. a structuredClone), so validation finishes before any mutation.
export function applyRecipeImport(
  d: any,
  recipes: any[],
  options: { addToMenu: boolean; replaceDates: boolean },
  makeId = uid,
) {
  if (!recipes.length) throw Error("Подборка пуста.");
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
    const plan = parseMenuSchedule(scheduleText(r));
    if (plan.scheduleErrors.length)
      throw Error(
        "Есть неверные строки «В меню». Используй ГГГГ-ММ-ДД | число порций.",
      );
    return {
      ...r,
      portions: Number(r.portions),
      kcal: r.kcal === "" ? "" : Number(r.kcal),
      ...plan,
    };
  });
  const dates = [
    ...new Set(prepared.flatMap((r) => r.schedule.map((p) => p.date))),
  ].sort();
  let removed = 0,
    added = 0,
    created = 0,
    reused = 0;
  if (options.addToMenu && options.replaceDates && dates.length) {
    const replace = new Set(dates);
    const old = d.menu.filter((m: any) => replace.has(m.date));
    removed = old.length;
    d.trash.unshift(
      ...old.map((item: any) => ({
        id: makeId(),
        collection: "menu",
        item,
        deletedAt: new Date().toISOString(),
      })),
    );
    d.menu = d.menu.filter((m: any) => !replace.has(m.date));
  }
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
      // Keep provenance when an identical recipe arrives with another dated plan.
      if (
        r.source &&
        r.source !== dish.source &&
        !(dish.sourceHistory || []).includes(r.source)
      ) {
        dish.sourceHistory = [...(dish.sourceHistory || []), r.source];
      }
    }
    if (options.addToMenu)
      for (const p of r.schedule) {
        if (
          d.menu.some(
            (m: any) =>
              m.dishId === dish.id &&
              m.date === p.date &&
              Number(m.portions) === p.portions,
          )
        )
          continue;
        d.menu.push({
          id: makeId(),
          date: p.date,
          dishId: dish.id,
          portions: p.portions,
        });
        added++;
      }
  }
  return { created, reused, added, removed, dates };
}
