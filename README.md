# SKIDS Parent Portal

**Smart Kids. Incredible Development System.**

The parent-facing web application for SKIDS — the Pediatric Life Record Platform where parent + pediatrician co-nurture a child's health from birth to 18.

**Live:** https://thrive-care.pages.dev (planned: parent.skids.clinic)

---

## Architecture

- **Framework:** Astro 5.7 (SSR + static hybrid)
- **Runtime:** Cloudflare Pages + Workers
- **Database:** Cloudflare D1 (SQLite)
- **Auth:** Firebase (Google + Phone OTP)
- **AI:** Cloudflare Workers AI (Llama) + Gemini/Claude (premium, gated)
- **Styling:** Tailwind CSS 4
- **Fonts:** DM Serif Display + Inter + Plus Jakarta Sans

## Key Pages

| Route | Page | Prerender |
|-------|------|-----------|
| `/` | Homepage — brand narrative (Learn, Grow, Practice, P²) | SSR |
| `/blog` | Learn — health articles from API | SSR |
| `/discover` | Grow — 16 body systems + developmental domains | Static |
| `/habits` | Practice — H.A.B.I.T.S. framework + workshops | Static |
| `/habits/[habit]` | Habit detail — science, age guidance, workshops, download | Static |
| `/skids` | SKIDS system page — P² equation, brand story | Static |
| `/timeline` | My Child — health timeline + SKIDS Guide chat | SSR |
| `/pilot/companion` | SKIDS Companion pilot — Bayesian engine testing | SSR |

## Three Features (Clearly Separated)

### 1. SKIDS Guide (Knowledge Companion)
- Floating chat widget on every page (superman mascot icon)
- Answers parent questions using milestones, habits, organs, blog content + LLM
- NOT a doctor — knowledge guide only with clear info panel
- Rate limited: 5/hr public, 20/day free, 100/day premium
- **Status: Ready for release**

### 2. SKIDS Companion (Core Intelligence Engine)
- Bayesian projection engine: 150+ conditions, 12 modifier sources
- Knowledge graph with evidence citations (5,924 lines)
- Projects probable conditions from parent observations
- Gated behind `ENABLE_SKIDS_COMPANION` env flag (default: off)
- Pilot testing URL: `/pilot/companion`
- **Status: Pilot testing only**

### 3. Passive Observation Logging
- Silently extracts health observations from chat messages
- Saves structured data to life record (parent never sees this)
- Pattern matching + domain detection, no projections unless Companion is enabled
- **Status: Always on**

## Workshop Programs

Six interactive HTML apps in `/public/workshops/`:

| Workshop | Framework | Audience |
|----------|-----------|----------|
| Healthy Habits | H.A.B.I.T.S. | Parents & Kids |
| DigiParenting | A.B.C.D.E. | Parents |
| Fueling Potential | F.R.E.S.H. | Parents |
| Screen Smart | S.M.A.R.T. | Parents |
| Life Lab | 4 Modules | Students (6-12) |
| Innovation Engine | F.I.R.E. | Students (6-12) |

## H.A.B.I.T.S. Framework

| Letter | Habit | Focus |
|--------|-------|-------|
| **H** | Healthy Eating | Fuel for body and brain |
| **A** | Active Movement | The brain's Miracle-Gro |
| **B** | Balanced Stress | Building a resilient brain |
| **I** | Inner Coaching | Architecting the mind |
| **T** | Timekeepers | Mastering the body's clock |
| **S** | Sufficient Sleep | The brain's nightly recharge |

## Development

```bash
bun install
bun run dev        # localhost:4321
bun run build      # builds to dist/
```

## Deployment

```bash
bun x wrangler pages deploy dist --project-name thrive-care --commit-dirty=true
```

## Environment Variables (Cloudflare)

| Variable | Required | Purpose |
|----------|----------|---------|
| `DB` | Yes | Cloudflare D1 database binding |
| `KV` | Yes | Cloudflare KV for rate limiting |
| `AI` | Yes | Cloudflare Workers AI binding |
| `FIREBASE_PROJECT_ID` | Yes | Firebase auth validation |
| `GEMINI_API_KEY` | No | Premium chat (Gemini Flash) |
| `ANTHROPIC_API_KEY` | No | Premium chat fallback (Claude Haiku) |
| `ENABLE_SKIDS_COMPANION` | No | Enable Bayesian projections (default: off) |

## Git Remotes

| Remote | Repo | Purpose |
|--------|------|---------|
| `thrive` | satishskid/thrive-care | Cloudflare Pages deployment |
| `origin` | satishskid/skidsparents | Primary repo |

## Related Repos

- **@skids/intelligence** — Core intelligence engine package (extracted, at /Users/spr/Desktop/skids-intelligence)
- **zpediscreen** — V3 school screening platform
