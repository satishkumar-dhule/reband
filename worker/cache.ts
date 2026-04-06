// Cloudflare Worker LRU cache with pre-compressed gzip support
// Mirrors the Express server/cache pattern for Workers

interface CacheEntry {
  data: unknown;
  json: string;
  gzipped: Uint8Array;
  etag: string;
  timestamp: number;
}

const MAX_CACHE_SIZE = 500;
const CACHE_TTL = 3_600_000; // 1 hour

const cache = new Map<string, CacheEntry>();

function makeETag(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return `"${(hash >>> 0).toString(36)}"`;
}

function buildEntry(data: unknown): Omit<CacheEntry, "timestamp"> {
  const json = JSON.stringify(data);
  const etag = makeETag(json);
  return { data, json, gzipped: new Uint8Array(), etag };
}

export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
): Promise<{ data: T; json: string; gzipped: Uint8Array; etag: string }> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    cache.delete(key);
    cache.set(key, cached);
    return {
      data: cached.data as T,
      json: cached.json,
      gzipped: cached.gzipped,
      etag: cached.etag,
    };
  }

  const data = await fetchFn();
  const json = JSON.stringify(data);
  const etag = makeETag(json);

  let gzipped: Uint8Array;
  try {
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(new TextEncoder().encode(json));
    writer.close();
    const compressed = await new Response(cs.readable).arrayBuffer();
    gzipped = new Uint8Array(compressed);
  } catch {
    gzipped = new TextEncoder().encode(json);
  }

  const entry: CacheEntry = { data, json, gzipped, etag, timestamp: Date.now() };
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, entry);

  return { data, json, gzipped, etag };
}

export function invalidateCache(): void {
  cache.clear();
}

export function sendCachedResponse(
  request: Request,
  result: { json: string; gzipped: Uint8Array; etag: string },
  maxAgeSeconds = 3600,
): Response {
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch === result.etag) {
    return new Response(null, { status: 304, headers: { ETag: result.etag } });
  }

  const headers = new Headers();
  headers.set("ETag", result.etag);
  headers.set("Vary", "Accept-Encoding");
  headers.set("Cache-Control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=86400`);
  headers.set("Content-Type", "application/json; charset=utf-8");

  const acceptsGzip = (request.headers.get("accept-encoding") || "").includes("gzip");
  if (acceptsGzip && result.gzipped.length > 0) {
    headers.set("Content-Encoding", "gzip");
    headers.set("Content-Length", String(result.gzipped.length));
    return new Response(result.gzipped, { headers });
  }

  return new Response(result.json, { headers });
}
