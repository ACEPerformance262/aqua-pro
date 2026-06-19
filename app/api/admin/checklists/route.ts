import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user || !['admin', 'manager'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const poolId    = searchParams.get('pool_id')
  const dateFrom  = searchParams.get('date_from')
  const dateTo    = searchParams.get('date_to')
  const flagsOnly = searchParams.get('flags_only') === 'true'
  const withId    = searchParams.get('id')

  if (withId) {
    const { data, error } = await supabaseAdmin
      .from('shift_checklists')
      .select('*, pools(name, pool_type, sanitiser_type), staff(first_name, last_name), shift_sessions(*)')
      .eq('id', withId)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ checklist: data })
  }

  let query = supabaseAdmin
    .from('shift_checklists')
    .select('*, pools(name), staff(first_name, last_name), shift_sessions(id, session_number, pool_users, start_time, finish_time, reporting_required)')
    .order('checklist_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (poolId)    query = query.eq('pool_id', poolId)
  if (dateFrom)  query = query.gte('checklist_date', dateFrom)
  if (dateTo)    query = query.lte('checklist_date', dateTo)
  if (flagsOnly) query = query.eq('has_flags', true)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ checklists: data })
}
