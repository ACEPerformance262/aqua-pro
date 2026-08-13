// Runs before any test file is imported — needed because lib/supabase.ts creates its
// clients at module-eval time, which happens before a test file's own beforeAll() runs.
process.env.SESSION_SECRET ??= 'test-secret-not-real'
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-key'
