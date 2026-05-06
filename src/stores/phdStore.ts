import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PhdTracker, PhdTrackerWithMember } from '@/types'
import * as phdQueries from '@/db/phdQueries'
import { subscribeToTables, debounce } from '@/db/realtime'

export const usePhdStore = defineStore('phd', () => {
  const trackers = ref<PhdTrackerWithMember[]>([])
  const loading = ref(false)
  let subscribed = false

  const refresh = debounce(async () => {
    trackers.value = await phdQueries.getAllPhdTrackers()
  })

  function ensureSubscribed() {
    if (subscribed) return
    subscribed = true
    subscribeToTables('phd', ['phd_trackers', 'team_members'], refresh)
  }

  async function loadTrackers() {
    loading.value = true
    trackers.value = await phdQueries.getAllPhdTrackers()
    loading.value = false
    ensureSubscribed()
  }

  async function addTracker(tracker: Omit<PhdTracker, 'id' | 'created_at' | 'updated_at'>) {
    await phdQueries.createPhdTracker(tracker)
    trackers.value = await phdQueries.getAllPhdTrackers()
  }

  async function updateTracker(id: number, tracker: Partial<Omit<PhdTracker, 'id' | 'created_at' | 'updated_at'>>) {
    await phdQueries.updatePhdTracker(id, tracker)
    trackers.value = await phdQueries.getAllPhdTrackers()
  }

  async function deleteTracker(id: number) {
    await phdQueries.deletePhdTracker(id)
    trackers.value = await phdQueries.getAllPhdTrackers()
  }

  return { trackers, loading, loadTrackers, addTracker, updateTracker, deleteTracker }
})
