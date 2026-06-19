# AquaPro — Pool Maintenance Management System

A full-stack web application for managing commercial pool maintenance operations. Built as a Buffer Zone Software alternative.

## Tech Stack

- **Framework**: Next.js 16 (App Router) · React 19 · TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4 + inline styles · dark navy theme
- **AI**: Anthropic Claude Sonnet (water chemistry advice)
- **Email**: Nodemailer via Gmail SMTP
- **Icons**: Lucide React · Charts: Recharts

---

## Setup & Deploy

### 1. Database

Create a new Supabase project, then run these two SQL files in order via the Supabase SQL editor:

```
supabase-schema.sql           ← core schema + seeded categories & water test targets
add-checklists-migration.sql  ← shift checklists + sessions tables
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email (Gmail App Password — not your regular password)
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Auth
SESSION_SECRET=any-long-random-string-32-chars-min

# Cron protection
CRON_SECRET=any-long-random-string

# App URL (used in email links)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Seed First Admin User

Run this in Supabase SQL editor (replace values):

```sql
insert into staff (email, password_hash, first_name, last_name, role)
values (
  'admin@yourcompany.com',
  -- bcrypt hash of your chosen password — generate at https://bcrypt-generator.com (rounds: 10)
  '$2b$10$...',
  'Admin',
  'User',
  'admin'
);
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Add all `.env.local` variables as Vercel Environment Variables in your project settings.

### 5. Schedule Daily Crons

In Vercel → Settings → Cron Jobs, or via any cron service:

```
GET https://your-domain.vercel.app/api/cron/compliance-check
Authorization: Bearer <CRON_SECRET>
Schedule: 0 8 * * *   (8am daily)

GET https://your-domain.vercel.app/api/cron/maintenance-reminders
Authorization: Bearer <CRON_SECRET>
Schedule: 0 7 * * *   (7am daily)
```

---

## Portals

| URL | Role | Access |
|-----|------|--------|
| `/login` | All | Login page |
| `/admin` | admin, manager | Full dashboard — 11 tabs |
| `/technician` | technician | Today's jobs, water testing, checklists |
| `/pool-manager` | pool_manager | Read-only water status + compliance |
| `/contractor` | contractor | Assigned jobs + sign-off |
| `/sales` | Public | Sales pitch PDF (⌘P → Save as PDF) |

---

## Admin Dashboard Tabs

| Tab | What it does |
|-----|-------------|
| Overview | KPI tiles + recent water tests |
| Pools | Pool register CRUD |
| Water Testing | Log tests, AI chemistry advice, view history |
| Staff & Scheduling | Shifts · Staff · Service Routes · Unavailability |
| Shift Checklists | Review submitted checklists, flag drill-down |
| Asset Register | Equipment CRUD + service log history |
| Compliance | Events calendar · Requirements library |
| Chemicals | Chemical inventory + usage log |
| Pool Closures | Close/reopen pools, closure history |
| Risk | Pool risk status, incident reporting |
| Remote Sites & IoT | Register sensors, view ingest endpoint |

---

## IoT Sensor Integration

Any device that can POST JSON to a URL can send readings automatically.

**Endpoint:** `POST /api/iot/ingest`

**Payload:**
```json
{
  "sensor_key": "your-64-char-hex-key",
  "free_chlorine": 2.1,
  "ph": 7.4,
  "temperature_c": 28.5,
  "total_alkalinity": 95,
  "salt_level": 3000
}
```

Register sensors in Admin → Remote Sites. The sensor key is shown **once** on registration — copy it immediately.

---

## Roles & Permissions

| Role | Can do |
|------|--------|
| `admin` | Everything |
| `manager` | Everything except staff password management |
| `technician` | View/complete shifts, log water tests, submit checklists |
| `contractor` | View assigned shifts, mark complete |
| `pool_manager` | Read-only pool status + compliance calendar |

---

## Development

```bash
npm install
npm run dev        # starts on http://localhost:3000
```

The technician portal uses port 3000 by default. To match the sales page reference to port 3004, set `PORT=3004` or adjust as needed.

---

## Handoff Checklist

- [ ] Supabase project created and both SQL files run
- [ ] `.env.local` values filled and added to Vercel
- [ ] First admin user seeded via SQL
- [ ] Deployed to Vercel
- [ ] Daily crons scheduled
- [ ] Client staff added via Admin → Staff & Scheduling → Staff
- [ ] Pools added via Admin → Pools
- [ ] Compliance requirements set up via Admin → Compliance → Requirements
- [ ] Chemicals added via Admin → Chemicals
- [ ] IoT sensors registered if applicable (Admin → Remote Sites)
- [ ] Sales PDF generated from `/sales` (if needed)
