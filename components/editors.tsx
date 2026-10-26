"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export function Dialog({
  title,
  onClose,
  children,
  drawer = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const root = ref.current;
    const focusable = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),textarea,select,summary,[tabindex="0"]',
        ) || [],
      ).filter((x) => x.offsetParent !== null);
    // Focus the dialog container, never an input: do not summon the mobile keyboard.
    root?.focus({ preventScroll: true });
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        const items = focusable(),
          first = items[0],
          last = items[items.length - 1];
        if (document.activeElement === root) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    root?.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      root?.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
      if (
        previous?.isConnected &&
        (!previous.matches("input,textarea,select") ||
          window.matchMedia("(pointer:fine)").matches)
      )
        previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <div
      className={"overlay " + (drawer ? "drawer-overlay" : "")}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={"dialog " + (drawer ? "drawer" : "")}
      >
        <header className="dialog-header">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Закрыть" onClick={onClose}>
            <X size={21} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
