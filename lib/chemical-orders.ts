import { supabaseAdmin } from './supabase'

// If a chemical has dropped to/below its reorder point, queue it on the To Order
// list — unless it's already pending or ordered there, so this is safe to call
// after every stock change (usage logging, manual update, stock take, edit).
export async function queueIfLowStock(chemicalId: string) {
  const { data: chemical } = await supabaseAdmin
    .from('chemicals')
    .select('current_stock, reorder_point')
    .eq('id', chemicalId)
    .single()

  if (!chemical || !chemical.reorder_point || Number(chemical.current_stock) > Number(chemical.reorder_point)) return

  const { data: existing } = await supabaseAdmin
    .from('chemical_orders')
    .select('id')
    .eq('chemical_id', chemicalId)
    .in('status', ['pending', 'ordered'])
    .limit(1)

  if (existing && existing.length > 0) return

  await supabaseAdmin.from('chemical_orders').insert({ chemical_id: chemicalId, status: 'pending' })
}
