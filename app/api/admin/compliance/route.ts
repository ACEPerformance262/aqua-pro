import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const poolId = searchParams.get('pool_id')

  let query = supabaseAdmin
    .from('compliance_events')
    .select('*, pools(name), compliance_requirements(authority), staff(first_name, last_name)')
    .order('due_date')

  if (status) query = query.eq('status', status)
  if (poolId) query = query.eq('pool_id', poolId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || !['admin', 'manager'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('compliance_events')
    .insert({
      pool_id: body.pool_id,
      requirement_id: body.requirement_id || null,
      event_type: body.event_type,
      due_date: body.due_date,
      status: body.status ?? 'pending',
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body
  if (updates.status === 'completed' && !updates.completed_date) {
    updates.completed_date = new Date().toISOString().slice(0, 10)
    updates.completed_by = user.id
  }

  const { data, error } = await supabaseAdmin
    .from('compliance_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}
