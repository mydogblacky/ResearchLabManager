import { supabase } from '@/supabase'
import type { TeamMember, TeamMemberRelationship } from '@/types'

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('name')
  if (error) throw error
  return (data ?? []) as TeamMember[]
}

export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', 1)
    .order('name')
  if (error) throw error
  return (data ?? []) as TeamMember[]
}

export async function getTeamMemberById(id: number): Promise<TeamMember | undefined> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data ?? undefined) as TeamMember | undefined
}

export async function createTeamMember(
  member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      name: member.name,
      role: member.role,
      function_title: member.function_title,
      email: member.email,
      photo: member.photo,
      start_date: member.start_date,
      is_active: member.is_active,
      ugent_id: member.ugent_id ?? '',
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as number
}

export async function updateTeamMember(
  id: number,
  member: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .update(member)
    .eq('id', id)
  if (error) throw error
}

export async function deleteTeamMember(id: number): Promise<void> {
  const { error } = await supabase.from('team_members').delete().eq('id', id)
  if (error) throw error
}

export async function getTeamMemberCount(): Promise<number> {
  const { count, error } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', 1)
  if (error) throw error
  return count ?? 0
}

export async function getAllRelationships(): Promise<TeamMemberRelationship[]> {
  const { data, error } = await supabase
    .from('team_member_relationships')
    .select('*')
  if (error) throw error
  return (data ?? []) as TeamMemberRelationship[]
}

export async function setParent(memberId: number, parentId: number): Promise<void> {
  const { error } = await supabase
    .from('team_member_relationships')
    .upsert(
      { member_id: memberId, parent_id: parentId },
      { onConflict: 'member_id' }
    )
  if (error) throw error
}

export async function removeParent(memberId: number): Promise<void> {
  const { error } = await supabase
    .from('team_member_relationships')
    .delete()
    .eq('member_id', memberId)
  if (error) throw error
}
