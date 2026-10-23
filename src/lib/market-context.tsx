"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CANDIDATES, type Candidate } from "@/config/candidates";
import { SITE } from "@/config/site";
import {
  DEMO,
  MAIN_KEY,
  demoHolders,
  demoMarkets,
  demoStats,
  fetchMarkets,
  fetchOdds,
  fetchStats,
  type EngineStats,
  type Holders,
  type Odds,
  type TokenMarket,
} from "./market";

type MarketState = {
  markets: Record<string, TokenMarket>;
  odds: Record<string, Odds>;
  // Keyed like markets (candidate id or MAIN_KEY), resolved from stats.holders by mint.
  holders: Record<string, Holders>;
  stats: EngineStats | null;
  // First load attempt finished (whether or not it succeeded).
  loaded: boolean;
  oddsLoaded: boolean;
  // Last attempt failed; the data shown is the last good copy, if any.
  marketsFailed: boolean;
  statsFailed: boolean;
};

const EMPTY: MarketState = {
  markets: {},
  odds: {},
  holders: {},
  stats: null,
  loaded: false,
  oddsLoaded: false,
  marketsFailed: false,
  statsFailed: false,
};

const Ctx = createContext<MarketState>(EMPTY);

const ENTRIES = [
  { key: MAIN_KEY, mint: SITE.mainMint },
  ...CANDIDATES.map((c) => ({ key: c.id, mint: c.mint })),
];
const ODDS_IDS = [
  ...CANDIDATES.flatMap((c) => (c.polymarketId ? [c.polymarketId] : [])),
  SITE.partyMarkets.R,
  SITE.partyMarkets.D,
];

// True once at least one coin (main or candidate) has a contract address.
export const ANY_LIVE = ENTRIES.some((e) => e.mint);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MarketState>(EMPTY);

  useEffect(() => {
    let alive = true;
    const loadMarkets = async () => {
      if (DEMO) {
        const keys = ENTRIES.map((e) => e.key);
        setState((s) => ({ ...s, markets: demoMarkets(keys), holders: demoHolders(keys), stats: demoStats(), loaded: true }));
        return;
      }
      const [m, st] = await Promise.allSettled([fetchMarkets(ENTRIES), fetchStats(SITE.statsUrl)]);
      if (!alive) return;
      setState((s) => {
        const stats = st.status === "fulfilled" && st.value ? st.value : s.stats;
        const holders: Record<string, Holders> = {};
        for (const e of ENTRIES) if (e.mint && stats?.holders[e.mint]) holders[e.key] = stats.holders[e.mint];
        return {
          ...s,
          markets: m.status === "fulfilled" ? m.value : s.markets,
          stats,
          holders,
          loaded: true,
          marketsFailed: m.status === "rejected",
          statsFailed: st.status === "rejected",
        };
      });
    };
    const loadOdds = async () => {
      const odds = await fetchOdds(ODDS_IDS).catch(() => null);
      if (alive) setState((s) => ({ ...s, odds: odds ?? s.odds, oddsLoaded: true }));
    };
    const tick = (fn: () => void) => () => {
      if (!document.hidden) fn();
    };
    const onVisible = () => {
      if (!document.hidden) {
        loadMarkets();
        loadOdds();
      }
    };
    loadMarkets();
    loadOdds();
    const t1 = setInterval(tick(loadMarkets), SITE.marketRefreshMs);
    const t2 = setInterval(tick(loadOdds), SITE.oddsRefreshMs);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(t1);
      clearInterval(t2);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useMarket = () => useContext(Ctx);

export type CandidateRow = Candidate & {
  market: TokenMarket | null;
  // Win probability 0–1 and its day/week change in probability points (0–1 scale).
  odds: number | null;
  oddsDay: number | null;
  oddsWeek: number | null;
  holders: Holders | null;
  // This candidate's market on polymarket.com (or the event page until the slug loads).
  pmUrl: string;
};

export function useCandidateRows(): CandidateRow[] {
  const { markets, odds, holders } = useMarket();
  return useMemo(
    () =>
      CANDIDATES.map((c) => {
        const o = c.polymarketId ? odds[c.polymarketId] : undefined;
        return {
          ...c,
          market: markets[c.id] ?? null,
          odds: o?.p ?? null,
          oddsDay: o?.day ?? null,
          oddsWeek: o?.week ?? null,
          holders: holders[c.id] ?? null,
          pmUrl: o?.slug ? `${SITE.polymarketEvent}/${o.slug}` : SITE.polymarketEvent,
        };
      }),
    [markets, odds, holders],
  );
}

// Polymarket's party-level odds (0–1) for the White House, null until loaded.
export function usePartyOdds() {
  const { odds } = useMarket();
  return { R: odds[SITE.partyMarkets.R]?.p ?? null, D: odds[SITE.partyMarkets.D]?.p ?? null };
}
