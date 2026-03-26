# Requirements Document

## Introduction

Dr. SKIDS is an AI-powered child health companion embedded in the SKIDS Parent platform's Timeline page. The current implementation fails with a generic "I'm having trouble connecting right now" error because the Cloudflare Workers AI binding (`env.AI`) is not configured in the Cloudflare Pages project. This feature upgrades the AI model, switches rate limiting from per-minute to per-day with user-visible quota feedback, improves error messaging, and replaces the placeholder "S" logo with the SKIDS brand illustration in the Timeline header and Navbar.

## Glossary

- **Chat_API**: The Astro API route at `src/pages/api/chat.ts` that handles POST requests to `/api/chat`
- **AI_Router**: The module at `src/lib/ai/router.ts` that selects the AI model and enforces rate limits
- **AI_Provider**: The module at `src/lib/ai/providers.ts` that calls individual AI model APIs
- **ChatWidget**: The React component at `src/components/chat/ChatWidget.tsx` that renders the chat UI
- **KV**: Cloudflare Workers KV namespace bound as `env.KV`, used for rate limit counters
- **Workers_AI**: Cloudflare's AI inference runtime bound as `env.AI` in the Cloudflare Pages project
- **Free_User**: An authenticated parent without an active premium subscription
- **Premium_User**: An authenticated parent with an active premium subscription
- **Daily_Quota**: The maximum number of chat questions a user may ask within a calendar day (midnight-to-midnight IST)
- **IST**: Indian Standard Time, UTC+5:30, the timezone used for daily quota resets
- **Llama_4_Scout**: The model identifier `@cf/meta/llama-4-scout-17b-16e-instruct` on Cloudflare Workers AI
- **Llama_3_1_8b**: The model identifier `@cf/meta/llama-3.1-8b-instruct` on Cloudflare Workers AI, used as fallback
- **SKIDS_Logo**: The colorful kids illustration asset used as the SKIDS brand mark

---

## Requirements

### Requirement 1: Upgrade AI Model with Fallback

**User Story:** As a parent, I want Dr. SKIDS to use the best available AI model, so that I receive higher-quality, more accurate child health guidance.

#### Acceptance Criteria

1. WHEN the Chat_API routes a request to Workers_AI, THE AI_Provider SHALL attempt to run the Llama_4_Scout model first.
2. IF the Llama_4_Scout model call fails, THEN THE AI_Provider SHALL fall back to the Llama_3_1_8b model.
3. IF both Llama_4_Scout and Llama_3_1_8b model calls fail, THEN THE AI_Provider SHALL throw an error so the Chat_API can return a helpful error response.
4. THE Chat_API SHALL include the model name used in the JSON response field `model` so the client can observe which model served the request.

---

### Requirement 2: Per-Day Rate Limiting

**User Story:** As a platform operator, I want daily question quotas instead of per-minute limits, so that usage is distributed fairly across the day and users are not blocked mid-conversation by burst limits.

#### Acceptance Criteria

1. THE AI_Router SHALL enforce a Daily_Quota of 20 questions per calendar day for Free_Users.
2. THE AI_Router SHALL enforce a Daily_Quota of 100 questions per calendar day for Premium_Users.
3. WHEN the AI_Router checks the rate limit, THE AI_Router SHALL use a KV key of the format `chat_daily:{tier}:{parentId}` with a TTL of 86400 seconds (24 hours).
4. WHEN a user sends a message and the Daily_Quota has not been reached, THE AI_Router SHALL increment the KV counter and return the number of questions remaining today.
5. WHEN a user sends a message and the Daily_Quota has been reached, THE AI_Router SHALL return `allowed: false` with `remaining: 0`.
6. IF the KV store is unavailable, THEN THE AI_Router SHALL allow the request through and return `remaining: 999` to avoid blocking users due to infrastructure failures.

---

### Requirement 3: Remaining Questions Display

**User Story:** As a parent, I want to see how many questions I have left today, so that I can plan my usage and am not surprised when I hit the limit.

#### Acceptance Criteria

1. WHEN the Chat_API returns a successful AI response, THE Chat_API SHALL include the remaining question count in the HTTP response header `X-RateLimit-Remaining`.
2. WHEN the ChatWidget receives a successful response, THE ChatWidget SHALL display the remaining count in the format "N of M questions remaining today" below the chat input, where N is the remaining count and M is the Daily_Quota for the user's tier.
3. WHEN the remaining count is greater than 5, THE ChatWidget SHALL display the remaining count in a neutral style (gray text).
4. WHEN the remaining count is 5 or fewer, THE ChatWidget SHALL display the remaining count in a warning style (amber text) to alert the user.
5. THE Chat_API SHALL include the user's tier Daily_Quota in the JSON response field `dailyLimit` so the ChatWidget can display the correct denominator.

---

### Requirement 4: Daily Limit Reached Message

**User Story:** As a parent who has used all their daily questions, I want a clear, friendly explanation of the limit and when it resets, so that I understand what happened and know when to return.

#### Acceptance Criteria

1. WHEN the Daily_Quota is reached and the user is a Free_User, THE Chat_API SHALL return HTTP 429 with a JSON body containing a `error` field explaining the 20-question daily limit and stating that the quota resets at midnight IST.
2. WHEN the Daily_Quota is reached and the user is a Premium_User, THE Chat_API SHALL return HTTP 429 with a JSON body containing a `error` field explaining the 100-question daily limit and stating that the quota resets at midnight IST.
3. WHEN the Daily_Quota is reached and the user is a Free_User, THE Chat_API SHALL include `upgradeAvailable: true` in the 429 response body.
4. WHEN the ChatWidget receives a 429 response with `upgradeAvailable: true`, THE ChatWidget SHALL display the error message followed by a prompt to upgrade to SKIDS Premium.
5. WHEN the ChatWidget receives a 429 response without `upgradeAvailable`, THE ChatWidget SHALL display only the error message without an upgrade prompt.

---

### Requirement 5: AI Binding Deployment Documentation

**User Story:** As a developer deploying the platform, I want clear instructions for configuring the Workers AI binding in Cloudflare Pages, so that the AI chat works correctly in production without code changes.

#### Acceptance Criteria

1. THE platform documentation SHALL include a deployment step specifying that the `AI` binding must be added in the Cloudflare Pages project settings under "Functions > Bindings > AI Bindings" with the variable name `AI`.
2. THE platform documentation SHALL state that the AI binding is a Cloudflare-managed binding and requires no API key or secret value.
3. THE platform documentation SHALL note that without the `AI` binding, the Chat_API will throw "No AI runtime available" and the ChatWidget will display the AI unavailable error message.

---

### Requirement 6: Improved AI Unavailable Error Message

**User Story:** As a parent who encounters an AI connectivity error, I want a helpful, specific error message, so that I understand the issue and know what to do next.

#### Acceptance Criteria

1. WHEN the AI_Router throws "No AI runtime available", THE Chat_API SHALL return a response with a `response` field containing a message that explains the AI service is temporarily unavailable and suggests the user try again shortly or contact support.
2. WHEN all AI model calls fail due to runtime errors, THE Chat_API SHALL return a response with a `response` field that is distinct from the generic network error message shown for fetch failures.
3. THE ChatWidget SHALL display the `response` field text from the Chat_API error response verbatim, without appending additional generic error text.
4. WHEN a fetch-level network error occurs (no response from server), THE ChatWidget SHALL display a message indicating a connection problem and suggesting the user check their internet connection and try again.

---

### Requirement 7: SKIDS Logo in Timeline Header and Navbar

**User Story:** As a parent using the platform, I want to see the SKIDS brand illustration instead of a plain "S" placeholder, so that the interface feels polished and on-brand.

#### Acceptance Criteria

1. THE Timeline page header SHALL replace the green circle containing "S" with the SKIDS_Logo image rendered at 40×40 pixels with `object-fit: contain`.
2. THE Navbar SHALL replace the green rounded square containing "S" with the SKIDS_Logo image rendered at 32×32 pixels with `object-fit: contain`.
3. THE ChatWidget full-screen mode SHALL replace the green circle containing "S" (bot avatar) with the SKIDS_Logo image rendered at 28×28 pixels with `object-fit: contain`.
4. THE ChatWidget floating widget header SHALL replace the green circle containing "S" with the SKIDS_Logo image rendered at 32×32 pixels with `object-fit: contain`.
5. WHERE the SKIDS_Logo image file is not found at the expected path, THE system SHALL fall back to displaying the green circle with "S" so the UI does not break.
6. THE SKIDS_Logo image SHALL include a descriptive `alt` attribute of "SKIDS" on all instances for accessibility.
