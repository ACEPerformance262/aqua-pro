import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { classifyRisk } from '@/lib/water-chemistry'
import type { PoolType, SanitiserType, WaterTestValues } from '@/lib/water-chemistry'

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const poolId = searchParams.get('pool_id')
  const riskLevel = searchParams.get('risk_level')
  const limit = Number(searchParams.get('limit') ?? 50)

  let query = supabaseAdmin
    .from('water_tests')
    .select('*, pools(name, pool_type, sanitiser_type, volume_litres), staff(first_name, last_name)')
    .order('tested_at', { ascending: false })
    .limit(limit)

  if (poolId) query = query.eq('pool_id', poolId)
  if (riskLevel) query = query.eq('risk_level', riskLevel)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tests: data })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Fetch pool for type/sanitiser info
  const { data: pool } = await supabaseAdmin
    .from('pools')
    .select('pool_type, sanitiser_type, volume_litres')
    .eq('id', body.pool_id)
    .single()

  const values: WaterTestValues = {
    freeChlorine: body.free_chlorine ?? undefined,
    combinedChlorine: body.combined_chlorine ?? undefined,
    totalChlorine: body.total_chlorine ?? undefined,
    bromine: body.bromine ?? undefined,
    ph: body.ph ?? undefined,
    totalAlkalinity: body.total_alkalinity ?? undefined,
    calciumHardness: body.calcium_hardness ?? undefined,
    cyanuricAcid: body.cyanuric_acid ?? undefined,
    totalDissolvedSolids: body.total_dissolved_solids ?? undefined,
    saltLevel: body.salt_level ?? undefined,
    phosphates: body.phosphates ?? undefined,
    temperatureC: body.temperature_c ?? undefined,
    turbidity: body.turbidity ?? undefined,
  }

  const poolType = (pool?.pool_type ?? 'outdoor') as PoolType
  const sanitiserType = (pool?.sanitiser_type ?? 'chlorine') as SanitiserType
  const { riskLevel, flags } = classifyRisk(values, poolType, sanitiserType)

  const { data, error } = await supabaseAdmin
    .from('water_tests')
    .insert({
      pool_id: body.pool_id,
      tested_by: user.id,
      test_source: body.test_source ?? 'manual',
      tested_at: body.tested_at ?? new Date().toISOString(),
      free_chlorine: body.free_chlorine ?? null,
      combined_chlorine: body.combined_chlorine ?? null,
      total_chlorine: body.total_chlorine ?? null,
      bromine: body.bromine ?? null,
      ph: body.ph ?? null,
      total_alkalinity: body.total_alkalinity ?? null,
      calcium_hardness: body.calcium_hardness ?? null,
      cyanuric_acid: body.cyanuric_acid ?? null,
      total_dissolved_solids: body.total_dissolved_solids ?? null,
      salt_level: body.salt_level ?? null,
      phosphates: body.phosphates ?? null,
      temperature_c: body.temperature_c ?? null,
      turbidity: body.turbidity ?? null,
      risk_level: riskLevel,
      risk_flags: flags,
      notes: body.notes ?? null,
    })
    .select('*, pools(name, pool_type, sanitiser_type, volume_litres)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Alert if red/orange risk
  if (riskLevel === 'red' || riskLevel === 'orange') {
    // Fire-and-forget notification
    supabaseAdmin.from('notifications').insert({
      pool_id: body.pool_id,
      type: 'water_risk',
      title: `${riskLevel === 'red' ? '🚨 CLOSE POOL' : '⚠️ Action Required'} — ${data?.pools?.name}`,
      body: `Water test flagged ${flags.join(', ')} as out of range.`,
    }).then(() => {})
  }

  return NextResponse.json({ test: data })
}
