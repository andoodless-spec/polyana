"use client";
import { Leaf, Plus } from "lucide-react";
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Empty({
  text,
  action,
  onClick,
}: {
  text: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="empty">
      <Leaf size={27} />
      <p>{text}</p>
      {action && (
        <button className="btn soft" onClick={onClick}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}
export function Leaves({
  value,
  onChange,
}: {
  value: number;
  onChange?: (n: number) => void;
}) {
  return (
    <span
      className={"leaves " + (onChange ? "interactive" : "")}
      aria-label={`${value} из 5 листиков`}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            title={`${n} из 5`}
            onClick={() => onChange(n)}
          >
            <Leaf
              size={23}
              fill={n <= value ? "currentColor" : "none"}
              className={n <= value ? "filled" : "unfilled"}
            />
          </button>
        ) : (
          <Leaf
            key={n}
            size={13}
            fill={n <= value ? "currentColor" : "none"}
            className={n <= value ? "filled" : "unfilled"}
          />
        ),
      )}
    </span>
  );
}
