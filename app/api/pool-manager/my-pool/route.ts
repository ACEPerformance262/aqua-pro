import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: pool } = await supabaseAdmin
    .from('pools')
    .select('*')
    .eq('pool_manager_id', user.id)
    .single()

  if (!pool) return NextResponse.json({ pool: null })

  const [testsRes, complianceRes] = await Promise.all([
    supabaseAdmin
      .from('water_tests')
      .select('*')
      .eq('pool_id', pool.id)
      .order('tested_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('compliance_events')
      .select('*, compliance_requirements(authority)')
      .eq('pool_id', pool.id)
      .order('due_date')
      .limit(20),
  ])

  return NextResponse.json({
    pool,
    recentTests: testsRes.data ?? [],
    compliance: complianceRes.data ?? [],
  })
}
