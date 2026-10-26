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
