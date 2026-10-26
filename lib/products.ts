import { normalize } from "./data";
// These are visual groups, not food storage or dietary recommendations.
export function productKind(name: string) {
  const n = normalize(name);
  if (/сыр|пармезан|моцарелл|чеддер|гауда|фета|брынз/.test(n)) return "cheese";
  if (/молок|кефир|сливк|йогурт|ряжен|сметан|творог/.test(n)) return "carton";
  if (/яйц/.test(n)) return "eggs";
  if (
    /тыкв|морков|огур|помидор|томат|капуст|салат|зелень|укроп|петруш|яблок|груш|банан|перец|лук|картоф|кабач|баклаж|чеснок|лимон|апельсин/.test(
      n,
    )
  )
    return "produce";
  if (/вода|сок|напит|масло|соус|уксус/.test(n)) return "bottle";
  if (/чай|кофе|рис|греч|круп|макарон|мук|сахар|хлеб|овсян|печень|орех/.test(n))
    return "bag";
  return "jar";
}
export function productGroup(name: string) {
  const kind = productKind(name);
  if (["cheese", "carton", "eggs"].includes(kind)) return "Молочное и яйца";
  if (kind === "produce") return "Овощи, фрукты и зелень";
  if (kind === "bag") return "Крупы и другие запасы";
  if (kind === "bottle") return "Напитки, масла и соусы";
  return "Остальное нужное";
}
export function groupProducts<T extends { name: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const name = productGroup(item.name);
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(item);
  }
  return [...groups].map(([name, items]) => ({ name, items }));
}
