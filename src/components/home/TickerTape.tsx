"use client";

import { changeColor, fmtDir, fmtOdds } from "@/lib/format";
import { useCandidateRows } from "@/lib/market-context";

export default function TickerTape() {
  const rows = [...useCandidateRows()].sort((a, b) => (b.odds ?? -1) - (a.odds ?? -1));
  const items = rows.map((r) => (
    <span key={r.id} className="flex items-center gap-2 px-4">
      <span className="font-bold text-cream">${r.ticker}</span>
      {r.market ? (
        <span className={`tabular-nums ${changeColor(r.market.change24h)}`}>{fmtDir(r.market.change24h)}</span>
      ) : (
        <span className="tabular-nums text-cream/70">{fmtOdds(r.odds)}</span>
      )}
      <span className="pl-4 text-gold" aria-hidden="true">
        ★
      </span>
    </span>
  ));
  return (
    <div className="overflow-hidden border-b-4 border-gold bg-ink py-3 font-narrow text-[15px] font-bold uppercase tracking-[0.12em]">
      <div className="marquee flex w-max" aria-hidden="true">
        <div className="flex">{items}</div>
        <div className="flex">{items}</div>
      </div>
    </div>
  );
}
