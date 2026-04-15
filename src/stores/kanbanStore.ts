import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { KanbanTask, KanbanColumn } from '@/types'
import * as kanbanQueries from '@/db/kanbanQueries'

export const useKanbanStore = defineStore('kanban', () => {
  const tasks = ref<KanbanTask[]>([])
  const loading = ref(false)

  async function loadTasks() {
    loading.value = true
    tasks.value = await kanbanQueries.getAllTasks()
    loading.value = false
  }

  async function addTask(title: string, column: KanbanColumn, description = '', color = '') {
    const position = await kanbanQueries.getMaxPosition(column)
    await kanbanQueries.createTask({ title, description, column, position, color })
    tasks.value = await kanbanQueries.getAllTasks()
  }

  async function updateTask(id: number, data: Partial<{ title: string; description: string; column: KanbanColumn; position: number; color: string }>) {
    await kanbanQueries.updateTask(id, data)
    tasks.value = await kanbanQueries.getAllTasks()
  }

  async function moveTask(id: number, toColumn: KanbanColumn, toPosition: number) {
    // Reorder: shift positions in the target column
    const colTasks = tasks.value
      .filter(t => t.column === toColumn && t.id !== id)
      .sort((a, b) => a.position - b.position)

    // Insert at the given position
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    colTasks.splice(toPosition, 0, { ...task, column: toColumn })

    // Batch update positions
    for (let i = 0; i < colTasks.length; i++) {
      if (colTasks[i].position !== i || colTasks[i].column !== toColumn || colTasks[i].id === id) {
        await kanbanQueries.updateTask(colTasks[i].id, { column: toColumn, position: i })
      }
    }

    tasks.value = await kanbanQueries.getAllTasks()
  }

  async function deleteTask(id: number) {
    await kanbanQueries.deleteTask(id)
    tasks.value = await kanbanQueries.getAllTasks()
  }

  return { tasks, loading, loadTasks, addTask, updateTask, moveTask, deleteTask }
})
