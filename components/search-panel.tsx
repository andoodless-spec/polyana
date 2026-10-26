"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
export function SearchPanel({
  label,
  active,
  onReset,
  children,
}: {
  label: string;
  active?: boolean;
  onReset: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section
      className={"search-panel " + (open ? "is-open" : "")}
      aria-label={label}
    >
      <div className="search-launch-row">
        {active ? (
          <span className="search-active-label">
            Фильтры действуют{" "}
            <button className="text-link" onClick={onReset}>
              Сбросить
            </button>
          </span>
        ) : (
          <span className="muted tiny">Найти своё — когда захочется</span>
        )}
        <button
          className={"search-launch " + (active ? "has-filters" : "")}
          aria-label={label}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={19} /> : <Search size={19} />}
        </button>
      </div>
      {open && <div className="filter-card">{children}</div>}
    </section>
  );
}
