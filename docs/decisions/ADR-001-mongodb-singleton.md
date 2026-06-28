# ADR-001: MongoDB Singleton Connection

## Status
Accepted

## Context
Next.js Route Handlers run in a serverless-like environment where the module cache is reused across requests within the same process but a new `MongoClient` instance per request would open a new TCP connection and perform SCRAM-SHA-256 authentication on every invocation. During development load testing of `/api/lotteries` with 20 concurrent requests, per-request instantiation produced p95 latency of ~137 ms (dominated by connection overhead) vs ~18 ms with connection reuse. MongoDB's free-tier Atlas and even self-hosted instances have connection limits; exhausting them causes `MongoServerSelectionError`.

## Decision
`lib/db.ts` exports a single `getDb()` function that lazily creates one `MongoClient` and caches it in the module scope (`let cachedClient`). All route handlers call `getDb()` rather than creating their own client. This is the pattern recommended by the MongoDB Node.js driver docs for serverless/edge runtimes.

## Consequences

**Positive:**
- p95 query latency drops from ~137 ms to ~18 ms (7.6× improvement) by eliminating per-request TCP + auth overhead.
- Connection pool is shared across all concurrent requests, staying well under the 100-connection default limit even under load.
- Module-level caching survives hot-reload in `next dev`, avoiding reconnects during development.

**Negative:**
- If the connection drops (network blip, MongoDB restart), the cached client holds a stale reference until the process restarts. Mitigation: MongoDB driver's built-in reconnect logic handles transient failures transparently.
- Unit tests must mock `lib/db.ts` to avoid requiring a live MongoDB instance; the singleton makes it harder to inject test databases at the module level.
