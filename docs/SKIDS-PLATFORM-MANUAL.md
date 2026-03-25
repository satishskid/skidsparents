# SKIDS Platform — Staff & User Manual
**Version:** March 2026 | **Live at:** parent.skids.clinic

---

## Who Uses What

| Role | URL | Access |
|------|-----|--------|
| **Parents** | parent.skids.clinic | PHR, bookings, subscriptions, community |
| **Doctors / Providers** | parent.skids.clinic/provider/login | Patient orders, teleconsult, prescriptions |
| **Admin / Staff** | parent.skids.clinic/admin | CRM, pricing, orders, revenue, audit |
| **Marketing** | skids.clinic | Public-facing marketing site |

---

## 1. PARENTS — How to Use

### Sign Up / Sign In
- Go to **parent.skids.clinic**
- Click **"Sign in with Google or mobile number"**
- First-time users are taken through a quick onboarding wizard (child name, DOB, basic health history)

### Child Health Record (PHR)
After login, go to **My Profile → child card**:

- **Milestone Tracker** — motor, cognitive, social, language milestones auto-matched to child's age
- **Growth Charts** — WHO z-score charts for weight, height, head circumference, BMI
- **Vaccination Tracker** — IAP schedule with due/overdue status
- **Observation Journal** — log anything (fever, new word, concern) linked to Dr. SKIDS
- **Screening Results** — vision, hearing, nutrition, developmental results in one place

### NEW — Health Score Gauge
- A ring gauge on the child dashboard shows an overall **Health Score (0–100)**
- Color coded: 🟢 Green (70+) · 🟡 Amber (40–69) · 🔴 Red (<40)
- Trend arrow shows ↑ improving / ↓ declining / → stable vs last 30 days
- **Detailed breakdown** (Premium subscribers): per-component bars for Growth, Development, Habits, Nutrition

### NEW — PDF Export
- On the child dashboard, click **"Export PHR as PDF"**
- Downloads a complete health record: vaccinations, growth, milestones, observations
- Filename: `skids-[childname]-[date].pdf`
- Only available to subscribers with `pdf_export` feature (all plans including Free)

### NEW — Subscription Management
- Go to **My Profile** → **Subscription Card**
- Shows: current plan, billing cycle, expiry date, included features
- **Cancel Plan** button available for active subscribers (inline confirmation required)
- Free plan users see "Free Plan" with included features listed

### Booking a Service
- Go to **parent.skids.clinic/services** → pick a service → **Book**
- Select provider, date/time slot
- **NEW — Teleconsult Discount**: Premium subscribers see discounted price (strikethrough original + green discounted price) for telehealth/consultation services
- Complete payment via Razorpay

### H.A.B.I.T.S. Tracker
- Go to **parent.skids.clinic/habits**
- Daily habit focus: Healthy Eating, Active Movement, Balanced Stress, Inner Coaching, Timekeepers, Sufficient Sleep
- Each habit page has a CTA → logs you into PHR if signed in, or redirects to login

---

## 2. DOCTORS / PROVIDERS — How to Use

### First Time — Apply to Join
1. Go to **parent.skids.clinic/provider/signup**
2. Fill in: Full Name, Medical Reg. Number, Specializations, City, Contact Email, Phone
3. Admin reviews and approves within 24 hours
4. You'll receive an email once approved

### Sign In (Approved Providers)
1. Go to **parent.skids.clinic/provider/login**
2. Click **"Continue with Google"** — use the same Google account you registered with
3. If you see "pending review" — your account hasn't been approved yet

### Provider Dashboard
After login at **parent.skids.clinic/provider**:

- **Orders** — view all booked appointments, patient details, scheduled time
- **Patient PHR** — access child health record for your booked patients
- **Availability** — set your available slots (date/time blocks)
- **Prescriptions** — issue digital prescriptions per order
- **Teleconsult Session** — start LiveKit video session for telehealth orders
- **Profile** — update credentials, specializations, bio

### Completing an Order
1. Open order from dashboard
2. Review patient PHR (auto-loaded)
3. Add clinical notes
4. Issue prescription if needed
5. Click **"Complete Order"**

---

## 3. ADMIN / STAFF — How to Use

### Access
- Go to **parent.skids.clinic/admin**
- Requires `ADMIN_KEY` bearer token (set in Cloudflare secrets)
- All admin pages are protected — unauthorized access returns 401

### CRM — Lead Management
**parent.skids.clinic/admin**
- View all leads captured from marketing site
- Filter by source, date, status
- Export for follow-up campaigns

### NEW — Pricing Tiers Manager
**parent.skids.clinic/admin/pricing**

This is the control panel for all subscription plans.

**View Tiers:**
- Table shows: Name, Monthly Price, Yearly Price, Active status, Feature keys

**Create New Tier:**
1. Click **"New Tier"**
2. Fill in: Name, Description, Currency (INR), Monthly price (in paise), Yearly price
3. Check features to include:
   - `pdf_export` — PDF health record download
   - `health_score_basic` — overall health score ring
   - `health_score_detailed` — per-component breakdown bars
   - `unlimited_children` — add more than 2 children
   - `priority_support` — priority customer support
   - `teleconsult_discount_pct` — discount % on teleconsult bookings (enter 0–100)
4. Click **Save**

**Edit a Tier:**
- Click **"Edit"** on any row → same form pre-populated
- Changes to features do NOT affect existing active subscribers (their snapshot is preserved)

**Deactivate a Tier:**
- Click **"Deactivate"** → sets tier to inactive (hidden from new subscribers)
- ⚠️ The **Free tier cannot be deactivated** (system enforced)

### Provider Management
**parent.skids.clinic/admin/providers**
- View all provider applications
- Approve / reject providers
- View credentials and specializations

### Orders
**parent.skids.clinic/admin/orders**
- View all bookings across all providers
- Filter by status, date, provider
- Manage refunds

### Revenue Dashboard
**parent.skids.clinic/admin/revenue**
- Revenue by period, service type, provider
- Subscription MRR tracking

### Audit Log
**parent.skids.clinic/admin/audit**
- Full audit trail of all admin actions
- Who changed what and when

---

## 4. NEW FEATURES SUMMARY (March 2026 Release)

### For Parents
| Feature | Where | Who Gets It |
|---------|-------|-------------|
| Health Score Gauge | Child dashboard | All users |
| Health Score Detailed View | Child dashboard | Premium subscribers |
| PDF PHR Export | Child dashboard | All subscribers (incl. Free) |
| Subscription Card | My Profile | All users |
| Cancel Subscription | My Profile → Subscription Card | Active subscribers |
| Teleconsult Discount | Booking flow | Subscribers with discount feature |

### For Admin
| Feature | Where |
|---------|-------|
| Pricing Tiers Manager | /admin/pricing |
| Create / Edit / Deactivate tiers | /admin/pricing |
| Teleconsult discount % per tier | /admin/pricing → tier form |

---

## 5. SUBSCRIPTION PLANS — How They Work

- **Free Plan** — every parent gets this automatically. Includes: `pdf_export`, `health_score_basic`
- **Paid Plans** — created by admin in Pricing Manager. Features are locked at subscription time (snapshot)
- When a parent subscribes, their feature set is **snapshotted** — future tier changes don't affect them
- To cancel: parent goes to My Profile → Subscription Card → Cancel Plan
- Reactivation after cancellation requires a new payment (no in-place reactivation)

---

## 6. SOCIAL MEDIA COPY (Ready to Post)

### LinkedIn / Internal Staff Post
> 🚀 Big update live on SKIDS Parent (parent.skids.clinic)!
>
> We've shipped our full monetisation + health intelligence layer:
>
> 🏥 **Health Score** — every child now gets a real-time health score (0–100) with trend tracking across growth, development, habits & nutrition
>
> 📄 **PDF PHR Export** — parents can download their child's complete health record in one tap
>
> 💳 **Subscription Management** — parents can view, manage and cancel their plan directly from their profile
>
> 💰 **Teleconsult Discounts** — premium subscribers get automatic discounts on video consultations
>
> 🛠️ **Admin Pricing Manager** — our team can now create and manage subscription tiers with granular feature control
>
> Doctors: log in at parent.skids.clinic/provider/login
> Parents: parent.skids.clinic
>
> #SKIDS #HealthTech #PediatricCare #MadeInIndia

### WhatsApp (Internal Staff)
> ✅ *SKIDS Platform Update — March 2026*
>
> New features are LIVE:
> • Health Score for every child 🏥
> • PDF export of health records 📄
> • Subscription management for parents 💳
> • Teleconsult discounts for premium users 🎯
> • Admin pricing control panel 🛠️
>
> *Doctors login:* parent.skids.clinic/provider/login
> *Parents:* parent.skids.clinic
> *Admin:* parent.skids.clinic/admin
>
> All 15 routes tested and live ✅

---

## 7. QUICK REFERENCE — URLs

```
parent.skids.clinic              → Parents home
parent.skids.clinic/login        → Parents sign in
parent.skids.clinic/me           → PHR dashboard
parent.skids.clinic/services     → Book a service
parent.skids.clinic/habits       → H.A.B.I.T.S. tracker
parent.skids.clinic/blog         → Health articles
parent.skids.clinic/community    → Parent community

parent.skids.clinic/provider/login   → Doctors sign in
parent.skids.clinic/provider/signup  → Doctors apply to join

parent.skids.clinic/admin            → Admin CRM
parent.skids.clinic/admin/pricing    → Subscription tiers
parent.skids.clinic/admin/providers  → Provider management
parent.skids.clinic/admin/orders     → Order management
parent.skids.clinic/admin/revenue    → Revenue dashboard
parent.skids.clinic/admin/audit      → Audit log

skids.clinic                         → Marketing site
```

---

*Generated March 25, 2026 | SKIDS Health Technologies*
