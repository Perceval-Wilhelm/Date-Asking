/** A pencil and an eraser lying on the desk, for screens wide enough to have a desk. */
export function DeskDecor() {
  return (
    <>
      <svg className="decor decor--pencil" viewBox="0 0 220 28" aria-hidden="true">
        <rect x="0" y="5" width="16" height="18" rx="5" fill="#ff8fb3" />
        <rect x="14" y="4" width="16" height="20" fill="#c9ced8" />
        <path d="M18 4 V24 M23 4 V24" stroke="#9aa1b0" strokeWidth="1.5" />
        <rect x="30" y="4" width="150" height="20" fill="#f6c343" />
        <path d="M30 11 H180 M30 17 H180" stroke="#e0a91f" strokeWidth="1.5" />
        <path d="M180 4 L214 14 L180 24 Z" fill="#f3d6ad" />
        <path d="M204 11 L214 14 L204 17 Z" fill="#1f2747" />
      </svg>
      <svg className="decor decor--eraser" viewBox="0 0 80 44" aria-hidden="true">
        <rect x="2" y="6" width="76" height="34" rx="7" fill="#ffd3e2" />
        <rect x="2" y="6" width="34" height="34" rx="7" fill="#7cc4ff" />
        <rect x="26" y="6" width="10" height="34" fill="#7cc4ff" />
        <path d="M44 16 C 52 12, 62 14, 70 20" stroke="#f3a9c3" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </>
  );
}
