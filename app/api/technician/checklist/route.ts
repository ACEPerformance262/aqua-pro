import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET  — fetch checklists for the current user's pool assignments
// POST — create or update a checklist (and upsert sessions)

export async function GET(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const poolId = searchParams.get('pool_id')
  const date = searchParams.get('date') ?? new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })

  let query = supabaseAdmin
    .from('shift_checklists')
    .select('*, pools(name), shift_sessions(*)')
    .eq('checklist_date', date)
    .order('created_at', { ascending: false })

  if (poolId) query = query.eq('pool_id', poolId)
  else query = query.eq('completed_by', user.id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ checklists: data })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const isCompleted = (body.status ?? 'completed') === 'completed'

  // Build flag summary from any failed/concerning items — only evaluated on a genuinely
  // completed checklist. A partial "Save & Exit" (status: in_progress) hasn't reached every
  // step yet, so evaluating flags on it would trip false alarms (e.g. "First aid kit not OK"
  // before the technician has even reached the Equipment step) and spam management.
  const flags: string[] = []
  if (isCompleted) {
    if (body.aed_self_test === 'fail')              flags.push('AED self test FAILED')
    if (body.aed_check === 'fail')                  flags.push('AED daily check FAILED')
    if (body.safety_equipment_check === 'fail')     flags.push('Safety equipment check FAILED')
    if (body.oxygen_equipment_check === 'fail')     flags.push('Oxygen equipment check FAILED')
    if (body.water_clarity === 'concern')           flags.push('Water clarity concern')
    if (body.deck_perimeter_walk === 'issue')       flags.push('Deck perimeter issue noted')
    if (!body.first_aid_kit_ok)                     flags.push('First aid kit not OK')
  }

  const checklistPayload = {
    shift_id:               body.shift_id || null,
    pool_id:                body.pool_id,
    completed_by:           user.id,
    checklist_date:         body.checklist_date ?? new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' }),
    pre_shift_time:         body.pre_shift_time || null,
    lifeguards_on_duty:     body.lifeguards_on_duty ? Number(body.lifeguards_on_duty) : null,
    keys_retrieved:         body.keys_retrieved ?? null,
    patrol_log_signed:      body.patrol_log_signed ?? null,
    bumbag_retrieved:       body.bumbag_retrieved ?? null,
    pool_door_unlocked:     body.pool_door_unlocked ?? null,
    lights_on:              body.lights_on ?? null,
    changerooms_opened:     body.changerooms_opened ?? null,
    deck_perimeter_walk:    body.deck_perimeter_walk || null,
    deck_perimeter_notes:   body.deck_perimeter_notes || null,
    water_clarity:          body.water_clarity || null,
    water_clarity_notes:    body.water_clarity_notes || null,
    last_weekly_safety_check:   body.last_weekly_safety_check || null,
    safety_equipment_check: body.safety_equipment_check || null,
    safety_equipment_notes: body.safety_equipment_notes || null,
    throw_bags_count:       body.throw_bags_count ? Number(body.throw_bags_count) : null,
    rescue_tubes_count:     body.rescue_tubes_count ? Number(body.rescue_tubes_count) : null,
    spine_board_present:    body.spine_board_present ?? null,
    first_aid_kit_ok:       body.first_aid_kit_ok ?? null,
    last_weekly_oxygen_check:   body.last_weekly_oxygen_check || null,
    oxygen_equipment_check: body.oxygen_equipment_check || null,
    oxygen_equipment_notes: body.oxygen_equipment_notes || null,
    last_weekly_aed_check:  body.last_weekly_aed_check || null,
    aed_check:              body.aed_check || null,
    aed_self_test:          body.aed_self_test || null,
    aed_notes:              body.aed_notes || null,
    end_of_shift_time:      body.end_of_shift_time || null,
    has_flags:              flags.length > 0,
    flag_summary:           flags,
    notes:                  body.notes || null,
    status:                 body.status ?? 'completed',
    updated_at:             new Date().toISOString(),
  }

  // Upsert the checklist
  let checklistId = body.id
  if (checklistId) {
    const { error } = await supabaseAdmin.from('shift_checklists').update(checklistPayload).eq('id', checklistId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { data, error } = await supabaseAdmin
      .from('shift_checklists').insert(checklistPayload).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    checklistId = data.id
  }

  // Upsert sessions
  if (body.sessions?.length) {
    for (let i = 0; i < body.sessions.length; i++) {
      const s = body.sessions[i]
      const sessionPayload = {
        checklist_id:           checklistId,
        pool_id:                body.pool_id,
        session_number:         i + 1,
        pool_users:             s.pool_users || null,
        start_time:             s.start_time,
        finish_time:            s.finish_time || null,
        lifeguards_on_shift:    s.lifeguards_on_shift ? Number(s.lifeguards_on_shift) : null,
        lifeguard_names:        s.lifeguard_names?.filter(Boolean) ?? [],
        external_staff_on_duty: s.external_staff_on_duty ? Number(s.external_staff_on_duty) : 0,
        external_staff_names:   s.external_staff_names?.filter(Boolean) ?? [],
        reporting_required:     s.reporting_required ?? false,
        incident_description:   s.incident_description || null,
        rules_observed:         s.rules_observed ?? true,
        rules_notes:            s.rules_notes || null,
        lane_ropes_replaced:    s.lane_ropes_replaced ?? null,
        deck_perimeter_walk:    s.deck_perimeter_walk ?? null,
        changerooms_closed:     s.changerooms_closed ?? null,
        lights_off:             s.lights_off ?? null,
        bumbag_returned:        s.bumbag_returned ?? null,
        keys_replaced:          s.keys_replaced ?? null,
        notes:                  s.notes || null,
      }

      if (s.id) {
        await supabaseAdmin.from('shift_sessions').update(sessionPayload).eq('id', s.id)
      } else {
        await supabaseAdmin.from('shift_sessions').insert(sessionPayload)
      }
    }
  }

  // Notify if flags raised
  if (flags.length > 0) {
    await supabaseAdmin.from('notifications').insert({
      pool_id: body.pool_id,
      type: 'checklist_flag',
      title: `Checklist flags: ${flags[0]}${flags.length > 1 ? ` +${flags.length - 1} more` : ''}`,
      body: flags.join(', '),
    })
  }

  return NextResponse.json({ ok: true, checklist_id: checklistId, flags })
}
