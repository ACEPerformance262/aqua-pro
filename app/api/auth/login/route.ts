import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { setSessionCookie } from '@/lib/auth'

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw + process.env.SESSION_SECRET).digest('hex')
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const { data: staff } = await supabaseAdmin
    .from('staff')
    .select('id, role, first_name, last_name, is_active, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!staff || !staff.is_active) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  if (staff.password_hash !== hashPassword(password)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const redirect = staff.role === 'technician' ? '/technician'
    : staff.role === 'contractor' ? '/contractor'
    : staff.role === 'pool_manager' ? '/pool-manager'
    : '/admin'

  const res = NextResponse.json({ ok: true, redirect })
  res.headers.set('Set-Cookie', setSessionCookie(staff.id))
  return res
}
