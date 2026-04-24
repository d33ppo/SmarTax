import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { RELIEFS_MASTER } from '../lib/tax/reliefs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedReliefs() {
  console.log(`Seeding ${RELIEFS_MASTER.length} reliefs...`)

  const rows = RELIEFS_MASTER.map((r) => ({
    code: r.code,

    name_en: r.name_en,
    name_ms: r.name_ms,

    category: r.category,
    max_amount: r.maxAmount,
    per_unit: r.perUnit ?? false,

    applies_to: r.appliesTo,

    ita_section: r.citation.itaSection,
    public_ruling: r.citation.publicRuling ?? null,
    citation_url: r.citation.url ?? null,

    requires: r.eligibilityRules.requires ?? [],
    description_en: r.eligibilityRules.description_en,
    description_ms: r.eligibilityRules.description_ms,

    lhdn_ref: r.lhdnRef,

    valid_from: r.validFrom,
    valid_until: r.validUntil ?? null,

    sub_limits: r.subLimits ?? null,
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
