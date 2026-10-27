import { normalize, fmt } from "./data";
// These are visual groups, not food storage or dietary recommendations.
export function productKind(name: string) {
  const n = normalize(name);
  if (/куриц|индейк|говядин|свинин|фарш|мясо|бекон|ветчин|колбас/.test(n))
    return "meat";
  if (/рыб|лосос|форел|тунец|кревет|кальмар|морепродукт/.test(n)) return "fish";
  if (/хлеб|батон|лаваш|булоч|багет|тост/.test(n)) return "bread";
  if (/заморож|пельмен|вареник|мороженое/.test(n)) return "frozen";
  if (/гриб/.test(n)) return "mushroom";
  if (/чечев|фасол|горох|нут|киноа|булгур|кус-кус|пшено|перлов/.test(n)) return "grains";
  if (/орех|семеч|миндал|фундук|грецк/.test(n)) return "nuts";
  if (/базилик|мята|шпинат|руккол|кинза|зелень|укроп|петруш/.test(n)) return "herbs";
  if (/сыр|пармезан|моцарелл|чеддер|гауда|фета|брынз/.test(n)) return "cheese";
  if (/молок|кефир|сливк|йогурт|ряжен|сметан|творог/.test(n)) return "carton";
  if (/яйц/.test(n)) return "eggs";
  if (/тыкв|морков|огур|помидор|томат|капуст|салат|зелень|укроп|петруш|яблок|груш|банан|перец|лук|картоф|кабач|баклаж|чеснок|лимон|апельсин/.test(n)) return "produce";
  if (/вода|сок|напит|масло|соус|уксус/.test(n)) return "bottle";
  if (/чай|кофе|рис|греч|круп|макарон|мук|сахар|хлеб|овсян|печень|орех/.test(n)) return "bag";
  return "jar";
}
export function productGroup(name: string) {
  const kind = productKind(name);
  if (["cheese", "carton", "eggs"].includes(kind)) return "Молочное и яйца";
  if (["produce", "herbs"].includes(kind)) return "Овощи, фрукты и зелень";
  if (["meat", "fish", "frozen"].includes(kind)) return "Мясо, рыба и заморозка";
  if (["bread", "mushroom"].includes(kind)) return "Хлеб и другие продукты";
  if (["bag", "grains", "nuts"].includes(kind)) return "Крупы и другие запасы";
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

/** Approximate retail pack sizes for display only; recipe quantities remain exact for aggregation. */
export function shoppingAmount(item: { name: string; qty: any; unit: string }) {
  if (item.qty === "" || item.unit === "п.в.") return item.unit === "п.в." ? "п.в." : "";
  const qty = Number(item.qty);
  if (!Number.isFinite(qty) || qty <= 0) return "";
  const name = normalize(item.name);
  const unit = normalize(item.unit);
  if (unit === "шт") {
    const pack = /яйц/.test(name) ? 10 : /таблет|капсул/.test(name) ? 10 : 1;
    const packs = Math.ceil(qty / pack);
    return pack === 1 ? `${fmt(packs)} шт.` : `${packs} уп. по ${pack} шт.`;
  }
  if (unit === "мл" || unit === "л") {
    const ml = qty * (unit === "л" ? 1000 : 1);
    const pack = /молок|кефир|сливк|сок|вода/.test(name) ? 1000 : /уксус|соус|сироп/.test(name) ? 500 : 500;
    return `${Math.ceil(ml / pack)} уп. по ${pack >= 1000 ? `${pack / 1000} л` : `${pack} мл`}`;
  }
  if (unit === "кг" || unit === "г") {
    const grams = qty * (unit === "кг" ? 1000 : 1);
    let pack = 500;
    if (/круп|рис|греч|мук|сахар|макарон|овсян|фасол|чечев|горох|нут|кофе|чай/.test(name)) pack = 900;
    else if (/сыр|творог|сметан|йогурт|масло/.test(name)) pack = 200;
    else if (/консерв|томаты в собственном/.test(name)) pack = 400;
    else if (/морков|картоф|лук|яблок|груш|банан|помидор|огур|капуст|лимон/.test(name)) pack = 500;
    const packs = Math.ceil(grams / pack);
    return `${packs} уп. по ${pack} г`;
  }
  return `${fmt(qty)} ${item.unit}`;
}
