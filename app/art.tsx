export function Meadow({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "meadow small" : "meadow"}
      viewBox="0 0 520 270"
      role="img"
      aria-label="Тихая пиксельная полянка с домиком, деревьями и цветами"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#e7ebda" />
          <stop offset="1" stopColor="#f0edda" />
        </linearGradient>
      </defs>
      <path d="M50 250V110H70V70h45V50h270v20h45v30h30v150z" fill="url(#sky)" />
      <path d="M88 186h48v-18h60v-14h70v10h100v22h75v60H88z" fill="#c6d2ac" />
      <path d="M42 216h90v-18h77v16h96v-22h70v16h91v55H42z" fill="#acbd91" />
      <path
        d="M105 83h24V71h37v12h22v13h-83zM285 62h20V50h37v12h29v12h-86z"
        fill="#fffdf1"
      />
      <path d="M375 73h24V61h25v12h13v25h-13v12h-25V98h-24z" fill="#ded6a4" />
      <path
        d="M83 216v-93h15v-22h13V86h24v15h14v22h16v42h-15v20h-29v31z"
        fill="#819870"
      />
      <path d="M105 216v-68h11v68z" fill="#7f805c" />
      <path d="M117 150h11v-11h11v-17h-12v13h-10z" fill="#96aa7a" />
      <path
        d="M382 220v-90h-15v-23h14V85h17V70h25v15h15v22h14v23h13v39h-15v24h-26v27z"
        fill="#708d65"
      />
      <path d="M407 225v-74h12v74z" fill="#7e7956" />
      <path d="M383 133h15v-22h13V91h-13v15h-15z" fill="#8ba274" />
      <path d="M204 223v-72h98v72z" fill="#e5d8ad" />
      <path
        d="M189 157v-13h14v-14h15v-14h16v-14h38v14h16v14h16v14h15v13z"
        fill="#869577"
      />
      <path
        d="M207 142v-12h14v-13h17v-13h15v13h-15v13h-15v12z"
        fill="#a1ad8a"
      />
      <path d="M279 115V86h15v43h-8v-14z" fill="#ac9876" />
      <path d="M244 223v-43h25v43z" fill="#8e9d7c" />
      <path d="M249 186h15v24h-15z" fill="#c1c7a0" />
      <path d="M215 173h19v20h-19zM279 173h16v20h-16z" fill="#9fae8b" />
      <path
        d="M222 173v20M215 183h19M286 173v20M279 183h16"
        stroke="#dfd5b2"
        strokeWidth="3"
      />
      <path d="M246 224h28v10h12v10h15v18h-61v-13h9v-12h-3z" fill="#dbd4ae" />
      <path
        d="M38 242h40v-9h63v10h45v-9h50v28H38zM298 245h50v-12h73v10h58v19H298z"
        fill="#92a77c"
      />
      {[
        [65, 234],
        [155, 239],
        [180, 214],
        [329, 226],
        [358, 245],
        [447, 226],
        [118, 252],
      ].map(([x, y], i) => (
        <g key={x}>
          <path d={`M${x} ${y + 12}v-18h4v18z`} fill="#708e60" />
          <path
            d={`M${x - 6} ${y - 9}h6v-5h6v5h6v6h-6v5h-6v-5h-6z`}
            fill={i % 2 ? "#e8ddb0" : "#f5efcf"}
          />
          <path d={`M${x} ${y - 9}h6v6h-6z`} fill="#c2ae6e" />
        </g>
      ))}
      {[
        [90, 249],
        [143, 222],
        [315, 251],
        [350, 215],
        [430, 252],
        [202, 248],
      ].map(([x, y]) => (
        <path key={x} d={`M${x} ${y}v-11h4v7h5v-11h4v15z`} fill="#7d986a" />
      ))}
      <path d="M161 251v-12h7v-7h19v7h7v12z" fill="#af9b76" />
      <path d="M175 251v10h7v-10z" fill="#e4dab9" />
    </svg>
  );
}
export function Sprout() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M19 34V19h4v15z" fill="currentColor" />
      <path
        d="M19 22H9v-4H5V8h10v4h4zM23 20V10h4V6h12v10h-4v4z"
        fill="currentColor"
      />
      <path d="M15 34h12v4H15z" fill="currentColor" />
    </svg>
  );
}

// Small, local pixel illustrations. Colours come from the chosen day/night palette.
export function ForestDetail({
  kind = "fern",
  className = "",
}: {
  kind?: "fern" | "mushroom" | "flowers" | "fox";
  className?: string;
}) {
  return (
    <svg
      className={"forest-detail " + className}
      viewBox="0 0 112 80"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {kind === "fern" ? (
        <>
          <path d="M52 73V16h5v57z" fill="var(--forest-deep)" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <path
                d={`M52 ${65 - i * 10}H${29 + i * 4}v-5h-7v-5h12v5h18z`}
                fill="var(--forest-leaf)"
              />
              <path
                d={`M57 ${62 - i * 10}h${23 - i * 3}v-5h7v-5H75v5H57z`}
                fill="var(--forest-light)"
              />
            </g>
          ))}
          <path d="M49 18v-8h5V5h6v13z" fill="var(--forest-light)" />
          <path d="M29 75h52v4H29z" fill="var(--forest-ground)" />
          <path
            d="M15 66h4v-8h4v8h5v10H15zM87 72v-8h4v-6h4v14z"
            fill="var(--forest-leaf)"
          />
        </>
      ) : kind === "mushroom" ? (
        <>
          <path d="M27 70V45h12v25z" fill="var(--forest-cream)" />
          <path
            d="M12 46V35h7V24h11v-6h15v6h11v11h7v11z"
            fill="var(--forest-rust)"
          />
          <path
            d="M22 31h8v6h-8zM42 26h6v6h-6zM43 39h8v5h-8z"
            fill="var(--forest-cream)"
          />
          <path d="M71 73V56h10v17z" fill="var(--forest-cream)" />
          <path d="M61 57V46h7v-7h15v7h8v11z" fill="var(--forest-gold)" />
          <path d="M69 47h6v5h-6z" fill="var(--forest-cream)" />
          <path
            d="M8 75h91v4H8zM48 73V61h4v8h5V57h4v16z"
            fill="var(--forest-leaf)"
          />
          <path
            className="forest-spark"
            d="M85 16h4v-4h4v4h4v4h-4v4h-4v-4h-4z"
            fill="var(--forest-gold)"
          />
        </>
      ) : kind === "fox" ? (
        <>
          <path
            d="M30 62V31h7V17h11v9h20v-9h11v14h7v31H75v8H42v-8z"
            fill="var(--forest-rust)"
          />
          <path
            d="M40 45h13v8h10v-8h15v15H66v6H52v-6H40z"
            fill="var(--forest-cream)"
          />
          <path
            d="M43 36h5v6h-5zM68 36h5v6h-5zM54 50h9v5h-9z"
            fill="var(--forest-deep)"
          />
          <path d="M20 67V47h8v16h10v10H19v-6z" fill="var(--forest-rust)" />
          <path d="M19 47h9v10h-9z" fill="var(--forest-cream)" />
          <path d="M12 76h86v4H12z" fill="var(--forest-ground)" />
        </>
      ) : (
        <>
          {[25, 57, 86].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x} 72V${31 + i * 8}h4v${41 - i * 8}zM${x} 59h-9v-5h9zM${x + 4} 64h9v-5h-9z`}
                fill="var(--forest-leaf)"
              />
              <path
                d={`M${x - 5} ${27 + i * 8}h5v-5h5v5h6v6h-6v5h-5v-5h-5z`}
                fill="var(--forest-cream)"
              />
              <path
                d={`M${x} ${27 + i * 8}h5v6h-5z`}
                fill="var(--forest-gold)"
              />
            </g>
          ))}
          <path d="M12 75h91v4H12z" fill="var(--forest-ground)" />
        </>
      )}
    </svg>
  );
}
