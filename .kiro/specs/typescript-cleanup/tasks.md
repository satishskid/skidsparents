# Implementation Plan: TypeScript Cleanup

## Overview

Eliminate all 88 TypeScript errors across API routes, admin components, and shared libraries by applying seven categories of type-only fixes. No runtime behaviour changes. Fixes are applied in dependency order: shared infrastructure first, then per-category sweeps, then verification.

## Tasks

- [x] 1. Audit: run tsc --noEmit and capture the full error list
  - Run `tsc --noEmit` and save the complete diagnostic output
  - Classify every error into CAT-1 through CAT-7 per Requirement 2.1
  - Record file path, line number, error code, and category for each error
  - Confirm total count matches 88 before proceeding
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3_

- [x] 2. Create `src/lib/runtime/env.ts` with the `getEnv` helper
  - [x] 2.1 Implement `getEnv(locals: App.Locals): Env` in `src/lib/runtime/env.ts`
    - Return `locals.runtime?.env` when present, fall back to `{} as Env`
    - Use `import type { App } from 'astro'` — no runtime import
    - _Requirements: 3.1, 3.3, 3.4, 12.4_

  - [ ]* 2.2 Write unit tests for `getEnv` in `src/lib/runtime/env.test.ts`
    - Test returns reference-equal env when `runtime.env` is present
    - Test does not throw and returns `{}` when `runtime` is absent
    - _Requirements: 3.1, 3.4_

  - [ ]* 2.3 Write property test for `getEnv` — Property 1: reference equality
    - **Property 1: `getEnv` returns a structurally valid Env object**
    - **Validates: Requirements 3.1, 3.3**
    - Use `fast-check` with `fc.record` to generate arbitrary env objects
    - Assert `getEnv(locals) === locals.runtime.env` for all valid inputs
    - Tag: `// Feature: typescript-cleanup, Property 1`

  - [ ]* 2.4 Write property test for `getEnv` — Property 2: absent runtime
    - **Property 2: `getEnv` handles absent runtime gracefully**
    - **Validates: Requirements 3.4**
    - Use `fast-check` to generate locals objects without `runtime`
    - Assert no exception is thrown and result equals `{}`
    - Tag: `// Feature: typescript-cleanup, Property 2`

- [x] 3. Apply CAT-1 fixes: replace `(locals as any).runtime?.env` with `getEnv(locals)`
  - Import `getEnv` from `@/lib/runtime/env` in each affected API route
  - Replace every `(locals as any).runtime?.env || {}` call site with `getEnv(locals)`
  - Update `getParentId` and `verifyChildOwnership` signatures in `src/pages/api/children.ts` from `env: any` to `env: Env`
  - Use `import type` for any type-only imports added
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 12.4, 12.5_

- [x] 4. Apply CAT-2 fixes: add inline row interfaces for D1 query results
  - For each affected file, define a row interface immediately above the handler that uses it
  - Field names must match SQL column names (snake_case)
  - Pass the interface as a generic type parameter to `.first<RowType>()` / `.all<RowType>()`
  - Ensure all `.first<T>()` call sites handle the `T | null` case explicitly
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Apply CAT-3 fixes: add inline body interfaces for `request.json()` calls
  - For each affected API route, define a body interface inline above the handler
  - Cast the result of `request.json()` as the interface: `await request.json() as BodyType`
  - Mark optional fields with `?` rather than `Type | undefined`
  - Do not add Zod or any runtime validation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Checkpoint — run vitest --run to catch early regressions
  - Ensure all existing tests pass before continuing
  - _Requirements: 11.1, 11.5_

- [x] 7. Apply CAT-4 fixes: replace `catch (e: any)` with `catch (e: unknown)` + instanceof guards
  - Replace all `catch (e: any)` and `catch (err: any)` with `catch (e: unknown)`
  - Where `e.message` or other `Error` properties are accessed, add `e instanceof Error` guard before access
  - Where `e` is only logged or re-thrown, no guard is needed
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8. Apply CAT-5 fix: add `Window.__ADMIN_KEY` declaration to `src/env.d.ts`
  - Append a `declare global { interface Window { __ADMIN_KEY?: string } }` block to `src/env.d.ts`
  - Remove `(window as any)` casts in `AuditLogViewer.tsx`, `OrderManager.tsx`, `ProviderManager.tsx`, `RevenueDashboard.tsx`
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9. Apply CAT-6 fixes: add `Promise<Response>` return types to all API route handlers
  - Add `: Promise<Response>` annotation to every exported `GET`, `POST`, `PUT`, `DELETE`, `PATCH` handler that lacks one
  - No implementation changes — annotation only
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10. Apply CAT-7 fixes: resolve remaining miscellaneous errors
  - Resolve each CAT-7 error individually with the minimum change required
  - Add a brief inline comment on each fix explaining the choice
  - Do not use `@ts-ignore` or `@ts-nocheck`; use `@ts-expect-error` only as a last resort with documented justification
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 11. Final verification — run tsc --noEmit to confirm zero errors
  - Run `tsc --noEmit` against the existing `tsconfig.json` with no options relaxed
  - Confirm exit code 0 and no diagnostic output
  - If new errors were introduced by fixes, resolve them before marking complete
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 12. Final verification — run vitest --run to confirm no regressions
  - Run `vitest --run` and confirm zero failing tests
  - Do not modify any test file — only source files under fix
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster pass
- All fixes are type-only — no runtime logic, no new npm dependencies, no file renames
- `import type` must be used for all type-only imports (Requirement 12.4)
- Property tests use `fast-check` (already Vitest-compatible); minimum 100 iterations per property
- CAT order matches dependency: shared helper (2) → consumers (3) → independent categories (4–10)
