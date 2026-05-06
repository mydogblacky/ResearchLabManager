import { supabase } from '@/supabase'
import type { PhdTracker, PhdTrackerWithMember } from '@/types'

export async function getAllPhdTrackers(): Promise<PhdTrackerWithMember[]> {
  const { data, error } = await supabase
    .from('phd_trackers_with_member')
    .select('*')
    .order('phd_start_date')
  if (error) throw error
  return (data ?? []) as PhdTrackerWithMember[]
}

export async function getPhdTrackerByMemberId(memberId: number): Promise<PhdTracker | undefined> {
  const { data, error } = await supabase
    .from('phd_trackers')
    .select('*')
    .eq('team_member_id', memberId)
    .maybeSingle()
  if (error) throw error
  return (data ?? undefined) as PhdTracker | undefined
}

export async function createPhdTracker(
  tracker: Omit<PhdTracker, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const { data, error } = await supabase
    .from('phd_trackers')
    .insert({
      team_member_id: tracker.team_member_id,
      phd_start_date: tracker.phd_start_date,
      expected_end_date: tracker.expected_end_date,
      status: tracker.status,
      milestones: tracker.milestones,
      chapters: tracker.chapters,
      notes: tracker.notes,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as number
}

export async function updatePhdTracker(
  id: number,
  tracker: Partial<Omit<PhdTracker, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('phd_trackers')
    .update(tracker)
    .eq('id', id)
  if (error) throw error
}

export async function deletePhdTracker(id: number): Promise<void> {
  const { error } = await supabase.from('phd_trackers').delete().eq('id', id)
  if (error) throw error
}
