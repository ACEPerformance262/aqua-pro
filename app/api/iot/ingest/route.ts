import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { classifyRisk } from '@/lib/water-chemistry'
import type { PoolType, SanitiserType, WaterTestValues } from '@/lib/water-chemistry'

// IoT sensor ingest endpoint — no user auth required, uses sensor_key
// Compatible with any device that can POST JSON (WaterGuru, Lovibond, custom Arduino, etc.)
//
// Payload: { sensor_key, free_chlorine?, ph?, total_alkalinity?, calcium_hardness?,
//            cyanuric_acid?, combined_chlorine?, salt_level?, phosphates?,
//            temperature_c?, turbidity?, total_dissolved_solids? }

export async function POST(req: NextRequest) {
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { sensor_key, ...readings } = body
  if (!sensor_key) return NextResponse.json({ error: 'sensor_key required' }, { status: 400 })

  // Validate sensor
  const { data: sensor } = await supabaseAdmin
    .from('iot_sensors')
    .select('id, pool_id, is_active, pools(pool_type, sanitiser_type, volume_litres, name)')
    .eq('sensor_key', sensor_key)
    .single()

  if (!sensor || !sensor.is_active) return NextResponse.json({ error: 'Invalid or inactive sensor' }, { status: 401 })

  // Update last_seen
  await supabaseAdmin.from('iot_sensors').update({ last_seen_at: new Date().toISOString() }).eq('id', sensor.id)

  const pool = sensor.pools as any
  const values: WaterTestValues = {
    freeChlorine: readings.free_chlorine ?? undefined,
    combinedChlorine: readings.combined_chlorine ?? undefined,
    bromine: readings.bromine ?? undefined,
    ph: readings.ph ?? undefined,
    totalAlkalinity: readings.total_alkalinity ?? undefined,
    calciumHardness: readings.calcium_hardness ?? undefined,
    cyanuricAcid: readings.cyanuric_acid ?? undefined,
    totalDissolvedSolids: readings.total_dissolved_solids ?? undefined,
    saltLevel: readings.salt_level ?? undefined,
    phosphates: readings.phosphates ?? undefined,
    temperatureC: readings.temperature_c ?? undefined,
    turbidity: readings.turbidity ?? undefined,
  }

  const { riskLevel, flags } = classifyRisk(
    values,
    (pool?.pool_type ?? 'outdoor') as PoolType,
    (pool?.sanitiser_type ?? 'chlorine') as SanitiserType
  )

  const { data: test, error } = await supabaseAdmin
    .from('water_tests')
    .insert({
      pool_id: sensor.pool_id,
      tested_by: null,
      test_source: 'iot',
      tested_at: readings.timestamp ?? new Date().toISOString(),
      free_chlorine: readings.free_chlorine ?? null,
      combined_chlorine: readings.combined_chlorine ?? null,
      bromine: readings.bromine ?? null,
      ph: readings.ph ?? null,
      total_alkalinity: readings.total_alkalinity ?? null,
      calcium_hardness: readings.calcium_hardness ?? null,
      cyanuric_acid: readings.cyanuric_acid ?? null,
      total_dissolved_solids: readings.total_dissolved_solids ?? null,
      salt_level: readings.salt_level ?? null,
      phosphates: readings.phosphates ?? null,
      temperature_c: readings.temperature_c ?? null,
      turbidity: readings.turbidity ?? null,
      risk_level: riskLevel,
      risk_flags: flags,
    })
    .select('id, risk_level, risk_flags')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Alert if red/orange
  if (riskLevel === 'red' || riskLevel === 'orange') {
    await supabaseAdmin.from('notifications').insert({
      pool_id: sensor.pool_id,
      type: 'water_risk',
      title: `${riskLevel === 'red' ? '🚨 CLOSE POOL' : '⚠️ Action Required'} — ${pool?.name} (IoT)`,
      body: `Sensor detected ${flags.join(', ')} out of range.`,
    })
  }

  return NextResponse.json({ ok: true, test_id: test?.id, risk_level: riskLevel, flags })
}
