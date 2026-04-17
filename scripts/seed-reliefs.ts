import { createClient } from '@supabase/supabase-js'
import { RELIEFS_MASTER } from '../lib/tax/reliefs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedReliefs() {
  console.log(`Seeding ${RELIEFS_MASTER.length} reliefs...`)

  const rows = RELIEFS_MASTER.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    name_ms: r.name,
    description: r.description,
    max_amount: r.maxAmount,
    category: r.category,
    ruling_citation: r.ruling_citation,
    ruling_url: r.ruling_url,
    active: true,
  }))

  const { error } = await supabase
    .from('reliefs_master')
    .upsert(rows, { onConflict: 'id' })

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log('Done! Reliefs seeded successfully.')
}

seedReliefs()
