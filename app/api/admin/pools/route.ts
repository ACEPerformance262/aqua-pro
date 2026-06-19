import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const includeRisk = searchParams.get('include_risk') === 'true'

  let query = supabaseAdmin
    .from('pools')
    .select('*, pool_managers:staff(first_name, last_name)')
    .eq('is_active', true)
    .order('name')

  const { data: pools, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (includeRisk) {
    // Attach latest risk level from water_tests
    const poolIds = pools?.map(p => p.id) ?? []
    if (poolIds.length > 0) {
      const { data: latestTests } = await supabaseAdmin
        .from('water_tests')
        .select('pool_id, risk_level, tested_at')
        .in('pool_id', poolIds)
        .order('tested_at', { ascending: false })

      const latestByPool: Record<string, string> = {}
      latestTests?.forEach(t => {
        if (!latestByPool[t.pool_id]) latestByPool[t.pool_id] = t.risk_level
      })

      const poolsWithRisk = pools?.map(p => ({ ...p, latest_risk: latestByPool[p.id] ?? null }))
      return NextResponse.json({ pools: poolsWithRisk })
    }
  }

  return NextResponse.json({ pools })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || !['admin', 'manager'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('pools')
    .insert({
      name: body.name,
      site_code: body.site_code,
      address: body.address,
      suburb: body.suburb || null,
      state: body.state || null,
      postcode: body.postcode || null,
      pool_type: body.pool_type,
      sanitiser_type: body.sanitiser_type,
      volume_litres: body.volume_litres ? Number(body.volume_litres) : null,
      surface_area_m2: body.surface_area_m2 ? Number(body.surface_area_m2) : null,
      max_bather_load: body.max_bather_load ? Number(body.max_bather_load) : null,
      owner_name: body.owner_name || null,
      owner_email: body.owner_email || null,
      owner_phone: body.owner_phone || null,
      is_commercial: body.is_commercial ?? false,
      health_licence_number: body.health_licence_number || null,
      licence_expiry: body.licence_expiry || null,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pool: data })
}
