"use client";
import React from "react";

export const artOptions: Record<string, { id: string; label: string }[]> = {
  headerArt: [
    { id: "meadow", label: "Полянка у леса" },
    { id: "garden", label: "Тихий сад" },
    { id: "brook", label: "Лесной ручей" },
    { id: "orchard", label: "Яблоневый уголок" },
  ],
  menuArt: [
    { id: "flowers", label: "Полевые цветы" },
    { id: "mushroom", label: "Грибы и папоротник" },
    { id: "teapot", label: "Чайник на столе" },
    { id: "basket", label: "Корзинка с травами" },
  ],
  shoppingArt: [
    { id: "fern", label: "Папоротник" },
    { id: "basket", label: "Корзинка покупок" },
    { id: "apple", label: "Яблоко и лист" },
    { id: "mushroom", label: "Лесные грибы" },
  ],
  faviconArt: [
    { id: "leaf", label: "Листик" },
    { id: "flower", label: "Цветок" },
    { id: "mushroom", label: "Гриб" },
    { id: "house", label: "Домик" },
  ],
};

const palettes = [
  ["#e9eddf", "#9eae88", "#617b5c", "#d5c89b", "#f8f4e7"],
  ["#edf0e4", "#aab88e", "#758b66", "#e3c98e", "#fff9e9"],
  ["#e7eee9", "#9db9a5", "#638577", "#d8c99d", "#f6f2df"],
  ["#f0eddf", "#b5b58a", "#758461", "#d7b98a", "#fff9e8"],
];

export function CuratedArt({
  slot,
  value,
  className = "",
}: {
  slot: string;
  value?: string;
  className?: string;
}) {
  const ix = Math.max(
    0,
    (artOptions[slot] || artOptions.headerArt).findIndex((x) => x.id === value),
  );
  const [sky, hill, deep, accent, paper] = palettes[ix];
  if (slot === "faviconArt") {
    return (
      <svg
        className={className}
        viewBox="0 0 64 64"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {ix === 0 ? (
          <>
            <path d="M31 53V29h6v24z" fill={deep} />
            <path
              d="M32 32C12 32 10 17 12 10c16 0 24 7 22 20C37 15 47 10 56 11c0 15-7 24-22 24"
              fill={hill}
            />
            <path d="M18 16l12 12m17-11L36 31" stroke={paper} strokeWidth="3" />
          </>
        ) : ix === 1 ? (
          <>
            <path d="M30 54V34h5v20z" fill={deep} />
            <path
              d="M32 34c-6-9-17-9-17 0 0 6 8 10 17 10 9 0 17-4 17-10 0-9-11-9-17 0z"
              fill={accent}
            />
            <path
              d="M32 32c-9-15-5-23 0-25 5 2 9 10 0 25zM19 29c-12-10-20-4-17 3 3 6 11 7 17-3zm26 0c12-10 20-4 17 3-3 6-11 7-17-3z"
              fill={hill}
            />
            <circle cx="32" cy="36" r="5" fill={paper} />
          </>
        ) : ix === 2 ? (
          <>
            <path d="M11 32h42v7H11z" fill={deep} />
            <path d="M16 31c0-13 7-22 16-22s16 9 16 22z" fill={accent} />
            <path d="M25 20h6v7h-6zm12 5h5v6h-5z" fill={paper} />
            <path d="M22 40h20v6H22z" fill={hill} />
          </>
        ) : (
          <>
            <path d="M10 29 32 10l22 19v25H10z" fill={paper} />
            <path d="M7 30 32 7l25 23-5 5-20-18-20 18z" fill={deep} />
            <path d="M27 37h10v17H27z" fill={accent} />
            <path d="M16 35h7v8h-7zm25 0h7v8h-7z" fill={hill} />
          </>
        )}
      </svg>
    );
  }
  return (
    <svg
      className={className}
      viewBox={slot === "headerArt" ? "0 0 520 270" : "0 0 180 110"}
      shapeRendering="crispEdges"
      role="img"
      aria-label={(artOptions[slot] || [])[ix]?.label || "Иллюстрация полянки"}
    >
      {slot === "headerArt" ? (
        <>
          <rect width="520" height="270" fill={sky} />
          <path
            d="M0 175h65v-25h55v14h80v-28h95v18h80v-24h75v21h70v119H0z"
            fill={hill}
          />
          <path d="M0 218h105v-20h95v20h92v-26h94v19h134v59H0z" fill={deep} />
          {ix === 0 ? (
            <>
              <path
                d="M43 190v-83h18V83h52v24h16v83zM375 190v-94h22V69h55v27h18v94z"
                fill={deep}
              />
              <path
                d="M91 204v-62h98v62zM77 145h15v-14h16v-15h41v15h16v14h16v12H77z"
                fill={paper}
              />
              <path
                d="M205 188v-42h110v42zM195 149l65-53 66 53z"
                fill={accent}
              />
              <path d="M248 158h22v30h-22z" fill={deep} />
            </>
          ) : ix === 1 ? (
            <>
              <path
                d="M70 195v-94h18V80h50v21h20v94zM363 192v-85h20V78h51v29h16v85z"
                fill={deep}
              />
              <path
                d="M225 193v-64h67v64zM210 130l48-46 49 46z"
                fill={accent}
              />
              <path
                d="M178 205v-39h10v-16h30v16h10v39zM317 205v-36h11v-18h27v18h11v36z"
                fill={hill}
              />
            </>
          ) : ix === 2 ? (
            <>
              <path
                d="M56 192v-98h20V76h55v27h17v89zM384 193v-80h18V82h47v31h17v80z"
                fill={deep}
              />
              <path d="M0 186h520v20H0zM0 207h520v12H0z" fill="#91b6a1" />
              <path d="M190 193v-54h145v54z" fill={paper} />
              <path d="M180 143h165l-18-16H198z" fill={accent} />
              <path d="M250 160h28v33h-28z" fill={deep} />
            </>
          ) : (
            <>
              <path
                d="M66 193V95h18V77h48v18h17v98zM382 191v-99h19V72h49v20h18v99z"
                fill={deep}
              />
              <path
                d="M107 100h24v20h-24zm-9 39h27v22H98zm310-31h25v21h-25zm-9 42h27v21h-27z"
                fill={accent}
              />
              <path d="M213 193v-62h89v62zM198 133l59-53 60 53z" fill={paper} />
              <circle cx="112" cy="179" r="16" fill={accent} />
              <circle cx="405" cy="176" r="17" fill="#bd8f65" />
            </>
          )}
          <path d="M36 226h448v8H36zM65 245h390v6H65z" fill={accent} />
          <path
            d="M112 231v-15h6v15zm283 13v-18h6v18zm-198-7v-13h6v13z"
            fill={paper}
          />
        </>
      ) : (
        <>
          <rect width="180" height="110" rx="8" fill={sky} />
          <path d="M0 78h40V63h38v10h42V60h30v12h30v38H0z" fill={hill} />
          {slot === "menuArt" ? (
            ix === 0 ? (
              <>
                <path
                  d="M25 81V57h8V44h8v13h7v24zM65 81V52h8V39h8v13h7v29zM105 81V58h8V44h8v14h7v23z"
                  fill={deep}
                />
                <path
                  d="M32 47h7v-7h7v7h-7v7h-7zM72 42h7v-7h7v7h-7v7h-7zM112 47h7v-7h7v7h-7v7h-7z"
                  fill={accent}
                />
                <path d="M17 85h123v8H17z" fill={paper} />
              </>
            ) : ix === 1 ? (
              <>
                <path
                  d="M42 83V60h8V48h17v12h7v23zM91 83V58h8V43h18v15h7v25z"
                  fill={accent}
                />
                <path
                  d="M47 50c3-17 24-17 27 0zM96 45c3-18 26-18 29 0z"
                  fill={deep}
                />
                <path d="M30 83h100v8H30z" fill={paper} />
              </>
            ) : ix === 2 ? (
              <>
                <path d="M42 48h68v8h10v22H32V56h10z" fill={paper} />
                <path
                  d="M53 35h40v13H53zM64 27h18v8H64zM39 79h75v8H39z"
                  fill={accent}
                />
                <path d="M110 58h17v13h-17z" fill={deep} />
                <path d="M60 58h30v6H60z" fill={deep} />
              </>
            ) : (
              <>
                <path d="M34 74h103v13H34zM42 60h85v14H42z" fill={accent} />
                <path
                  d="M52 58c2-18 12-24 23-24s21 6 23 24zM100 59c2-15 10-19 19-19s17 4 19 19z"
                  fill={deep}
                />
                <path d="M56 44h14v8H56zM109 46h12v7h-12z" fill={paper} />
              </>
            )
          ) : ix === 0 ? (
            <>
              <path
                d="M85 94V54h8v40zM87 56c-26-13-32-33-25-39 18-2 31 11 29 34 3-23 17-36 34-33 5 16-8 33-33 40"
                fill={deep}
              />
              <path
                d="M22 92h42V66H22zM29 66V51h28v15zM35 51v-9h15v9z"
                fill={accent}
              />
            </>
          ) : ix === 1 ? (
            <>
              <path d="M45 83h87v10H45zM54 71h70v13H54z" fill={accent} />
              <path d="M65 67c0-18 10-31 24-31s24 13 24 31z" fill={deep} />
              <path d="M74 48h8v8h-8zm25 6h8v8h-8z" fill={paper} />
            </>
          ) : ix === 2 ? (
            <>
              <path d="M78 84V55h7v29z" fill={deep} />
              <path
                d="M81 56c-20-17-38-9-35 3 3 10 20 12 35-3zm1-2c16-20 34-15 32-3-2 11-18 16-32 3z"
                fill={accent}
              />
              <path d="M81 57c-4-19 2-29 6-30 7 7 6 17-6 30z" fill={paper} />
              <circle cx="83" cy="62" r="6" fill="#cfaa68" />
            </>
          ) : (
            <>
              <path d="M70 64 90 42l21 22v31H70z" fill={paper} />
              <path d="M64 65 90 37l27 28-6 7-21-22-20 22z" fill={deep} />
              <path d="M85 78h12v17H85z" fill={accent} />
            </>
          )}
        </>
      )}
    </svg>
  );
}

export function ArtPicker({
  slot,
  value,
  onChange,
}: {
  slot: string;
  value?: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      className={"art-picker art-picker-" + slot}
      role="group"
      aria-label="Выбор иллюстрации"
    >
      {(artOptions[slot] || []).map((x, i) => (
        <button
          key={x.id}
          type="button"
          className={value === x.id ? "active" : ""}
          aria-pressed={value === x.id}
          onClick={() => onChange(x.id)}
        >
          <CuratedArt slot={slot} value={x.id} className="art-picker-image" />
          <span>{x.label}</span>
        </button>
      ))}
    </div>
  );
}

export function faviconData(id?: string) {
  const art = id || "leaf";
  let motif = `<path d="M31 53V29h6v24z" fill="#617b5c"/><path d="M32 32C12 32 10 17 12 10c16 0 24 7 22 20C37 15 47 10 56 11c0 15-7 24-22 24" fill="#9eae88"/>`;
  if (art === "flower")
    motif = `<path d="M30 54V34h5v20z" fill="#617b5c"/><path d="M32 34c-6-9-17-9-17 0 0 6 8 10 17 10 9 0 17-4 17-10 0-9-11-9-17 0zM32 32c-9-15-5-23 0-25 5 2 9 10 0 25zM19 29c-12-10-20-4-17 3 3 6 11 7 17-3zm26 0c12-10 20-4 17 3-3 6-11 7-17-3z" fill="#9eae88"/><circle cx="32" cy="37" r="5" fill="#e9eddf"/>`;
  if (art === "mushroom")
    motif = `<path d="M12 31c2-17 12-25 20-25s18 8 20 25z" fill="#b88b62"/><path d="M27 31h10v20H27z" fill="#f8f4e7"/><path d="M16 20h7v6h-7zm23-4h7v6h-7z" fill="#f8f4e7"/>`;
  if (art === "house")
    motif = `<path d="M10 29 32 10l22 19v25H10z" fill="#f8f4e7"/><path d="M7 30 32 7l25 23-5 5-20-18-20 18z" fill="#617b5c"/><path d="M27 37h10v17H27z" fill="#d5c89b"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#e9eddf"/>${motif}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
