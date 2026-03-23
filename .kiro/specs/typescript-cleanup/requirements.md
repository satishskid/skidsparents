# Requirements Document

## Introduction

The SKIDS Parent codebase currently produces 88 TypeScript errors when `tsc --noEmit` is run against the full project. These errors exist in pre-existing files across API routes, admin components, PHR components, and shared libraries. They are not in the recently built onboarding wizard files.

The errors fall into seven recurring categories, all rooted in the same root cause: the Cloudflare Workers + Astro SSR runtime environment was not fully typed when these files were written, leading to widespread use of `as any` casts and implicit `any` types as workarounds.

This feature resolves all 88 errors before public launch. No new functionality is added. Runtime behaviour must not change.

---

## Glossary

- **TypeScript_Compiler**: The `tsc` CLI tool invoked as `tsc --noEmit`, which type-checks the project without emitting output files.
- **API_Route**: A TypeScript file under `src/pages/api/**/*.ts` that exports Astro `APIRoute` handlers (`GET`, `POST`, etc.).
- **Locals_Runtime**: The `locals.runtime.env` object provided by the `@astrojs/cloudflare` adapter, which exposes Cloudflare bindings (`DB`, `KV`, `R2`, `AI`) to API routes.
- **D1_Result**: A row object returned by a Cloudflare D1 `prepare().first()` or `prepare().all()` query, whose shape is `unknown` by default.
- **Request_Body**: The parsed JSON object obtained from `request.json()` in an API route handler.
- **Catch_Block**: A `catch (e)` clause in a try/catch statement.
- **Admin_Component**: A React component under `src/components/admin/` that accesses `window.__ADMIN_KEY` for bearer auth.
- **Error_Category**: One of the seven classified groups of TypeScript errors identified during the audit phase.
- **Test_Suite**: The Vitest test suite run via `vitest --run`, covering analytics, community, content, distribution, engagement, notifications, and social modules.
- **Zero_Error_State**: The condition where `tsc --noEmit` exits with code 0 and produces no diagnostic output.

---

## Requirements

### Requirement 1: Error Audit

**User Story:** As a developer, I want a complete categorised inventory of all 88 TypeScript errors, so that I can plan and track fixes systematically without missing any file.

#### Acceptance Criteria

1. THE TypeScript_Compiler SHALL be run against the full project before any fixes are applied, and the complete output SHALL be captured.
2. WHEN the audit output is captured, THE developer SHALL classify every error into one of the seven Error_Category types defined in Requirement 2.
3. THE audit SHALL record the file path, line number, error code, and assigned Error_Category for each of the 88 errors.
4. WHEN the audit is complete, THE developer SHALL confirm the total error count matches 88 before proceeding to fixes.

---

### Requirement 2: Error Category Classification

**User Story:** As a developer, I want errors grouped by root cause, so that I can apply consistent fixes across all instances of each pattern rather than fixing files one by one.

#### Acceptance Criteria

1. THE developer SHALL classify errors into exactly these seven Error_Category types:
   - **CAT-1**: Untyped `locals.runtime.env` access — `(locals as any).runtime?.env` in API routes
   - **CAT-2**: Untyped D1 query result property access — `(row as any).id`, `(existing as any).status`, etc.
   - **CAT-3**: Untyped request body casts — `body.platform as any`, `body.contentType as any`
   - **CAT-4**: Implicit `any` in catch blocks — `catch (e: any)` or `catch (err: any)`
   - **CAT-5**: Untyped `window` access in admin components — `(window as any).__ADMIN_KEY`
   - **CAT-6**: Missing or implicit return type annotations on exported API route handlers
   - **CAT-7**: Miscellaneous — any error not fitting CAT-1 through CAT-6
2. WHEN an error fits more than one category, THE developer SHALL assign it to the lowest-numbered matching category.
3. THE audit document SHALL include a count of errors per category.

---

### Requirement 3: Fix CAT-1 — Locals Runtime Typing

**User Story:** As a developer, I want `locals.runtime.env` to be accessed through a properly typed helper, so that all Cloudflare bindings (`DB`, `KV`, `R2`, `AI`) are type-safe throughout every API route.

#### Acceptance Criteria

1. THE developer SHALL create or extend a shared typed accessor for `locals.runtime.env` that returns the `Env` interface already defined in `src/env.d.ts`.
2. WHEN the typed accessor is applied, THE TypeScript_Compiler SHALL not produce any CAT-1 errors in any API_Route file.
3. THE fix SHALL not alter the runtime value of `env` — only its declared type.
4. IF `locals.runtime` is `undefined` at runtime, THEN THE accessor SHALL return a safe fallback (empty object or throw), preserving existing error-handling behaviour.
5. THE fix SHALL be applied consistently to all API_Route files that currently use `(locals as any).runtime?.env`.

---

### Requirement 4: Fix CAT-2 — D1 Query Result Typing

**User Story:** As a developer, I want D1 query results to have typed row shapes, so that property access on database results is type-safe and self-documenting.

#### Acceptance Criteria

1. FOR EACH distinct query result shape that is currently accessed via `as any`, THE developer SHALL define a TypeScript interface or type alias representing that row shape.
2. WHEN a typed interface is applied to a D1_Result, THE TypeScript_Compiler SHALL not produce any CAT-2 errors for property access on that result.
3. THE row interface field names SHALL match the SQL column names returned by the query (snake_case).
4. THE fix SHALL not add runtime validation — only compile-time type assertions via `as RowType` or generic type parameters where the D1 API supports them.
5. WHEN a query returns `null` (`.first()` on no match), THE typed result SHALL be `RowType | null`, and all call sites SHALL handle the null case explicitly.

---

### Requirement 5: Fix CAT-3 — Request Body Typing

**User Story:** As a developer, I want request body objects to have declared types, so that property access on parsed JSON is type-safe and invalid field names are caught at compile time.

#### Acceptance Criteria

1. FOR EACH API_Route that calls `request.json()` and then accesses properties via `as any`, THE developer SHALL define a TypeScript interface for the expected body shape.
2. WHEN the typed interface is applied, THE TypeScript_Compiler SHALL not produce any CAT-3 errors in that route.
3. THE body interface SHALL be defined inline in the route file or in a co-located types file — not in `schema.ts`.
4. THE fix SHALL not add runtime schema validation (no Zod) unless a route already uses it — only compile-time typing.
5. WHERE a body field is optional, THE interface SHALL declare it as optional (`field?: Type`) rather than `field: Type | undefined`.

---

### Requirement 6: Fix CAT-4 — Catch Block Typing

**User Story:** As a developer, I want catch block variables to use `unknown` instead of `any`, so that error handling is type-safe and consistent with TypeScript strict mode.

#### Acceptance Criteria

1. THE developer SHALL replace all `catch (e: any)` and `catch (err: any)` patterns with `catch (e: unknown)`.
2. WHEN `e` is used as an `Error` (e.g. `e.message`), THE developer SHALL add a type narrowing guard (`e instanceof Error`) before accessing `Error` properties.
3. WHEN `e` is only re-thrown or ignored, THE narrowing guard is not required.
4. THE TypeScript_Compiler SHALL not produce any CAT-4 errors after fixes are applied.
5. THE fix SHALL not change the runtime behaviour of any error handler — only the declared type of the caught variable.

---

### Requirement 7: Fix CAT-5 — Window Typing in Admin Components

**User Story:** As a developer, I want `window.__ADMIN_KEY` access to be type-safe, so that admin components do not rely on untyped global augmentation.

#### Acceptance Criteria

1. THE developer SHALL declare a typed extension of the global `Window` interface that includes `__ADMIN_KEY?: string`.
2. THE declaration SHALL be placed in `src/env.d.ts` or a dedicated `src/types/global.d.ts` file.
3. WHEN the declaration is in place, THE TypeScript_Compiler SHALL not produce any CAT-5 errors in admin component files.
4. THE fix SHALL not change the runtime mechanism by which `__ADMIN_KEY` is injected into `window` — only its declared type.

---

### Requirement 8: Fix CAT-6 — Missing Return Type Annotations

**User Story:** As a developer, I want all exported API route handlers to have explicit return type annotations, so that TypeScript can verify handler signatures are correct.

#### Acceptance Criteria

1. THE developer SHALL add explicit return type annotations to all exported `GET`, `POST`, `PUT`, `DELETE`, and `PATCH` handlers that currently lack them.
2. THE return type SHALL be `Promise<Response>` or `Response` as appropriate to the handler's implementation.
3. WHEN the annotation is added, THE TypeScript_Compiler SHALL not produce any CAT-6 errors for that handler.
4. THE fix SHALL not require changing the handler's implementation — only adding the annotation.

---

### Requirement 9: Fix CAT-7 — Miscellaneous Errors

**User Story:** As a developer, I want all remaining TypeScript errors that don't fit the standard categories to be resolved, so that the full error count reaches zero.

#### Acceptance Criteria

1. THE developer SHALL resolve each CAT-7 error individually, using the minimum change required to satisfy the TypeScript_Compiler.
2. FOR EACH CAT-7 fix, THE developer SHALL add a brief inline comment explaining why the fix was chosen.
3. THE fix SHALL not use `@ts-ignore` or `@ts-nocheck` suppressions — errors must be genuinely resolved.
4. IF a CAT-7 error cannot be resolved without a `@ts-expect-error` suppression, THEN THE developer SHALL document the reason in the audit record and seek a second opinion before applying the suppression.

---

### Requirement 10: Zero Error State Verification

**User Story:** As a developer, I want `tsc --noEmit` to exit cleanly with zero errors, so that the codebase is verifiably type-safe before public launch.

#### Acceptance Criteria

1. WHEN all fixes from Requirements 3–9 have been applied, THE TypeScript_Compiler SHALL exit with code 0 and produce no diagnostic output.
2. THE verification SHALL be run against the same `tsconfig.json` that produced the original 88 errors — no compiler options shall be relaxed.
3. IF THE TypeScript_Compiler produces any new errors introduced by the fixes themselves, THEN THE developer SHALL resolve those errors before considering the requirement met.
4. THE Zero_Error_State SHALL be confirmed by a clean `tsc --noEmit` run with no flags other than those already in `tsconfig.json`.

---

### Requirement 11: Test Suite Regression Guard

**User Story:** As a developer, I want all existing tests to continue passing after type fixes, so that I can be confident no runtime behaviour was accidentally changed.

#### Acceptance Criteria

1. WHEN all fixes have been applied, THE Test_Suite SHALL be run via `vitest --run` and SHALL produce zero failing tests.
2. THE test run SHALL cover all test files currently in the project, including analytics, community, content, distribution, engagement, notifications, and social modules.
3. IF a test fails after a type fix, THEN THE developer SHALL revert the fix and find an alternative approach that does not break the test.
4. THE developer SHALL not modify any test file to make tests pass — only the source files under fix.
5. WHILE fixes are being applied incrementally, THE Test_Suite SHOULD be run after each Error_Category batch to catch regressions early.

---

### Requirement 12: No Runtime Behaviour Changes

**User Story:** As a developer, I want type fixes to be purely additive to the type system, so that the application behaves identically before and after the cleanup.

#### Acceptance Criteria

1. THE developer SHALL not change any runtime logic, conditional branches, data transformations, or API response shapes as part of this feature.
2. IF a type fix requires changing a runtime value (e.g. replacing `as any` with a cast that changes the actual value), THEN THE developer SHALL flag this as out of scope and raise it as a separate issue.
3. THE developer SHALL not add new runtime dependencies (npm packages) as part of this feature.
4. WHERE a fix requires adding a type-only import (`import type`), THE developer SHALL use `import type` to ensure zero runtime impact.
5. THE developer SHALL not refactor, rename, or restructure any file as part of this feature — only add or modify type annotations within existing files.
