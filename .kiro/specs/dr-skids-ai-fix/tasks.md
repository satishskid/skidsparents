# Implementation Plan: Dr. SKIDS AI Fix

## Overview

Surgical fixes across four source files and two layout files: upgrade the Workers AI model, switch rate limiting to per-day quotas, surface quota status in the UI, improve error messages, and replace the "S" placeholder with the SKIDS logo.

## Tasks

- [x] 1. Upgrade Workers AI model in providers.ts
  - In `src/lib/ai/providers.ts`, update `runWorkersAI` to try `@cf/meta/llama-4-scout-17b-16e-instruct` first, falling back to `@cf/meta/llama-3.1-8b-instruct` on failure
  - If both models throw, let the error propagate to the caller
  - Update the returned `model` field to reflect whichever model succeeded
  - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 1.1 Write property test for Llama-4-Scout first-call guarantee
    - **Property 1: Llama-4-Scout is always tried first**
    - **Validates: Requirements 1.1**

  - [ ]* 1.2 Write property test for fallback on primary failure
    - **Property 2: Fallback to Llama-3.1-8b on primary failure**
    - **Validates: Requirements 1.2**

- [x] 2. Switch rate limiting to per-day quotas in router.ts
  - In `src/lib/ai/router.ts`, update `RATE_LIMITS` to `{ free: 20, premium: 100 }`
  - Update `checkRateLimit` to use KV key format `chat_daily:{tier}:{parentId}` with TTL `86400`
  - Keep the return shape `{ allowed: boolean; remaining: number }` unchanged
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.1 Write property test for KV key format
    - **Property 5: KV key format is correct**
    - **Validates: Requirements 2.3**

  - [ ]* 2.2 Write property test for daily quota enforcement
    - **Property 4: Daily quota is enforced per tier**
    - **Validates: Requirements 2.1, 2.2, 2.5**

  - [ ]* 2.3 Write property test for remaining count decrement
    - **Property 6: Remaining count decrements correctly**
    - **Validates: Requirements 2.4**

- [ ] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update chat.ts — error messages and response shape
  - In `src/pages/api/chat.ts`, update the 429 response body:
    - Free user: `"You've used all 20 of your free questions today. Your quota resets at midnight IST."` + `upgradeAvailable: true`
    - Premium user: `"You've used all 100 of your premium questions today. Your quota resets at midnight IST."`
  - Add `dailyLimit` (numeric) to the 200 response JSON body
  - Update the "No AI runtime available" catch branch to return the specific unavailability message (Req 6.1)
  - Keep `X-RateLimit-Remaining` header on 200 responses
  - _Requirements: 3.5, 4.1, 4.2, 4.3, 6.1, 6.2_

  - [ ]* 4.1 Write property test for 200 response shape
    - **Property 3: Successful response always includes model and dailyLimit fields**
    - **Validates: Requirements 1.4, 3.5**

  - [ ]* 4.2 Write property test for X-RateLimit-Remaining header
    - **Property 7: Successful response always includes X-RateLimit-Remaining header**
    - **Validates: Requirements 3.1**

- [x] 5. Update ChatWidget.tsx — quota display and error handling
  - Add `remaining: number | null` and `dailyLimit: number | null` state
  - After each successful response, read `X-RateLimit-Remaining` header and `dailyLimit` from JSON body; update state
  - Render quota display below the input: `"{N} of {M} questions remaining today"` — gray when N > 5, amber when N ≤ 5, hidden when `remaining` is null
  - Update the 429 handler to use `data.error` verbatim; append upgrade prompt only when `upgradeAvailable: true`
  - Update the fetch-level catch block to show: `"Connection problem — please check your internet and try again."`
  - _Requirements: 3.2, 3.3, 3.4, 4.4, 4.5, 6.3, 6.4_

  - [ ]* 5.1 Write property test for quota display string format
    - **Property 8: Quota display text format**
    - **Validates: Requirements 3.2**

  - [ ]* 5.2 Write property test for quota display styling threshold
    - **Property 9: Quota display styling by threshold**
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 5.3 Write property test for verbatim response rendering
    - **Property 10: ChatWidget displays server response text verbatim**
    - **Validates: Requirements 6.3**

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Replace "S" placeholder with SKIDS logo
  - In `src/components/chat/ChatWidget.tsx`, replace all green "S" circle bot avatars with `<SkidsLogo>` inline component that renders `<img src="/skids-logo.png" alt="SKIDS">` with `onError` fallback to the green circle; sizes: full-screen avatar 28×28, floating header 32×32
  - In `src/pages/timeline.astro`, replace the green circle "S" in the header with the inline `<img>` + hidden fallback `<div>` pattern at 40×40
  - In `src/components/common/Navbar.astro`, replace the green rounded square "S" with the inline `<img>` + hidden fallback `<div>` pattern at 32×32
  - All logo `<img>` elements must have `alt="SKIDS"`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 7.1 Write property test for alt attribute on all logo images
    - **Property 11: All SKIDS logo images have alt="SKIDS"**
    - **Validates: Requirements 7.6**

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` — install with `npm install --save-dev fast-check` if not already present
- Each property test must include the tag comment: `// Feature: dr-skids-ai-fix, Property {N}: {property_text}`
- The floating widget "S" button (open/close toggle) is intentionally not replaced — it is a UI control, not a logo
