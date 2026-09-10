import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { filename, entity_type } = await req.json()
  if (!filename || !entity_type) return NextResponse.json({ error: 'filename and entity_type required' }, { status: 400 })

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${entity_type}/${Date.now()}_${safeName}`

  const { data, error } = await supabaseAdmin.storage.from('attachments').createSignedUploadUrl(filePath)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: pub } = supabaseAdmin.storage.from('attachments').getPublicUrl(filePath)
  return NextResponse.json({ path: data.path, token: data.token, publicUrl: pub.publicUrl })
}
