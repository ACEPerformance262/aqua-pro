'use client'
import { useState, useEffect } from 'react'
import { Printer, FileText } from 'lucide-react'

function ratingBand(score: number): { label: string; colour: string } {
  if (score >= 15) return { label: 'Extreme', colour: '#d63031' }
  if (score >= 10) return { label: 'High', colour: '#e17055' }
  if (score >= 5) return { label: 'Medium', colour: '#fdcb6e' }
  return { label: 'Low', colour: '#00b894' }
}

const CONTACT_TYPE_LABELS: Record<string, string> = {
  facility_manager: 'Facility Manager', service_provider: 'Service Provider', gas_supplier: 'Gas Supplier',
  chemical_supplier: 'Chemical Supplier', laboratory: 'Laboratory', electrical_hvac: 'Electrical / HVAC',
  emergency_services: 'Emergency Services', other: 'Other',
}

const PRIORITY_COLOUR: Record<string, string> = { low: '#00b894', medium: '#fdcb6e', high: '#e17055', critical: '#d63031' }

// Prints via window.print() — @media print rules below hide the app chrome (sidebar, header,
// buttons) so only the document itself ends up on the page/PDF, same "browser print to PDF"
// pattern already used for the /sales page.
export default function WqrmpTab() {
  const [pools, setPools] = useState<any[]>([])
  const [poolId, setPoolId] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/pools').then(r => r.json()).then(d => setPools(d.pools ?? []))
  }, [])

  useEffect(() => {
    if (!poolId) { setDoc(null); return }
    setLoading(true)
    fetch(`/api/admin/wqrmp?pool_id=${poolId}`).then(r => r.json()).then(d => { setDoc(d); setLoading(false) })
  }, [poolId])

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .wqrmp-doc { color: #111 !important; background: #fff !important; }
          .wqrmp-doc * { color: #111 !important; border-color: #ccc !important; }
          .wqrmp-doc .wqrmp-section-title { color: #000 !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
        <select value={poolId} onChange={e => setPoolId(e.target.value)} style={{ minWidth: '280px' }}>
          <option value="">Select a pool to generate a WQRMP report…</option>
          {pools.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {doc && (
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={15} /> Print / Save as PDF
          </button>
        )}
      </div>

      {loading && <div style={{ color: 'var(--text-muted)' }}>Loading…</div>}

      {doc && (
        <div className="wqrmp-doc card" style={{ maxWidth: '820px', padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid var(--aqua)' }}>
            <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--aqua)', fontWeight: '700', textTransform: 'uppercase' }}>Water Quality Risk Management Plan</div>
            <div style={{ fontSize: '24px', fontWeight: '800', margin: '8px 0 4px', color: 'var(--text)' }}>{doc.pool.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{doc.pool.address}{doc.pool.suburb ? `, ${doc.pool.suburb}` : ''} {doc.pool.state}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Generated {new Date(doc.generated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Sydney' })}</div>
          </div>

          <Section title="1. Facility Details">
            <Grid>
              <Field label="Pool Type" value={doc.pool.pool_type} />
              <Field label="Sanitiser Type" value={doc.pool.sanitiser_type} />
              <Field label="Volume" value={doc.pool.volume_litres ? `${Number(doc.pool.volume_litres).toLocaleString()} L` : 'Not set'} />
              <Field label="Max Bather Load" value={doc.pool.max_bather_load ?? 'Not set'} />
              <Field label="Health Licence #" value={doc.pool.health_licence_number ?? '—'} />
              <Field label="Licence Expiry" value={doc.pool.licence_expiry ?? '—'} />
              <Field label="pH Correction Method" value={doc.pool.ph_correction_method === 'co2' ? 'CO₂ Injection' : 'Acid'} />
              <Field label="Owner" value={doc.pool.owner_name ?? '—'} />
            </Grid>
          </Section>

          <Section title="2. Operational Water Quality Targets">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px' }}>Parameter</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Min</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Ideal</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Max</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Priority</th>
              </tr></thead>
              <tbody>
                {Object.entries(doc.ranges).map(([key, r]: [string, any]) => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px', fontWeight: '600' }}>{r.label}</td>
                    <td style={{ padding: '6px' }}>{r.min} {r.unit}</td>
                    <td style={{ padding: '6px' }}>{r.ideal} {r.unit}</td>
                    <td style={{ padding: '6px' }}>{r.max} {r.unit}</td>
                    <td style={{ padding: '6px', textTransform: 'capitalize' }}>{r.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
              Closure standard: pool closes if Free Chlorine falls below {doc.pool.close_threshold_free_chlorine ?? '0.5 (default)'}
              {' '}or pH moves outside {doc.pool.close_threshold_ph_low ?? '6.8 (default)'}–{doc.pool.close_threshold_ph_high ?? '8.2 (default)'}.
            </div>
          </Section>

          <Section title="3. Risk Register">
            {doc.risk_register.length === 0 ? <Empty text="No risk register entries recorded for this site." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Code</th><th style={{ textAlign: 'left', padding: '6px' }}>Hazard</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Inherent</th><th style={{ textAlign: 'left', padding: '6px' }}>Controls</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Residual</th><th style={{ textAlign: 'left', padding: '6px' }}>Owner</th>
                </tr></thead>
                <tbody>
                  {doc.risk_register.map((r: any) => {
                    const inh = (r.inherent_likelihood ?? 0) * (r.inherent_consequence ?? 0)
                    const res = r.residual_likelihood && r.residual_consequence ? r.residual_likelihood * r.residual_consequence : null
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px' }}>{r.code ?? '—'}</td>
                        <td style={{ padding: '6px', maxWidth: '180px' }}>{r.hazard_description}</td>
                        <td style={{ padding: '6px', color: ratingBand(inh).colour }}>{inh || '—'} {inh ? ratingBand(inh).label : ''}</td>
                        <td style={{ padding: '6px', maxWidth: '160px' }}>{r.controls_in_place ?? '—'}</td>
                        <td style={{ padding: '6px', color: res ? ratingBand(res).colour : undefined }}>{res ?? '—'} {res ? ratingBand(res).label : ''}</td>
                        <td style={{ padding: '6px' }}>{r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="4. Corrective Actions">
            {doc.corrective_actions.length === 0 ? <Empty text="No corrective actions currently open." /> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Code</th><th style={{ textAlign: 'left', padding: '6px' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Priority</th><th style={{ textAlign: 'left', padding: '6px' }}>Owner</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Due</th><th style={{ textAlign: 'left', padding: '6px' }}>Status</th>
                </tr></thead>
                <tbody>
                  {doc.corrective_actions.map((a: any) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px' }}>{a.code ?? '—'}</td>
                      <td style={{ padding: '6px', maxWidth: '220px' }}>{a.description}</td>
                      <td style={{ padding: '6px', color: PRIORITY_COLOUR[a.priority], textTransform: 'capitalize' }}>{a.priority}</td>
                      <td style={{ padding: '6px' }}>{a.owner ? `${a.owner.first_name} ${a.owner.last_name}` : '—'}</td>
                      <td style={{ padding: '6px' }}>{a.due_date ?? '—'}</td>
                      <td style={{ padding: '6px', textTransform: 'capitalize' }}>{a.status.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="5. Emergency Contact Tree">
            {doc.contacts.length === 0 ? <Empty text="No emergency contacts recorded for this site." /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {doc.contacts.map((c: any) => (
                  <div key={c.id} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                    <span><b>{c.name}</b> — {CONTACT_TYPE_LABELS[c.contact_type] ?? c.contact_type}{c.organisation ? ` (${c.organisation})` : ''}{c.is_primary ? ' · Primary' : ''}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{[c.phone, c.email].filter(Boolean).join(' · ') || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="6. Asset Register Summary">
            {doc.assets.length === 0 ? <Empty text="No assets recorded for this site." /> : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {doc.assets.length} active assets registered, spanning {new Set(doc.assets.map((a: any) => a.asset_categories?.name)).size} categories.
                {doc.assets.filter((a: any) => a.condition === 'poor' || a.condition === 'failed').length > 0 && (
                  <span style={{ color: 'var(--red)', fontWeight: '600' }}> {doc.assets.filter((a: any) => a.condition === 'poor' || a.condition === 'failed').length} asset(s) currently in poor/failed condition — see Asset Register for detail.</span>
                )}
              </div>
            )}
          </Section>

          <Section title="7. Compliance Schedule">
            {doc.compliance_requirements.length === 0 ? <Empty text="No compliance requirements recorded." /> : (
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px' }}>
                {doc.compliance_requirements.map((r: any) => (
                  <li key={r.id} style={{ marginBottom: '4px' }}>{r.requirement_type} — {r.frequency}{r.authority ? ` (${r.authority})` : ''}</li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div className="wqrmp-section-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--aqua)', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>{title}</div>
      {children}
    </div>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>{children}</div>
}
function Field({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{String(value)}</span>
    </div>
  )
}
function Empty({ text }: { text: string }) {
  return <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{text}</div>
}
