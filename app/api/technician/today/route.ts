import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tz = 'Australia/Sydney'
  const today = new Date().toLocaleDateString('en-CA', { timeZone: tz })
  const start = `${today}T00:00:00`
  const end = `${today}T23:59:59`

  const { data, error } = await supabaseAdmin
    .from('shifts')
    .select('*, pools(name, address, suburb, pool_type, sanitiser_type, volume_litres, site_code)')
    .eq('staff_id', user.id)
    .gte('scheduled_start', start)
    .lte('scheduled_start', end)
    .order('scheduled_start')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ shifts: data })
}
