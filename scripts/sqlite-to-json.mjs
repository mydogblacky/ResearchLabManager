#!/usr/bin/env node
// One-off: dump the legacy local SQLite DB into the JSON shape the
// Supabase importer (Settings → Import JSON) expects.
//
// Usage:
//   node scripts/sqlite-to-json.mjs <path-to-researchlabmanager.db> > backup.json

import Database from 'better-sqlite3'
import { existsSync } from 'node:fs'

const path = process.argv[2]
if (!path) {
  console.error('Usage: node scripts/sqlite-to-json.mjs <path-to-researchlabmanager.db> > backup.json')
  process.exit(1)
}
if (!existsSync(path)) {
  console.error(`File not found: ${path}`)
  process.exit(1)
}

const TABLES = [
  'team_members',
  'team_member_relationships',
  'phd_trackers',
  'projects',
  'project_members',
  'deliverables',
  'meeting_notes',
  'meeting_attendees',
  'kanban_tasks',
]

const db = new Database(path, { readonly: true, fileMustExist: true })
const out = {}
for (const t of TABLES) {
  try {
    out[t] = db.prepare(`SELECT * FROM ${t}`).all()
  } catch (e) {
    process.stderr.write(`warning: skipping ${t}: ${e.message}\n`)
    out[t] = []
  }
}
db.close()

process.stdout.write(JSON.stringify(out, null, 2))
process.stderr.write(`\nDumped ${TABLES.map(t => `${t}=${out[t].length}`).join(', ')}\n`)
