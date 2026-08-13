import crypto from 'crypto'

// IoT sensor keys were previously stored in the DB as plaintext (readable by anyone with
// a DB read, e.g. a backup leak or misconfigured RLS policy). Hashed the same way session
// cookies are signed — HMAC-SHA256 with SESSION_SECRET — so a DB read alone can't recover
// a device's live credential. The raw key is still shown to the admin once at registration;
// only the hash is ever stored or compared against on ingest.
export function hashSensorKey(rawKey: string): string {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET!).update(rawKey).digest('hex')
}
