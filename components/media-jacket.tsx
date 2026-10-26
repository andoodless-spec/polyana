import { BookOpen, Film, Flower2, Library, Gamepad2 } from "lucide-react";
export const jacketTypes = [
  {
    type: "Книги",
    label: "Книга",
    className: "book-spine",
    Icon: BookOpen,
    description: "Переплёт, корешок и уголки обложки.",
  },
  {
    type: "Фильмы",
    label: "VHS",
    className: "tape-case",
    Icon: Film,
    description: "Кассетная рубашка с этикеткой и двумя катушками.",
  },
  {
    type: "Мультфильмы",
    label: "Мультфильм",
    className: "cartoon-case",
    Icon: Flower2,
    description: "Компактная кассета со светлой этикеткой и цветком.",
  },
  {
    type: "Сериалы",
    label: "Бокс",
    className: "series-case",
    Icon: Library,
    description: "Многокассетный бокс: несколько корешков рядом.",
  },
  {
    type: "Игры",
    label: "Игра",
    className: "game-case",
    Icon: Gamepad2,
    description: "Картридж с выемками, контактами и игровой этикеткой.",
  },
];
export function MediaJacket({ item }: { item: any }) {
  const spec = jacketTypes.find((s) => s.type === item.type) || jacketTypes[0];
  const Icon = spec.Icon;
  return (
    <>
      <span className="jacket-binding" aria-hidden="true" />
      {item.type === "Сериалы" && (
        <span className="jacket-box-spines" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      {item.type === "Игры" && (
        <span className="jacket-cartridge-ridges" aria-hidden="true" />
      )}
      <span className={"jacket-face " + (item.image ? "has-cover" : "")}>
        {item.image && (
          <img className="jacket-cover-image" src={item.image} alt="" />
        )}
        <span className="jacket-category">
          <Icon size={11} />
          {spec.label}
        </span>
        <span className="jacket-title">{item.title}</span>
        <span className="jacket-emblem" aria-hidden="true">
          <Icon size={24} />
        </span>
      </span>
      {(item.type === "Фильмы" || item.type === "Мультфильмы") && (
        <span className="jacket-reels" aria-hidden="true">
          <i />
          <span />
          <i />
        </span>
      )}
      {item.type === "Игры" && (
        <span className="jacket-contacts" aria-hidden="true" />
      )}
      {item.type === "Книги" && (
        <span className="jacket-book-pages" aria-hidden="true" />
      )}
    </>
  );
}
export function ShelfInformation() {
  return (
    <div className="shelf-information">
      <p>
        Все истории живут на общей полке. Категории, слова, рейтинг,
        рекомендации и желание вернуться выбираются под лупой.
      </p>
      <div className="jacket-guide">
        {jacketTypes.map((s, i) => (
          <div key={s.type} className="jacket-guide-row">
            <div
              className={
                "shelf-object media-jacket jacket-sample " + s.className
              }
              style={
                {
                  "--object-color": [
                    "#96a381",
                    "#8f9e96",
                    "#baa67f",
                    "#89917d",
                    "#96a1a1",
                  ][i],
                } as any
              }
            >
              <MediaJacket item={{ type: s.type, title: s.type }} />
            </div>
            <div>
              <h3>{s.type}</h3>
              <p>{s.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="footnote">
        «В процессе» — сверху. Завершённое ниже: от 5 листиков слева до 1
        справа. Без оценки хранится отдельно. Нажми на предмет — откроется твоя
        запись.
      </p>
    </div>
  );
}
