import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('staff_unavailability')
    .select('*, member:staff_id(first_name, last_name, role), approver:approved_by(first_name, last_name)')
    .order('start_date')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unavailability: data })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('staff_unavailability')
    .insert({
      staff_id: body.staff_id || user.id,
      start_date: body.start_date,
      end_date: body.end_date,
      reason: body.reason || null,
    })
    .select('*, member:staff_id(first_name, last_name, role)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unavailability: data })
}

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user || !['admin', 'manager'].includes(user.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, action, ...updates } = body
  if (action === 'approve') updates.approved_by = user.id

  const { data, error } = await supabaseAdmin
    .from('staff_unavailability')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unavailability: data })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession()
  if (!user || !['admin', 'manager'].includes(user.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('staff_unavailability').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
