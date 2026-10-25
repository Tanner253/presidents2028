import { CANDIDATES } from "@/config/candidates";
import { SITE } from "@/config/site";

// Contract addresses come from the crank: it finds every coin the dev wallet launched and publishes
// the list with its stats (see /api/stats). Addresses typed into the config still win.

export type LaunchedCoin = { mint: string; symbol: string; name: string; image: string | null; main: boolean };

export type Mints = {
  main: string;
  // Candidate id → contract address.
  byId: Record<string, string>;
  // At least one coin is live.
  any: boolean;
};

const norm = (s: string) => s.replace(/[^a-z0-9]/gi, "").toUpperCase();

const longest = (hits: { id: string; len: number }[]) => hits.sort((a, b) => b.len - a.len)[0]?.id ?? null;

// Which candidate a launched coin is: its ticker ($VANCE), else the candidate's full name inside the
// coin's name, else the candidate's ticker inside the coin's ticker ($JDVANCE). Longest match wins,
// so "Donald Trump Jr" is Trump Jr, not Trump.
export function candidateFor(coin: Pick<LaunchedCoin, "symbol" | "name">): string | null {
  const t = norm(coin.symbol);
  const n = norm(coin.name);
  const exact = CANDIDATES.find((c) => norm(c.ticker) === t);
  if (exact) return exact.id;
  return (
    longest(CANDIDATES.filter((c) => n && n.includes(norm(c.name))).map((c) => ({ id: c.id, len: norm(c.name).length }))) ??
    longest(CANDIDATES.filter((c) => t && t.includes(norm(c.ticker))).map((c) => ({ id: c.id, len: c.ticker.length })))
  );
}

// `coins` come oldest first, so if a ticker was launched twice the newest coin wins.
export function resolveMints(coins: LaunchedCoin[]): Mints {
  let main = "";
  const byId: Record<string, string> = {};
  for (const c of coins) {
    if (c.main) main = c.mint;
    else {
      const id = candidateFor(c);
      if (id) byId[id] = c.mint;
    }
  }
  if (SITE.mainMint) main = SITE.mainMint;
  for (const c of CANDIDATES) if (c.mint) byId[c.id] = c.mint;
  return { main, byId, any: Boolean(main) || Object.keys(byId).length > 0 };
}

// Just the addresses typed into the config (before the crank's list loads).
export const CONFIG_MINTS = resolveMints([]);
