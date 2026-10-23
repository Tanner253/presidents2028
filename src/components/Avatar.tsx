"use client";

import { useState } from "react";
import { PARTIES, initials, type Candidate } from "@/config/candidates";
import { PHOTOS } from "@/config/photos";

// Candidate portrait (or initials). `square` for table cells; `dim` greys out dropped-out
// candidates. Pass dim={false} when the parent row/card already fades them.
export default function Avatar({
  c,
  size = 44,
  square = false,
  dim = true,
}: {
  c: Candidate;
  size?: number;
  square?: boolean;
  dim?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const src = broken ? undefined : (c.image ?? PHOTOS[c.id]?.src);
  const p = PARTIES[c.party];
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border-2 font-slab ${
        square ? "" : "rounded-full"
      } ${dim && c.status === "out" ? "grayscale" : ""}`}
      style={{ width: size, height: size, background: p.color, borderColor: p.color, color: p.on, fontSize: size * 0.36 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover object-[50%_18%]" />
      ) : (
        initials(c.name)
      )}
    </span>
  );
}

export function PartyTag({ party }: { party: Candidate["party"] }) {
  const p = PARTIES[party];
  return (
    <span
      className="inline-block px-1.5 py-0.5 font-narrow text-[11px] font-bold tracking-[0.14em]"
      style={{ background: p.color, color: p.on }}
      title={p.name}
    >
      {p.short}
    </span>
  );
}
