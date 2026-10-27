import { productKind } from "@/lib/products";
export function ProductArt({ name }: { name: string }) {
  const kind = productKind(name);
  return (
    <svg
      className={"product-art product-" + kind}
      viewBox="0 0 84 94"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <ellipse cx="42" cy="86" rx="31" ry="4" fill="var(--product-shadow)" />
      {kind === "carton" ? (
        <>
          <path d="M21 82V27h42v55z" fill="var(--product-cream)" />
          <path d="M21 27l10-17h21l11 17z" fill="var(--product-sage)" />
          <path d="M31 10V5h21v5z" fill="var(--product-deep)" />
          <path d="M49 27h14v55H49z" fill="var(--product-soft)" />
          <path d="M21 42h28v25H21z" fill="var(--product-sage)" />
          <path d="M31 53h9v-6h5v12h-5v7h-9z" fill="var(--product-cream)" />
        </>
      ) : kind === "cheese" ? (
        <>
          <path d="M12 78V48l44-27 18 15v42z" fill="var(--product-gold)" />
          <path d="M12 48l44-27 18 15-43 27z" fill="var(--product-light)" />
          <path d="M31 63l43-27v42H31z" fill="var(--product-gold)" />
          <path
            d="M19 56h7v9h-7zM40 66h8v9h-8zM57 52h8v8h-8zM61 70h6v6h-6z"
            fill="var(--product-rust)"
          />
        </>
      ) : kind === "eggs" ? (
        <>
          <path d="M9 68h66v13H9zM13 59h58v9H13z" fill="var(--product-rust)" />
          {[23, 43, 63].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x - 10} 53V43h3V36h3V32h8v4h3v7h3v10h-3v7H${x - 7}v-7z`}
                fill={i % 2 ? "var(--product-cream)" : "var(--product-light)"}
              />
              <path d={`M${x - 8} 59h16v7h-16z`} fill="var(--product-soft)" />
            </g>
          ))}
        </>
      ) : kind === "meat" ? (
        <>
          <path
            d="M19 55c0-13 12-24 29-24 14 0 24 8 24 19 0 15-14 25-31 25-13 0-22-7-22-20z"
            fill="var(--product-rust)"
          />
          <path
            d="M27 54c3-8 10-13 21-13 8 0 13 4 13 10 0 8-9 15-20 15-9 0-15-4-14-12z"
            fill="var(--product-light)"
          />
          <path
            d="M39 30c-2-8 2-13 8-14 6 2 8 7 6 14z"
            fill="var(--product-deep)"
          />
        </>
      ) : kind === "fish" ? (
        <>
          <path
            d="M13 48c13-19 39-24 53-5l10 5-10 7c-14 18-40 14-53-7l-6 8V40z"
            fill="var(--product-sage)"
          />
          <path
            d="M23 47h31v8H23zM36 38h8v7h-8zM36 57h8v7h-8z"
            fill="var(--product-light)"
          />
          <circle cx="58" cy="48" r="3" fill="var(--product-deep)" />
        </>
      ) : kind === "bread" ? (
        <>
          <path
            d="M15 48c0-13 13-25 28-25s27 12 27 25v28H15z"
            fill="var(--product-gold)"
          />
          <path d="M23 46h40v26H23z" fill="var(--product-rust)" />
          <path d="M31 36h7v13h-7zm16-4h7v14h-7z" fill="var(--product-light)" />
        </>
      ) : kind === "frozen" ? (
        <>
          <path d="M18 18h48v63H18z" fill="var(--product-sage)" />
          <path
            d="M18 28h48v8H18zM24 45h36v24H24z"
            fill="var(--product-cream)"
          />
          <path d="M39 49h7v16h-7zM34 54h17v7H34z" fill="var(--product-deep)" />
          <path d="M55 21h7v4h-7z" fill="var(--product-light)" />
        </>
      ) : kind === "mushroom" ? (
        <>
          <path
            d="M14 50c2-19 14-30 29-30s27 11 29 30z"
            fill="var(--product-rust)"
          />
          <path d="M34 49h18v29H34z" fill="var(--product-cream)" />
          <path d="M24 36h8v7h-8zm29-5h8v7h-8z" fill="var(--product-light)" />
        </>
      ) : kind === "grains" || kind === "nuts" ? (
        <>
          <path d="M20 25h44v54H20z" fill="var(--product-cream)" />
          <path d="M20 25h44v13H20z" fill="var(--product-gold)" />
          <path d="M27 48h30v20H27z" fill="var(--product-sage)" />
          {[31, 40, 49].map((x) => (
            <path key={x} d={`M${x} 54h4v4h-4z`} fill="var(--product-light)" />
          ))}
          <path d="M28 17h28v7H28z" fill="var(--product-deep)" />
        </>
      ) : kind === "herbs" ? (
        <>
          <path d="M39 76V29h6v47z" fill="var(--product-deep)" />
          <path
            d="M42 52c-23 0-30-15-24-23 13 0 24 6 24 23zm0-8c2-21 16-28 26-22 0 15-10 24-26 22zM42 66c-17 0-23-11-20-18 12 0 20 6 20 18z"
            fill="var(--product-sage)"
          />
          <path d="M18 78h48v7H18z" fill="var(--product-gold)" />
        </>
      ) : kind === "produce" && /морков/i.test(name) ? (
        <>
          <path
            d="M23 34h39v11h-5v12h-6v12h-5v11h-7V69h-5V57h-6V45h-5z"
            fill="var(--product-rust)"
          />
          <path
            d="M28 36h10v20h6v13h-5V57h-6V45h-5z"
            fill="var(--product-gold)"
          />
          <path
            d="M38 34V18h-8V9h9v10h6V6h8v14h-6v14z"
            fill="var(--product-deep)"
          />
          <path
            d="M27 26h-8v-9h10v8h12v8H30zM48 27v-9h13v-8h8v14H57v9h-9z"
            fill="var(--product-sage)"
          />
        </>
      ) : kind === "produce" && /яблок|груш/i.test(name) ? (
        <>
          <path
            d="M14 46h7V35h16v5h10v-5h16v11h7v23h-6v12H49v-5H35v5H21V69h-7z"
            fill="var(--product-sage)"
          />
          <path d="M21 46h8v19h-8zM29 40h8v6h-8z" fill="var(--product-light)" />
          <path d="M40 38V22h6v16z" fill="var(--product-rust)" />
          <path d="M46 23V13h17v8h-7v7H46z" fill="var(--product-deep)" />
        </>
      ) : kind === "produce" && /картоф/i.test(name) ? (
        <>
          <path
            d="M16 55c0-16 11-27 29-27s27 11 27 25c0 17-12 25-30 25S16 72 16 55z"
            fill="var(--product-gold)"
          />
          <path
            d="M27 43h5v5h-5zm24 19h5v5h-5zM43 36h4v4h-4z"
            fill="var(--product-rust)"
          />
          <path d="M23 57h8v5h-8z" fill="var(--product-light)" />
        </>
      ) : kind === "produce" && /помидор|томат/i.test(name) ? (
        <>
          <path
            d="M21 40h12v-8h18v8h12v11h7v18H61v9H25v-9h-8V50h4z"
            fill="var(--product-rust)"
          />
          <path
            d="M39 34V21h6v13zM42 29 28 22l-4 6 17 8zm2 0 14-8 4 6-17 9z"
            fill="var(--product-deep)"
          />
          <path d="M27 48h12v8H27z" fill="var(--product-light)" />
        </>
      ) : kind === "produce" && /лук/i.test(name) ? (
        <>
          <path
            d="M42 20c0 9-20 18-20 37 0 16 9 25 20 25s20-9 20-25c0-19-20-28-20-37z"
            fill="var(--product-rust)"
          />
          <path
            d="M41 25c-4 12-12 19-12 32 0 10 5 17 13 19z"
            fill="var(--product-light)"
          />
          <path d="M39 20V8h6v12z" fill="var(--product-deep)" />
        </>
      ) : kind === "produce" && /огур/i.test(name) ? (
        <>
          <path d="M25 20h31v11h8v39H20V31h5z" fill="var(--product-deep)" />
          <path d="M27 30h8v30h-8zM43 36h8v27h-8z" fill="var(--product-sage)" />
          <path d="M21 70h42v7H21z" fill="var(--product-light)" />
        </>
      ) : kind === "produce" && /перец/i.test(name) ? (
        <>
          <path
            d="M38 28c-14-9-26 4-24 24 1 18 10 29 20 25l8-5 8 5c10 4 19-7 20-25 2-20-10-33-24-24l-4 6z"
            fill="var(--product-rust)"
          />
          <path
            d="M41 30V12h7v19zM42 19c-11-11-17-8-18-3 5 7 10 8 18 8z"
            fill="var(--product-deep)"
          />
          <path d="M23 49h7v13h-7z" fill="var(--product-gold)" />
        </>
      ) : kind === "produce" ? (
        <>
          <path
            d="M19 80V45h7V35h12v-8h17v8h13v10h6v35z"
            fill="var(--product-rust)"
          />
          <path d="M32 42h8v37h-8zM54 42h6v37h-6z" fill="var(--product-gold)" />
          <path d="M38 29V15h7V7h9v7h-7v15z" fill="var(--product-deep)" />
          <path
            d="M40 24H24v-8h-9v-6h18v6h12zM48 23V12h10V7h12v9H60v7z"
            fill="var(--product-sage)"
          />
        </>
      ) : kind === "bottle" ? (
        <>
          <path d="M30 9h24v10H30z" fill="var(--product-deep)" />
          <path
            d="M32 19h20v20h8v10h6v34H18V49h6V39h8z"
            fill="var(--product-sage)"
          />
          <path d="M24 52h36v20H24z" fill="var(--product-cream)" />
          <path d="M38 57h9v10h-9z" fill="var(--product-gold)" />
          <path d="M25 43h5v9h-5zM25 75h5v5h-5z" fill="var(--product-light)" />
        </>
      ) : kind === "bag" ? (
        <>
          <path d="M20 17h44v12h5v54H15V29h5z" fill="var(--product-rust)" />
          <path d="M20 17h44v8H20zM20 76h44v7H20z" fill="var(--product-gold)" />
          <path d="M23 35h38v29H23z" fill="var(--product-cream)" />
          <path
            d="M40 41h5v18h-5zM32 44h8v5h-8zM45 50h8v5h-8z"
            fill="var(--product-sage)"
          />
        </>
      ) : (
        <>
          <path d="M20 18h44v10H20z" fill="var(--product-deep)" />
          <path d="M24 28h36v9h7v44H17V37h7z" fill="var(--product-soft)" />
          <path d="M17 46h50v27H17z" fill="var(--product-cream)" />
          <path
            d="M36 50h10v5h6v8h-6v5H36v-5h-6v-8h6z"
            fill="var(--product-sage)"
          />
          <path d="M22 33h5v10h-5z" fill="var(--product-light)" />
        </>
      )}
    </svg>
  );
}
