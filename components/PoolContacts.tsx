'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Pencil, Phone, Mail, Star } from 'lucide-react'

interface Contact {
  id: string
  contact_type: string
  name: string
  organisation: string | null
  phone: string | null
  email: string | null
  is_primary: boolean
  notes: string | null
}

const CONTACT_TYPE_LABELS: Record<string, string> = {
  facility_manager: 'Facility Manager',
  service_provider: 'Service Provider',
  gas_supplier: 'Gas Supplier',
  chemical_supplier: 'Chemical Supplier',
  laboratory: 'Laboratory',
  electrical_hvac: 'Electrical / HVAC',
  emergency_services: 'Emergency Services',
  other: 'Other',
}

const BLANK = { contact_type: 'facility_manager', name: '', organisation: '', phone: '', email: '', is_primary: false, notes: '' }

// Emergency contact tree for one pool — deliberately embedded in the Pool edit modal rather than
// a separate top-level tab, since every contact here only ever makes sense in the context of one
// specific site.
export default function PoolContacts({ poolId }: { poolId: string }) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    fetch(`/api/admin/pool-contacts?pool_id=${poolId}`).then(r => r.json()).then(d => {
      setContacts(d.contacts ?? [])
      setLoading(false)
    })
  }, [poolId])
  useEffect(() => { load() }, [load])

  function openAdd() { setEditing(null); setForm(BLANK); setShowForm(true) }
  function openEdit(c: Contact) {
    setEditing(c)
    setForm({ contact_type: c.contact_type, name: c.name, organisation: c.organisation ?? '', phone: c.phone ?? '', email: c.email ?? '', is_primary: c.is_primary, notes: c.notes ?? '' })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/pool-contacts', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...form } : { pool_id: poolId, ...form }),
    })
    if (res.ok) { setShowForm(false); load() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setContacts(prev => prev.filter(c => c.id !== id))
    await fetch(`/api/admin/pool-contacts?id=${id}`, { method: 'DELETE' })
  }

  return (
    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>Emergency Contact Tree</div>
        <button type="button" className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={openAdd}>
          <Plus size={13} /> Add Contact
        </button>
      </div>

      {loading ? (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading…</div>
      ) : contacts.length === 0 ? (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No contacts recorded for this site yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {contacts.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: '8px', fontSize: '12px' }}>
              {c.is_primary && <Star size={12} fill="var(--aqua)" color="var(--aqua)" />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text)' }}>
                  {c.name} <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>· {CONTACT_TYPE_LABELS[c.contact_type] ?? c.contact_type}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {c.organisation && <span>{c.organisation}</span>}
                  {c.phone && <span><Phone size={10} style={{ verticalAlign: '-1px' }} /> {c.phone}</span>}
                  {c.email && <span><Mail size={10} style={{ verticalAlign: '-1px' }} /> {c.email}</span>}
                </div>
              </div>
              <button type="button" onClick={() => openEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><Pencil size={13} /></button>
              <button type="button" onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '4px' }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--surface-2)', borderRadius: '8px' }} onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label>Type</label>
                <select value={form.contact_type} onChange={e => setForm(f => ({ ...f, contact_type: e.target.value }))}>
                  {Object.entries(CONTACT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label>Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label>Organisation</label>
                <input value={form.organisation} onChange={e => setForm(f => ({ ...f, organisation: e.target.value }))} />
              </div>
              <div>
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 'auto' }} checked={form.is_primary} onChange={e => setForm(f => ({ ...f, is_primary: e.target.checked }))} />
                  Primary contact for this site
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
