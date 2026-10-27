"use client";
import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import {
  Home,
  BookOpen,
  CookingPot,
  Library,
  Settings,
  Leaf,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Sun,
  Moon,
  Search,
  Pencil,
  Trash2,
  Pin,
  Lock,
  Unlock,
  CalendarDays,
  Cake,
  ClipboardList,
  NotebookPen,
  Cloud,
  Shuffle,
  Heart,
  Utensils,
  ShoppingBasket,
  Refrigerator,
  Upload,
  Download,
  LogIn,
  LogOut,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Monitor,
  CheckCheck,
  Copy,
  Menu as MenuIcon,
} from "lucide-react";
import {
  today,
  uid,
  tabs,
  categories,
  mediaTypes,
  blocks,
  blockNames,
  emptyData,
  demoData,
  normalize,
  ingredientMatch,
  parseRecipes,
  parseIngredients,
  shoppingFor,
  validBackup,
  migrateMenuPlan,
  fmt,
  nextBirthday,
} from "@/lib/data";
import { Meadow, Sprout, ForestDetail } from "./art";
import { CuratedArt, faviconData } from "@/components/curated-art";
import { Field, Empty, Leaves } from "@/components/ui";
import { Dialog } from "@/components/editors";
import {
  Tasks,
  Shopping,
  ShelfObjects,
  BirthdayList,
} from "@/components/widgets";
import { createShoppingPng } from "@/lib/shopping-export";
import { parseMenuPeriod } from "@/lib/menu-schedule";
import { RECIPE_PROMPT } from "@/lib/recipe-prompt";
import { applyRecipeImport } from "@/lib/recipe-import";
import ShoppingSheet from "@/components/shopping-sheet";
import { ShelfInformation } from "@/components/media-jacket";
import { createMenuPng } from "@/lib/menu-export";
import Journal from "@/components/journal";
import { SearchPanel } from "@/components/search-panel";
import RestaurantMenu from "@/components/restaurant-menu";
const icons: any = {
  home: Home,
  book: BookOpen,
  pot: CookingPot,
  shelf: Library,
};
const dateLabel = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
const menuDateLabel = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
function PixelMushroom() {
  return (
    <svg
      className="pixel-mushroom-icon"
      viewBox="0 0 32 32"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path d="M4 15V11h4V7h4V4h8v3h4v4h4v4H4z" fill="currentColor" />
      <path d="M10 15h12v4h-3v8h-6v-8h-3z" fill="currentColor" />
      <path d="M10 11h3v3h-3zm9-3h3v3h-3zm5 5h3v2h-3z" fill="var(--surface)" />
    </svg>
  );
}
export default function Polyanka() {
  const [data, setData] = useState<any>(emptyData),
    [ready, setReady] = useState(false),
    [page, setPage] = useState("home"),
    [kitchen, setKitchen] = useState("menu"),
    [journalRequest, setJournalRequest] = useState<any>(null),
    [importText, setImportText] = useState(""),
    [parsedRecipes, setParsedRecipes] = useState<any[]>([]),
    [addImportedMenu, setAddImportedMenu] = useState(true),
    [replaceImportedMenu, setReplaceImportedMenu] = useState(false),
    [shelfType, setShelfType] = useState("Все"),
    [settings, setSettings] = useState(""),
    [modal, setModal] = useState<any>(null),
    [draft, setDraft] = useState<any>({}),
    [toast, setToast] = useState(""),
    [editingHome, setEditingHome] = useState(false),
    [homeFood, setHomeFood] = useState("menu"),
    [mealDay, setMealDay] = useState(today()),
    [menuTo, setMenuTo] = useState(today()),
    [menuEditing, setMenuEditing] = useState(false),
    [query, setQuery] = useState(""),
    [foodQuery, setFoodQuery] = useState(""),
    [foodExclude, setFoodExclude] = useState(""),
    [foodCategory, setFoodCategory] = useState("Все"),
    [onlyLoved, setOnlyLoved] = useState(false),
    [allIngredients, setAllIngredients] = useState(false),
    [rating, setRating] = useState(""),
    [again, setAgain] = useState(""),
    [recommend, setRecommend] = useState(""),
    [quickTask, setQuickTask] = useState(""),
    [quickShop, setQuickShop] = useState(""),
    [randomId, setRandomId] = useState(""),
    [dishFlips, setDishFlips] = useState<Record<string, boolean>>({}),
    [randomRecipeOpen, setRandomRecipeOpen] = useState(false),
    [user, setUser] = useState<any>(null),
    [configured, setConfigured] = useState(false),
    [sync, setSync] = useState("Локальный деморежим"),
    [authBusy, setAuthBusy] = useState(false),
    [systemDark, setSystemDark] = useState(false),
    [saving, setSaving] = useState(false);
  const version = useRef(0),
    hydrated = useRef(false),
    cloudReady = useRef(false),
    lastSaved = useRef(""),
    dataRef = useRef(data),
    busy = useRef(false),
    conflict = useRef(false),
    needsSync = useRef(false),
    revision = useRef(0),
    toastTimer = useRef<any>(null);
  const tell = useCallback((s: string) => {
    setToast(s);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  function mutate(fn: (d: any) => void) {
    setData((old: any) => {
      const d = structuredClone(old);
      fn(d);
      return d;
    });
    needsSync.current = true;
    revision.current++;
  }
  function open(type: string, item: any = {}) {
    if (type === "note" || type === "noteView") {
      setPage("diary");
      window.scrollTo({ top: 0, behavior: "instant" });
      setJournalRequest({
        key: uid(),
        type: type === "noteView" ? "read" : item.id ? "read" : "new",
        item,
        kind: item.kind || "thoughts",
      });
      return;
    }
    if (type === "birthday" || type === "task") {
      setPage("diary");
      setJournalRequest({ key: uid(), type, item });
      return;
    }
    setDraft(structuredClone(item));
    setModal({ type });
  }
  function help(text: string) {
    setModal({ type: "help", text });
  }
  async function copyRecipePrompt() {
    try {
      await navigator.clipboard.writeText(RECIPE_PROMPT);
      tell("Промт скопирован — можно вставить его во внешний ИИ");
    } catch {
      const area = document.createElement("textarea");
      area.value = RECIPE_PROMPT;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      tell(
        copied
          ? "Промт скопирован — можно вставить его во внешний ИИ"
          : "Не удалось скопировать промт",
      );
    }
  }
  function H({ text }: { text: string }) {
    return (
      <button
        className="help"
        aria-label="Как пользоваться"
        title="Как пользоваться"
        onClick={() => help(text)}
      >
        <Leaf size={16} />
      </button>
    );
  }
  function storeLocal(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      tell(
        "Не хватает места в браузере. Скачай резервную копию и уменьши фотографии.",
      );
      return false;
    }
  }
  function readDemo() {
    try {
      const s = JSON.parse(localStorage.getItem("polyanka-demo") || "null");
      return migrateMenuPlan(validBackup(s) ? s : demoData());
    } catch {
      return migrateMenuPlan(demoData());
    }
  }
  function loadAppData(source: any) {
    const next = migrateMenuPlan(source);
    setData(next);
    setMealDay(next.menuPeriod.from);
    setMenuTo(next.menuPeriod.to);
  }
  useEffect(() => {
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const cb = () => setSystemDark(m.matches);
    cb();
    m.addEventListener("change", cb);
    (async () => {
      try {
        const a = await fetch("/api/auth").then((r) => r.json());
        setConfigured(!!a.configured);
        if (a.user) {
          const r = await fetch("/api/state");
          if (!r.ok) throw Error();
          const s = await r.json();
          let initial = migrateMenuPlan(s.data || emptyData());
          const key = "polyanka-account-" + a.user.id;
          let recovered = false;
          let baseVersion = s.version;
          try {
            const pending = JSON.parse(localStorage.getItem(key) || "null");
            if (pending?.pending && validBackup(pending.data)) {
              initial = migrateMenuPlan(pending.data);
              baseVersion = pending.version;
              needsSync.current = true;
              recovered = true;
              if (pending.version !== s.version) {
                conflict.current = true;
                setSync("Конфликт версий — открой настройки аккаунта");
              }
            }
          } catch {}
          setUser(a.user);
          loadAppData(initial);
          version.current = baseVersion;
          lastSaved.current = JSON.stringify(s.data || emptyData());
          cloudReady.current = true;
          if (!conflict.current)
            setSync(
              recovered
                ? "Восстановлены несохранённые правки"
                : "Всё сохранено в облаке",
            );
        } else loadAppData(readDemo());
      } catch {
        loadAppData(readDemo());
        setSync("Облако недоступно · открыт деморежим");
      }
      hydrated.current = true;
      setReady(true);
    })();
    return () => m.removeEventListener("change", cb);
  }, []);
  useEffect(() => {
    dataRef.current = data;
    if (!ready) return;
    const encoded = JSON.stringify(data);
    if (!user) {
      storeLocal("polyanka-demo", encoded);
      return;
    }
    storeLocal(
      "polyanka-account-" + user.id,
      JSON.stringify({
        data,
        version: version.current,
        pending: encoded !== lastSaved.current,
      }),
    );
    if (encoded === lastSaved.current) return;
    needsSync.current = true;
    setSync(
      conflict.current
        ? "Есть конфликт · правки сохранены локально"
        : "Изменения на этом устройстве",
    );
    const timer = setTimeout(() => saveCloud(), 900);
    return () => clearTimeout(timer);
  }, [data, ready, user]);
  async function saveCloud() {
    if (
      !cloudReady.current ||
      busy.current ||
      conflict.current ||
      !needsSync.current
    )
      return;
    busy.current = true;
    setSaving(true);
    const snapshot = JSON.stringify(dataRef.current);
    try {
      const r = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: JSON.parse(snapshot),
          version: version.current,
        }),
      });
      const b = await r.json();
      if (!r.ok) {
        if (r.status === 409) conflict.current = true;
        throw Error(b.error || "Ошибка синхронизации");
      }
      version.current = b.version;
      lastSaved.current = snapshot;
      needsSync.current = JSON.stringify(dataRef.current) !== snapshot;
      storeLocal(
        "polyanka-account-" + user.id,
        JSON.stringify({
          data: dataRef.current,
          version: b.version,
          pending: needsSync.current,
        }),
      );
      setSync(
        needsSync.current
          ? "Сохраняем следующие изменения…"
          : "Всё сохранено в облаке",
      );
    } catch (e: any) {
      setSync(e.message || "Нет связи · правки сохранены локально");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (needsSync.current) {
        saveCloud();
        return;
      }
      refreshCloud(false);
    }, 15000);
    const focus = () => {
      if (needsSync.current) saveCloud();
      else refreshCloud(false);
    };
    window.addEventListener("focus", focus);
    window.addEventListener("online", focus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", focus);
      window.removeEventListener("online", focus);
    };
  }, [user]);
  async function refreshCloud(force: boolean) {
    if (!user || busy.current || (!force && needsSync.current)) return;
    const rev = revision.current;
    try {
      const r = await fetch("/api/state");
      if (!r.ok) throw Error();
      const s = await r.json();
      if (!force && (revision.current !== rev || needsSync.current)) return;
      if (force || s.version !== version.current) {
        const d = migrateMenuPlan(s.data || emptyData());
        version.current = s.version;
        lastSaved.current = JSON.stringify(d);
        needsSync.current = false;
        conflict.current = false;
        loadAppData(d);
        setSync("Всё сохранено в облаке");
        if (force) tell("Загружена облачная версия");
      }
    } catch {
      setSync("Нет связи с облаком");
    }
  }
  useEffect(() => {
    const warning = (e: BeforeUnloadEvent) => {
      if (user && needsSync.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warning);
    return () => window.removeEventListener("beforeunload", warning);
  }, [user]);
  const night =
    data.settings.mode === "night" ||
    (data.settings.mode === "system" && systemDark);
  useEffect(() => {
    document.documentElement.dataset.mode = night ? "night" : "day";
    document.documentElement.dataset.theme = data.settings.theme;
    document.documentElement.dataset.motion = data.settings.reduceMotion
      ? "reduce"
      : "normal";
  }, [night, data.settings.theme, data.settings.reduceMotion]);
  useEffect(() => {
    const href = faviconData();
    let link = document.querySelector<HTMLLinkElement>(
      'link[data-polyanka-favicon="true"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.dataset.polyankaFavicon = "true";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = href;
    return () => {
      link?.remove();
    };
  }, []);
  function go(p: string) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "instant" });
    setQuery("");
    if (p === "diary") {
      setJournalRequest(null);
    }
  }
  function remove(collection: string, id: string) {
    mutate((d) => {
      const item = d[collection].find((x: any) => x.id === id);
      if (!item) return;
      d.trash.unshift({
        id: uid(),
        collection,
        item,
        deletedAt: new Date().toISOString(),
      });
      d[collection] = d[collection].filter((x: any) => x.id !== id);
    });
    tell("Перемещено в корзину");
    setModal(null);
  }
  function editNote(kind = "thoughts", item?: any) {
    open(
      "note",
      item || {
        title: "",
        text: "",
        date: today(),
        time: "",
        kind: kind === "troubles" ? "troubles" : "thoughts",
        pinned: false,
      },
    );
  }
  function saveItem(collection: string, item: any) {
    mutate((d) => {
      if (item.id) {
        const i = d[collection].findIndex((x: any) => x.id === item.id);
        if (i >= 0) d[collection][i] = item;
        else d[collection].push(item);
      } else d[collection].push({ ...item, id: uid() });
    });
    setModal(null);
    tell("Сохранено");
  }
  function saveMenuItem(item: any) {
    mutate((d) => {
      const existing = d.menu.find(
        (x: any) => x.id === item.id || (!item.id && x.dishId === item.dishId),
      );
      if (existing) Object.assign(existing, item, { id: existing.id });
      else d.menu.push({ ...item, id: uid() });
    });
    setModal(null);
    tell("Меню сохранено");
  }
  function addTask(e: any) {
    e.preventDefault();
    if (!quickTask.trim()) return;
    mutate((d) =>
      d.tasks.push({ id: uid(), text: quickTask.trim(), done: false }),
    );
    setQuickTask("");
  }
  function addShopping(e: any) {
    e.preventDefault();
    if (!quickShop.trim()) return;
    mutate((d) =>
      d.shopping.push({
        id: uid(),
        name: quickShop.trim(),
        qty: "",
        unit: "",
        done: false,
      }),
    );
    setQuickShop("");
  }
  const shopping = shoppingFor(
    data,
    mealDay,
    menuTo < mealDay ? mealDay : menuTo,
  );
  function setShop(item: any, key: string, value: boolean) {
    mutate((d) => {
      let s = d.shopping.find((x: any) => x.id === item.id);
      if (!s) {
        s = { ...item };
        d.shopping.push(s);
      }
      s[key] = value;
    });
  }
  function markBought(item: any) {
    setShop(item, "done", !item.done);
  }
  function moveSetting(key: string, id: string, delta: number) {
    mutate((d) => {
      const a = d.settings[key],
        i = a.indexOf(id),
        j = i + delta;
      if (j < 0 || j >= a.length) return;
      [a[i], a[j]] = [a[j], a[i]];
    });
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    download(URL.createObjectURL(blob), "svoya-polyanka-" + today() + ".json");
  }
  function download(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  async function saveImageToPhone(dataUrl: string, name: string) {
    const blob = await fetch(dataUrl).then((r) => r.blob());
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Полянка" });
        tell(
          "Открой «Сохранить изображение» в меню телефона, чтобы добавить его в галерею",
        );
      } catch (error: any) {
        if (error?.name !== "AbortError") throw error;
      }
      return;
    }
    download(URL.createObjectURL(blob), name);
    tell(
      "Изображение скачано. На телефоне выбери «Сохранить в Фото/Галерею» из меню файла",
    );
  }
  async function importBackup(file: File) {
    try {
      const v = JSON.parse(await file.text());
      if (!validBackup(v)) throw Error();
      if (
        !confirm(
          "Заменить текущие данные резервной копией? Сначала рекомендуем скачать текущую копию.",
        )
      )
        return;
      mutate((d) => {
        Object.keys(d).forEach((k) => delete d[k]);
        Object.assign(d, v);
      });
      tell("Копия восстановлена");
    } catch {
      tell("Не получилось прочитать копию. Нужен корректный JSON «полянки».");
    }
  }
  async function image(file: File) {
    if (!file.type.startsWith("image/")) return tell("Выбери изображение");
    if (file.size > 15_000_000)
      return tell("Изображение должно быть меньше 15 МБ");
    const r = new FileReader();
    r.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, 640 / img.width, 640 / img.height),
          c = document.createElement("canvas");
        c.width = img.width * scale;
        c.height = img.height * scale;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        setDraft((d: any) => ({
          ...d,
          image: c.toDataURL("image/webp", 0.78),
        }));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  }
  async function exportPng(kind: string) {
    if (kind === "shopping") {
      try {
        await saveImageToPhone(
          await createShoppingPng(
            shopping,
            mealDay,
            menuTo < mealDay ? mealDay : menuTo,
          ),
          "polyanka-pokupki-" + today() + ".png",
        );
      } catch (e: any) {
        tell(e.message || "Не удалось создать изображение");
      }
      return;
    }

    if (kind === "menu") {
      try {
        await saveImageToPhone(
          await createMenuPng(
            data,
            mealDay,
            menuTo < mealDay ? mealDay : menuTo,
          ),
          "polyanka-menyu-" + today() + ".png",
        );
      } catch (e: any) {
        tell(e.message || "Не удалось создать изображение");
      }
      return;
    }
    return;
  }
  async function auth(e: any) {
    e.preventDefault();
    setAuthBusy(true);
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: draft.action || "login",
          email: draft.email,
          password: draft.password,
        }),
      });
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      const sr = await fetch("/api/state");
      if (!sr.ok) throw Error("Не удалось загрузить аккаунт");
      const s = await sr.json();
      const fresh = s.data || emptyData();
      lastSaved.current = JSON.stringify(fresh);
      version.current = s.version;
      cloudReady.current = true;
      needsSync.current = false;
      conflict.current = false;
      loadAppData(fresh);
      setUser(b.user);
      setSync("Всё сохранено в облаке");
      setModal(null);
      tell("Добро пожаловать на свою полянку");
    } catch (e: any) {
      tell(e.message);
    } finally {
      setAuthBusy(false);
    }
  }
  async function logout() {
    if (needsSync.current) {
      await saveCloud();
      if (needsSync.current)
        return tell(
          "Правки ещё не в облаке. Скачай резервную копию перед выходом.",
        );
    }
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      if (!r.ok) throw Error();
      cloudReady.current = false;
      if (user) localStorage.removeItem("polyanka-account-" + user.id);
      setUser(null);
      loadAppData(readDemo());
      setSync("Локальный деморежим");
      setSettings("");
      tell("Вы вышли из аккаунта");
    } catch {
      tell("Не удалось выйти. Проверь соединение.");
    }
  }
  function openDish(d: any) {
    if (!d?.id) return;
    go("kitchen");
    setKitchen("dishes");
    setFoodQuery("");
    setFoodCategory("Все");
    setOnlyLoved(false);
    setAllIngredients(false);
    setDishFlips({ [d.id]: true });
  }
  function saveParsedRecipes() {
    try {
      const next = structuredClone(data);
      const period = { from: mealDay, to: menuTo < mealDay ? mealDay : menuTo };
      const result = applyRecipeImport(next, parsedRecipes, {
        addToMenu: addImportedMenu,
        replaceMenu: replaceImportedMenu,
        period,
      });
      mutate((d) => {
        d.dishes = next.dishes;
        d.menu = next.menu;
        d.trash = next.trash;
        d.menuPeriod = next.menuPeriod;
      });
      tell(
        `Сохранено: ${result.created} новых блюд${result.reused ? ", " + result.reused + " повторно использовано" : ""}${result.added ? ", " + result.added + " блюд добавлено в меню" : ""}`,
      );
      setKitchen(addImportedMenu ? "menu" : "dishes");
      setParsedRecipes([]);
      setImportText("");
      setDraft({});
      setReplaceImportedMenu(false);
    } catch (e: any) {
      tell(e.message || "Не удалось сохранить подборку");
    }
  }
  function updateParsed(i: number, patch: any) {
    setDraft((d: any) => ({ ...d, importReviewed: false }));
    setParsedRecipes((a) =>
      a.map((r, n) => (n === i ? { ...r, ...patch } : r)),
    );
  }
  function addDish() {
    open("dish", {
      title: "",
      category: "Горячее",
      portions: 1,
      kcal: "",
      ingredients: [],
      ingredientText: "",
      recipe: "",
      liked: false,
    });
  }
  function editDish(d: any) {
    open("dish", {
      ...d,
      ingredientText: d.ingredients
        .map((i: any) => `${i.name} | ${i.qty} | ${i.unit}`)
        .join("\n"),
    });
  }
  const filteredDishes = data.dishes.filter((d: any) => {
    const terms = foodQuery.split(",").map(normalize).filter(Boolean);
    return (
      (foodCategory === "Все" || d.category === foodCategory) &&
      (!onlyLoved || d.liked) &&
      (terms.length === 0 ||
        (allIngredients
          ? terms.every((q) =>
              d.ingredients.some((i: any) => ingredientMatch(i.name, q)),
            )
          : terms.some((q) =>
              d.ingredients.some((i: any) => ingredientMatch(i.name, q)),
            ))) &&
      (!foodExclude ||
        !d.ingredients.some((i: any) =>
          foodExclude
            .split(",")
            .some((q) => q.trim() && ingredientMatch(i.name, q)),
        ))
    );
  });
  const randomPool = filteredDishes.filter((d: any) => d.liked),
    randomDish = randomPool.find((d: any) => d.id === randomId);
  function randomize() {
    if (!randomPool.length) return tell("Пока нет подходящих любимых блюд");
    const options =
      randomPool.length > 1
        ? randomPool.filter((d: any) => d.id !== randomId)
        : randomPool;
    setRandomId(options[Math.floor(Math.random() * options.length)].id);
    setRandomRecipeOpen(false);
  }
  function prepareMeal(m: any, dish: any) {
    if (!dish) return;
    const scale = Number(m.portions) / Number(dish.portions || 1);
    const usage = dish.ingredients.map((i: any) => {
      const f = data.fridge.find(
        (x: any) => normalize(x.name) === normalize(i.name),
      );
      let amount = i.qty === "" ? "" : Number(i.qty) * scale;
      if (f && amount !== "") {
        if (i.unit === "г" && f.unit === "кг") amount = Number(amount) / 1000;
        else if (i.unit === "кг" && f.unit === "г")
          amount = Number(amount) * 1000;
        else if (i.unit === "мл" && f.unit === "л")
          amount = Number(amount) / 1000;
        else if (i.unit === "л" && f.unit === "мл")
          amount = Number(amount) * 1000;
        else if (normalize(i.unit) !== normalize(f.unit)) amount = "";
      }
      return {
        name: i.name,
        fridgeId: f?.id || "",
        amount,
        unit: f?.unit || i.unit,
        enabled: !!f && f.qty !== "" && amount !== "",
      };
    });
    open("prepared", { menuId: m.id, title: dish.title, usage });
  }
  function addToMenu(d: any) {
    open("menu", { dishId: d.id, portions: d.portions || 1 });
  }
  const pinned = data.notes.filter(
    (n: any) => n.pinned && n.kind !== "troubles",
  );
  const progress = data.media.filter((m: any) => m.status === "process");
  const filteredMedia = data.media.filter(
    (m: any) =>
      (shelfType === "Все" || m.type === shelfType) &&
      (!query ||
        normalize(m.title + " " + m.review + " " + (m.progress || "")).includes(
          normalize(query),
        )) &&
      (!rating || Number(m.rating) === Number(rating)) &&
      (!again || m.again === again) &&
      (!recommend || m.recommend === recommend),
  );
  const taskProps = {
    data,
    mutate,
    quickTask,
    setQuickTask,
    addTask,
    open,
    remove,
  };
  const shoppingProps = {
    shopping,
    markBought,
    setShop,
    quickShop,
    setQuickShop,
    addShopping,
    remove,
  };
  function renderHomeBlock({ id }: { id: string }) {
    return (
      <section className={"card home-block block-" + id}>
        <div className="card-heading">
          <h2>
            {id === "notes" ? (
              <Pin size={17} />
            ) : id === "tasks" ? (
              <ClipboardList size={18} />
            ) : id === "kitchen" ? (
              <CookingPot size={19} />
            ) : id === "progress" ? (
              <BookOpen size={18} />
            ) : (
              <Cake size={18} />
            )}{" "}
            {blockNames[id]}
          </h2>
          <div className="row">
            {editingHome ? (
              <>
                <button
                  className="icon-btn"
                  title="Выше"
                  onClick={() => moveSetting("blocks", id, -1)}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  className="icon-btn"
                  title="Ниже"
                  onClick={() => moveSetting("blocks", id, 1)}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  className="icon-btn"
                  title="Скрыть блок"
                  onClick={() => mutate((d) => d.settings.hidden.push(id))}
                >
                  <EyeOff size={15} />
                </button>
              </>
            ) : (
              <H
                text={
                  id === "notes"
                    ? "Здесь только мысли, которые ты закрепила кнопкой с булавкой в дневнике."
                    : id === "tasks"
                      ? "Это тот же список дел, что на закладке дневника. Галочка отмечает выполненное."
                      : id === "kitchen"
                        ? "Переключай меню и покупки. Галочкой отмечай купленное, кнопкой «Есть дома» — продукты из запасов."
                        : id === "progress"
                          ? "Незаконченные книги, фильмы и игры с твоей полки. Нажми на предмет, чтобы продолжить запись."
                          : "Ближайшие дни рождения из органайзера дневника. Нажми на человека, чтобы посмотреть заметки."
                }
              />
            )}
          </div>
        </div>
        {id === "notes" && (
          <>
            <div className="pinned-list">
              {pinned.slice(0, 2).map((n: any, i: number) => (
                <button
                  className={"pinned-note note-" + i}
                  key={n.id}
                  onClick={() => open("noteView", n)}
                >
                  <span className="note-date">
                    {dateLabel(n.date)} <Pin size={12} />
                  </span>
                  <strong>{n.title || "Без названия"}</strong>
                  <p>{n.text}</p>
                </button>
              ))}
            </div>
            {!pinned.length && (
              <p className="muted">Закрепи важную мысль в дневнике.</p>
            )}
            <button className="text-link" onClick={() => go("diary")}>
              Открыть дневник <ArrowUpRight size={15} />
            </button>
          </>
        )}
        {id === "tasks" && <Tasks compact {...taskProps} />}
        {id === "kitchen" && (
          <>
            <div className="segmented">
              <button
                className={homeFood === "menu" ? "active" : ""}
                onClick={() => setHomeFood("menu")}
              >
                Меню на сегодня
              </button>
              <button
                className={homeFood === "shopping" ? "active" : ""}
                onClick={() => setHomeFood("shopping")}
              >
                Покупки{" "}
                <span>
                  {shopping.filter((s: any) => !s.done && !s.have).length}
                </span>
              </button>
            </div>
            {homeFood === "menu" ? (
              <>
                <div className="home-meals">
                  {[...data.menu]
                    .sort((a: any, b: any) => {
                      const order = ["Салат", "Суп", "Горячее", "Закуска"];
                      const ca = order.indexOf(
                        data.dishes.find((d: any) => d.id === a.dishId)
                          ?.category,
                      );
                      const cb = order.indexOf(
                        data.dishes.find((d: any) => d.id === b.dishId)
                          ?.category,
                      );
                      return (ca < 0 ? 99 : ca) - (cb < 0 ? 99 : cb);
                    })
                    .map((m: any) => {
                      const d = data.dishes.find((x: any) => x.id === m.dishId);
                      return (
                        d && (
                          <button
                            className="home-meal"
                            key={m.id}
                            onClick={() => openDish(d)}
                          >
                            <span className="meal-icon">
                              <CookingPot size={20} />
                            </span>
                            <span>
                              <strong>{d.title}</strong>
                              <small>
                                {d.category} · {m.portions} порц.
                              </small>
                            </span>
                            <ChevronRight size={15} />
                          </button>
                        )
                      );
                    })}
                </div>
                {!data.menu.length && (
                  <p className="muted">Меню пока не заполнено.</p>
                )}
                <button
                  className="text-link"
                  onClick={() => {
                    go("kitchen");
                    setKitchen("menu");
                  }}
                >
                  Заглянуть в кухоньку <ArrowUpRight size={15} />
                </button>
              </>
            ) : (
              <Shopping compact {...shoppingProps} />
            )}
          </>
        )}
        {id === "progress" && (
          <>
            {progress.length ? (
              <ShelfObjects open={open} items={progress.slice(0, 7)} mini />
            ) : (
              <Empty text="Здесь появятся истории, к которым ты ещё вернёшься." />
            )}
            <button className="text-link" onClick={() => go("shelf")}>
              На свою полку <ArrowUpRight size={15} />
            </button>
          </>
        )}
        {id === "birthdays" && (
          <>
            <BirthdayList compact data={data} open={open} />
            <button
              className="text-link"
              onClick={() => {
                go("diary");
                setJournalRequest({ key: uid(), type: "birthdayList" });
              }}
            >
              Все важные даты <ArrowUpRight size={15} />
            </button>
          </>
        )}
      </section>
    );
  }
  if (!ready)
    return (
      <main className="loading">
        <Sprout />
        <h1>полянка</h1>
        <p>Открываем тихое место…</p>
      </main>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => go("home")}>
          <span className="brand-icon">
            <Sprout />
          </span>
          <span>
            полянка<span className="brand-dot">.</span>
          </span>
        </button>
        <div className="sidebar-caption">МЕСТО, ГДЕ МОЖНО БЫТЬ СОБОЙ</div>
        <nav>
          {data.settings.nav.map((id: string) => {
            const t = tabs.find((x) => x.id === id);
            if (!t) return null;
            const Icon = icons[t.icon];
            return (
              <button
                key={id}
                className={"nav-item " + (page === id ? "active" : "")}
                onClick={() => go(id)}
              >
                <Icon size={21} />
                <span>{t.name}</span>
                {page === id && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sprout />
            <p>
              Не спеши.
              <br />
              Ты на своей полянке.
            </p>
            <span>Всё — в твоём темпе.</span>
          </div>
          <button
            className="theme-switch"
            onClick={() =>
              mutate((d) => (d.settings.mode = night ? "day" : "night"))
            }
          >
            <span>
              {night ? <Moon size={17} /> : <Sun size={17} />}{" "}
              {night ? "Тихий лес" : "Дневная полянка"}
            </span>
            <span className={"switch " + (night ? "on" : "")}>
              <i />
            </span>
          </button>
          <button className="profile" onClick={() => setSettings("account")}>
            <span className="avatar">
              <Sprout />
            </span>
            <span>
              {user ? "Моя полянка" : "Заглянуть в гости"}
              <small>
                {user ? "Личный аккаунт" : "Демонстрационный режим"}
              </small>
            </span>
            <ChevronRight size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            Моя полянка <ChevronRight size={13} />
            <strong>{tabs.find((t) => t.id === page)?.name}</strong>
          </span>
          <div className="topbar-right">
            <span className="header-date">
              <Sun size={15} />{" "}
              {new Date().toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                weekday: "short",
              })}
            </span>
            <button
              className={
                "sync-dot " +
                (sync.includes("конфликт") || sync.includes("Нет")
                  ? "warning"
                  : "")
              }
              title={sync}
              onClick={() => setSettings("account")}
            >
              <span />
              {user ? (saving ? "Сохраняем…" : "Моя полянка") : "Деморежим"}
            </button>
            <button
              className="settings-trigger"
              aria-label="Настройки"
              onClick={() => setSettings("appearance")}
            >
              <Settings size={21} />
            </button>
          </div>
        </header>
        <main className="main-content">
          {page === "home" && (
            <>
              <section className="welcome">
                <div className="welcome-copy">
                  <span className="eyebrow">
                    <span /> ТВОЁ ТИХОЕ МЕСТО
                  </span>
                  <h1>
                    Здесь можно
                    <br />
                    просто быть<span>.</span>
                  </h1>
                  <p>
                    Собрать мысли, позаботиться о себе
                    <br />и оставить место для маленького хорошего.
                  </p>
                  <button
                    className="btn primary"
                    onClick={() => editNote("thoughts")}
                  >
                    <Plus size={17} /> Записать мысль
                  </button>
                </div>
                <CuratedArt
                  slot="headerArt"
                  value="meadow"
                  className="curated-meadow"
                />
                <span className="hero-caption">
                  маленький мир, в котором ты дома
                </span>
              </section>
              <div className="section-heading">
                <div>
                  <h2>
                    Мой уголок <span className="little-star">✧</span>
                  </h2>
                  <p>Важное рядом. Остальное подождёт.</p>
                </div>
                <button
                  className={"btn small " + (editingHome ? "primary" : "ghost")}
                  onClick={() => setEditingHome(!editingHome)}
                >
                  {editingHome ? <Check size={15} /> : <Pencil size={14} />}{" "}
                  {editingHome ? "Готово" : "Редактировать"}
                </button>
              </div>
              {editingHome && data.settings.hidden.length > 0 && (
                <div className="restore-blocks">
                  <span>Вернуть блок:</span>
                  {data.settings.hidden.map((id: string) => (
                    <button
                      className="tag"
                      key={id}
                      onClick={() =>
                        mutate(
                          (d) =>
                            (d.settings.hidden = d.settings.hidden.filter(
                              (x: string) => x !== id,
                            )),
                        )
                      }
                    >
                      <Plus size={12} />
                      {blockNames[id]}
                    </button>
                  ))}
                </div>
              )}
              <div className="home-grid">
                {data.settings.blocks
                  .filter((id: string) => !data.settings.hidden.includes(id))
                  .map((id: string) => (
                    <Fragment key={id}>{renderHomeBlock({ id })}</Fragment>
                  ))}
              </div>
              <div className="quiet-footer">
                <Leaf size={14} /> Сегодня достаточно быть здесь.
              </div>
            </>
          )}
          {page === "diary" && (
            <Journal
              data={data}
              mutate={mutate}
              tell={tell}
              request={journalRequest}
              memoryKey={user?.id || "demo"}
            />
          )}
          {page === "kitchen" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ПРОСТАЯ ЗАБОТА О СЕБЕ</span>
                  <h1>
                    Кухонька<span>.</span>
                  </h1>
                  <ForestDetail kind="flowers" className="heading-art" />
                  <p>Чтобы «что поесть?» стало приятным вопросом.</p>
                </div>
                <button className="btn primary" onClick={addDish}>
                  <Plus size={16} /> Добавить блюдо
                </button>
              </div>
              <div className="section-tabs kitchen-main-tabs">
                {[
                  ["menu", "Меню"],
                  ["shopping", "Покупки"],
                  ["random", "Что поесть?"],
                  ["import", "Мои блюда"],
                ].map(([id, title]) => (
                  <button
                    key={id}
                    className={
                      (
                        id === "shopping"
                          ? kitchen === "shopping" || kitchen === "fridge"
                          : id === "import"
                            ? kitchen === "import" || kitchen === "dishes"
                            : kitchen === id
                      )
                        ? "active"
                        : ""
                    }
                    onClick={() => setKitchen(id)}
                  >
                    {title}
                  </button>
                ))}
              </div>
              {(kitchen === "import" || kitchen === "dishes") && (
                <div className="sub-tabs">
                  <button
                    className={kitchen === "import" ? "active" : ""}
                    onClick={() => setKitchen("import")}
                  >
                    Разобрать текст
                  </button>
                  <button
                    className={kitchen === "dishes" ? "active" : ""}
                    onClick={() => setKitchen("dishes")}
                  >
                    Коллекция
                  </button>
                </div>
              )}
              {(kitchen === "shopping" || kitchen === "fridge") && (
                <div className="sub-tabs">
                  <button
                    className={kitchen === "shopping" ? "active" : ""}
                    onClick={() => setKitchen("shopping")}
                  >
                    Список покупок
                  </button>
                  <button
                    className={kitchen === "fridge" ? "active" : ""}
                    onClick={() => setKitchen("fridge")}
                  >
                    Что есть дома
                  </button>
                </div>
              )}
              {(kitchen === "dishes" || kitchen === "random") && (
                <>
                  <SearchPanel
                    label="Поиск блюд и фильтры"
                    active={
                      !!(
                        foodQuery ||
                        foodExclude ||
                        foodCategory !== "Все" ||
                        onlyLoved ||
                        allIngredients
                      )
                    }
                    onReset={() => {
                      setFoodQuery("");
                      setFoodExclude("");
                      setFoodCategory("Все");
                      setOnlyLoved(false);
                      setAllIngredients(false);
                    }}
                  >
                    <div className="filter-main">
                      <div className="search-box">
                        <Search size={17} />
                        <input
                          aria-label="Поиск по продуктам"
                          placeholder="Хочется чего-нибудь с… сыром?"
                          value={foodQuery}
                          onChange={(e) => setFoodQuery(e.target.value)}
                        />
                      </div>
                      <select
                        aria-label="Категория блюда"
                        value={foodCategory}
                        onChange={(e) => setFoodCategory(e.target.value)}
                      >
                        <option>Все</option>
                        {categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <H text="Поиск идёт по ингредиентам. Несколько продуктов разделяй запятыми. «Сыр» также находит моцареллу, пармезан и другие сыры. Рандомайзер берёт только понравившиеся блюда." />
                    </div>
                    <div className="filter-secondary">
                      <label className="inline-check">
                        <input
                          type="checkbox"
                          checked={onlyLoved || kitchen === "random"}
                          disabled={kitchen === "random"}
                          onChange={(e) => setOnlyLoved(e.target.checked)}
                        />
                        <Heart size={14} /> Только любимые
                      </label>
                      <label className="inline-check">
                        <input
                          type="checkbox"
                          checked={allIngredients}
                          onChange={(e) => setAllIngredients(e.target.checked)}
                        />{" "}
                        Все указанные продукты
                      </label>
                      <input
                        className="exclude-input"
                        aria-label="Исключить продукты"
                        placeholder="Без… (продукты через запятую)"
                        value={foodExclude}
                        onChange={(e) => setFoodExclude(e.target.value)}
                      />
                    </div>
                  </SearchPanel>
                  {kitchen === "dishes" ? (
                    filteredDishes.length ? (
                      <div
                        className={
                          "dish-grid " +
                          (data.settings.dishView === "text"
                            ? "text-view"
                            : "image-view")
                        }
                      >
                        {filteredDishes.map((d: any) => (
                          <article
                            className={
                              "card dish-card recipe-collection-card " +
                              (dishFlips[d.id]
                                ? "recipe-collection-flipped"
                                : "")
                            }
                            key={d.id}
                          >
                            <div className="collection-flip-inner">
                              <div className="collection-recipe-front">
                                {data.settings.dishView === "image" && (
                                  <button
                                    className="dish-image"
                                    onClick={() =>
                                      setDishFlips((old) => ({
                                        ...old,
                                        [d.id]: !old[d.id],
                                      }))
                                    }
                                  >
                                    {d.image ? (
                                      <img src={d.image} alt={d.title} />
                                    ) : (
                                      <>
                                        <CookingPot size={45} />
                                        <span>Твоё блюдо</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                <div className="dish-card-body">
                                  <span className="eyebrow">{d.category}</span>
                                  <button
                                    className="dish-title"
                                    onClick={() =>
                                      setDishFlips((old) => ({
                                        ...old,
                                        [d.id]: !old[d.id],
                                      }))
                                    }
                                  >
                                    {d.title}
                                  </button>
                                  <p>
                                    {d.kcal !== "" && d.kcal != null
                                      ? (d.kcalEstimated ? "≈" : "") +
                                        d.kcal +
                                        " ккал / порц."
                                      : "Калорийность не указана"}{" "}
                                    · {d.portions} порц.
                                  </p>
                                  <div className="dish-actions">
                                    <button
                                      className={
                                        "icon-btn " + (d.liked ? "liked" : "")
                                      }
                                      aria-label={
                                        d.liked
                                          ? "Убрать из любимых"
                                          : "Понравилось"
                                      }
                                      onClick={() =>
                                        mutate((s) => {
                                          const x = s.dishes.find(
                                            (x: any) => x.id === d.id,
                                          );
                                          x.liked = !x.liked;
                                        })
                                      }
                                    >
                                      <Heart
                                        size={18}
                                        fill={d.liked ? "currentColor" : "none"}
                                      />
                                    </button>
                                    <button
                                      className="text-link"
                                      onClick={() => addToMenu(d)}
                                    >
                                      В меню <Plus size={14} />
                                    </button>
                                    <button
                                      className="icon-btn"
                                      title="Редактировать"
                                      onClick={() => editDish(d)}
                                    >
                                      <Pencil size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="collection-recipe-back"
                                aria-hidden={!dishFlips[d.id]}
                              >
                                <span className="eyebrow">
                                  СПОСОБ ПРИГОТОВЛЕНИЯ
                                </span>
                                <button
                                  className="dish-title collection-back-title"
                                  onClick={() =>
                                    setDishFlips((old) => ({
                                      ...old,
                                      [d.id]: false,
                                    }))
                                  }
                                >
                                  {d.title}
                                </button>
                                <button
                                  className="preserve collection-recipe-text"
                                  onClick={() =>
                                    setDishFlips((old) => ({
                                      ...old,
                                      [d.id]: false,
                                    }))
                                  }
                                >
                                  {d.recipe?.trim() ||
                                    "Способ приготовления пока не добавлен."}
                                  {d.notes ? "\n\n" + d.notes : ""}
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        text="Подходящих блюд пока нет. Можно изменить фильтры или добавить своё."
                        action="Добавить блюдо"
                        onClick={addDish}
                      />
                    )
                  ) : (
                    <section className="card random-card">
                      <span className="eyebrow">
                        НЕБОЛЬШАЯ КУЛИНАРНАЯ СЛУЧАЙНОСТЬ
                      </span>
                      {randomDish ? (
                        <>
                          {data.settings.dishView === "image" && (
                            <button
                              className="random-image"
                              onClick={() =>
                                setRandomRecipeOpen((open) => !open)
                              }
                            >
                              {randomDish.image ? (
                                <img
                                  src={randomDish.image}
                                  alt={randomDish.title}
                                />
                              ) : (
                                <CookingPot size={64} />
                              )}
                            </button>
                          )}
                          <h2>{randomDish.title}</h2>
                          <p>
                            {randomDish.category}
                            {randomDish.kcal !== ""
                              ? " · " + randomDish.kcal + " ккал / порц."
                              : ""}
                          </p>
                          <button
                            className="text-link"
                            onClick={() => setRandomRecipeOpen((open) => !open)}
                          >
                            {randomRecipeOpen
                              ? "Скрыть приготовление"
                              : "Как приготовить"}{" "}
                            <ArrowUpRight size={15} />
                          </button>
                          {randomRecipeOpen && (
                            <div className="random-recipe-inline">
                              <p className="preserve">
                                {randomDish.recipe ||
                                  "Способ приготовления пока не добавлен."}
                              </p>
                              {randomDish.notes && (
                                <p className="preserve muted">
                                  {randomDish.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="random-sprout">
                            <CookingPot size={50} />
                          </div>
                          <h2>А что, если…</h2>
                          <p>Выберем что-нибудь из твоих любимых?</p>
                        </>
                      )}
                      <div className="row centered">
                        <button className="btn primary" onClick={randomize}>
                          <Shuffle size={17} />
                          {randomDish ? "Другое блюдо" : "Выбери за меня"}
                        </button>
                        {randomDish && (
                          <button
                            className="btn soft"
                            onClick={() => addToMenu(randomDish)}
                          >
                            <Plus size={16} /> В меню
                          </button>
                        )}
                      </div>
                      <small className="muted">
                        Подходящих любимых блюд: {randomPool.length}
                      </small>
                    </section>
                  )}
                </>
              )}
              {(kitchen === "menu" || kitchen === "shopping") && (
                <>
                  <div className="toolbar">
                    <div className="row">
                      <Field label="Период с">
                        <input
                          type="date"
                          value={mealDay}
                          onChange={(e) => {
                            const from = e.target.value,
                              to = menuTo < from ? from : menuTo;
                            setMealDay(from);
                            setMenuTo(to);
                            mutate((d) => (d.menuPeriod = { from, to }));
                          }}
                        />
                      </Field>
                      <Field label="по">
                        <input
                          type="date"
                          min={mealDay}
                          value={menuTo}
                          onChange={(e) => {
                            setMenuTo(e.target.value);
                            mutate(
                              (d) =>
                                (d.menuPeriod = {
                                  from: mealDay,
                                  to: e.target.value,
                                }),
                            );
                          }}
                        />
                      </Field>
                    </div>
                    <div className="row">
                      <H
                        text={
                          kitchen === "menu"
                            ? "Период общий для всего меню, блюда не привязаны к отдельным датам. Ингредиенты рассчитаны на число порций в карточке."
                            : "Список покупок собран по общему меню и количеству порций. Отметки «Куплено» и «Есть дома» исключают продукт из остатка."
                        }
                      />
                      <button
                        className="help gallery-save"
                        aria-label={
                          kitchen === "menu"
                            ? "Сохранить меню в галерею"
                            : "Сохранить список продуктов в галерею"
                        }
                        title={
                          kitchen === "menu"
                            ? "Сохранить меню в галерею"
                            : "Сохранить список продуктов в галерею"
                        }
                        onClick={() => exportPng(kitchen)}
                      >
                        <PixelMushroom />
                      </button>
                      {kitchen === "menu" && menuEditing && (
                        <button
                          className="btn primary"
                          onClick={() =>
                            open("menu", {
                              dishId: data.dishes[0]?.id || "",
                              portions: data.dishes[0]?.portions || 1,
                            })
                          }
                        >
                          <Plus size={16} /> Добавить блюдо
                        </button>
                      )}
                    </div>
                  </div>
                  {kitchen === "shopping" ? (
                    <ShoppingSheet
                      shoppingProps={shoppingProps}
                      artwork="fern"
                      from={mealDay}
                      to={menuTo < mealDay ? mealDay : menuTo}
                      onClear={() => {
                        if (
                          !confirm(
                            "Убрать отметки «Куплено»? Продукты из меню останутся в списке.",
                          )
                        )
                          return;
                        mutate((d) => {
                          d.shopping = d.shopping
                            .filter((s: any) => s.auto || !s.done)
                            .map((s: any) => ({ ...s, done: false }));
                        });
                      }}
                    />
                  ) : (
                    <>
                      <RestaurantMenu
                        data={data}
                        from={mealDay}
                        to={menuTo < mealDay ? mealDay : menuTo}
                        editing={menuEditing}
                        onEdit={(m: any) => open("menu", m)}
                        onDelete={(m: any) => remove("menu", m.id)}
                        onPrepare={prepareMeal}
                        onMove={(m: any, delta: number) =>
                          mutate((d) => {
                            const dish = d.dishes.find(
                              (x: any) => x.id === m.dishId,
                            );
                            const group = d.menu.filter(
                              (x: any) =>
                                d.dishes.find(
                                  (item: any) => item.id === x.dishId,
                                )?.category === dish?.category,
                            );
                            const n = group.findIndex(
                                (x: any) => x.id === m.id,
                              ),
                              other = group[n + delta];
                            if (!other) return;
                            const i = d.menu.findIndex(
                                (x: any) => x.id === m.id,
                              ),
                              j = d.menu.findIndex(
                                (x: any) => x.id === other.id,
                              );
                            [d.menu[i], d.menu[j]] = [d.menu[j], d.menu[i]];
                          })
                        }
                      />
                      <div className="menu-edit-footer">
                        <button
                          className={menuEditing ? "btn primary" : "btn soft"}
                          onClick={() => setMenuEditing(!menuEditing)}
                        >
                          {menuEditing ? (
                            <Check size={16} />
                          ) : (
                            <Pencil size={15} />
                          )}
                          {menuEditing ? "Готово" : "Редактировать"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
              {kitchen === "fridge" && (
                <>
                  <div className="section-heading">
                    <div>
                      <h2>Что есть дома</h2>
                      <p>Точность до грамма не обязательна.</p>
                    </div>
                    <button
                      className="btn soft"
                      onClick={() =>
                        open("fridge", { name: "", qty: "", unit: "г" })
                      }
                    >
                      <Plus size={16} /> Добавить продукт
                    </button>
                  </div>
                  <div className="pantry-list">
                    {data.fridge.length ? (
                      data.fridge.map((item: any) => (
                        <div className="pantry-row" key={item.id}>
                          <div className="grow">
                            <strong>{item.name}</strong>
                            <small>
                              {item.qty !== ""
                                ? fmt(item.qty) +
                                  (item.unit ? " " + item.unit : "")
                                : "Количество не указано"}
                            </small>
                          </div>
                          <button
                            className="icon-btn"
                            aria-label={"Изменить " + item.name}
                            onClick={() => open("fridge", item)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="icon-btn danger"
                            aria-label={"Удалить " + item.name}
                            onClick={() => remove("fridge", item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="muted">Пока ничего не записано.</p>
                    )}
                  </div>
                </>
              )}
              {kitchen === "import" && (
                <section className="card import-card">
                  <div className="card-heading">
                    <h2>Из текста — в твою коллекцию</h2>
                    <button
                      className="help"
                      aria-label="Скопировать промт для ИИ"
                      title="Скопировать промт для ИИ"
                      onClick={copyRecipePrompt}
                    >
                      <Leaf size={18} />
                    </button>
                  </div>
                  <p className="muted">
                    Готовое меню от твоего ИИ или свои рецепты. Проверим блюда,
                    порции и общий период — сайт сам ничего не придумывает.
                  </p>
                  <textarea
                    rows={12}
                    aria-label="Текст рецептов"
                    placeholder={
                      "Название: Твой рецепт\nКатегория: Суп\nПорции: 2\nКкал на порцию: 250\nИнгредиенты:\nПродукт | 200 | г\nПриготовление:\nТекст приготовления\n\n---\n\nНазвание: Следующий рецепт"
                    }
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setParsedRecipes([]);
                      setReplaceImportedMenu(false);
                      setDraft((d: any) => ({ ...d, importReviewed: false }));
                    }}
                  />
                  <div className="row spread">
                    <button
                      className="btn primary"
                      disabled={!importText.trim()}
                      onClick={() => {
                        const period = parseMenuPeriod(importText);
                        if (period) {
                          setMealDay(period.from);
                          setMenuTo(period.to);
                          mutate((d) => (d.menuPeriod = period));
                        }
                        const parsed = parseRecipes(importText);
                        setParsedRecipes(parsed);
                        setDraft((d: any) => ({ ...d, importReviewed: false }));
                        if (!parsed.length)
                          tell(
                            "Не нашла блоков «Название: …». Проверь вставленный текст и попробуй ещё раз.",
                          );
                      }}
                    >
                      Разобрать текст <ArrowRight size={15} />
                    </button>
                  </div>
                  {parsedRecipes.length > 0 && (
                    <div className="parsed-list">
                      <h3>Проверь подборку · {parsedRecipes.length}</h3>
                      <p className="footnote">
                        Количество ингредиентов относится ко всем базовым
                        порциям. Пустые значения не додумываются. Неизвестное
                        число порций нужно заполнить.
                      </p>
                      {parsedRecipes.map((d: any, i: number) => (
                        <details
                          className="parsed-recipe"
                          key={i}
                          open={parsedRecipes.length === 1}
                        >
                          <summary>
                            {d.title || "Блюдо без названия"}{" "}
                            <span className="muted">
                              · {d.ingredients.length} продуктов
                              {!Number(d.portions) ? " · нужны порции" : ""}
                            </span>
                          </summary>
                          <div className="form-grid">
                            <Field label="Название">
                              <input
                                aria-label={"Название рецепта " + (i + 1)}
                                value={d.title}
                                onChange={(e) =>
                                  updateParsed(i, { title: e.target.value })
                                }
                              />
                            </Field>
                            <Field label="Категория">
                              <select
                                value={d.category}
                                onChange={(e) =>
                                  updateParsed(i, { category: e.target.value })
                                }
                              >
                                {categories.map((c) => (
                                  <option key={c}>{c}</option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Базовые порции">
                              <input
                                type="number"
                                min="1"
                                aria-label={"Порции рецепта " + (i + 1)}
                                value={d.portions}
                                onChange={(e) =>
                                  updateParsed(i, { portions: e.target.value })
                                }
                              />
                            </Field>
                            <Field label="Ккал на порцию">
                              <input
                                type="number"
                                min="0"
                                value={d.kcal}
                                onChange={(e) =>
                                  updateParsed(i, { kcal: e.target.value })
                                }
                              />
                            </Field>
                          </div>
                          <label className="inline-check">
                            <input
                              type="checkbox"
                              checked={!!d.kcalEstimated}
                              onChange={(e) =>
                                updateParsed(i, {
                                  kcalEstimated: e.target.checked,
                                })
                              }
                            />{" "}
                            Калорийность приблизительная
                          </label>
                          <Field label="Продукт | количество | единица">
                            <textarea
                              rows={4}
                              value={
                                d.ingredientText ??
                                d.ingredients
                                  .map(
                                    (x: any) =>
                                      x.name +
                                      " | " +
                                      (x.unit === "п.в." ? "п.в." : x.qty) +
                                      " | " +
                                      (x.unit === "п.в." ? "" : x.unit),
                                  )
                                  .join("\n")
                              }
                              onChange={(e) =>
                                updateParsed(i, {
                                  ingredientText: e.target.value,
                                  ingredients: parseIngredients(e.target.value),
                                })
                              }
                            />
                          </Field>
                          <Field label="Приготовление">
                            <textarea
                              rows={3}
                              value={d.recipe}
                              onChange={(e) =>
                                updateParsed(i, { recipe: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Примечания">
                            <textarea
                              rows={2}
                              value={d.notes || ""}
                              onChange={(e) =>
                                updateParsed(i, { notes: e.target.value })
                              }
                            />
                          </Field>
                          <button
                            className="text-link danger"
                            onClick={() => {
                              setParsedRecipes((a) =>
                                a.filter((_, n) => n !== i),
                              );
                              setDraft((d: any) => ({
                                ...d,
                                importReviewed: false,
                              }));
                            }}
                          >
                            Убрать из подборки
                          </button>
                        </details>
                      ))}
                      <div className="import-menu-options">
                        <h3>Добавить в меню</h3>
                        <div className="row">
                          <Field label="Период с">
                            <input
                              type="date"
                              value={mealDay}
                              onChange={(e) => {
                                const from = e.target.value,
                                  to = menuTo < from ? from : menuTo;
                                setMealDay(from);
                                setMenuTo(to);
                                mutate((d) => (d.menuPeriod = { from, to }));
                              }}
                            />
                          </Field>
                          <Field label="по">
                            <input
                              type="date"
                              min={mealDay}
                              value={menuTo}
                              onChange={(e) => {
                                setMenuTo(e.target.value);
                                mutate(
                                  (d) =>
                                    (d.menuPeriod = {
                                      from: mealDay,
                                      to: e.target.value,
                                    }),
                                );
                              }}
                            />
                          </Field>
                        </div>
                        <p>
                          {parsedRecipes.length} рецептов · общий период{" "}
                          {menuDateLabel(mealDay)} —{" "}
                          {menuDateLabel(menuTo < mealDay ? mealDay : menuTo)}
                        </p>
                        <label className="inline-check">
                          <input
                            type="checkbox"
                            checked={addImportedMenu}
                            onChange={(e) => {
                              setAddImportedMenu(e.target.checked);
                              if (!e.target.checked)
                                setReplaceImportedMenu(false);
                              setDraft((d: any) => ({
                                ...d,
                                importReviewed: false,
                              }));
                            }}
                          />{" "}
                          Добавить эти блюда в меню
                        </label>
                        <label className="inline-check">
                          <input
                            type="checkbox"
                            disabled={!addImportedMenu}
                            checked={replaceImportedMenu}
                            onChange={(e) => {
                              setReplaceImportedMenu(e.target.checked);
                              setDraft((d: any) => ({
                                ...d,
                                importReviewed: false,
                              }));
                            }}
                          />{" "}
                          Заменить всё текущее меню
                        </label>
                        {replaceImportedMenu && addImportedMenu && (
                          <p className="import-warning">
                            Все текущие позиции меню будут перемещены в корзину.
                          </p>
                        )}
                      </div>
                      <label className="inline-check">
                        <input
                          type="checkbox"
                          checked={draft.importReviewed || false}
                          onChange={(e) =>
                            setDraft((d: any) => ({
                              ...d,
                              importReviewed: e.target.checked,
                            }))
                          }
                        />{" "}
                        Я проверила данные подборки
                      </label>
                      <button
                        className="btn primary"
                        disabled={!draft.importReviewed}
                        onClick={saveParsedRecipes}
                      >
                        Сохранить всю подборку
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
          {page === "shelf" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ИСТОРИИ, КОТОРЫЕ ОСТАЮТСЯ</span>
                  <h1>
                    Моя полка<span>.</span>
                  </h1>
                  <ForestDetail kind="fox" className="heading-art" />
                  <p>Любимое, недосмотренное и то, о чём хочется рассказать.</p>
                </div>
                <div className="row shelf-heading-actions">
                  <button
                    className="help"
                    aria-label="Информация о полке"
                    title="Информация о полке"
                    onClick={() => setModal({ type: "shelfHelp" })}
                  >
                    <Leaf size={18} />
                  </button>
                  <button
                    className="btn primary"
                    onClick={() =>
                      open("media", {
                        title: "",
                        type: "Книги",
                        status: "process",
                        rating: 0,
                        review: "",
                        recommend: "unknown",
                        again: "unknown",
                        progress: "",
                        color: "#96a381",
                        spoilers: false,
                      })
                    }
                  >
                    <Plus size={16} /> На полку
                  </button>
                </div>
              </div>
              <SearchPanel
                label="Поиск и фильтры полки"
                active={
                  !!(
                    query ||
                    shelfType !== "Все" ||
                    rating ||
                    again ||
                    recommend
                  )
                }
                onReset={() => {
                  setQuery("");
                  setShelfType("Все");
                  setRating("");
                  setAgain("");
                  setRecommend("");
                }}
              >
                <div className="filter-main">
                  <div className="search-box">
                    <Search size={17} />
                    <input
                      aria-label="Поиск по полке"
                      placeholder="Название или слова из рецензии…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className="help"
                    aria-label="Обозначения на полке"
                    onClick={() => setModal({ type: "shelfHelp" })}
                  >
                    <Leaf size={16} />
                  </button>
                </div>
                <div className="shelf-filters">
                  <select
                    aria-label="Категория на полке"
                    value={shelfType}
                    onChange={(e) => setShelfType(e.target.value)}
                  >
                    <option>Все</option>
                    {mediaTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Рейтинг"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="">Любая оценка</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} листиков
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Желание вернуться"
                    value={again}
                    onChange={(e) => setAgain(e.target.value)}
                  >
                    <option value="">Вернуться к истории?</option>
                    <option value="yes">
                      Хочу перечитать / пересмотреть / переиграть
                    </option>
                    <option value="no">Не хочу возвращаться</option>
                    <option value="unknown">Пока не знаю</option>
                  </select>
                  <select
                    aria-label="Рекомендация"
                    value={recommend}
                    onChange={(e) => setRecommend(e.target.value)}
                  >
                    <option value="">Любая рекомендация</option>
                    <option value="yes">Рекомендую</option>
                    <option value="no">Не рекомендую</option>
                    <option value="some">Не всем</option>
                    <option value="unknown">Пока не решила</option>
                  </select>
                </div>
              </SearchPanel>
              <section className="shelf-section progress-shelf">
                <div className="shelf-heading">
                  <h2>
                    В процессе{" "}
                    <span>
                      {
                        filteredMedia.filter((m: any) => m.status === "process")
                          .length
                      }
                    </span>
                  </h2>
                  <span className="muted tiny">
                    Можно не спешить заканчивать
                  </span>
                </div>
                {filteredMedia.some((m: any) => m.status === "process") ? (
                  <ShelfObjects
                    open={open}
                    items={filteredMedia.filter(
                      (m: any) => m.status === "process",
                    )}
                  />
                ) : (
                  <div className="empty-shelf">
                    Здесь есть место для новой истории.
                  </div>
                )}
              </section>
              <section className="shelf-section">
                <div className="shelf-heading">
                  <h2>Остались впечатления</h2>
                  <span className="muted tiny">
                    От любимого — к тому, что не откликнулось
                  </span>
                </div>
                <div className="rated-shelves">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const items = filteredMedia
                      .filter(
                        (m: any) =>
                          m.status !== "process" && Number(m.rating) === n,
                      )
                      .sort((a: any, b: any) =>
                        (b.updatedAt || "").localeCompare(a.updatedAt || ""),
                      );
                    return (
                      items.length > 0 && (
                        <div className="rating-shelf" key={n}>
                          <div className="rating-label">
                            <Leaves value={n} />
                            <span>{n} / 5</span>
                          </div>
                          <ShelfObjects open={open} items={items} />
                        </div>
                      )
                    );
                  })}
                </div>
                {!filteredMedia.some(
                  (m: any) => m.status !== "process" && m.rating > 0,
                ) && (
                  <div className="empty-shelf">
                    Твои рецензии появятся на этих полках.
                  </div>
                )}
              </section>
              {filteredMedia.some(
                (m: any) => m.status !== "process" && !m.rating,
              ) && (
                <section className="shelf-section">
                  <h2>Пока без оценки</h2>
                  <ShelfObjects
                    open={open}
                    items={filteredMedia.filter(
                      (m: any) => m.status !== "process" && !m.rating,
                    )}
                  />
                </section>
              )}
            </>
          )}
          <footer className="main-footer">
            <span>
              <Sprout /> полянка
            </span>
            <span>
              {user
                ? "Твоё личное пространство"
                : "Демо · данные хранятся только в этом браузере"}
            </span>
          </footer>
        </main>
      </div>
      <nav className="mobile-nav">
        {data.settings.nav.map((id: string) => {
          const t = tabs.find((x) => x.id === id);
          if (!t) return null;
          const I = icons[t.icon];
          return (
            <button
              key={id}
              onClick={() => go(id)}
              className={page === id ? "active" : ""}
            >
              <I size={21} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </nav>
      {settings && (
        <Dialog
          title="Настройки полянки"
          onClose={() => setSettings("")}
          drawer
        >
          <div className="settings-tabs">
            {[
              ["appearance", "Оформление"],
              ["layout", "Расположение"],
              ["ideas", "Идеи для сайта"],
              ["account", "Аккаунт и данные"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={settings === id ? "active" : ""}
                onClick={() => setSettings(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {settings === "appearance" && (
            <div className="settings-body">
              <h3>Твоя палитра</h3>
              <p className="muted">Природные оттенки, в которых спокойно.</p>
              <div className="theme-options">
                {[
                  ["sage", "Шалфей", "#91a080", "#f0f0e5"],
                  ["moss", "Мох", "#718c70", "#e9ede5"],
                  ["oat", "Овёс", "#a89a74", "#f4f0e4"],
                ].map(([id, name, a, b]) => (
                  <button
                    className={
                      "theme-option " +
                      (data.settings.theme === id ? "active" : "")
                    }
                    key={id}
                    onClick={() => mutate((d) => (d.settings.theme = id))}
                  >
                    <span style={{ background: b }}>
                      <i style={{ background: a }} />
                      {data.settings.theme === id && <Check size={19} />}
                    </span>
                    {name}
                  </button>
                ))}
              </div>
              <h3>Время на полянке</h3>
              <div className="mode-options">
                {[
                  { id: "day", name: "День", icon: Sun },
                  { id: "night", name: "Тихий лес", icon: Moon },
                  { id: "system", name: "Как на устройстве", icon: Monitor },
                ].map((t) => (
                  <button
                    className={data.settings.mode === t.id ? "active" : ""}
                    key={t.id}
                    onClick={() => mutate((d) => (d.settings.mode = t.id))}
                  >
                    <t.icon size={23} />
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="curated-art-note">
                <Leaf size={18} />
                <span>
                  Иллюстрации и значок сайта оставлены в прежнем оформлении.
                </span>
              </div>
              <h3>Блюда в кухоньке</h3>
              <div className="segmented">
                <button
                  className={data.settings.dishView === "text" ? "active" : ""}
                  onClick={() => mutate((d) => (d.settings.dishView = "text"))}
                >
                  Текстом
                </button>
                <button
                  className={data.settings.dishView === "image" ? "active" : ""}
                  onClick={() => mutate((d) => (d.settings.dishView = "image"))}
                >
                  С картинками
                </button>
              </div>
              <label className="setting-check">
                <span>
                  Меньше анимации<small>Без декоративных переходов</small>
                </span>
                <input
                  type="checkbox"
                  checked={data.settings.reduceMotion}
                  onChange={(e) =>
                    mutate((d) => (d.settings.reduceMotion = e.target.checked))
                  }
                />
              </label>
              <p className="footnote">
                Основной шрифт — локальный Pixelify Sans с кириллицей. Никаких
                внешних шрифтов и подмен.
              </p>
            </div>
          )}
          {settings === "layout" && (
            <div className="settings-body">
              <h3>Порядок разделов</h3>
              <p className="muted">
                «Мой уголок» всегда открывается при входе.
              </p>
              {data.settings.nav.map((id: string, i: number) => (
                <div className="setting-row" key={id}>
                  <GripVertical size={16} />
                  <span className="grow">
                    {tabs.find((x) => x.id === id)?.name}
                  </span>
                  <button
                    className="icon-btn"
                    disabled={i === 0}
                    title="Выше"
                    onClick={() => moveSetting("nav", id, -1)}
                  >
                    <ArrowUp size={17} />
                  </button>
                  <button
                    className="icon-btn"
                    disabled={i === data.settings.nav.length - 1}
                    title="Ниже"
                    onClick={() => moveSetting("nav", id, 1)}
                  >
                    <ArrowDown size={17} />
                  </button>
                </div>
              ))}
              <h3>Блоки «Моего уголка»</h3>
              {data.settings.blocks.map((id: string, i: number) => (
                <div className="setting-row" key={id}>
                  <span className="grow">{blockNames[id]}</span>
                  <button
                    className="icon-btn"
                    disabled={i === 0}
                    title="Выше"
                    onClick={() => moveSetting("blocks", id, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    disabled={i === data.settings.blocks.length - 1}
                    title="Ниже"
                    onClick={() => moveSetting("blocks", id, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    className="icon-btn"
                    title={
                      data.settings.hidden.includes(id) ? "Показать" : "Скрыть"
                    }
                    onClick={() =>
                      mutate((d) => {
                        d.settings.hidden = d.settings.hidden.includes(id)
                          ? d.settings.hidden.filter((x: string) => x !== id)
                          : [...d.settings.hidden, id];
                      })
                    }
                  >
                    {data.settings.hidden.includes(id) ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
          {settings === "ideas" && (
            <div className="settings-body">
              <h3>Записать, пока не забыла</h3>
              <p className="muted">Твои заметки для будущих изменений кода.</p>
              <button
                className="btn soft"
                onClick={() =>
                  open("idea", { title: "", text: "", done: false })
                }
              >
                <Plus size={16} /> Новая идея
              </button>
              <div className="ideas-list">
                {data.ideas.map((i: any) => (
                  <div className="idea-item" key={i.id}>
                    <button
                      className={"check " + (i.done ? "checked" : "")}
                      aria-label="Отметить сделанной"
                      onClick={() =>
                        mutate((d) => {
                          const x = d.ideas.find((x: any) => x.id === i.id);
                          x.done = !x.done;
                        })
                      }
                    >
                      {i.done && <Check size={13} />}
                    </button>
                    <button
                      className={"plain grow " + (i.done ? "struck" : "")}
                      onClick={() => open("idea", i)}
                    >
                      <strong>{i.title}</strong>
                      <p>{i.text}</p>
                    </button>
                    <button
                      className="icon-btn"
                      title="Удалить идею"
                      onClick={() => remove("ideas", i.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              {!data.ideas.length && (
                <Empty text="Можно записать даже самую маленькую поправку." />
              )}
            </div>
          )}
          {settings === "account" && (
            <div className="settings-body">
              <h3>
                {user ? "Мой аккаунт" : "Одна полянка на всех устройствах"}
              </h3>
              {user ? (
                <>
                  <div className="account-box">
                    <span className="avatar">
                      <Sprout />
                    </span>
                    <div>
                      <strong>{user.email}</strong>
                      <small>{sync}</small>
                    </div>
                  </div>
                  <div className="row wrap">
                    <button
                      className="btn soft"
                      disabled={saving}
                      onClick={() => {
                        needsSync.current = true;
                        saveCloud();
                      }}
                    >
                      Синхронизировать
                    </button>
                    <button className="btn ghost" onClick={logout}>
                      <LogOut size={15} /> Выйти
                    </button>
                  </div>
                  {conflict.current && (
                    <div className="notice">
                      <p>
                        На другом устройстве появились изменения. Чтобы ничего
                        не потерять, сначала скачай резервную копию текущих
                        правок, затем загрузи облачную версию.
                      </p>
                      <button className="text-link" onClick={exportBackup}>
                        1. Скачать текущую копию
                      </button>
                      <button
                        className="text-link"
                        onClick={() => {
                          if (
                            confirm(
                              "Заменить текущий экран облачной версией? Сохрани резервную копию своих правок перед продолжением.",
                            )
                          )
                            refreshCloud(true);
                        }}
                      >
                        2. Загрузить облачную версию
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="notice">
                    <strong>
                      {configured
                        ? "Можно создать личный аккаунт"
                        : "Сейчас открыт локальный деморежим"}
                    </strong>
                    <p>
                      {configured
                        ? "После входа записи и настройки будут доступны с других устройств. Демоданные не переносятся автоматически."
                        : "Neon ещё не подключён. Данные демо сохраняются в этом браузере, но не синхронизируются. Для аккаунтов добавь DATABASE_URL в настройках проекта Vercel и выполни повторное развёртывание."}
                    </p>
                  </div>
                  <button
                    className="btn primary"
                    onClick={() =>
                      open("auth", { action: "login", email: "", password: "" })
                    }
                  >
                    <LogIn size={16} /> Войти / создать аккаунт
                  </button>
                </>
              )}
              <h3>Резервная копия</h3>
              <p className="muted">
                Содержит записи, рецепты, картинки и настройки. Храни файл в
                безопасном месте: он не зашифрован.
              </p>
              <div className="row wrap">
                <button className="btn soft" onClick={exportBackup}>
                  <Download size={16} /> Скачать JSON
                </button>
                <label className="btn ghost">
                  <Upload size={16} /> Восстановить
                  <input
                    type="file"
                    accept="application/json,.json"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0]) importBackup(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <h3>
                Корзина <span className="muted">({data.trash.length})</span>
              </h3>
              {data.trash.map((t: any) => (
                <div className="setting-row" key={t.id}>
                  <span className="grow">
                    {t.collection === "notes" && t.item.kind === "troubles"
                      ? "Закрытая запись"
                      : t.item.title || t.item.name || t.item.text || "Запись"}
                  </span>
                  <button
                    className="icon-btn"
                    title="Восстановить"
                    onClick={() => {
                      mutate((d) => {
                        if (
                          !d[t.collection].some((x: any) => x.id === t.item.id)
                        )
                          d[t.collection].push(t.item);
                        d.trash = d.trash.filter((x: any) => x.id !== t.id);
                      });
                      tell("Восстановлено");
                    }}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    className="icon-btn danger"
                    title="Удалить навсегда"
                    onClick={() => {
                      if (confirm("Удалить навсегда? Это нельзя отменить."))
                        mutate(
                          (d) =>
                            (d.trash = d.trash.filter(
                              (x: any) => x.id !== t.id,
                            )),
                        );
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {!data.trash.length && (
                <p className="muted">
                  Пусто. Удалённое можно будет восстановить здесь.
                </p>
              )}
              {!user && (
                <button
                  className="text-link danger"
                  onClick={() => {
                    if (
                      confirm(
                        "Очистить демонстрационные записи и начать с пустой полянки на этом устройстве?",
                      )
                    ) {
                      mutate((d) => {
                        Object.assign(d, emptyData());
                      });
                      tell("Теперь здесь только твоё");
                    }
                  }}
                >
                  Очистить демоданные
                </button>
              )}
            </div>
          )}
        </Dialog>
      )}
      {modal && (
        <Dialog
          title={
            (
              {
                shelfHelp: "Своя полка — как всё устроено",
                help: "Листик-подсказка",
                dish: "Твой рецепт",
                dishView: "Из твоей кухоньки",
                menu: "Добавить в меню",
                prepared: "Приготовила",
                media: "Место на полке",
                mediaView: "Твоя история",
                auth: "Добро пожаловать домой",
                fridge: "Что есть дома",
                idea: "Идея для полянки",
              } as any
            )[modal.type] || "полянка"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "shelfHelp" && <ShelfInformation />}
          {modal.type === "help" && (
            <div className="help-content">
              <Leaf size={36} />
              <p>{modal.text}</p>
              <button className="btn soft" onClick={() => setModal(null)}>
                Понятно
              </button>
            </div>
          )}
          {modal.type === "dish" && (
            <form
              className="editor-form"
              onSubmit={(e) => {
                e.preventDefault();
                saveItem("dishes", {
                  ...draft,
                  portions: Number(draft.portions),
                  kcal: draft.kcal === "" ? "" : Number(draft.kcal),
                  ingredients: parseIngredients(draft.ingredientText || ""),
                });
              }}
            >
              <Field label="Название блюда">
                <input
                  required
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </Field>
              <div className="form-grid">
                <Field label="Категория">
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({ ...draft, category: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Базовое число порций">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    value={draft.portions}
                    onChange={(e) =>
                      setDraft({ ...draft, portions: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Ккал на одну порцию — только если известны">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Не указано"
                  value={draft.kcal}
                  onChange={(e) => setDraft({ ...draft, kcal: e.target.value })}
                />
              </Field>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={!!draft.kcalEstimated}
                  onChange={(e) =>
                    setDraft({ ...draft, kcalEstimated: e.target.checked })
                  }
                />{" "}
                Калорийность приблизительная
              </label>
              <Field label="Ингредиенты: продукт | количество | единица, каждый с новой строки">
                <textarea
                  rows={6}
                  value={draft.ingredientText || ""}
                  placeholder={"Сыр | 100 | г\nМолоко | 200 | мл\nСоль"}
                  onChange={(e) =>
                    setDraft({ ...draft, ingredientText: e.target.value })
                  }
                />
              </Field>
              <Field label="Приготовление и заметки">
                <textarea
                  rows={5}
                  value={draft.recipe}
                  onChange={(e) =>
                    setDraft({ ...draft, recipe: e.target.value })
                  }
                />
              </Field>
              <Field label="Примечания">
                <textarea
                  rows={3}
                  value={draft.notes || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, notes: e.target.value })
                  }
                />
              </Field>
              <label className="upload-box">
                <Upload size={19} />
                {draft.image
                  ? "Заменить фотографию"
                  : "Загрузить свою фотографию"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    e.target.files?.[0] && image(e.target.files[0])
                  }
                />
              </label>
              {draft.image && (
                <div className="uploaded-preview">
                  <img src={draft.image} alt="Фотография блюда" />
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setDraft({ ...draft, image: "" })}
                  >
                    Убрать картинку
                  </button>
                </div>
              )}
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={draft.liked}
                  onChange={(e) =>
                    setDraft({ ...draft, liked: e.target.checked })
                  }
                />{" "}
                Понравилось — добавить в любимые
              </label>
              {draft.source && (
                <details>
                  <summary>Исходный текст</summary>
                  <p className="preserve muted">{draft.source}</p>
                  {(draft.sourceHistory || []).map(
                    (source: string, i: number) => (
                      <details key={i}>
                        <summary>Дополнительный исходник {i + 1}</summary>
                        <p className="preserve muted">{source}</p>
                      </details>
                    ),
                  )}
                </details>
              )}
              <div className="row spread">
                <button className="btn primary">Сохранить блюдо</button>
                {draft.id && (
                  <button
                    type="button"
                    className="text-link danger"
                    onClick={() => remove("dishes", draft.id)}
                  >
                    Не понравилось — в корзину
                  </button>
                )}
              </div>
            </form>
          )}
          {modal.type === "menu" && (
            <form
              className="editor-form"
              onSubmit={(e) => {
                e.preventDefault();
                saveMenuItem({
                  ...draft,
                  portions: Number(draft.portions),
                });
              }}
            >
              <Field label="Блюдо">
                <select
                  required
                  value={draft.dishId}
                  onChange={(e) =>
                    setDraft({ ...draft, dishId: e.target.value })
                  }
                >
                  <option value="">Выбери блюдо</option>
                  {data.dishes.map((d: any) => (
                    <option value={d.id} key={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Количество порций">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={draft.portions}
                  onChange={(e) =>
                    setDraft({ ...draft, portions: e.target.value })
                  }
                />
              </Field>
              <button className="text-link" type="button" onClick={addDish}>
                <Plus size={14} /> Сначала вписать новое блюдо вручную
              </button>
              <button className="btn primary" disabled={!draft.dishId}>
                Сохранить в меню
              </button>
              {draft.id && (
                <button
                  type="button"
                  className="text-link danger"
                  onClick={() => remove("menu", draft.id)}
                >
                  Убрать из меню
                </button>
              )}
            </form>
          )}
          {modal.type === "prepared" && (
            <form
              className="editor-form"
              onSubmit={(e) => {
                e.preventDefault();
                mutate((d) => {
                  for (const u of draft.usage) {
                    if (!u.enabled || u.amount === "") continue;
                    const f = d.fridge.find((x: any) => x.id === u.fridgeId);
                    if (f && f.qty !== "")
                      f.qty = Math.max(0, Number(f.qty) - Number(u.amount));
                  }
                  const m = d.menu.find((x: any) => x.id === draft.menuId);
                  if (m) m.prepared = true;
                });
                setModal(null);
                tell("Отмечено приготовленным. Выбранные запасы обновлены.");
              }}
            >
              <h3>{draft.title}</h3>
              <p className="muted">
                Выбери, что списать из запасов. Количества можно изменить.
                Продукты без точного количества не списываются.
              </p>
              {draft.usage.map((u: any, i: number) => (
                <div className="usage-row" key={i}>
                  <label className="inline-check grow">
                    <input
                      type="checkbox"
                      checked={u.enabled}
                      disabled={!u.fridgeId}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          usage: draft.usage.map((v: any, n: number) =>
                            n === i ? { ...v, enabled: e.target.checked } : v,
                          ),
                        })
                      }
                    />
                    {u.name}
                  </label>
                  {u.fridgeId ? (
                    <>
                      <input
                        aria-label={"Списать " + u.name}
                        type="number"
                        min="0"
                        step="any"
                        value={u.amount}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            usage: draft.usage.map((v: any, n: number) =>
                              n === i ? { ...v, amount: e.target.value } : v,
                            ),
                          })
                        }
                      />
                      <span className="tiny">{u.unit}</span>
                    </>
                  ) : (
                    <span className="tiny muted">Нет в запасах</span>
                  )}
                </div>
              ))}
              <button className="btn primary">Подтвердить</button>
            </form>
          )}
          {modal.type === "fridge" && (
            <form
              className="editor-form"
              onSubmit={(e) => {
                e.preventDefault();
                saveItem("fridge", {
                  ...draft,
                  qty: draft.qty === "" ? "" : Number(draft.qty),
                });
              }}
            >
              <Field label="Продукт">
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </Field>
              <div className="form-grid">
                <Field label="Количество (необязательно)">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={draft.qty}
                    onChange={(e) =>
                      setDraft({ ...draft, qty: e.target.value })
                    }
                  />
                </Field>
                <Field label="Единица">
                  <input
                    placeholder="г, мл, шт…"
                    value={draft.unit}
                    onChange={(e) =>
                      setDraft({ ...draft, unit: e.target.value })
                    }
                  />
                </Field>
              </div>
              <button className="btn primary">Сохранить запас</button>
            </form>
          )}
          {modal.type === "idea" && (
            <form
              className="editor-form"
              onSubmit={(e) => {
                e.preventDefault();
                saveItem("ideas", draft);
              }}
            >
              <Field label="Что хочется изменить">
                <input
                  required
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </Field>
              <Field label="Записулька">
                <textarea
                  rows={7}
                  value={draft.text}
                  onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                />
              </Field>
              <button className="btn primary">Сохранить идею</button>
            </form>
          )}
          {modal.type === "media" && (
            <form
              className="editor-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  draft.publish &&
                  (!draft.rating ||
                    !draft.review?.trim() ||
                    draft.recommend === "unknown")
                )
                  return tell(
                    "Для готовой рецензии поставь оценку, напиши почему и выбери рекомендацию. Можно сохранить черновик.",
                  );
                saveItem("media", {
                  ...draft,
                  updatedAt: new Date().toISOString(),
                });
              }}
            >
              <Field label="Название">
                <input
                  required
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </Field>
              <div className="form-grid">
                <Field label="Категория">
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      setDraft({ ...draft, type: e.target.value })
                    }
                  >
                    {mediaTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Состояние">
                  <select
                    value={draft.status}
                    onChange={(e) =>
                      setDraft({ ...draft, status: e.target.value })
                    }
                  >
                    <option value="process">В процессе</option>
                    <option value="done">Закончила</option>
                    <option value="dropped">Не закончила и не хочу</option>
                  </select>
                </Field>
              </div>
              <Field label="Где остановилась / заметка">
                <input
                  value={draft.progress || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, progress: e.target.value })
                  }
                />
              </Field>
              <Field label="Твоя оценка">
                <Leaves
                  value={Number(draft.rating)}
                  onChange={(n) => setDraft({ ...draft, rating: n })}
                />
              </Field>
              <Field label="Почему столько листиков?">
                <textarea
                  rows={5}
                  value={draft.review}
                  onChange={(e) =>
                    setDraft({ ...draft, review: e.target.value })
                  }
                />
              </Field>
              <div className="form-grid">
                <Field label="Рекомендую другим?">
                  <select
                    value={draft.recommend}
                    onChange={(e) =>
                      setDraft({ ...draft, recommend: e.target.value })
                    }
                  >
                    <option value="unknown">Пока не решила</option>
                    <option value="yes">Да</option>
                    <option value="no">Нет</option>
                    <option value="some">Не всем</option>
                  </select>
                </Field>
                <Field
                  label={
                    draft.type === "Книги"
                      ? "Хочу перечитать?"
                      : draft.type === "Игры"
                        ? "Хочу переиграть?"
                        : "Хочу пересмотреть?"
                  }
                >
                  <select
                    value={draft.again}
                    onChange={(e) =>
                      setDraft({ ...draft, again: e.target.value })
                    }
                  >
                    <option value="unknown">Пока не знаю</option>
                    <option value="yes">Да</option>
                    <option value="no">Нет</option>
                  </select>
                </Field>
              </div>
              <Field label="Кому и почему (необязательно)">
                <input
                  value={draft.audience || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, audience: e.target.value })
                  }
                />
              </Field>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={!!draft.spoilers}
                  onChange={(e) =>
                    setDraft({ ...draft, spoilers: e.target.checked })
                  }
                />{" "}
                В рецензии есть спойлеры
              </label>
              <div className="form-grid">
                <Field label="Цвет корешка / коробки">
                  <input
                    type="color"
                    value={draft.color || "#96a381"}
                    onChange={(e) =>
                      setDraft({ ...draft, color: e.target.value })
                    }
                  />
                </Field>
                <label className="upload-box">
                  <Upload size={17} />
                  {draft.image ? "Заменить обложку" : "Своя обложка"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      e.target.files?.[0] && image(e.target.files[0])
                    }
                  />
                </label>
              </div>
              {draft.image && (
                <img className="small-cover" src={draft.image} alt="Обложка" />
              )}
              <div className="row wrap">
                <button
                  className="btn primary"
                  onClick={() => setDraft({ ...draft, publish: true })}
                >
                  Сохранить рецензию
                </button>
                <button
                  className="btn soft"
                  onClick={() => setDraft({ ...draft, publish: false })}
                >
                  Сохранить черновик
                </button>
              </div>
            </form>
          )}
          {modal.type === "mediaView" && (
            <div className="media-detail">
              {draft.image && (
                <img
                  className="media-cover"
                  src={draft.image}
                  alt={draft.title}
                />
              )}
              <span className="eyebrow">
                {draft.type} ·{" "}
                {draft.status === "process"
                  ? "В процессе"
                  : draft.status === "dropped"
                    ? "Не закончила"
                    : "Завершено"}
              </span>
              <h2>{draft.title}</h2>
              {draft.rating > 0 ? (
                <Leaves value={draft.rating} />
              ) : (
                <p className="muted">Пока без оценки</p>
              )}
              {draft.progress && (
                <p className="progress-note">{draft.progress}</p>
              )}
              {draft.spoilers ? (
                <details className="spoiler">
                  <summary>Рецензия со спойлерами — открыть</summary>
                  <p className="preserve">{draft.review}</p>
                </details>
              ) : (
                <p className="preserve">
                  {draft.review || "Слова о впечатлениях появятся позже."}
                </p>
              )}
              <div className="review-tags">
                <span className="tag">
                  {draft.recommend === "yes"
                    ? "Рекомендую"
                    : draft.recommend === "no"
                      ? "Не рекомендую"
                      : draft.recommend === "some"
                        ? "Рекомендую не всем"
                        : "Рекомендация не выбрана"}
                </span>
                {draft.again === "yes" && (
                  <span className="tag">
                    {draft.type === "Книги"
                      ? "Хочу перечитать"
                      : draft.type === "Игры"
                        ? "Хочу переиграть"
                        : "Хочу пересмотреть"}
                  </span>
                )}
              </div>
              {draft.audience && (
                <p className="muted">Кому: {draft.audience}</p>
              )}
              <div className="row wrap">
                <button
                  className="btn soft"
                  onClick={() => open("media", draft)}
                >
                  <Pencil size={15} /> Редактировать
                </button>
                <button
                  className="icon-btn danger"
                  title="Удалить с полки"
                  onClick={() => remove("media", draft.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
          {modal.type === "auth" && (
            <form className="editor-form" onSubmit={auth}>
              <div className="segmented">
                <button
                  type="button"
                  className={draft.action === "login" ? "active" : ""}
                  onClick={() => setDraft({ ...draft, action: "login" })}
                >
                  Войти
                </button>
                <button
                  type="button"
                  className={draft.action === "register" ? "active" : ""}
                  onClick={() => setDraft({ ...draft, action: "register" })}
                >
                  Создать аккаунт
                </button>
              </div>
              {!configured && (
                <div className="notice">
                  Для входа сначала нужно подключить Neon через DATABASE_URL в
                  Vercel. Пока можно изучать сайт в локальном деморежиме.
                </div>
              )}
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={draft.email}
                  onChange={(e) =>
                    setDraft({ ...draft, email: e.target.value })
                  }
                />
              </Field>
              <Field label="Пароль — не менее 8 символов">
                <input
                  type="password"
                  minLength={8}
                  maxLength={200}
                  required
                  autoComplete={
                    draft.action === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  value={draft.password}
                  onChange={(e) =>
                    setDraft({ ...draft, password: e.target.value })
                  }
                />
              </Field>
              <button
                className="btn primary"
                disabled={authBusy || !configured}
              >
                {authBusy
                  ? "Открываем…"
                  : draft.action === "register"
                    ? "Создать свою полянку"
                    : "Войти на полянку"}
              </button>
              <p className="footnote">
                В первом варианте нет восстановления пароля по почте. Сохрани
                пароль в менеджере паролей. Для незнакомых людей регистрацию
                пока не публикуем.
              </p>
            </form>
          )}
        </Dialog>
      )}
      {toast && (
        <div className="toast" role="status">
          <Leaf size={17} />
          {toast}
          <button
            className="icon-btn"
            aria-label="Закрыть уведомление"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
