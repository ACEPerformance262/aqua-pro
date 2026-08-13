import { cookies } from 'next/headers'
import crypto from 'crypto'
import { supabaseAdmin } from './supabase'

export type StaffRole = 'admin' | 'manager' | 'technician' | 'contractor' | 'pool_manager'

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: StaffRole
}

const SESSION_COOKIE = 'aquapro_session'

// Cookie value is `${staffId}.${hmac}` — a bare staff UUID is never trusted on its own.
// Without this, anyone who obtains a staffId (log line, screenshot, referrer) could set
// that cookie directly and impersonate the account with zero verification.
export function sign(staffId: string): string {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET!).update(staffId).digest('hex')
}

export function parseCookie(value: string): string | null {
  const dot = value.lastIndexOf('.')
  if (dot === -1) return null // legacy unsigned cookie — treat as logged out, forces re-login
  const staffId = value.slice(0, dot)
  const sig = value.slice(dot + 1)
  const expected = sign(staffId)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  return staffId
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null
  const staffId = parseCookie(raw)
  if (!staffId) return null

  const { data } = await supabaseAdmin
    .from('staff')
    .select('id, email, first_name, last_name, role, is_active')
    .eq('id', staffId)
    .eq('is_active', true)
    .single()

  if (!data) return null

  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role as StaffRole,
  }
}

export function requireRole(user: SessionUser | null, allowed: StaffRole[]): boolean {
  if (!user) return false
  return allowed.includes(user.role)
}

export function setSessionCookie(staffId: string) {
  const value = `${staffId}.${sign(staffId)}`
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`
}
