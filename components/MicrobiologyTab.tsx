'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, FlaskConical } from 'lucide-react'

const TEST_TYPE_LABELS: Record<string, string> = {
  e_coli: 'E. coli',
  pseudomonas_aeruginosa: 'Pseudomonas aeruginosa',
  hcc: 'HCC (Heterotrophic Colony Count)',
  legionella: 'Legionella',
  other: 'Other',
}

const STATUS_COLOUR: Record<string, string> = { pending: '#fdcb6e', pass: '#00b894', fail: '#d63031' }

const BLANK = { pool_id: '', test_type: 'e_coli', lab_name: '', lab_reference: '', notes: '' }

export default function MicrobiologyTab() {
  const [tests, setTests] = useState<any[]>([])
  const [pools, setPools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [resultDraft, setResultDraft] = useState<Record<string, { result_value: string; pass_fail: string }>>({})

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/admin/microbiology').then(r => r.json()),
      fetch('/api/admin/pools').then(r => r.json()),
    ]).then(([t, p]) => {
      setTests(t.tests ?? [])
      setPools(p.pools ?? [])
      setLoading(false)
    })
  }, [])
  useEffect(() => { load() }, [load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/microbiology', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { setShowModal(false); setForm(BLANK); load() }
    setSaving(false)
  }

  async function recordResult(id: string) {
    const draft = resultDraft[id]
    if (!draft?.pass_fail) return
    await fetch('/api/admin/microbiology', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, result_value: draft.result_value, pass_fail: draft.pass_fail }),
    })
    setResultDraft(prev => { const n = { ...prev }; delete n[id]; return n })
    load()
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '520px' }}>
          Lab-turnaround microbiology testing — log a sample when it's taken, then record the pass/fail result once the lab reports back. Separate from routine chemical water tests, which are instant-reading.
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Sample
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pool</th><th>Test</th><th>Sample Taken</th><th>Lab</th><th>Result</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading…</td></tr>
            ) : tests.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No microbiology samples logged yet</td></tr>
            ) : tests.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: '600' }}>{t.pools?.name ?? '—'}</td>
                <td>{TEST_TYPE_LABELS[t.test_type] ?? t.test_type}</td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(t.sample_taken_at).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney' })}</td>
                <td style={{ color: 'var(--text-muted)' }}>{t.lab_name || '—'}</td>
                <td>
                  {t.pass_fail === 'pending' ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input type="number" placeholder="CFU" style={{ width: '70px', padding: '4px 6px', fontSize: '12px' }}
                        value={resultDraft[t.id]?.result_value ?? ''}
                        onChange={e => setResultDraft(prev => ({ ...prev, [t.id]: { result_value: e.target.value, pass_fail: prev[t.id]?.pass_fail ?? '' } }))} />
                      <select style={{ padding: '4px 6px', fontSize: '12px' }}
                        value={resultDraft[t.id]?.pass_fail ?? ''}
                        onChange={e => setResultDraft(prev => ({ ...prev, [t.id]: { result_value: prev[t.id]?.result_value ?? '', pass_fail: e.target.value } }))}>
                        <option value="">Result…</option>
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                      </select>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => recordResult(t.id)}>Save</button>
                    </div>
                  ) : (
                    <span>{t.result_value != null ? `${t.result_value} ${t.result_unit ?? 'cfu/100ml'}` : '—'}</span>
                  )}
                </td>
                <td>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', background: STATUS_COLOUR[t.pass_fail] + '20', color: STATUS_COLOUR[t.pass_fail], border: `1px solid ${STATUS_COLOUR[t.pass_fail]}40`, textTransform: 'capitalize' }}>
                    {t.pass_fail}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-title"><FlaskConical size={18} style={{ verticalAlign: '-3px', marginRight: '6px' }} />Log Microbiology Sample</div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '16px' }}>
                <label>Pool *</label>
                <select required value={form.pool_id} onChange={e => setForm(f => ({ ...f, pool_id: e.target.value }))}>
                  <option value="">Select pool…</option>
                  {pools.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Test Type *</label>
                <select required value={form.test_type} onChange={e => setForm(f => ({ ...f, test_type: e.target.value }))}>
                  {Object.entries(TEST_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label>Lab Name</label>
                  <input value={form.lab_name} onChange={e => setForm(f => ({ ...f, lab_name: e.target.value }))} />
                </div>
                <div>
                  <label>Lab Reference #</label>
                  <input value={form.lab_reference} onChange={e => setForm(f => ({ ...f, lab_reference: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label>Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Log Sample'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
