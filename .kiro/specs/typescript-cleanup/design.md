# Design Document: TypeScript Cleanup

## Overview

This is a type-only cleanup of the SKIDS Parent codebase. The goal is to eliminate all 88 TypeScript
errors reported by `tsc --noEmit` without changing any runtime behaviour. No new functionality is
added, no runtime dependencies are introduced, and no files are renamed or restructured.

The errors share a single root cause: the Cloudflare Workers + Astro SSR runtime environment was not
fully typed when these files were written, so developers used `as any` casts as workarounds. The fix
is to supply the missing type information that was always implicitly present at runtime.

All fixes fall into seven categories (CAT-1 through CAT-7) defined in the requirements document.

---

## Architecture

The fix is purely additive to the type layer. The runtime call graph, response shapes, and data flow
are unchanged. The diagram below shows which files are touched per category.

```mermaid
graph TD
  subgraph "Type declarations (src/env.d.ts)"
    ENV[Env interface — already exists]
    WIN[Window.__ADMIN_KEY — CAT-5 addition]
  end

  subgraph "Shared helper (src/lib/runtime/env.ts)"
    HELPER[getEnv(locals): Env — CAT-1]
  end

  subgraph "API routes (~35 files)"
    CAT1[CAT-1: replace locals cast with getEnv]
    CAT2[CAT-2: inline row interfaces + as RowType]
    CAT3[CAT-3: inline body interfaces]
    CAT4[CAT-4: catch unknown + instanceof]
    CAT6[CAT-6: add Promise<Response> return types]
    CAT7[CAT-7: misc per-file fixes]
  end

  subgraph "Admin components (4 files)"
    CAT5[CAT-5: window.__ADMIN_KEY via Window extension]
  end

  ENV --> HELPER
  HELPER --> CAT1
  WIN --> CAT5
```

---

## Components and Interfaces

### CAT-1: `getEnv` helper

A single shared function replaces every `(locals as any).runtime?.env || {}` call site.

**File:** `src/lib/runtime/env.ts` (new file)

```typescript
import type { App } from 'astro'

/**
 * Type-safe accessor for Cloudflare bindings from Astro locals.
 * Returns the Env object from locals.runtime.env.
 * Falls back to a cast empty object if runtime is absent (e.g. local dev without wrangler).
 */
export function getEnv(locals: App.Locals): Env {
  return (locals as App.Locals & { runtime?: { env?: Env } }).runtime?.env ?? ({} as Env)
}
```

The `Env` interface is already declared globally in `src/env.d.ts` and includes `DB`, `KV`, `R2`,
`AI`, `VECTORIZE`, `FIREBASE_PROJECT_ID`, and `SITE_URL`. No changes to `src/env.d.ts` are needed
for CAT-1.

Usage in every API route replaces the inline cast:

```typescript
// Before
const env = (locals as any).runtime?.env || {}

// After
import { getEnv } from '@/lib/runtime/env'
const env = getEnv(locals)
```

The `getParentId` and `verifyChildOwnership` helpers in `src/pages/api/children.ts` accept `env: any`
today. Their signatures will be updated to `env: Env` as part of CAT-1 since they are the primary
consumers of the env object.

### CAT-2: D1 row interfaces

Row interfaces are defined **inline** in each route file, immediately above the handler that uses
them. They are not extracted to a shared types file because:

- Each query returns a distinct shape; sharing would create false coupling.
- The interfaces are small (2–6 fields) and self-documenting at the call site.
- Requirement 5.3 explicitly prohibits placing body interfaces in `schema.ts`; the same principle
  applies to row interfaces.

Pattern:

```typescript
interface MilestoneRow {
  id: string
  child_id: string
  milestone_key: string
  status: string
}

// Usage
const existing = await env.DB
  .prepare('SELECT id FROM milestones WHERE child_id = ? AND milestone_key = ?')
  .bind(childId, key)
  .first<MilestoneRow>()

// existing is MilestoneRow | null — null case must be handled explicitly
if (existing) {
  await env.DB.prepare('UPDATE milestones SET status = ? WHERE id = ?')
    .bind(status, existing.id)   // no cast needed
    .run()
}
```

D1's `.first<T>()` and `.all<T>()` accept a generic type parameter, so no `as RowType` cast is
needed at the call site — the generic is sufficient.

### CAT-3: Request body interfaces

Body interfaces are defined **inline** in each route file, immediately above the handler that parses
the body. No co-located types file is created.

Pattern:

```typescript
interface CreateChildBody {
  name: string
  dob: string
  gender?: string
  blood_group?: string
  allergies?: string[]
}

const body = await request.json() as CreateChildBody
```

Several route files already follow this pattern (e.g. `children.ts`, `growth.ts`). The remaining
files that use `body.field as any` will have their body interfaces added.

### CAT-4: Catch block narrowing

All `catch (e: any)` and `catch (err: any)` are replaced with `catch (e: unknown)`. Where `e.message`
or other `Error` properties are accessed, an `instanceof Error` guard is added.

Pattern A — message is accessed:

```typescript
// Before
} catch (err: any) {
  if (err.message?.includes('no such table')) { ... }
}

// After
} catch (e: unknown) {
  if (e instanceof Error && e.message.includes('no such table')) { ... }
}
```

Pattern B — error is only logged or re-thrown (no property access):

```typescript
// Before
} catch (err: any) {
  console.error('[Chat] Error:', err)
}

// After
} catch (e: unknown) {
  console.error('[Chat] Error:', e)
}
```

### CAT-5: Window interface extension

A `Window` interface augmentation is added to `src/env.d.ts` (the existing global declarations file):

```typescript
// Appended to src/env.d.ts
declare global {
  interface Window {
    __ADMIN_KEY?: string
  }
}
```

This removes the need for `(window as any).__ADMIN_KEY` in the four admin components:
`AuditLogViewer.tsx`, `CRMDashboard.tsx` (if present), `OrderManager.tsx`, `ProviderManager.tsx`,
`RevenueDashboard.tsx`.

After this declaration, `window.__ADMIN_KEY` is directly accessible without a cast.

### CAT-6: Return type annotations

All exported `GET`, `POST`, `PUT`, `DELETE`, and `PATCH` handlers that lack an explicit return type
annotation receive `Promise<Response>`. No implementation changes are made.

```typescript
// Before
export const GET: APIRoute = async ({ request, locals }) => {

// After
export const GET: APIRoute = async ({ request, locals }): Promise<Response> => {
```

Note: `APIRoute` is already typed as `(context: APIContext) => Response | Promise<Response>`, so
adding `Promise<Response>` is always valid and never requires changing the implementation.

### CAT-7: Miscellaneous

CAT-7 errors are resolved case-by-case. Each fix includes an inline comment. Common patterns
expected:

- Implicit `any` on array `.map()` callbacks where the array type is inferred as `any[]` — fixed by
  typing the array or the callback parameter.
- Missing type arguments on generic utility calls.
- `params` destructuring where the param type is `string | undefined` but used as `string` — fixed
  with a non-null assertion or explicit check.

No `@ts-ignore` or `@ts-nocheck` suppressions are permitted. `@ts-expect-error` is a last resort
requiring documented justification.

---

## Data Models

No new data models are introduced. The existing `Env` interface in `src/env.d.ts` is the canonical
type for all Cloudflare bindings. Row interfaces and body interfaces are lightweight structural types
with no persistence concern.

Representative row interfaces (illustrative, not exhaustive):

```typescript
// Used in children.ts / milestones.ts
interface IdRow { id: string }

// Used in children.ts getParentId
interface ParentRow { id: string }

// Used in chat.ts conversation loading
interface ConversationRow { messages_json: string }

// Used in growth.ts
interface GrowthRow {
  id: string
  child_id: string
  date: string
  height_cm: number | null
  weight_kg: number | null
  head_circ_cm: number | null
  bmi: number | null
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a
system — essentially, a formal statement about what the system should do. Properties serve as the
bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: `getEnv` returns a structurally valid Env object

*For any* `App.Locals` object whose `runtime.env` contains the standard Cloudflare bindings, calling
`getEnv(locals)` should return an object where every binding key present in `locals.runtime.env` is
also present in the returned value, and the returned value is reference-equal to
`locals.runtime.env`.

**Validates: Requirements 3.1, 3.3**

### Property 2: `getEnv` handles absent runtime gracefully

*For any* `App.Locals` object where `runtime` is `undefined` or `null`, calling `getEnv(locals)`
should return an empty object without throwing, and the return value should satisfy the `Env` type
structurally (i.e. no runtime exception is raised).

**Validates: Requirements 3.4**

### Property 3: Zero TypeScript errors after all fixes

Running `tsc --noEmit` against the project with the existing `tsconfig.json` (no options relaxed)
should exit with code 0 and produce no diagnostic output.

**Validates: Requirements 3.2, 4.2, 5.2, 6.4, 7.2, 8.3, 10.1, 10.4**

### Property 4: Full test suite passes after all fixes

Running `vitest --run` against all test files should exit with code 0 and report zero failing tests,
covering analytics, community, content, distribution, engagement, notifications, and social modules.

**Validates: Requirements 11.1**

### Property 5: No runtime behaviour change

*For any* API route handler, the HTTP response (status code, body shape, headers) produced for a
given request should be identical before and after the type fixes are applied. Type annotations are
purely additive and must not alter any conditional branch, data transformation, or response
construction.

**Validates: Requirements 12.1, 6.5**

---

## Error Handling

This feature does not introduce new error handling logic. The CAT-4 fix changes the *declared type*
of caught exceptions from `any` to `unknown`, which requires adding `instanceof Error` guards where
`Error` properties are accessed. The observable behaviour of every catch block remains identical:

- Blocks that check `err.message` continue to check `e.message` after narrowing.
- Blocks that only log or re-throw continue to do so without narrowing.
- The fallback responses returned from catch blocks are unchanged.

The `getEnv` helper's fallback (`?? ({} as Env)`) preserves the existing `|| {}` fallback semantics
present at every call site today. If `env.DB` is accessed on the fallback empty object, it will be
`undefined` at runtime — exactly as it is today — and the existing `no such table` error handling
will continue to fire.

---

## Testing Strategy

This feature is a type-only cleanup. The primary correctness signal is the TypeScript compiler itself.
The testing strategy is therefore minimal and focused on regression prevention.

### Unit tests

No new unit tests are written for this feature. The existing test suite (Vitest) serves as the
regression guard. Tests must not be modified.

The one new testable unit is the `getEnv` helper, which is simple enough to warrant two focused
example tests:

```typescript
// src/lib/runtime/env.test.ts
import { describe, it, expect } from 'vitest'
import { getEnv } from './env'

describe('getEnv', () => {
  it('returns runtime.env when present', () => {
    const fakeEnv = { DB: {}, KV: {} } as unknown as Env
    const locals = { runtime: { env: fakeEnv } } as unknown as App.Locals
    expect(getEnv(locals)).toBe(fakeEnv)
  })

  it('returns empty object when runtime is absent', () => {
    const locals = {} as App.Locals
    expect(() => getEnv(locals)).not.toThrow()
    expect(getEnv(locals)).toEqual({})
  })
})
```

### Property-based tests

Property-based testing is not the primary tool for a type cleanup. The "properties" of this feature
are best expressed as compiler invariants (tsc exits 0) and regression invariants (vitest passes),
both of which are verified by running the existing toolchain rather than by generating random inputs.

If property-based tests are added in future for the `getEnv` helper, the recommended library is
**fast-check** (already compatible with Vitest). Each test should run a minimum of 100 iterations.

Tag format for any future property tests:
`// Feature: typescript-cleanup, Property {N}: {property_text}`

Example skeleton:

```typescript
import fc from 'fast-check'

// Feature: typescript-cleanup, Property 1: getEnv returns reference-equal env for any valid locals
it('getEnv returns reference-equal env for any locals with runtime.env', () => {
  fc.assert(
    fc.property(fc.record({ DB: fc.constant({}), KV: fc.constant({}) }), (fakeEnv) => {
      const locals = { runtime: { env: fakeEnv } } as unknown as App.Locals
      return getEnv(locals) === fakeEnv
    }),
    { numRuns: 100 }
  )
})
```

### Verification checklist

The feature is complete when all of the following pass:

1. `tsc --noEmit` exits 0 with no output (Property 3)
2. `vitest --run` exits 0 with zero failing tests (Property 4)
3. No `@ts-ignore` or `@ts-nocheck` suppressions exist in any modified file
4. No new npm dependencies appear in `package.json`
