"use client";
import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  NotebookPen,
  Cloud,
  ClipboardList,
  Cake,
  Search,
  Lock,
  Unlock,
  Plus,
  Pencil,
  Check,
  Trash2,
  Pin,
  ArrowLeft,
  ArrowRight,
  Leaf,
  X,
  CalendarDays,
  Download,
  BookOpen,
} from "lucide-react";
import { today, uid, normalize, nextBirthday } from "@/lib/data";
import { paginateText, TextPage } from "@/lib/pagination";
import { exportBirthdays } from "@/lib/calendar";
import { ForestDetail } from "@/app/art";
const dateLabel = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const tabDefs = [
  { id: "thoughts", icon: NotebookPen, label: "Мысли" },
  { id: "troubles", icon: Cloud, label: "Маленькие трудности" },
  { id: "tasks", icon: ClipboardList, label: "Список дел" },
  { id: "birthdays", icon: Cake, label: "Дни рождения" },
  { id: "search", icon: Search, label: "Поиск" },
];
export default function Journal({
  data,
  mutate,
  tell,
  request,
  memoryKey,
}: {
  data: any;
  mutate: any;
  tell: (s: string) => void;
  request: any;
  memoryKey: string;
}) {
  const [tab, setTab] = useState("thoughts"),
    [unlocked, setUnlocked] = useState(false),
    [selection, setSelection] = useState({ id: "", offset: 0 }),
    [editing, setEditing] = useState<any>(null),
    [status, setStatus] = useState(""),
    [bookHeight, setBookHeight] = useState(620),
    [size, setSize] = useState({ width: 300, height: 260 }),
    [textPages, setTextPages] = useState<any[]>([]),
    [fontTick, setFontTick] = useState(0),
    [turn, setTurn] = useState(0),
    [direction, setDirection] = useState("next"),
    [toolPage, setToolPage] = useState(0),
    [taskEdit, setTaskEdit] = useState(""),
    [birthdayEdit, setBirthdayEdit] = useState<any>(null),
    [query, setQuery] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [kind, setKind] = useState("thoughts"),
    [help, setHelp] = useState(false);
  const slot = useRef<HTMLDivElement>(null),
    probe = useRef<HTMLDivElement>(null),
    textarea = useRef<HTMLTextAreaElement>(null),
    latest = useRef<any>(null),
    dirty = useRef(false),
    mutateRef = useRef(mutate),
    caret = useRef<number | null>(null),
    restoreFocus = useRef(false),
    seenRequest = useRef(""),
    lastWidth = useRef(0),
    searchRef = useRef<HTMLDivElement>(null);
  mutateRef.current = mutate;
  const notes = useMemo(() => {
    let a = data.notes.filter(
      (n: any) => n.kind === (tab === "troubles" ? "troubles" : "thoughts"),
    );
    if (editing) {
      a = a.filter((n: any) => n.id !== editing.id);
      a.push(editing);
    }
    return a.sort(
      (a: any, b: any) =>
        b.date.localeCompare(a.date) ||
        (b.createdAt || "").localeCompare(a.createdAt || ""),
    );
  }, [data.notes, tab, editing]);
  function write(v: any) {
    if (!v || (!v.title.trim() && !v.text.trim())) return;
    mutateRef.current((d: any) => {
      const n = { ...v, updatedAt: new Date().toISOString() };
      const i = d.notes.findIndex((x: any) => x.id === n.id);
      if (i < 0) d.notes.push(n);
      else d.notes[i] = n;
    });
  }
  function flush() {
    if (dirty.current && latest.current) {
      write(latest.current);
      dirty.current = false;
      setStatus("Запись сохранена");
    }
  }
  useEffect(
    () => () => {
      if (dirty.current) write(latest.current);
    },
    [],
  );
  useEffect(() => {
    latest.current = editing;
    if (!editing || !dirty.current) return;
    setStatus("Сохраняем…");
    const t = setTimeout(() => {
      write(editing);
      dirty.current = false;
      setStatus("Запись сохранена");
    }, 750);
    return () => clearTimeout(t);
  }, [editing]);
  function change(p: any) {
    dirty.current = true;
    setEditing((v: any) => {
      const n = { ...v, ...p };
      latest.current = n;
      return n;
    });
  }
  function animate(dir = "next") {
    setDirection(dir);
    setTurn((n) => n + 1);
  }
  function chooseTab(id: string) {
    flush();
    setEditing(null);
    setBirthdayEdit(null);
    setTaskEdit("");
    setTab(id);
    setToolPage(0);
    setHelp(false);
    animate();
    if (id === "troubles" && data.settings.lockTroubles) setUnlocked(false);
  }
  function newNote(kind = tab) {
    flush();
    const n = {
      id: uid(),
      title: "",
      text: "",
      date: today(),
      time: "",
      kind: kind === "troubles" ? "troubles" : "thoughts",
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    latest.current = n;
    setEditing(n);
    setSelection({ id: n.id, offset: 0 });
    setStatus("Коснись страницы, чтобы писать");
    animate();
  }
  function readNote(n: any) {
    flush();
    setEditing(null);
    setTab(n.kind === "troubles" ? "troubles" : "thoughts");
    setSelection({ id: n.id, offset: 0 });
    animate();
  }
  useEffect(() => {
    try {
      const s = JSON.parse(
        localStorage.getItem("polyanka-book-" + memoryKey) || "null",
      );
      if (s?.id && Number.isFinite(s.offset)) setSelection(s);
    } catch {}
  }, [memoryKey]);
  useEffect(() => {
    if (tab === "thoughts" && selection.id)
      try {
        localStorage.setItem(
          "polyanka-book-" + memoryKey,
          JSON.stringify(selection),
        );
      } catch {}
  }, [selection, tab, memoryKey]);
  useEffect(() => {
    if (!request || seenRequest.current === request.key) return;
    seenRequest.current = request.key;
    if (request.type === "new") {
      setTab(request.kind || "thoughts");
      newNote(request.kind || "thoughts");
    } else if (request.type === "read") {
      readNote(request.item);
    } else if (request.type === "birthday") {
      setTab("birthdays");
      setBirthdayEdit(structuredClone(request.item));
    } else if (request.type === "birthdayList") {
      setTab("birthdays");
    } else if (request.type === "task") {
      setTab("tasks");
      setTaskEdit(request.item.id);
    }
  }, [request]);
  useLayoutEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w === lastWidth.current) return;
      lastWidth.current = w;
      setBookHeight(
        Math.max(
          w < 600 ? 350 : 480,
          Math.min(
            w < 600 ? 680 : 720,
            window.innerHeight - (w < 600 ? 350 : 245),
          ),
        ),
      );
    }
    update();
    window.addEventListener("resize", update);
    document.fonts.ready.then(() => setFontTick((x) => x + 1));
    return () => window.removeEventListener("resize", update);
  }, []);
  useLayoutEffect(() => {
    const el = slot.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.floor(el.clientWidth),
        h = Math.floor(el.clientHeight);
      if (w > 0 && h > 0)
        setSize((s) =>
          s.width === w && s.height === h ? s : { width: w, height: h },
        );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab, bookHeight, birthdayEdit !== null, turn]);
  useLayoutEffect(() => {
    if (!probe.current) return;
    const p = notes.flatMap((note: any) =>
      paginateText(note.text, probe.current!, size.width, size.height).map(
        (p: TextPage, i: number, a: TextPage[]) => ({
          ...p,
          note,
          part: i,
          total: a.length,
        }),
      ),
    );
    setTextPages(p);
  }, [notes, size, fontTick]);
  let pageIndex = textPages.findIndex(
    (p) =>
      p.note.id === selection.id &&
      selection.offset >= p.start &&
      (selection.offset < p.end ||
        (p.part === p.total - 1 && selection.offset === p.end)),
  );
  if (pageIndex < 0) pageIndex = 0;
  const current = textPages[pageIndex],
    note = current?.note;
  useLayoutEffect(() => {
    if (
      editing &&
      caret.current !== null &&
      current &&
      textarea.current &&
      restoreFocus.current
    ) {
      const pos = Math.max(
        0,
        Math.min(current.text.length, caret.current - current.start),
      );
      textarea.current.focus({ preventScroll: true });
      textarea.current.setSelectionRange(pos, pos);
      caret.current = null;
      restoreFocus.current = false;
    }
  }, [current?.text, current?.start, editing?.text]);
  function turnPage(delta: number) {
    if (editing) flush();
    if (tab === "thoughts" || tab === "troubles") {
      const p = textPages[pageIndex + delta];
      if (!p) return;
      setSelection({ id: p.note.id, offset: p.start });
      if (editing && p.note.id !== editing.id) setEditing(null);
    } else setToolPage((p) => Math.max(0, p + delta));
    animate(delta > 0 ? "next" : "previous");
  }
  function trash(collection: string, item: any) {
    if (collection === "notes" && editing?.id === item.id) {
      dirty.current = false;
      latest.current = null;
      setEditing(null);
    }
    mutate((d: any) => {
      d.trash.unshift({
        id: uid(),
        collection,
        item,
        deletedAt: new Date().toISOString(),
      });
      d[collection] = d[collection].filter((x: any) => x.id !== item.id);
    });
    tell("Перемещено в корзину");
  }
  const isNote = tab === "thoughts" || tab === "troubles",
    locked = tab === "troubles" && data.settings.lockTroubles && !unlocked;
  const perPage = Math.max(1, Math.floor(size.height / 58));
  const birthdays = [...data.birthdays].sort(
    (a: any, b: any) => nextBirthday(a) - nextBirthday(b),
  );
  const results = data.notes
    .filter(
      (n: any) =>
        n.kind ===
          (kind === "troubles" && data.settings.lockTroubles && !unlocked
            ? "thoughts"
            : kind) &&
        (!query ||
          normalize(n.title + " " + n.text).includes(normalize(query))) &&
        (!from || n.date >= from) &&
        (!to || n.date <= to),
    )
    .sort((a: any, b: any) => b.date.localeCompare(a.date));
  const items =
    tab === "tasks" ? data.tasks : tab === "birthdays" ? birthdays : results;
  const totalPages = isNote
    ? Math.max(1, textPages.length)
    : Math.max(1, Math.ceil(items.length / perPage));
  const toolIndex = Math.min(toolPage, totalPages - 1),
    position = isNote ? pageIndex : toolIndex;
  // Decorative layers reflect both section position and progress within that section.
  const sectionIndex = tabDefs.findIndex((t) => t.id === tab);
  const localProgress = position / Math.max(1, totalPages - 1);
  const rightSheets = locked
    ? 4
    : Math.max(1, Math.round(7 - sectionIndex - localProgress * 2));
  const leftSheets = locked ? 1 : Math.max(1, 8 - rightSheets);
  const toolItems = items.slice(toolIndex * perPage, (toolIndex + 1) * perPage);
  function saveBirthday(e: any) {
    e.preventDefault();
    const v = birthdayEdit;
    if (!v.name.trim() || !v.date) return;
    mutate((d: any) => {
      const i = d.birthdays.findIndex((x: any) => x.id === v.id);
      if (i < 0) d.birthdays.push(v);
      else d.birthdays[i] = v;
    });
    setBirthdayEdit(null);
    tell("Дата сохранена");
  }
  return (
    <>
      <div className="page-heading journal-heading">
        <div>
          <span className="eyebrow">ТО, ЧТО ВНУТРИ</span>
          <h1>
            Мой дневник<span>.</span>
          </h1>
          <p>Одна страница за раз. В своём темпе.</p>
        </div>
        <ForestDetail kind="fern" />
      </div>
      <div
        className="journal journal-v2"
        style={
          {
            "--book-height": bookHeight + "px",
            "--sheet-right": rightSheets,
            "--sheet-left": leftSheets,
          } as any
        }
      >
        <div className="journal-tabs">
          {tabDefs.map((t) => (
            <div className="journal-tab-wrap" key={t.id}>
              <button
                className={"journal-tab " + (tab === t.id ? "active" : "")}
                title={t.label}
                aria-label={t.label}
                aria-pressed={tab === t.id}
                onClick={() => chooseTab(t.id)}
              >
                <t.icon size={24} />
              </button>
              {t.id === "troubles" && (
                <button
                  className="tab-lock"
                  aria-label="Защита вкладки"
                  title={
                    data.settings.lockTroubles
                      ? "Выключить защиту"
                      : "Включить защиту"
                  }
                  onClick={() => {
                    mutate(
                      (d: any) =>
                        (d.settings.lockTroubles = !d.settings.lockTroubles),
                    );
                    setUnlocked(false);
                  }}
                >
                  {data.settings.lockTroubles ? (
                    <Lock size={11} />
                  ) : (
                    <Unlock size={11} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="sheet-stack stack-left" aria-hidden="true">
          {Array.from({ length: leftSheets }, (_, i) => (
            <i
              key={i}
              style={{ transform: `translate(${-i * 1.3}px, ${i * 1.1}px)` }}
            />
          ))}
        </div>
        <div className="sheet-stack stack-right" aria-hidden="true">
          {Array.from({ length: rightSheets }, (_, i) => (
            <i
              key={i}
              style={{ transform: `translate(${i * 1.6}px, ${i * 1.1}px)` }}
            />
          ))}
        </div>
        <section className="journal-paper" aria-label="Страницы дневника">
          <div className="binding" />
          <div
            className={"journal-leaf leaf-" + direction}
            key={tab + "-" + turn}
          >
            <div className="book-toolbar">
              <span>{tabDefs.find((t) => t.id === tab)?.label}</span>
              <div className="row">
                {isNote && !locked && (
                  <>
                    <button
                      className="icon-btn"
                      title="Новая запись"
                      aria-label="Новая запись"
                      onClick={() => newNote()}
                    >
                      <Plus size={18} />
                    </button>
                    {note && !editing && (
                      <button
                        className="icon-btn"
                        title="Редактировать запись"
                        onClick={() => {
                          setEditing(structuredClone(note));
                          latest.current = structuredClone(note);
                          setStatus("Коснись текста, чтобы писать");
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {editing && (
                      <button
                        className="icon-btn accent"
                        title="Режим чтения"
                        aria-label="Режим чтения"
                        onClick={() => {
                          flush();
                          setEditing(null);
                        }}
                      >
                        <BookOpen size={18} />
                      </button>
                    )}
                    {tab === "troubles" && data.settings.lockTroubles && (
                      <button
                        className="icon-btn"
                        title="Заблокировать вкладку"
                        onClick={() => {
                          flush();
                          setEditing(null);
                          setUnlocked(false);
                        }}
                      >
                        <Lock size={15} />
                      </button>
                    )}
                  </>
                )}
                {tab === "birthdays" && !birthdayEdit && (
                  <>
                    <button
                      className="icon-btn"
                      aria-label="Добавить день рождения"
                      onClick={() =>
                        setBirthdayEdit({
                          id: uid(),
                          name: "",
                          date: today(),
                          remind: 7,
                          ideas: "",
                          color: "#c98189",
                        })
                      }
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      className="icon-btn"
                      aria-label="Все дни рождения в календарь"
                      disabled={!birthdays.length}
                      onClick={() => exportBirthdays(birthdays)}
                    >
                      <Download size={17} />
                    </button>
                  </>
                )}
                <button
                  className="help"
                  aria-label="Подсказка дневника"
                  aria-expanded={help}
                  onClick={() => setHelp(!help)}
                >
                  <Leaf size={16} />
                </button>
              </div>
            </div>
            {help && (
              <div className="book-tip">
                {isNote
                  ? "По умолчанию здесь читают. Карандаш включает письмо прямо на листе. Длинный текст продолжается на следующем листе. Стрелки — снизу. Никакой спешки."
                  : tab === "tasks"
                    ? "Нажми карандаш у дела — редактируй в той же строке. Enter завершает изменение."
                    : tab === "birthdays"
                      ? "Добавляй и меняй даты прямо здесь. Календарь скачивается файлом .ics: открой его своим календарём и подтверди импорт."
                      : "Слова и даты можно сочетать. Для одного дня укажи одинаковую начальную и конечную дату. Трудные записи не подмешиваются к обычным."}
              </div>
            )}
            {isNote && (
              <div className="book-note-heading">
                {locked ? (
                  <>
                    <span className="entry-date">Только когда захочется</span>
                    <h2>Закрытая страница</h2>
                  </>
                ) : editing ? (
                  <>
                    <div className="inline-date-fields">
                      <label>
                        <span className="sr-only">Дата записи</span>
                        <input
                          type="date"
                          aria-label="Дата записи"
                          value={editing.date}
                          onChange={(e) => change({ date: e.target.value })}
                        />
                      </label>
                      <input
                        type="time"
                        aria-label="Время записи"
                        value={editing.time || ""}
                        onChange={(e) => change({ time: e.target.value })}
                      />
                    </div>
                    <input
                      className="inline-title"
                      aria-label="Заголовок записи"
                      placeholder="Без названия"
                      value={editing.title}
                      onChange={(e) => change({ title: e.target.value })}
                    />
                    <span className="writing-status">{status}</span>
                  </>
                ) : (
                  <>
                    <span className="entry-date">
                      {note
                        ? dateLabel(note.date) +
                          (note.time ? " · " + note.time : "")
                        : "Чистый лист"}
                    </span>
                    <h2 title={note?.title}>
                      {note?.title || "Здесь можно начать"}
                    </h2>
                    <span className="writing-status">
                      {note ? "Режим чтения" : "Нажми +, когда появятся слова"}
                    </span>
                  </>
                )}
              </div>
            )}
            {tab === "search" && (
              <div className="book-search" ref={searchRef}>
                <div className="search-box">
                  <Search size={16} />
                  <input
                    aria-label="Поиск по дневнику"
                    placeholder="Слово или название…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setToolPage(0);
                    }}
                  />
                </div>
                <div className="inline-date-fields">
                  <label>
                    С даты
                    <input
                      type="date"
                      aria-label="С даты"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setToolPage(0);
                      }}
                    />
                  </label>
                  <label>
                    По дату
                    <input
                      type="date"
                      aria-label="По дату"
                      min={from}
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setToolPage(0);
                      }}
                    />
                  </label>
                </div>
                {(!data.settings.lockTroubles || unlocked) && (
                  <select
                    aria-label="Где искать"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    <option value="thoughts">Мои мысли</option>
                    <option value="troubles">Маленькие трудности</option>
                  </select>
                )}
              </div>
            )}
            {tab === "birthdays" && birthdayEdit && (
              <form className="book-birthday-editor" onSubmit={saveBirthday}>
                <label className="field">
                  <span>Имя</span>
                  <input
                    required
                    aria-label="Имя"
                    value={birthdayEdit.name}
                    onChange={(e) =>
                      setBirthdayEdit({ ...birthdayEdit, name: e.target.value })
                    }
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Дата рождения</span>
                    <input
                      type="date"
                      required
                      aria-label="Дата рождения"
                      value={birthdayEdit.date}
                      onChange={(e) =>
                        setBirthdayEdit({
                          ...birthdayEdit,
                          date: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Напомнить в календаре</span>
                    <select
                      aria-label="Напомнить"
                      value={birthdayEdit.remind}
                      onChange={(e) =>
                        setBirthdayEdit({
                          ...birthdayEdit,
                          remind: Number(e.target.value),
                        })
                      }
                    >
                      {[0, 1, 3, 7, 14].map((n) => (
                        <option key={n} value={n}>
                          {n ? "За " + n + " дн." : "В сам день"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="field birthday-balloon-color-field">
                  <span>Цвет шарика в календаре</span>
                  <div className="birthday-color-options">
                    {["#c98189", "#a078bd", "#779eae", "#d3a446", "#78966d", "#d9895f"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={birthdayEdit.color === color ? "active" : ""}
                        style={{ "--birthday-color": color } as any}
                        aria-label={`Выбрать цвет ${color}`}
                        aria-pressed={birthdayEdit.color === color}
                        onClick={() => setBirthdayEdit({ ...birthdayEdit, color })}
                      />
                    ))}
                  </div>
                </div>
                <label className="field">
                  <span>Идеи подарков и заметки</span>
                  <textarea
                    rows={3}
                    aria-label="Идеи подарков"
                    value={birthdayEdit.ideas}
                    onChange={(e) =>
                      setBirthdayEdit({
                        ...birthdayEdit,
                        ideas: e.target.value,
                      })
                    }
                  />
                </label>
                <div className="row wrap">
                  <button className="btn soft small">
                    <Check size={14} /> Сохранить
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Эту дату в календарь"
                    disabled={!birthdayEdit.name}
                    onClick={() => exportBirthdays([birthdayEdit])}
                  >
                    <CalendarDays size={17} />
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setBirthdayEdit(null)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}
            <div
              className={
                "journal-workspace " + (isNote ? "text-workspace" : "")
              }
              ref={slot}
            >
              {isNote &&
                (locked ? (
                  <div className="book-locked">
                    <Lock size={32} />
                    <p>
                      Эти слова останутся здесь.
                      <br />
                      Открывай, когда сама захочешь.
                    </p>
                    <button
                      className="btn soft"
                      onClick={() => {
                        setUnlocked(true);
                        animate();
                      }}
                    >
                      <Unlock size={15} /> Открыть вкладку
                    </button>
                    <ForestDetail kind="mushroom" />
                  </div>
                ) : editing ? (
                  <textarea
                    ref={textarea}
                    className="journal-reading-text journal-inline-text"
                    aria-label="Твои слова"
                    placeholder="Можно начать с того, что сейчас в голове…"
                    value={
                      current?.note.id === editing.id ? current?.text || "" : ""
                    }
                    onChange={(e) => {
                      const start =
                          current?.note.id === editing.id ? current.start : 0,
                        end = current?.note.id === editing.id ? current.end : 0;
                      const full =
                        editing.text.slice(0, start) +
                        e.target.value +
                        editing.text.slice(end);
                      const offset = start + (e.target.selectionStart || 0);
                      caret.current = offset;
                      restoreFocus.current =
                        document.activeElement === e.target;
                      change({ text: full });
                      setSelection({ id: editing.id, offset });
                    }}
                  />
                ) : (
                  <div
                    className="journal-reading-text"
                    aria-label="Текст страницы"
                  >
                    {current?.text ||
                      (!note
                        ? "Можно не подбирать идеальных слов. Просто оставь здесь то, что хочется сохранить."
                        : "")}
                  </div>
                ))}
              {tab === "tasks" && (
                <div className="book-tool-list">
                  {toolItems.map((t: any) => (
                    <div
                      className={"task-row " + (t.done ? "done" : "")}
                      key={t.id}
                    >
                      <button
                        className="check"
                        aria-label={t.done ? "Снять отметку" : "Выполнить дело"}
                        onClick={() =>
                          mutate((d: any) => {
                            const x = d.tasks.find((x: any) => x.id === t.id);
                            x.done = !x.done;
                          })
                        }
                      >
                        {t.done && <Check size={13} />}
                      </button>
                      {taskEdit === t.id ? (
                        <input
                          className="inline-task-edit"
                          aria-label="Текст дела"
                          value={t.text}
                          onChange={(e) =>
                            mutate((d: any) => {
                              d.tasks.find((x: any) => x.id === t.id).text =
                                e.target.value;
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setTaskEdit("");
                          }}
                        />
                      ) : (
                        <span>{t.text}</span>
                      )}
                      <button
                        className="icon-btn"
                        title={
                          taskEdit === t.id ? "Готово" : "Редактировать дело"
                        }
                        onClick={() =>
                          setTaskEdit(taskEdit === t.id ? "" : t.id)
                        }
                      >
                        {taskEdit === t.id ? (
                          <Check size={14} />
                        ) : (
                          <Pencil size={14} />
                        )}
                      </button>
                      <button
                        className="icon-btn"
                        title="Удалить дело"
                        onClick={() => trash("tasks", t)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {!items.length && (
                    <div className="book-empty">
                      <ForestDetail kind="fern" />
                      <p>Достаточно одного маленького дела.</p>
                    </div>
                  )}
                </div>
              )}
              {tab === "birthdays" && !birthdayEdit && (
                <div className="book-tool-list">
                  {toolItems.map((b: any) => (
                    <div className="book-birthday-row" key={b.id}>
                      <button
                        className="plain grow"
                        onClick={() => setBirthdayEdit({ ...structuredClone(b), color: b.color || "#c98189" })}
                      >
                        <strong>{b.name}</strong>
                        <small>
                          {dateLabel(b.date).replace(/ \d{4} г\./, "")} ·{" "}
                          {nextBirthday(b) === 0
                            ? "сегодня"
                            : `через ${nextBirthday(b)} дн.`}
                        </small>
                      </button>
                      <button
                        className="icon-btn"
                        title="Добавить в календарь"
                        aria-label={"В календарь: " + b.name}
                        onClick={() => exportBirthdays([b])}
                      >
                        <CalendarDays size={17} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Изменить дату"
                        onClick={() => setBirthdayEdit({ ...structuredClone(b), color: b.color || "#c98189" })}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Удалить дату"
                        onClick={() => trash("birthdays", b)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {!items.length && (
                    <div className="book-empty">
                      <ForestDetail kind="flowers" />
                      <p>Здесь будут важные люди и их дни.</p>
                    </div>
                  )}
                </div>
              )}
              {tab === "search" && (
                <div className="book-tool-list">
                  {toolItems.map((n: any) => (
                    <button
                      className="result-row"
                      key={n.id}
                      onClick={() => readNote(n)}
                    >
                      <CalendarDays size={16} />
                      <span className="grow">
                        <strong>{n.title || "Без названия"}</strong>
                        <small>{dateLabel(n.date)}</small>
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  ))}
                  {!items.length && (
                    <p className="muted">
                      Ничего не нашлось. Попробуй другое слово или дату.
                    </p>
                  )}
                </div>
              )}
            </div>
            {isNote && !locked && (
              <div className="book-note-actions">
                {note && !editing && (
                  <>
                    {tab === "thoughts" && (
                      <button
                        className={"text-link " + (note.pinned ? "accent" : "")}
                        onClick={() =>
                          mutate((d: any) => {
                            const n = d.notes.find(
                              (x: any) => x.id === note.id,
                            );
                            if (n) n.pinned = !n.pinned;
                          })
                        }
                      >
                        <Pin size={13} />
                        {note.pinned ? "В моём уголке" : "Сохранить в уголке"}
                      </button>
                    )}
                    <button
                      className="icon-btn danger"
                      title="Удалить запись"
                      onClick={() => trash("notes", note)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
                {editing && (
                  <span className="muted tiny">
                    Пишешь на странице · текст сохраняется целиком
                  </span>
                )}
              </div>
            )}
            {tab === "tasks" && (
              <form
                className="quick-add book-add-task"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    "task",
                  ) as HTMLInputElement;
                  if (!input.value.trim()) return;
                  mutate((d: any) =>
                    d.tasks.push({
                      id: uid(),
                      text: input.value.trim(),
                      done: false,
                    }),
                  );
                  input.value = "";
                  setToolPage(Math.floor(data.tasks.length / perPage));
                }}
              >
                <Plus size={15} />
                <input
                  name="task"
                  aria-label="Новое дело"
                  placeholder="Добавить маленькое дело…"
                />
                <button className="icon-btn" aria-label="Добавить дело">
                  <Check size={16} />
                </button>
              </form>
            )}
            <div className="page-arrows">
              <button
                className="arrow-btn"
                disabled={locked || position === 0 || !!birthdayEdit}
                aria-label="Предыдущая страница"
                onClick={() => turnPage(-1)}
              >
                <ArrowLeft size={20} />
              </button>
              <span aria-live="polite">
                {locked
                  ? "Только для тебя"
                  : isNote
                    ? `${position + 1} / ${totalPages}${current && current.total > 1 ? " · запись " + (current.part + 1) + " / " + current.total : ""}`
                    : `${toolIndex + 1} / ${totalPages}`}
              </span>
              <button
                className="arrow-btn"
                disabled={
                  locked || position >= totalPages - 1 || !!birthdayEdit
                }
                aria-label="Следующая страница"
                onClick={() => turnPage(1)}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>
        <div
          ref={probe}
          className="journal-reading-text pagination-probe"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
