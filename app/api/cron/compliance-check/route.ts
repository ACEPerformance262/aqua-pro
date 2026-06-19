import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, buildComplianceDueEmail } from '@/lib/email'

// Runs daily — marks overdue events and sends alerts to admin/manager staff
// Trigger: cron job calling GET /api/cron/compliance-check with Authorization header

export async function GET(req: NextRequest) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })
  const sevenDaysOut = new Date()
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7)
  const sevenDays = sevenDaysOut.toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })

  // Mark overdue
  const { data: overdueRows } = await supabaseAdmin
    .from('compliance_events')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_date', today)
    .select('id')
  const markedOverdue = overdueRows?.length ?? 0

  // Fetch events due within 7 days (for email alerts)
  const { data: dueSoon } = await supabaseAdmin
    .from('compliance_events')
    .select('*, pools(name, owner_email)')
    .in('status', ['pending'])
    .gte('due_date', today)
    .lte('due_date', sevenDays)
    .order('due_date')

  // Get admin/manager emails
  const { data: admins } = await supabaseAdmin
    .from('staff')
    .select('email')
    .in('role', ['admin', 'manager'])
    .eq('is_active', true)

  const adminEmails = admins?.map(a => a.email) ?? []

  let emailsSent = 0
  for (const event of dueSoon ?? []) {
    const html = buildComplianceDueEmail(
      event.pools?.name ?? 'Unknown Pool',
      event.event_type,
      event.due_date,
      `${appUrl}/admin`
    )
    for (const email of adminEmails) {
      try {
        await sendEmail(email, `Compliance Due: ${event.event_type} — ${event.pools?.name}`, html)
        emailsSent++
      } catch {}
    }
  }

  return NextResponse.json({
    ok: true,
    markedOverdue: markedOverdue ?? 0,
    alertsSent: emailsSent,
    dueSoonCount: dueSoon?.length ?? 0,
  })
}
