import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { hashPassword } from '@/lib/password'

export async function GET() {
  const user = await getSession()
  if (!user || !['admin', 'manager'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('staff')
    .select('id, email, first_name, last_name, role, phone, is_active, created_at, last_login_at')
    .order('last_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('staff')
    .insert({
      email: body.email.toLowerCase().trim(),
      password_hash: await hashPassword(body.password),
      first_name: body.first_name,
      last_name: body.last_name,
      role: body.role,
      phone: body.phone || null,
    })
    .select('id, email, first_name, last_name, role')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { id, ...updates } = body
  if (updates.password) {
    updates.password_hash = await hashPassword(updates.password)
    delete updates.password
  }

  const { data, error } = await supabaseAdmin
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ staff: data })
}
