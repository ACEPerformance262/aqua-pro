import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'

export type StaffRole = 'admin' | 'manager' | 'technician' | 'contractor'

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: StaffRole
}

const SESSION_COOKIE = 'aquapro_session'

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const staffId = cookieStore.get(SESSION_COOKIE)?.value
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
  return `${SESSION_COOKIE}=${staffId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`
}
