import { describe, it, expect } from 'vitest'
import { hashSensorKey } from './sensor-key'

describe('sensor key hashing', () => {
  it('is deterministic for the same input', () => {
    const key = 'a'.repeat(64)
    expect(hashSensorKey(key)).toBe(hashSensorKey(key))
  })

  it('produces different hashes for different inputs', () => {
    expect(hashSensorKey('a'.repeat(64))).not.toBe(hashSensorKey('b'.repeat(64)))
  })

  it('never returns the raw key back', () => {
    const key = 'a'.repeat(64)
    expect(hashSensorKey(key)).not.toBe(key)
  })
})
