import { describe, it, expect } from 'vitest'
import { sign, parseCookie, setSessionCookie } from './auth'

describe('session cookie signing', () => {
  it('round-trips a valid signed value back to the original staffId', () => {
    const staffId = '11111111-1111-1111-1111-111111111111'
    const signed = `${staffId}.${sign(staffId)}`
    expect(parseCookie(signed)).toBe(staffId)
  })

  it('rejects a bare unsigned staffId (legacy cookie format)', () => {
    const staffId = '11111111-1111-1111-1111-111111111111'
    expect(parseCookie(staffId)).toBeNull()
  })

  it('rejects a tampered staffId with a mismatched signature', () => {
    const staffId = '11111111-1111-1111-1111-111111111111'
    const otherStaffId = '22222222-2222-2222-2222-222222222222'
    const forged = `${otherStaffId}.${sign(staffId)}`
    expect(parseCookie(forged)).toBeNull()
  })

  it('rejects a tampered signature', () => {
    const staffId = '11111111-1111-1111-1111-111111111111'
    const tampered = `${staffId}.${'0'.repeat(64)}`
    expect(parseCookie(tampered)).toBeNull()
  })

  it('setSessionCookie produces a value parseCookie accepts', () => {
    const staffId = '33333333-3333-3333-3333-333333333333'
    const cookieHeader = setSessionCookie(staffId)
    const value = cookieHeader.split(';')[0].split('=')[1]
    expect(parseCookie(value)).toBe(staffId)
  })
})
