import bcrypt from 'bcrypt'
import { createHash } from 'crypto'

const BCRYPT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

// Pre-2026-07-27 accounts were hashed as SHA-256(password + SESSION_SECRET).
// Kept only so those accounts can still log in and get transparently upgraded.
function legacyHash(password: string): string {
  return createHash('sha256').update(password + process.env.SESSION_SECRET).digest('hex')
}

function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$/.test(hash)
}

export async function verifyPassword(password: string, storedHash: string): Promise<{ valid: boolean; legacy: boolean }> {
  if (isBcryptHash(storedHash)) {
    return { valid: await bcrypt.compare(password, storedHash), legacy: false }
  }
  return { valid: storedHash === legacyHash(password), legacy: true }
}
