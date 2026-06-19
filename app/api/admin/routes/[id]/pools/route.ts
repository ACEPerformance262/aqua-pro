import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession()
  if (!user || !['admin', 'manager'].includes(user.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: routeId } = await params
  const body = await req.json()

  if (body.action === 'remove') {
    const { error } = await supabaseAdmin
      .from('route_pools')
      .delete()
      .eq('route_id', routeId)
      .eq('pool_id', body.pool_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (body.action === 'reorder') {
    const updates = (body.pools as { pool_id: string; visit_order: number }[]).map(p =>
      supabaseAdmin
        .from('route_pools')
        .update({ visit_order: p.visit_order })
        .eq('route_id', routeId)
        .eq('pool_id', p.pool_id)
    )
    await Promise.all(updates)
    return NextResponse.json({ success: true })
  }

  // Add pool to route
  const { data, error } = await supabaseAdmin
    .from('route_pools')
    .insert({
      route_id: routeId,
      pool_id: body.pool_id,
      visit_order: body.visit_order ?? 999,
      service_frequency: body.service_frequency ?? 'weekly',
    })
    .select('*, pools(name, site_code, address)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pool: data })
}
