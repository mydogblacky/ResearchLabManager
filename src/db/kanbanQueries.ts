import { supabase } from '@/supabase'
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
  const { data, error } = await supabase
    .from('kanban_tasks')
    .select('*')
    .order('position')
  if (error) throw error
  return ((data ?? []) as KanbanTaskRow[]).map(mapRow)
}

export async function createTask(task: {
  title: string
  description: string
  column: KanbanColumn
  position: number
  color: string
}): Promise<number> {
  const { data, error } = await supabase
    .from('kanban_tasks')
    .insert({
      title: task.title,
      description: task.description,
      column_name: task.column,
      position: task.position,
      color: task.color,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as number
}

export async function updateTask(
  id: number,
  task: Partial<{
    title: string
    description: string
    column: KanbanColumn
    position: number
    color: string
  }>
): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (task.title !== undefined) patch.title = task.title
  if (task.description !== undefined) patch.description = task.description
  if (task.column !== undefined) patch.column_name = task.column
  if (task.position !== undefined) patch.position = task.position
  if (task.color !== undefined) patch.color = task.color

  const { error } = await supabase.from('kanban_tasks').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: number): Promise<void> {
  const { error } = await supabase.from('kanban_tasks').delete().eq('id', id)
  if (error) throw error
}

export async function getMaxPosition(column: KanbanColumn): Promise<number> {
  const { data, error } = await supabase
    .from('kanban_tasks')
    .select('position')
    .eq('column_name', column)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data?.position ?? -1) + 1
}
