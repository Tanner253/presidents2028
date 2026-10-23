# US President 2028 ($PRESIDENT)

The World Cup on Pump format, remade for the 2028 presidential race: one pump.fun coin per candidate, all feeding the main $PRESIDENT coin.

Live: https://president2028.vercel.app

## Pages (and their World Cup equivalents)

| Ours | World Cup on Pump | What's on it |
| --- | --- | --- |
| `/` | Home | Splash gate, scoreboard (next big day, next burn, candidates remaining, up next), burned / market cap / Election Day blocks, buy band, ticker, 4-step fee engine, "paired to $PRESIDENT", top gainer & loser, frontrunner table (their Golden Boot) |
| `/president/` | `/worldcup/` | Burn cam, contract address, market cap / volume / price / liquidity / holders / % burnt, chart, fee-engine totals |
| `/candidates/` | `/countries/` | Ranked board (position, movement, odds, market cap, 24h, volume, holders) and photo cards |
| `/race/` | `/tournament/` | Road to the White House bracket, race calendar (their fixtures), "Call the race" ballot (their bracket challenge) with share links |
| `/voters/` | `/passport/` | Voter Card: holder leaderboard with 5 tiers, 8 badges, wallet lookup |
| `/credits/` | n/a | Photo credits (Wikimedia Commons licenses) |

## Data sources

| What | Where it comes from |
| --- | --- |
| Coin price, market cap, volume, 24h change | DexScreener public API, in the browser, every 60s |
| Win odds | Polymarket "Presidential Election Winner 2028" market (gamma `/markets/keyset`), every 5 min |
| Party odds ("Race to 270", chyron) | Polymarket "Which party wins 2028" market, ids in `SITE.partyMarkets` |
| Burned, SOL routed, cycle times, holder counts | `stats.json`, written by your internal claim process |
| Voter Card | `board-meta.json` + `board-{n}.json`, written by your internal claim process |

## Launch checklist

1. **Main coin:** paste the $PRESIDENT contract address into `mainMint` in `src/config/site.ts`.
2. **Candidate coins:** paste each contract address into that candidate's `mint` in `src/config/candidates.ts`. Until a coin has one, its card says "Soon".
3. **Socials:** fill in `socials` in `src/config/site.ts`; empty links stay hidden.
4. **Giveaway (optional):** set `BALLOT.prize` in `src/config/site.ts` to show winners × SOL and rules on the ballot. Edit or remove the home `ANNOUNCEMENT` band there too.
5. **Deploy:** `vercel --prod`.

## stats.json (fee engine)

Your claim process publishes this after every cycle:

```json
{
  "totalBurned": 0,
  "totalSolRouted": 0,
  "solToBurn": 0,
  "solToLp": 0,
  "solToMarketing": 0,
  "cycles": 0,
  "lastCycleAt": null,
  "nextCycleAt": null,
  "cycleIntervalMs": 3600000,
  "capturedAt": null,
  "holders": {
    "<mint>": { "count": 1049, "change24h": -30 }
  }
}
```

- `totalBurned` is in $PRESIDENT tokens; the SOL fields are in SOL; times are ISO strings.
- `holders` is optional. When it's present, holder counts appear on the $PRESIDENT page, the candidates board and the coin cards.
- Until `nextCycleAt` is set, the site shows "Burns start at launch" instead of a countdown.

There are two ways to publish it:

- **Easiest:** host the JSON wherever the claim process runs (any URL that sends `Access-Control-Allow-Origin: *`), then point `statsUrl` in `src/config/site.ts` at it. New numbers show up within a minute, with no redeploy.
- **No extra hosting:** overwrite `public/data/stats.json` and run `vercel --prod`.

## Voter Card files

The schema is documented at the top of `src/config/voters.ts`. In short:

- `board-meta.json`: `{ "totalEntries": 9966, "pageCount": 200, "pageSize": 50 }`
- `board-{n}.json`: `{ "entries": [{ "rank": 1, "owner": "<wallet>", "band": "ELECTOR", "badges": ["REGISTERED"] }], "resolvedResultBadges": [] }`

Host them at `VOTER_CARD.rosterUrl`, then set `VOTER_CARD.enabled: true` in `src/config/site.ts`. Until then, the page shows "The rolls open when $PRESIDENT launches" plus the tiers and badges explainer.

## Running the race

- **Someone drops out:** set `status: "out"`, `outAt` (the stage, e.g. `"early"`) and optionally `outDate: "2027-09-14"` in `src/config/candidates.ts`. They're greyed out everywhere, stop on the road at that stage, and appear in the calendar.
- **Someone declares, wins a nomination, or wins:** set `status` to `"running"`, `"nominee"`, or `"winner"`. Ballots score automatically against nominees and the winner.
- **New candidate:** add a line to `CANDIDATES`, a photo to `public/candidates/<id>.jpg`, and a credit line to `src/config/photos.ts`. For live odds, set `polymarketId` (market ids are listed at `https://gamma-api.polymarket.com/events?slug=presidential-election-winner-2028`).
- **The race moves on:** set `CURRENT_STAGE` in `src/config/race.ts`.
- **Calendar:** add or date events in `EVENTS` in `src/config/race.ts`, and set `result` once an event is decided.

Redeploy with `vercel --prod` after any change.

## Local development

```bash
npm install
npm run dev
```

`npm run dev` shows fake market numbers and a demo voter roll (set in `.env.development`) so you can check layouts before launch. Production builds always show real data.
