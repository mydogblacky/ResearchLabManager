import { getDb } from './database'
import type { KanbanTask, KanbanColumn } from '@/types'

interface KanbanTaskRow {
  id: number
  title: string
  description: string
  column_name: string
  position: number
  color: string
  created_at: string
  updated_at: string
}

function mapRow(row: KanbanTaskRow): KanbanTask {
  return { ...row, column: row.column_name as KanbanColumn }
}

export async function getAllTasks(): Promise<KanbanTask[]> {
  const db = await getDb()
  const rows = await db.select<KanbanTaskRow[]>('SELECT * FROM kanban_tasks ORDER BY position')
  return rows.map(mapRow)
}

export async function createTask(task: { title: string; description: string; column: KanbanColumn; position: number; color: string }): Promise<number> {
  const db = await getDb()
  const result = await db.execute(
    `INSERT INTO kanban_tasks (title, description, column_name, position, color) VALUES ($1, $2, $3, $4, $5)`,
    [task.title, task.description, task.column, task.position, task.color]
  )
  return result.lastInsertId ?? 0
}

export async function updateTask(id: number, task: Partial<{ title: string; description: string; column: KanbanColumn; position: number; color: string }>): Promise<void> {
  const db = await getDb()
  const fields: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (task.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(task.title) }
  if (task.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(task.description) }
  if (task.column !== undefined) { fields.push(`column_name = $${paramIndex++}`); values.push(task.column) }
  if (task.position !== undefined) { fields.push(`position = $${paramIndex++}`); values.push(task.position) }
  if (task.color !== undefined) { fields.push(`color = $${paramIndex++}`); values.push(task.color) }

  fields.push(`updated_at = datetime('now')`)
  values.push(id)

  await db.execute(
    `UPDATE kanban_tasks SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  )
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM kanban_tasks WHERE id = $1', [id])
}

export async function getMaxPosition(column: KanbanColumn): Promise<number> {
  const db = await getDb()
  const result = await db.select<{ max_pos: number | null }[]>(
    'SELECT MAX(position) as max_pos FROM kanban_tasks WHERE column_name = $1',
    [column]
  )
  return (result[0]?.max_pos ?? -1) + 1
}
