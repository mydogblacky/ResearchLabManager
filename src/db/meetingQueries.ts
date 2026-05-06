import { supabase } from '@/supabase'
import type { MeetingNote, MeetingNoteWithDetails } from '@/types'

type MeetingRow = MeetingNote & { project_name: string | null; phd_member_name: string | null }
type AttendeeRow = { meeting_id: number; team_member_id: number; team_members: { name: string } | null }

async function attachAttendees(notes: MeetingRow[]): Promise<MeetingNoteWithDetails[]> {
  if (notes.length === 0) return []
  const ids = notes.map(n => n.id)
  const { data, error } = await supabase
    .from('meeting_attendees')
    .select('meeting_id, team_member_id, team_members(name)')
    .in('meeting_id', ids)
  if (error) throw error

  const byMeeting = new Map<number, { team_member_id: number; name: string }[]>()
  for (const row of (data ?? []) as unknown as AttendeeRow[]) {
    const list = byMeeting.get(row.meeting_id) ?? []
    list.push({ team_member_id: row.team_member_id, name: row.team_members?.name ?? '' })
    byMeeting.set(row.meeting_id, list)
  }
  for (const list of byMeeting.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }
  return notes.map(n => ({ ...n, attendees: byMeeting.get(n.id) ?? [] }))
}

export async function getAllMeetingNotes(): Promise<MeetingNoteWithDetails[]> {
  const { data, error } = await supabase
    .from('meeting_notes_with_details')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return attachAttendees((data ?? []) as MeetingRow[])
}

export async function getMeetingNoteById(id: number): Promise<MeetingNoteWithDetails | undefined> {
  const { data, error } = await supabase
    .from('meeting_notes_with_details')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return undefined
  const [withAttendees] = await attachAttendees([data as MeetingRow])
  return withAttendees
}

export async function createMeetingNote(
  note: Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>,
  attendeeIds: number[]
): Promise<number> {
  const { data, error } = await supabase
    .from('meeting_notes')
    .insert({
      title: note.title,
      date: note.date,
      content: note.content,
      project_id: note.project_id,
      phd_tracker_id: note.phd_tracker_id,
    })
    .select('id')
    .single()
  if (error) throw error
  const meetingId = data.id as number

  if (attendeeIds.length > 0) {
    const rows = attendeeIds.map(team_member_id => ({ meeting_id: meetingId, team_member_id }))
    const { error: attErr } = await supabase.from('meeting_attendees').insert(rows)
    if (attErr) throw attErr
  }
  return meetingId
}

export async function updateMeetingNote(
  id: number,
  note: Partial<Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>>,
  attendeeIds?: number[]
): Promise<void> {
  if (Object.keys(note).length > 0) {
    const { error } = await supabase.from('meeting_notes').update(note).eq('id', id)
    if (error) throw error
  }

  if (attendeeIds !== undefined) {
    const { error: delErr } = await supabase
      .from('meeting_attendees')
      .delete()
      .eq('meeting_id', id)
    if (delErr) throw delErr

    if (attendeeIds.length > 0) {
      const rows = attendeeIds.map(team_member_id => ({ meeting_id: id, team_member_id }))
      const { error: insErr } = await supabase.from('meeting_attendees').insert(rows)
      if (insErr) throw insErr
    }
  }
}

export async function deleteMeetingNote(id: number): Promise<void> {
  const { error } = await supabase.from('meeting_notes').delete().eq('id', id)
  if (error) throw error
}

export async function getMeetingNotesByPhdTrackerId(
  phdTrackerId: number
): Promise<MeetingNoteWithDetails[]> {
  const { data, error } = await supabase
    .from('meeting_notes_with_details')
    .select('*')
    .eq('phd_tracker_id', phdTrackerId)
    .order('date', { ascending: false })
  if (error) throw error
  return attachAttendees((data ?? []) as MeetingRow[])
}

export async function getMeetingNoteCount(): Promise<number> {
  const { count, error } = await supabase
    .from('meeting_notes')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}
