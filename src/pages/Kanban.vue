<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Plus, X, GripVertical, Trash2, Pencil } from 'lucide-vue-next'
import { useKanbanStore } from '@/stores/kanbanStore'
import type { KanbanTask, KanbanColumn } from '@/types'

const store = useKanbanStore()
const loaded = ref(false)

const columns: { key: KanbanColumn; label: string; color: string; headerColor: string }[] = [
  { key: 'todo', label: 'To Do', color: 'bg-blue/10', headerColor: 'text-blue' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-warning/10', headerColor: 'text-warning' },
  { key: 'done', label: 'Done', color: 'bg-success/10', headerColor: 'text-success' },
]

const taskColors = ['', '#4f6ef7', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899']

function tasksByColumn(col: KanbanColumn) {
  return store.tasks.filter(t => t.column === col).sort((a, b) => a.position - b.position)
}

onMounted(async () => {
  await store.loadTasks()
  loaded.value = true
})

// --- Add task ---
const addingTo = ref<KanbanColumn | null>(null)
const newTitle = ref('')
const newTitleInput = ref<HTMLInputElement | null>(null)

async function startAdding(col: KanbanColumn) {
  addingTo.value = col
  newTitle.value = ''
  await nextTick()
  newTitleInput.value?.focus()
}

async function confirmAdd() {
  if (!newTitle.value.trim() || !addingTo.value) return
  await store.addTask(newTitle.value.trim(), addingTo.value)
  newTitle.value = ''
  addingTo.value = null
}

function cancelAdd() {
  addingTo.value = null
  newTitle.value = ''
}

// --- Edit task ---
const editingTask = ref<KanbanTask | null>(null)
const editTitle = ref('')
const editDescription = ref('')
const editColor = ref('')

function openEdit(task: KanbanTask) {
  editingTask.value = task
  editTitle.value = task.title
  editDescription.value = task.description
  editColor.value = task.color
}

async function saveEdit() {
  if (!editingTask.value || !editTitle.value.trim()) return
  await store.updateTask(editingTask.value.id, {
    title: editTitle.value.trim(),
    description: editDescription.value.trim(),
    color: editColor.value,
  })
  editingTask.value = null
}

function cancelEdit() {
  editingTask.value = null
}

async function handleDelete(id: number) {
  await store.deleteTask(id)
  editingTask.value = null
}

// --- Drag and drop ---
const dragTask = ref<KanbanTask | null>(null)
const dragOverColumn = ref<KanbanColumn | null>(null)
const dragOverIndex = ref<number>(-1)

function onDragStart(e: DragEvent, task: KanbanTask) {
  dragTask.value = task
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(task.id))
  }
}

function onDragOverColumn(e: DragEvent, col: KanbanColumn) {
  e.preventDefault()
  if (!dragTask.value) return
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverColumn.value = col

  // Calculate drop index from mouse Y position relative to card elements
  const container = (e.currentTarget as HTMLElement).querySelector('[data-task-list]') as HTMLElement | null
  if (!container) {
    dragOverIndex.value = tasksByColumn(col).length
    return
  }

  const cards = Array.from(container.querySelectorAll('[data-task-card]')) as HTMLElement[]
  const mouseY = e.clientY
  let index = cards.length // default: drop at end

  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    if (mouseY < midY) {
      index = i
      break
    }
  }

  dragOverIndex.value = index
}

async function onDrop(e: DragEvent, col: KanbanColumn) {
  e.preventDefault()
  if (!dragTask.value) return
  const targetIndex = dragOverIndex.value >= 0 ? dragOverIndex.value : tasksByColumn(col).length
  await store.moveTask(dragTask.value.id, col, targetIndex)
  dragTask.value = null
  dragOverColumn.value = null
  dragOverIndex.value = -1
}

function onDragEnd() {
  dragTask.value = null
  dragOverColumn.value = null
  dragOverIndex.value = -1
}

const columnTaskCounts = computed(() => {
  const counts: Record<KanbanColumn, number> = { todo: 0, in_progress: 0, done: 0 }
  for (const t of store.tasks) counts[t.column]++
  return counts
})
</script>

<template>
  <div v-if="!loaded" class="flex items-center justify-center h-64 text-text-secondary">Loading...</div>
  <div v-else class="flex flex-col h-full">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-text">Kanban Board</h1>
      <p class="text-text-secondary mt-2 text-sm">Manage your tasks and to-dos.</p>
    </div>

    <div class="flex-1 grid grid-cols-3 gap-6 min-h-0 pb-4">
      <div
        v-for="col in columns"
        :key="col.key"
        class="flex flex-col min-h-0 rounded-2xl bg-hover/40 p-4"
        @dragover.prevent="onDragOverColumn($event, col.key)"
        @drop.prevent="onDrop($event, col.key)"
      >
        <!-- Column header -->
        <div class="flex items-center justify-between mb-4 px-1">
          <div class="flex items-center gap-2.5">
            <div :class="['w-2.5 h-2.5 rounded-full', col.key === 'todo' ? 'bg-blue' : col.key === 'in_progress' ? 'bg-warning' : 'bg-success']" />
            <h2 class="text-sm font-semibold text-text">{{ col.label }}</h2>
            <span class="text-xs text-text-muted bg-hover rounded-full px-2 py-0.5">{{ columnTaskCounts[col.key] }}</span>
          </div>
          <button
            @click="startAdding(col.key)"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-hover transition-colors"
          >
            <Plus :size="16" />
          </button>
        </div>

        <!-- Tasks list -->
        <div data-task-list class="flex-1 overflow-y-auto space-y-2.5 min-h-0">
          <!-- Drop indicator at top -->
          <div
            v-if="dragOverColumn === col.key && dragOverIndex === 0 && dragTask"
            class="h-1 bg-blue/40 rounded-full mx-2"
          />

          <template v-for="(task, idx) in tasksByColumn(col.key)" :key="task.id">
            <div
              data-task-card
              :class="[
                'group bg-card rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
                dragTask?.id === task.id ? 'opacity-30' : '',
              ]"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
            >
              <div class="flex items-start gap-2">
                <GripVertical :size="14" class="text-text-muted mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-medium text-text leading-snug break-words">{{ task.title }}</p>
                    <button
                      @click.stop="openEdit(task)"
                      class="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-hover text-text-muted hover:text-text transition-all shrink-0"
                    >
                      <Pencil :size="13" />
                    </button>
                  </div>
                  <p v-if="task.description" class="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">{{ task.description }}</p>
                </div>
              </div>
              <div v-if="task.color" class="mt-3">
                <div :style="{ backgroundColor: task.color }" class="w-full h-1 rounded-full opacity-60" />
              </div>
            </div>

            <!-- Drop indicator between cards -->
            <div
              v-if="dragOverColumn === col.key && dragOverIndex === idx + 1 && dragTask && dragTask.id !== task.id"
              class="h-1 bg-blue/40 rounded-full mx-2"
            />
          </template>

          <!-- Add task inline form -->
          <div v-if="addingTo === col.key" class="bg-card rounded-xl p-4 shadow-sm">
            <input
              ref="newTitleInput"
              v-model="newTitle"
              @keydown.enter="confirmAdd"
              @keydown.escape="cancelAdd"
              placeholder="Task title..."
              class="w-full text-sm text-text bg-transparent outline-none placeholder:text-text-muted"
            />
            <div class="flex items-center gap-2 mt-3">
              <button @click="confirmAdd" class="px-4 py-1.5 bg-blue text-white text-xs font-medium rounded-lg hover:bg-blue-dark transition-colors">
                Add
              </button>
              <button @click="cancelAdd" class="px-4 py-1.5 text-xs text-text-secondary rounded-lg hover:bg-hover transition-colors">
                Cancel
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="tasksByColumn(col.key).length === 0 && addingTo !== col.key"
            class="flex flex-col items-center justify-center py-10 text-text-muted"
          >
            <p class="text-xs">No tasks</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit modal -->
    <Teleport to="body">
      <div v-if="editingTask" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50" @click.self="cancelEdit">
        <div class="bg-card rounded-2xl w-full max-w-md shadow-xl p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-text">Edit Task</h3>
            <button @click="cancelEdit" class="p-1.5 rounded-lg hover:bg-hover text-text-muted hover:text-text transition-colors">
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-5">
            <div>
              <label class="block text-xs font-medium text-text-secondary mb-1.5">Title</label>
              <input
                v-model="editTitle"
                @keydown.enter="saveEdit"
                class="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
              <textarea
                v-model="editDescription"
                rows="3"
                class="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-text bg-transparent focus:outline-none focus:ring-2 focus:ring-blue/30 resize-none"
                placeholder="Add a description..."
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-text-secondary mb-1.5">Color label</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="c in taskColors"
                  :key="c"
                  @click="editColor = c"
                  :class="[
                    'w-7 h-7 rounded-full border-2 transition-all',
                    editColor === c ? 'border-text scale-110' : 'border-transparent hover:scale-105',
                    c === '' ? 'bg-hover' : '',
                  ]"
                  :style="c ? { backgroundColor: c } : {}"
                >
                  <X v-if="c === '' && editColor === ''" :size="12" class="text-text-muted mx-auto" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-8">
            <button @click="handleDelete(editingTask!.id)" class="flex items-center gap-1.5 px-4 py-2 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors">
              <Trash2 :size="14" />
              Delete
            </button>
            <div class="flex items-center gap-2">
              <button @click="cancelEdit" class="px-5 py-2.5 text-sm text-text-secondary rounded-xl hover:bg-hover transition-colors">
                Cancel
              </button>
              <button @click="saveEdit" class="px-5 py-2.5 bg-blue text-white text-sm font-medium rounded-xl hover:bg-blue-dark transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
