import { describe, it, expect } from 'vitest'
import { createHash } from 'crypto'
import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('hashes and verifies a bcrypt password', async () => {
    const hash = await hashPassword('correct horse battery staple')
    const { valid, legacy } = await verifyPassword('correct horse battery staple', hash)
    expect(valid).toBe(true)
    expect(legacy).toBe(false)
  })

  it('rejects the wrong password against a bcrypt hash', async () => {
    const hash = await hashPassword('correct horse battery staple')
    const { valid } = await verifyPassword('wrong password', hash)
    expect(valid).toBe(false)
  })

  it('recognizes and verifies a legacy SHA-256 hash, flagging it for upgrade', async () => {
    const password = 'legacy-password'
    const legacyHash = createHash('sha256').update(password + process.env.SESSION_SECRET).digest('hex')
    const { valid, legacy } = await verifyPassword(password, legacyHash)
    expect(valid).toBe(true)
    expect(legacy).toBe(true)
  })

  it('rejects the wrong password against a legacy hash', async () => {
    const legacyHash = createHash('sha256').update('right-password' + process.env.SESSION_SECRET).digest('hex')
    const { valid } = await verifyPassword('wrong-password', legacyHash)
    expect(valid).toBe(false)
  })
})
