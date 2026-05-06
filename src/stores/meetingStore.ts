import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MeetingNote, MeetingNoteWithDetails } from '@/types'
import * as meetingQueries from '@/db/meetingQueries'
import { subscribeToTables, debounce } from '@/db/realtime'

export const useMeetingStore = defineStore('meeting', () => {
  const notes = ref<MeetingNoteWithDetails[]>([])
  const loading = ref(false)
  let subscribed = false

  const refresh = debounce(async () => {
    notes.value = await meetingQueries.getAllMeetingNotes()
  })

  function ensureSubscribed() {
    if (subscribed) return
    subscribed = true
    subscribeToTables(
      'meeting',
      ['meeting_notes', 'meeting_attendees'],
      refresh
    )
  }

  async function loadNotes() {
    loading.value = true
    notes.value = await meetingQueries.getAllMeetingNotes()
    loading.value = false
    ensureSubscribed()
  }

  async function addNote(note: Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>, attendeeIds: number[]): Promise<number> {
    const id = await meetingQueries.createMeetingNote(note, attendeeIds)
    notes.value = await meetingQueries.getAllMeetingNotes()
    return id
  }

  async function updateNote(id: number, note: Partial<Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>>, attendeeIds?: number[]) {
    await meetingQueries.updateMeetingNote(id, note, attendeeIds)
    notes.value = await meetingQueries.getAllMeetingNotes()
  }

  async function deleteNote(id: number) {
    await meetingQueries.deleteMeetingNote(id)
    notes.value = await meetingQueries.getAllMeetingNotes()
  }

  async function getNotesByPhdTracker(phdTrackerId: number): Promise<MeetingNoteWithDetails[]> {
    return await meetingQueries.getMeetingNotesByPhdTrackerId(phdTrackerId)
  }

  return { notes, loading, loadNotes, addNote, updateNote, deleteNote, getNotesByPhdTracker }
})
