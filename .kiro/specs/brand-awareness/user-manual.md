# SKIDS Parent — User Manual
## Phase 7: Brand Awareness & Community Features

**Live URL**: https://parent.skids.clinic  
**Preview URL**: https://43d57123.skidsparent.pages.dev  
**Last deployed**: March 18, 2026

---

## 1. What's New in Phase 7

This phase transforms SKIDS Parent from a PHR tool into a full parent education and community platform. All new features are **free** — no paywall.

---

## 2. Feature Guide

### 2.1 Organ Discovery (16 Modules)
**URL**: `/discover`

Parents can explore all 16 organ systems in child-friendly language.

| Organ | URL |
|-------|-----|
| Brain & Mind | `/discover/brain` |
| Heart & Blood | `/discover/heart` |
| Eyes & Vision | `/discover/eyes` |
| Ears & Hearing | `/discover/ears` |
| Lungs & Breathing | `/discover/lungs` |
| Digestive System | `/discover/digestive` |
| Skin | `/discover/skin` |
| Muscles | `/discover/muscles` |
| Immune System | `/discover/immune` |
| Hormones | `/discover/hormones` |
| Kidneys | `/discover/kidneys` |
| Learning & Memory | `/discover/learning` |
| Language & Speech | `/discover/language` |
| Emotions | `/discover/emotions` |
| Movement | `/discover/movement` |
| Senses | `/discover/senses` |

Each page includes: wonder fact, overview, age relevance, and links to related SKIDS services. All pages are **pre-rendered static** — fast load, SEO-friendly, no login required.

---

### 2.2 H.A.B.I.T.S. Framework (6 Modules)
**URL**: `/habits`

| Letter | Habit | URL |
|--------|-------|-----|
| H | Healthy Eating | `/habits/healthy_eating` |
| A | Active Movement | `/habits/active_movement` |
| B | Balanced Stress | `/habits/balanced_stress` |
| I | Inner Coaching | `/habits/inner_coaching` |
| T | Timekeepers | `/habits/timekeepers` |
| S | Sufficient Sleep | `/habits/sufficient_sleep` |

Each page has a daily tip, description, and links to the habit tracker in the child's PHR. No login required to read; login required to log habits.

---

### 2.3 Community Forum
**URL**: `/community`

Parents can discuss in age-based and topic-based groups.

**How it works:**
- Browse groups at `/community`
- Click a group to see posts
- Click a post to read + comment
- Use the "New Post" button to create a post
- Check "Post anonymously" to hide your name from other parents (your identity is never stored in the response)
- Like posts and comments with the ❤️ button — one like per parent, no duplicates

**Moderation**: Posts can be reported via the "Report" button. Admins review at `/admin/moderation`.

---

### 2.4 Blog Bookmarks
**URL**: `/blog`

On any blog post, logged-in parents can:
- Click the bookmark icon to save the post
- View saved posts on their profile at `/me`
- Bookmark the same post multiple times safely — it's idempotent (no duplicates)

---

### 2.5 Social Sharing
Available on blog posts, organ pages, and H.A.B.I.T.S. pages.

Supported platforms: WhatsApp, Facebook, Instagram, Twitter/X, LinkedIn, Medium, Copy link.

Every share URL automatically includes UTM tracking:
- `utm_source` = platform (e.g., `whatsapp`)
- `utm_medium` = `social`
- `utm_campaign` = `skids_share`

SKIDS official channels linked in footer:
- Facebook: facebook.com/skids.health
- Instagram: @skids_clinic
- Twitter: @SKIDS58283752
- LinkedIn: linkedin.com/company/skids
- Medium: medium.com/@skids_health

---

### 2.6 WhatsApp Daily Tips
**Subscribe**: Available in user profile settings

Parents can subscribe to:
- **Daily tip** — health tip every morning at 9 AM IST
- **Weekly digest** — community highlights
- **Personalized** — content based on child's age

Powered by BHASH API (sender: BUZWAP). Phone numbers are auto-normalized to 10-digit format.

**To activate the daily cron** (one-time manual step):
1. Go to https://dash.cloudflare.com → Pages → skidsparent
2. Settings → Functions → Cron Triggers
3. Add trigger: `30 3 * * *` (= 9:00 AM IST daily)

---

### 2.7 Analytics Tracking
Tracks automatically once IDs are configured. Add these as Cloudflare secrets when ready:

```bash
wrangler pages secret put GA4_MEASUREMENT_ID    # Google Analytics 4
wrangler pages secret put META_PIXEL_ID          # Meta/Facebook Pixel
wrangler pages secret put POSTHOG_API_KEY        # PostHog product analytics
```

The app works fine without these — analytics just won't fire until IDs are set.

Events tracked automatically:
- `page_view` — every page
- `content_view` — blog, organ, habit pages (with read duration)
- `content_share` — every share action
- `content_bookmark` — blog bookmarks
- `forum_post_created`, `forum_comment_created`, `forum_like`
- `service_view`, `service_inquiry`, `lead_captured` — conversion funnel
- `phr_entry` — milestones, growth, habits, observations, vaccinations
- `chat_message` — Dr. SKIDS chatbot

---

### 2.8 Admin Dashboards
Both require admin authentication.

**Analytics Dashboard** — `/admin/analytics`
- Traffic overview (page views, unique visitors)
- Engagement metrics (DAU/MAU, session duration, community posts)
- Conversion metrics (service views, inquiries, leads)
- Popular content ranked by engagement score

**Moderation Dashboard** — `/admin/moderation`
- Reported posts and comments
- Hide (soft delete — removes from public view) or Dismiss (mark reviewed, keep visible)

---

## 3. Deployment Reference

### Current State
| Item | Status |
|------|--------|
| Code | ✅ Deployed to `skidsparent.pages.dev` |
| DB migrations (0000, 0001, 0002) | ✅ Applied to production D1 |
| BHASH credentials | ✅ Set (BHASH_USER, BHASH_PASS, BHASH_SENDER) |
| Cron trigger (9 AM IST) | ⚠️ Manual step — set in CF dashboard |
| GA4_MEASUREMENT_ID | ⏳ Add when ready |
| META_PIXEL_ID | ⏳ Add when ready |
| POSTHOG_API_KEY | ⏳ Add when ready |

### Re-deploy after code changes
```bash
npm run build
npx wrangler pages deploy dist --project-name skidsparent
```

### Run DB migration (new tables only)
```bash
echo "y" | npx wrangler d1 execute skids-parent-db --remote --file=migrations/<file>.sql
```

### Run tests
```bash
npx vitest run
```
Expected: 92 tests passing across 11 test files.

---

## 4. All Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | Home |
| `/blog` | No | Blog listing |
| `/blog/[slug]` | No | Blog post (with bookmark if logged in) |
| `/discover` | No | Organ discovery listing |
| `/discover/[organ]` | No | Individual organ page |
| `/habits` | No | H.A.B.I.T.S. listing |
| `/habits/[habit]` | No | Individual habit page |
| `/community` | No | Forum group listing |
| `/community/[groupId]` | No | Forum posts in group |
| `/community/[groupId]/[postId]` | No | Post detail + comments |
| `/interventions` | No | SKIDS services listing |
| `/interventions/[slug]` | No | Service detail + lead capture |
| `/services` | No | Services overview |
| `/login` | No | Firebase Auth (Google + Phone OTP) |
| `/me` | Yes | User profile + bookmarks |
| `/child/[id]` | Yes | Child PHR dashboard |
| `/timeline` | Yes | Health timeline |
| `/admin` | Admin | CRM dashboard |
| `/admin/analytics` | Admin | Analytics dashboard |
| `/admin/moderation` | Admin | Content moderation |

---

## 5. Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5 (SSR, Cloudflare Pages adapter) |
| UI | React 18 + Tailwind CSS v4 |
| Database | Cloudflare D1 (SQLite, Drizzle ORM) |
| Auth | Firebase Auth (Google + Phone OTP) |
| AI | Cloudflare Workers AI (Llama 3.1) |
| WhatsApp | BHASH API (sender: BUZWAP) |
| CRM | Neodove (webhook integration) |
| Analytics | GA4 + Meta Pixel + PostHog |
| Storage | Cloudflare R2 (medical reports) |
| Testing | Vitest + fast-check (PBT) |
