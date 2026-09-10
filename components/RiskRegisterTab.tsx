'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, ListChecks, ShieldAlert } from 'lucide-react'

const PRIORITY_COLOUR: Record<string, string> = { low: '#00b894', medium: '#fdcb6e', high: '#e17055', critical: '#d63031' }
const STATUS_COLOUR: Record<string, string> = { open: '#64748b', in_progress: '#fdcb6e', completed: '#00b894', overdue: '#d63031' }

function ratingBand(score: number): { label: string; colour: string } {
  if (score >= 15) return { label: 'Extreme', colour: '#d63031' }
  if (score >= 10) return { label: 'High', colour: '#e17055' }
  if (score >= 5) return { label: 'Medium', colour: '#fdcb6e' }
  return { label: 'Low', colour: '#00b894' }
}

const BLANK_ACTION = { pool_id: '', code: '', source: 'internal', description: '', priority: 'medium', owner_staff_id: '', due_date: '', notes: '' }
const BLANK_RISK = { pool_id: '', code: '', hazard_description: '', inherent_likelihood: 3, inherent_consequence: 3, controls_in_place: '', residual_likelihood: '', residual_consequence: '', owner_staff_id: '', review_date: '', notes: '' }

export default function RiskRegisterTab() {
  const [subTab, setSubTab] = useState<'actions' | 'register'>('actions')
  const [pools, setPools] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/pools').then(r => r.json()),
      fetch('/api/admin/staff').then(r => r.json()),
    ]).then(([p, st]) => { setPools(p.pools ?? []); setStaff(st.staff ?? []) })
  }, [])

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={subTab === 'actions' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setSubTab('actions')}>
          <ListChecks size={14} /> Corrective Actions
        </button>
        <button className={subTab === 'register' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setSubTab('register')}>
          <ShieldAlert size={14} /> Risk Register
        </button>
      </div>
      {subTab === 'actions' ? <CorrectiveActions pools={pools} staff={staff} /> : <RiskRegister pools={pools} staff={staff} />}
    </>
  )
}

function CorrectiveActions({ pools, staff }: { pools: any[]; staff: any[] }) {
  const [actions, setActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK_ACTION)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    fetch('/api/admin/corrective-actions').then(r => r.json()).then(d => { setActions(d.actions ?? []); setLoading(false) })
  }, [])
  useEffect(() => { load() }, [load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/corrective-actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setShowModal(false); setForm(BLANK_ACTION); load() }
    setSaving(false)
  }

  async function setStatus(id: string, status: string) {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    await fetch('/api/admin/corrective-actions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Action</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Pool</th><th>Description</th><th>Priority</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading…</td></tr>
            ) : actions.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No corrective actions logged</td></tr>
            ) : actions.map(a => (
              <tr key={a.id}>
                <td><code style={{ fontSize: '12px', color: 'var(--aqua)' }}>{a.code || '—'}</code></td>
                <td>{a.pools?.name ?? '—'}</td>
                <td style={{ maxWidth: '280px' }}>{a.description}</td>
                <td><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', background: PRIORITY_COLOUR[a.priority] + '20', color: PRIORITY_COLOUR[a.priority], textTransform: 'capitalize' }}>{a.priority}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{a.owner ? `${a.owner.first_name} ${a.owner.last_name}` : '—'}</td>
                <td style={{ color: a.status === 'overdue' ? 'var(--red)' : 'var(--text-muted)' }}>{a.due_date ?? '—'}</td>
                <td>
                  <select value={a.status} onChange={e => setStatus(a.id, e.target.value)} style={{ padding: '3px 6px', fontSize: '11px', color: STATUS_COLOUR[a.status], borderColor: STATUS_COLOUR[a.status] + '60' }}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-title">Add Corrective Action</div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label>Pool *</label>
                  <select required value={form.pool_id} onChange={e => setForm(f => ({ ...f, pool_id: e.target.value }))}>
                    <option value="">Select pool…</option>
                    {pools.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div><label>Code</label><input placeholder="CA-01" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Description *</label>
                <textarea required rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div><label>Owner</label>
                  <select value={form.owner_staff_id} onChange={e => setForm(f => ({ ...f, owner_staff_id: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {staff.map((s: any) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                  </select>
                </div>
                <div><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Action'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function RiskRegister({ pools, staff }: { pools: any[]; staff: any[] }) {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK_RISK)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    fetch('/api/admin/risk-register').then(r => r.json()).then(d => { setEntries(d.entries ?? []); setLoading(false) })
  }, [])
  useEffect(() => { load() }, [load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/risk-register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setShowModal(false); setForm(BLANK_RISK); load() }
    setSaving(false)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '480px' }}>
          AS/NZS ISO 31000-style — inherent rating (before controls) vs residual rating (after controls in place), scored 1–5 likelihood × 1–5 consequence.
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Risk</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Code</th><th>Pool</th><th>Hazard</th><th>Inherent</th><th>Residual</th><th>Owner</th><th>Review</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No risk register entries yet</td></tr>
            ) : entries.map(r => {
              const inherentScore = (r.inherent_likelihood ?? 0) * (r.inherent_consequence ?? 0)
              const residualScore = r.residual_likelihood && r.residual_consequence ? r.residual_likelihood * r.residual_consequence : null
              const inherentBand = ratingBand(inherentScore)
              const residualBand = residualScore != null ? ratingBand(residualScore) : null
              return (
                <tr key={r.id}>
                  <td><code style={{ fontSize: '12px', color: 'var(--aqua)' }}>{r.code || '—'}</code></td>
                  <td>{r.pools?.name ?? '—'}</td>
                  <td style={{ maxWidth: '260px' }}>{r.hazard_description}</td>
                  <td>{inherentScore > 0 ? <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', background: inherentBand.colour + '20', color: inherentBand.colour }}>{inherentScore} · {inherentBand.label}</span> : '—'}</td>
                  <td>{residualBand ? <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', background: residualBand.colour + '20', color: residualBand.colour }}>{residualScore} · {residualBand.label}</span> : '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.review_date ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="modal-title">Add Risk Register Entry</div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label>Pool *</label>
                  <select required value={form.pool_id} onChange={e => setForm(f => ({ ...f, pool_id: e.target.value }))}>
                    <option value="">Select pool…</option>
                    {pools.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div><label>Code</label><input placeholder="R-01" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Hazard Description *</label>
                <textarea required rows={2} value={form.hazard_description} onChange={e => setForm(f => ({ ...f, hazard_description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label>Inherent Likelihood (1–5)</label>
                  <input type="number" min={1} max={5} value={form.inherent_likelihood} onChange={e => setForm(f => ({ ...f, inherent_likelihood: Number(e.target.value) }))} />
                </div>
                <div><label>Inherent Consequence (1–5)</label>
                  <input type="number" min={1} max={5} value={form.inherent_consequence} onChange={e => setForm(f => ({ ...f, inherent_consequence: Number(e.target.value) }))} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Controls In Place</label>
                <textarea rows={2} value={form.controls_in_place} onChange={e => setForm(f => ({ ...f, controls_in_place: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label>Residual Likelihood (1–5)</label>
                  <input type="number" min={1} max={5} value={form.residual_likelihood} onChange={e => setForm(f => ({ ...f, residual_likelihood: e.target.value }))} />
                </div>
                <div><label>Residual Consequence (1–5)</label>
                  <input type="number" min={1} max={5} value={form.residual_consequence} onChange={e => setForm(f => ({ ...f, residual_consequence: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div><label>Owner</label>
                  <select value={form.owner_staff_id} onChange={e => setForm(f => ({ ...f, owner_staff_id: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {staff.map((s: any) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                  </select>
                </div>
                <div><label>Review Date</label><input type="date" value={form.review_date} onChange={e => setForm(f => ({ ...f, review_date: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add Risk'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
