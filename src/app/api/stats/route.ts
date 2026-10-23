import { MongoClient } from "mongodb";

// Read-only window onto the stats the crank saves in MongoDB (database "president2028",
// collection "stats", document "current"). Set MONGODB_URI in Vercel to a read-only user.
// Responses are cached at Vercel's edge for a minute, so the database sees about one read a minute.

export const dynamic = "force-dynamic";

const CACHE = "public, s-maxage=60, stale-while-revalidate=300";

// Reused across invocations of a warm function.
let client: Promise<MongoClient> | null = null;

function connect(uri: string) {
  client ??= new MongoClient(uri, { maxPoolSize: 1, serverSelectionTimeoutMS: 5_000 })
    .connect()
    .catch((e) => {
      client = null;
      throw e;
    });
  return client;
}

export async function GET() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return Response.json({ error: "stats not configured" }, { status: 503 });
  try {
    const db = (await connect(uri)).db("president2028");
    const doc = await db.collection<{ _id: string }>("stats").findOne({ _id: "current" }, { projection: { _id: 0 } });
    if (!doc) return Response.json({ error: "no stats yet" }, { status: 404, headers: { "Cache-Control": CACHE } });
    return Response.json(doc, { headers: { "Cache-Control": CACHE } });
  } catch {
    return Response.json({ error: "stats unavailable" }, { status: 503 });
  }
}
