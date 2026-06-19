import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AquaPro — Product Overview',
}

// Print as PDF: File → Print → Save as PDF (or use Chrome headless)
// Landscape A4 recommended

export default function SalesPage() {
  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#1e293b', background: '#ffffff', minHeight: '100vh' }}>

      {/* ── COVER ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2a4a 60%, #003d5c 100%)',
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px',
        pageBreakAfter: 'always',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '60px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px',
          }}>💧</div>
          <div>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#00b4d8', letterSpacing: '-1px', lineHeight: 1 }}>AquaPro</div>
            <div style={{ fontSize: '16px', color: '#64748b', marginTop: '4px', letterSpacing: '2px', textTransform: 'uppercase' }}>Pool Maintenance Management</div>
          </div>
        </div>

        <div style={{ maxWidth: '700px' }}>
          <div style={{ fontSize: '42px', fontWeight: '800', color: '#ffffff', lineHeight: 1.2, marginBottom: '24px' }}>
            The Complete Digital Platform for Pool &amp; Aquatic Facility Management
          </div>
          <div style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '48px' }}>
            Water compliance, staff scheduling, asset management, real-time IoT sensor integration,
            and AI-powered water chemistry advice — all in one purpose-built system.
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['Water Quality & Risk', 'Compliance Management', 'Staff Scheduling', 'Asset Register', 'IoT Integration', 'AI Chemistry Advice'].map(tag => (
              <div key={tag} style={{
                padding: '8px 16px', borderRadius: '99px',
                background: '#00b4d820', color: '#00b4d8',
                border: '1px solid #00b4d840', fontSize: '13px', fontWeight: '600',
              }}>{tag}</div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '80px', fontSize: '13px', color: '#334155' }}>
          Confidential — Prepared for discussion purposes only
        </div>
      </div>

      {/* ── PAGE 2: THE PROBLEM ───────────────────────────────────────────── */}
      <div style={{ padding: '64px 80px', pageBreakAfter: 'always', minHeight: '100vh' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#00b4d8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>The Challenge</div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '40px', lineHeight: 1.2 }}>
          Running a pool maintenance operation on clipboards, spreadsheets, and memory is a compliance and safety risk.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
          {[
            { icon: '📋', title: 'Paper checklists get lost', body: 'Pre-shift, safety equipment, and AED checks done on paper can\'t be audited, searched, or flagged in real-time when something fails.' },
            { icon: '⚗️', title: 'Water chemistry done by gut feel', body: 'Without structured testing records and automated analysis, out-of-range water can go undetected — creating liability and health risks.' },
            { icon: '🔧', title: 'Assets managed reactively', body: 'Equipment failures that could be predicted through a service register instead become emergency callouts, closures, and expensive repairs.' },
            { icon: '📅', title: 'Scheduling done in someone\'s head', body: 'Staff rosters in WhatsApp or paper rosters result in uncovered shifts, no-shows, and no audit trail of who was on deck and when.' },
            { icon: '📊', title: 'No compliance visibility', body: 'Health department requirements, licence renewals, and inspection due dates are tracked manually — until they\'re missed.' },
            { icon: '📡', title: 'Remote sites are a blind spot', body: 'For pools you don\'t visit every day, you have no visibility of water quality, equipment status, or who logged on until a problem has already occurred.' },
          ].map(c => (
            <div key={c.title} style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>{c.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '8px' }}>{c.title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0a1628, #0d2a4a)', borderRadius: '16px', padding: '32px', color: '#94a3b8', fontSize: '16px', lineHeight: 1.7 }}>
          <span style={{ color: '#00b4d8', fontWeight: '700' }}>AquaPro</span> replaces all of this with a single, purpose-built platform — built to the same standard as enterprise sports facility management software, but designed specifically for pool maintenance businesses.
        </div>
      </div>

      {/* ── PAGE 3: FEATURES OVERVIEW ─────────────────────────────────────── */}
      <div style={{ padding: '64px 80px', pageBreakAfter: 'always', minHeight: '100vh' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#00b4d8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Platform Features</div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '48px', lineHeight: 1.2 }}>
          Everything your team needs, in one place.
        </div>

        {[
          {
            number: '01',
            title: 'Digital Shift Checklists',
            colour: '#00b4d8',
            description: 'Pre-shift, safety equipment, AED, and session reporting — all done digitally on a smartphone. Every check is timestamped, signed off, and immediately visible to management.',
            points: [
              'Pre-shift operational checks (keys, lights, changerooms, deck walk)',
              'Safety equipment daily check with throw bag and rescue tube counts',
              'AED self-test with automatic escalation if failed',
              'Oxygen equipment check with date of last weekly service',
              'Session-by-session bather logging (pool users, LGs, external staff)',
              'Rules compliance and incident reporting per session',
              'Post-session close-up tasks (lane ropes, changerooms, bumbag, keys)',
              'Flags raised immediately trigger management notifications',
            ],
          },
          {
            number: '02',
            title: 'Water Quality & Risk Management',
            colour: '#00b894',
            description: 'Every water test is automatically classified as green / yellow / orange / red based on your pool type and sanitiser system. Red pools get immediate alerts.',
            points: [
              'Supports chlorine, saltwater, bromine, UV, ozone, and Baquacil systems',
              'Tests all standard parameters: FC, pH, TA, CH, CYA, salt, TDS, phosphates',
              'Automatic risk classification on every test (manual or IoT)',
              'AI-powered rebalancing advice with exact chemical doses',
              'Australian standards compliance (AS/NZS 1838)',
              'Full test history with trend visibility',
              'Closure alerts for critical readings',
            ],
          },
          {
            number: '03',
            title: 'Staff Scheduling',
            colour: '#fdcb6e',
            description: 'Schedule technicians, lifeguards, and contractors across multiple pools with a clear view of who is on deck, when, and for what purpose.',
            points: [
              'Shift types: service visit, repair, chemical delivery, inspection, emergency',
              'Assign shifts to specific pools or office/admin duties',
              'Technician mobile portal — see today\'s jobs, log water tests, mark complete',
              'Contractor portal with completion notes and sign-off',
              'Overnight shift reminder emails automatically sent to staff',
              'Unavailability management to prevent scheduling conflicts',
              'Service routes — assign pools in visit order to minimise travel',
            ],
          },
        ].map(f => (
          <div key={f.number} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '64px', fontWeight: '900', color: f.colour + '30', lineHeight: 1, marginBottom: '8px' }}>{f.number}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', lineHeight: 1.2 }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{f.description}</div>
            </div>
            <div style={{ paddingTop: '8px' }}>
              {f.points.map(p => (
                <div key={p} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: f.colour, flexShrink: 0, marginTop: '6px' }} />
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── PAGE 4: MORE FEATURES ─────────────────────────────────────────── */}
      <div style={{ padding: '64px 80px', pageBreakAfter: 'always', minHeight: '100vh' }}>
        {[
          {
            number: '04',
            title: 'Asset Register & Maintenance',
            colour: '#e17055',
            description: 'A full equipment register for every pool — pumps, filters, chlorinators, AEDs, safety equipment, and more — with service histories and replacement cost tracking.',
            points: [
              '20 pre-built asset categories (pump, filter, chlorinator, UV, AED, etc.)',
              'Manufacturer, model, serial number, install date, warranty tracking',
              'Condition rating (new / good / fair / poor / failed)',
              'Configurable service intervals with overdue alerts',
              'Service log with cost tracking and parts used',
              'Total replacement cost visibility across your portfolio',
              'Asset location within facility (e.g. "pump room, north wall")',
            ],
          },
          {
            number: '05',
            title: 'Compliance Management',
            colour: '#a78bfa',
            description: 'Never miss a health department inspection, licence renewal, or mandatory water quality report again. Compliance events are tracked, auto-escalated, and emailed to management.',
            points: [
              'Scheduled compliance events with due dates and authority references',
              'Daily cron automatically marks overdue events',
              '7-day advance email alerts to admin and managers',
              'Compliance status per pool (pending / completed / overdue / failed)',
              'Health licence number and expiry tracked per pool',
              'Certificate URL storage for audit purposes',
              'Water closure log when pools are taken offline for remediation',
            ],
          },
          {
            number: '06',
            title: 'IoT Sensor Integration',
            colour: '#00b4d8',
            description: 'Connect smart pool controllers and water quality sensors to AquaPro. Readings arrive automatically, are classified for risk, and trigger alerts — no technician visit required.',
            points: [
              'Compatible with any device that can POST JSON via HTTP',
              'Supports WaterGuru, Lovibond Checkit Connect, and custom Arduino controllers',
              'Per-device cryptographic key for secure authentication',
              'Readings automatically classified for risk on arrival',
              'Last-seen timestamp to detect offline sensors',
              'IoT readings trigger the same alerts as manual tests',
              'Sensor management portal — register, revoke, and monitor devices',
            ],
          },
          {
            number: '07',
            title: 'AI Water Chemistry Advice',
            colour: '#00b894',
            description: 'When readings are out of range, one tap generates a plain-English explanation of the problem, the exact chemical doses required, and step-by-step safety instructions — built on Claude by Anthropic.',
            points: [
              'Explains what is wrong and why it matters for swimmer safety',
              'Calculates exact chemical doses based on pool volume and current readings',
              'Provides the correct sequence of chemical additions (order matters)',
              'Includes safety handling instructions for all chemicals',
              'Specifies when to re-test and what to expect',
              'Advises whether the pool should remain open during treatment',
              'References Australian standards where relevant',
            ],
          },
        ].map(f => (
          <div key={f.number} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '64px', fontWeight: '900', color: f.colour + '30', lineHeight: 1, marginBottom: '8px' }}>{f.number}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '12px', lineHeight: 1.2 }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{f.description}</div>
            </div>
            <div style={{ paddingTop: '8px' }}>
              {f.points.map(p => (
                <div key={p} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: f.colour, flexShrink: 0, marginTop: '6px' }} />
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{p}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── PAGE 5: PORTALS & ROLES ───────────────────────────────────────── */}
      <div style={{ padding: '64px 80px', pageBreakAfter: 'always', minHeight: '100vh' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#00b4d8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Access Control</div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', lineHeight: 1.2 }}>
          The right view for every person.
        </div>
        <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '48px', lineHeight: 1.7 }}>
          AquaPro has four distinct portals, each tailored to how that person actually uses the system.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
          {[
            {
              role: 'Owner / Admin',
              icon: '🔑',
              colour: '#00b4d8',
              access: 'Full access',
              capabilities: [
                'All pools, all staff, all data',
                'Add and manage pools, staff, assets',
                'View all water tests, checklists, incidents',
                'Compliance management and reporting',
                'IoT sensor registration and monitoring',
                'Risk management dashboard',
                'Financial and KPI overview',
              ],
            },
            {
              role: 'Manager',
              icon: '📊',
              colour: '#00b894',
              access: 'Operational access',
              capabilities: [
                'Schedule and manage staff shifts',
                'Review water tests and checklists',
                'Manage compliance events',
                'Add and view assets',
                'View and respond to flagged checklists',
                'Register IoT sensors',
                'View reporting dashboards',
              ],
            },
            {
              role: 'Technician / Lifeguard',
              icon: '📱',
              colour: '#fdcb6e',
              access: 'Mobile-first field portal',
              capabilities: [
                'View today\'s assigned shifts and pool locations',
                'Complete digital pre-shift checklists',
                'Log session reporting (pool users, LGs, incidents)',
                'Log water tests with automatic risk classification',
                'Mark shifts complete with notes',
                'Access last water test readings for each pool',
                'Receive shift reminder emails the night before',
              ],
            },
            {
              role: 'Contractor',
              icon: '🔧',
              colour: '#e17055',
              access: 'Limited field portal',
              capabilities: [
                'View assigned jobs for today',
                'See pool address and job type',
                'Add completion notes and sign off',
                'Mark jobs complete',
                'No access to water test data or financial information',
                'Clean, simple mobile interface',
              ],
            },
          ].map(r => (
            <div key={r.role} style={{ borderRadius: '16px', padding: '28px', border: `2px solid ${r.colour}30`, background: r.colour + '08' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px' }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a' }}>{r.role}</div>
                  <div style={{ fontSize: '12px', color: r.colour, fontWeight: '600' }}>{r.access}</div>
                </div>
              </div>
              {r.capabilities.map(c => (
                <div key={c} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ color: r.colour, fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>✓</div>
                  <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{c}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pool Manager role */}
        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>🏊 Pool / Facility Manager (on-site)</div>
          <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, marginBottom: '16px' }}>
            For commercial clients who manage their own facility — schools, councils, leisure centres — the pool manager portal gives them visibility of their pool&apos;s water status and compliance calendar without access to other pools or staff data.
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {['Current water risk status', 'Recent test readings', 'Compliance event calendar', 'Closure notifications'].map(c => (
              <div key={c} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa' }} />
                <div style={{ fontSize: '13px', color: '#64748b' }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE 6: TECHNOLOGY & TRANSFER ────────────────────────────────── */}
      <div style={{ padding: '64px 80px', pageBreakAfter: 'always', minHeight: '100vh' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#00b4d8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Technology</div>
        <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '40px', lineHeight: 1.2 }}>
          Built on modern, proven infrastructure.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '48px' }}>
          {[
            { name: 'Next.js 15', role: 'Web framework', detail: 'Industry-standard React framework used by Vercel, Netflix, and thousands of SaaS products.' },
            { name: 'Supabase / PostgreSQL', role: 'Database', detail: 'Open-source database with row-level security, real-time subscriptions, and scalable infrastructure.' },
            { name: 'Claude by Anthropic', role: 'AI engine', detail: 'The latest Claude model powers water chemistry analysis — accurate, safety-conscious, and explainable.' },
            { name: 'Vercel', role: 'Hosting', detail: 'Zero-config deployment with global CDN, automatic HTTPS, and 99.99% uptime SLA.' },
            { name: 'TypeScript', role: 'Code quality', detail: 'Strictly typed throughout — fewer bugs, easier maintenance, and safe to hand to a new developer.' },
            { name: 'Nodemailer + Twilio', role: 'Notifications', detail: 'Email and SMS alerts for compliance reminders, shift reminders, and critical water quality flags.' },
          ].map(t => (
            <div key={t.name} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#00b4d8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{t.role}</div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>{t.detail}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0a1628, #0d2a4a)', borderRadius: '16px', padding: '40px', marginBottom: '32px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>Clean ownership transfer</div>
          <div style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.8, marginBottom: '24px' }}>
            AquaPro is built as a standalone codebase — no proprietary black boxes, no vendor lock-in beyond commodity services (Supabase, Vercel, Anthropic). Transferring ownership means handing over:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              'Git repository with full source code',
              'Supabase project (database + all data)',
              'Environment variables and API keys',
              'Vercel deployment (transfer takes 2 minutes)',
              'Domain name (if applicable)',
              'Documentation and setup guide',
            ].map(i => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ color: '#00b4d8', fontWeight: '700', flexShrink: 0 }}>→</div>
                <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{i}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '24px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', color: '#15803d', marginBottom: '8px' }}>✓ What&apos;s included</div>
            {['Full source code', 'Database schema + seed data', 'Water chemistry calculation engine', 'All 7 feature modules', 'Email templates', 'Cron job scripts', 'Setup documentation'].map(i => (
              <div key={i} style={{ fontSize: '13px', color: '#166534', marginBottom: '5px' }}>• {i}</div>
            ))}
          </div>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '800', fontSize: '16px', color: '#0f172a', marginBottom: '8px' }}>Accounts to set up</div>
            {[
              ['Supabase', 'Free tier covers early stage'],
              ['Vercel', 'Free for most workloads'],
              ['Anthropic', 'Pay per AI call (~cents each)'],
              ['Gmail/email', 'For outbound alerts'],
              ['Twilio (optional)', 'For SMS notifications'],
            ].map(([name, note]) => (
              <div key={name} style={{ fontSize: '13px', color: '#475569', marginBottom: '7px' }}>
                <span style={{ fontWeight: '600' }}>{name}</span> — {note}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE 7: CONTACT / NEXT STEPS ─────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2a4a 60%, #003d5c 100%)', padding: '80px', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#00b4d8', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Next Steps</div>
        <div style={{ fontSize: '42px', fontWeight: '800', color: '#ffffff', lineHeight: 1.2, marginBottom: '24px', maxWidth: '600px' }}>
          Ready to see AquaPro in action?
        </div>
        <div style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '48px', maxWidth: '600px' }}>
          We can walk you through a live demo, tailor the system to your pools and workflows, and have you fully operational within days.
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '64px' }}>
          {[
            { step: '1', title: 'Live Demo', body: 'See every feature working with real data — checklists, water tests, AI advice, and more.' },
            { step: '2', title: 'Configure for your pools', body: 'Add your pool register, staff, asset categories, and compliance schedule.' },
            { step: '3', title: 'Train your team', body: 'Technicians and managers are typically up and running in under an hour.' },
            { step: '4', title: 'Go live', body: 'Deploy to production on Vercel. You own everything from day one.' },
          ].map(s => (
            <div key={s.step} style={{ flex: '1', minWidth: '180px', background: '#ffffff15', borderRadius: '12px', padding: '24px', border: '1px solid #ffffff20' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#00b4d830', lineHeight: 1, marginBottom: '8px' }}>{s.step}</div>
              <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '16px', marginBottom: '8px' }}>{s.title}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #ffffff20', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#00b4d8,#0077b6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💧</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#00b4d8' }}>AquaPro</div>
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Built on the same technology stack as enterprise sports facility management platforms.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Prepared for</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#94a3b8' }}>Your Company</div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          div[style*="pageBreakAfter: always"] { page-break-after: always; }
        }
      `}</style>
    </div>
  )
}
