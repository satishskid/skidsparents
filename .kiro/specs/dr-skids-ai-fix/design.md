# Design Document: Dr. SKIDS AI Fix

## Overview

This feature fixes the broken Dr. SKIDS AI chat by configuring the correct Cloudflare Workers AI models, replacing the per-minute rate limiter with a per-day quota system, surfacing quota status to users in the UI, improving error messages, and replacing the placeholder "S" logo with the SKIDS brand illustration across the Navbar, Timeline header, and ChatWidget.

The changes are surgical — touching four existing files (`providers.ts`, `router.ts`, `chat.ts`, `ChatWidget.tsx`), two layout files (`Navbar.astro`, `timeline.astro`), and adding one documentation section.

---

## Architecture

The system follows the existing layered architecture:

```
Browser (ChatWidget.tsx)
    │  POST /api/chat  +  X-RateLimit-Remaining header
    ▼
Astro API Route (chat.ts)
    │  checkRateLimit()  │  routeToModel()
    ▼                    ▼
AI_Router (router.ts)   AI_Provider (providers.ts)
    │  KV (chat_daily:)      │  env.AI (Workers AI binding)
    ▼                        ▼
Cloudflare KV          Llama-4-Scout → Llama-3.1-8b (fallback)
```

No new services, databases, or infrastructure are introduced. The only external dependency change is the Workers AI model identifier.

---

## Components and Interfaces

### providers.ts — `runWorkersAI()`

Current behaviour: tries `@cf/meta/llama-3.1-8b-instruct`, falls back to `@cf/meta/llama-3.2-3b-instruct`.

New behaviour:

```
runWorkersAI(ai, messages, maxTokens):
  try:
    result = ai.run('@cf/meta/llama-4-scout-17b-16e-instruct', ...)
    return { text, model: 'llama-4-scout-17b-16e-instruct', tier: 'free' }
  catch:
    result = ai.run('@cf/meta/llama-3.1-8b-instruct', ...)
    return { text, model: 'llama-3.1-8b-instruct', tier: 'free' }
  // if both throw, the error propagates to router.ts
```

### router.ts — `checkRateLimit()`

KV key format changes from `chat_rl:{tier}:{parentId}` (TTL 60s) to `chat_daily:{tier}:{parentId}` (TTL 86400s).

Daily limits:

| Tier    | Limit |
|---------|-------|
| free    | 20    |
| premium | 100   |

Return shape is unchanged: `{ allowed: boolean; remaining: number }`.

### chat.ts — rate limit error messages

The 429 response body changes to include:
- `error`: human-readable message with the daily limit and midnight IST reset time
- `upgradeAvailable`: `true` only for free users
- `dailyLimit`: numeric quota for the tier (also added to 200 responses)

The 200 response body gains:
- `dailyLimit`: numeric quota so the widget can display "N of M"

### ChatWidget.tsx — quota display

New state: `remaining: number | null`, `dailyLimit: number | null`.

After each successful response, parse `X-RateLimit-Remaining` header and `dailyLimit` from the JSON body. Render below the input:

```
"N of M questions remaining today"
  - gray text when N > 5
  - amber text when N ≤ 5
  - hidden when remaining is null (first load / unauthenticated)
```

### Logo replacement

A shared `SkidsLogo` inline component handles the fallback pattern:

```tsx
function SkidsLogo({ size }: { size: number }) {
  const [err, setErr] = useState(false)
  if (err) return <GreenCircle size={size} />
  return <img src="/skids-logo.png" alt="SKIDS"
    width={size} height={size}
    style={{ objectFit: 'contain' }}
    onError={() => setErr(true)} />
}
```

For Astro files (Navbar, timeline header) where React state is unavailable, use an inline `onerror` handler:

```html
<img src="/skids-logo.png" alt="SKIDS" width="32" height="32"
  style="object-fit:contain"
  onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
<div style="display:none" class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 ...">S</div>
```

---

## Data Models

No schema changes. The only data model change is the KV key namespace:

| Field       | Old value                        | New value                          |
|-------------|----------------------------------|------------------------------------|
| KV key      | `chat_rl:{tier}:{parentId}`      | `chat_daily:{tier}:{parentId}`     |
| TTL         | 60 seconds                       | 86400 seconds                      |
| Free limit  | 20 / minute                      | 20 / day                           |
| Premium limit | 60 / minute                    | 100 / day                          |

The `chatbot_conversations` table and all other DB tables are untouched.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Llama-4-Scout is always tried first

*For any* set of messages passed to `runWorkersAI`, the first `ai.run` call SHALL use the model identifier `@cf/meta/llama-4-scout-17b-16e-instruct`.

**Validates: Requirements 1.1**

### Property 2: Fallback to Llama-3.1-8b on primary failure

*For any* set of messages where the Llama-4-Scout call throws, `runWorkersAI` SHALL complete successfully by calling `@cf/meta/llama-3.1-8b-instruct` and return a non-empty `text` field.

**Validates: Requirements 1.2**

### Property 3: Successful response always includes model and dailyLimit fields

*For any* authenticated request that results in a 200 response from `/api/chat`, the JSON body SHALL contain a non-empty string `model` field and a positive integer `dailyLimit` field.

**Validates: Requirements 1.4, 3.5**

### Property 4: Daily quota is enforced per tier

*For any* parentId and tier, once the daily quota for that tier has been reached (20 for free, 100 for premium), every subsequent call to `checkRateLimit` within the same TTL window SHALL return `{ allowed: false, remaining: 0 }`.

**Validates: Requirements 2.1, 2.2, 2.5**

### Property 5: KV key format is correct

*For any* tier string and parentId string, `checkRateLimit` SHALL write to a KV key matching the pattern `chat_daily:{tier}:{parentId}` with a TTL of exactly 86400 seconds.

**Validates: Requirements 2.3**

### Property 6: Remaining count decrements correctly

*For any* parentId and tier where the current count is C (C < limit), calling `checkRateLimit` once SHALL return `remaining = limit - C - 1` and increment the stored counter to C + 1.

**Validates: Requirements 2.4**

### Property 7: Successful response always includes X-RateLimit-Remaining header

*For any* authenticated request that results in a 200 response from `/api/chat`, the HTTP response SHALL include an `X-RateLimit-Remaining` header whose value is a non-negative integer string.

**Validates: Requirements 3.1**

### Property 8: Quota display text format

*For any* remaining count N and daily limit M, the quota display string SHALL match the pattern `"{N} of {M} questions remaining today"`.

**Validates: Requirements 3.2**

### Property 9: Quota display styling by threshold

*For any* remaining count N, the quota display element SHALL have amber styling when N ≤ 5 and gray styling when N > 5.

**Validates: Requirements 3.3, 3.4**

### Property 10: ChatWidget displays server response text verbatim

*For any* `response` string returned by the Chat_API (including error responses), the ChatWidget SHALL render that exact string in the message list without appending or prepending additional text.

**Validates: Requirements 6.3**

### Property 11: All SKIDS logo images have alt="SKIDS"

*For any* rendered page that includes the SKIDS logo image, every `<img>` element with `src="/skids-logo.png"` SHALL have `alt="SKIDS"`.

**Validates: Requirements 7.6**

---

## Error Handling

| Scenario | Current behaviour | New behaviour |
|---|---|---|
| `env.AI` not bound | Generic "I'm having trouble connecting" | Specific message: "Dr. SKIDS AI service is temporarily unavailable. Please try again shortly or contact support." |
| Both Workers AI models fail | Error propagates, generic catch message | Same specific message as above (distinct from network errors) |
| Fetch-level network error (no server response) | Same generic message | "Connection problem — please check your internet and try again." |
| Daily quota reached (free) | "20 questions per minute" message | "You've used all 20 of your free questions today. Your quota resets at midnight IST." + upgrade prompt |
| Daily quota reached (premium) | "60 questions per minute" message | "You've used all 100 of your premium questions today. Your quota resets at midnight IST." |
| KV unavailable | Blocks request | Allows through with `remaining: 999` |
| Logo image 404 | Broken image | Falls back to green "S" circle via `onError` |

---

## Testing Strategy

### Unit Tests

Focus on specific examples and edge cases:

- `runWorkersAI` with both models failing throws an error (Req 1.3)
- `checkRateLimit` with KV unavailable returns `{ allowed: true, remaining: 999 }` (Req 2.6)
- Chat_API 429 response for free user includes `upgradeAvailable: true` (Req 4.3)
- Chat_API 429 response for premium user does not include `upgradeAvailable` (Req 4.5)
- ChatWidget renders upgrade prompt when `upgradeAvailable: true` (Req 4.4)
- ChatWidget renders only error message when no `upgradeAvailable` (Req 4.5)
- ChatWidget renders connection error message on fetch failure (Req 6.4)
- Logo `onError` handler swaps to green circle fallback (Req 7.5)
- Timeline header renders `<img src="/skids-logo.png">` at 40×40 (Req 7.1)
- Navbar renders `<img src="/skids-logo.png">` at 32×32 (Req 7.2)

### Property-Based Tests

Use **fast-check** (already compatible with the TypeScript/Vitest stack).

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: dr-skids-ai-fix, Property {N}: {property_text}`

| Property | Test description | Generator inputs |
|---|---|---|
| P1 | First ai.run call is always Llama-4-Scout | Random message arrays |
| P2 | Fallback succeeds when primary throws | Random messages + simulated primary failure |
| P3 | 200 response always has `model` + `dailyLimit` | Random valid request bodies |
| P4 | Quota enforced per tier | Random parentId, tier, count at/above limit |
| P5 | KV key format matches pattern | Random tier strings, random parentId UUIDs |
| P6 | Remaining count decrements correctly | Random parentId, count below limit |
| P7 | X-RateLimit-Remaining header present on 200 | Random valid request bodies |
| P8 | Quota display string format | Random N (0–999), M (20 or 100) |
| P9 | Quota display styling threshold | Random N values around the threshold of 5 |
| P10 | ChatWidget renders response verbatim | Random response strings including special chars |
| P11 | All logo imgs have alt="SKIDS" | Rendered component snapshots |

**Property-based testing library**: `fast-check` (`npm install --save-dev fast-check`)

Each property-based test must be tagged with a comment referencing the design property, e.g.:

```ts
// Feature: dr-skids-ai-fix, Property 5: KV key format is correct
it('KV key format matches chat_daily:{tier}:{parentId}', () => {
  fc.assert(fc.property(
    fc.constantFrom('free', 'premium'),
    fc.uuid(),
    async (tier, parentId) => {
      const writtenKey = await captureKvKey(tier, parentId)
      expect(writtenKey).toBe(`chat_daily:${tier}:${parentId}`)
    }
  ), { numRuns: 100 })
})
```
