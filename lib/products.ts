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

