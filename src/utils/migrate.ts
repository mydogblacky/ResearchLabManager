import { supabase } from '@/supabase'

const ORDER = [
  'team_members',
  'team_member_relationships',
  'phd_trackers',
  'projects',
  'project_members',
  'deliverables',
  'meeting_notes',
  'meeting_attendees',
  'kanban_tasks',
] as const

type TableName = (typeof ORDER)[number]
type ImportPayload = Partial<Record<TableName, Record<string, unknown>[]>>

export async function exportAllTablesAsJson(): Promise<string> {
  const out: Record<string, unknown[]> = {}
  for (const table of ORDER) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) throw error
    out[table] = data ?? []
  }
  return JSON.stringify(out, null, 2)
}

export async function importFromJson(payload: ImportPayload): Promise<void> {
  for (const table of [...ORDER].reverse()) {
    const { error } = await supabase.from(table).delete().gt('id', 0)
    if (error) throw new Error(`Clearing ${table}: ${error.message}`)
  }

  for (const table of ORDER) {
    const rows = payload[table]
    if (!Array.isArray(rows) || rows.length === 0) continue
    const sanitized = rows.map(row => {
      const { created_at: _c, updated_at: _u, ...rest } = row as Record<string, unknown>
      return rest
    })
    const { error } = await supabase.from(table).insert(sanitized)
    if (error) throw new Error(`Inserting into ${table}: ${error.message}`)
  }

  const { error: seqErr } = await supabase.rpc('reset_id_sequences')
  if (seqErr) throw new Error(`Resetting sequences: ${seqErr.message}`)
}
