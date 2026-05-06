import { supabase } from '@/supabase'
import type { Project, ProjectMember, Deliverable, DeliverableWithAssignee } from '@/types'

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('name')
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data ?? undefined) as Project | undefined
}

export async function createProject(
  project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: project.name,
      description: project.description,
      funding: project.funding,
      budget: project.budget,
      person_months: project.person_months,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
      color: project.color,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as number
}

export async function updateProject(
  id: number,
  project: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase.from('projects').update(project).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: number): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function getProjectMembers(
  projectId: number
): Promise<(ProjectMember & { member_name: string })[]> {
  const { data, error } = await supabase
    .from('project_members_with_name')
    .select('*')
    .eq('project_id', projectId)
    .order('member_name')
  if (error) throw error
  return (data ?? []) as (ProjectMember & { member_name: string })[]
}

export async function addProjectMember(
  projectId: number,
  teamMemberId: number,
  roleInProject: string
): Promise<void> {
  const { error } = await supabase.from('project_members').insert({
    project_id: projectId,
    team_member_id: teamMemberId,
    role_in_project: roleInProject,
  })
  if (error) throw error
}

export async function removeProjectMember(
  projectId: number,
  teamMemberId: number
): Promise<void> {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('team_member_id', teamMemberId)
  if (error) throw error
}

export async function getProjectDeliverables(projectId: number): Promise<Deliverable[]> {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date')
  if (error) throw error
  return (data ?? []) as Deliverable[]
}

export async function getAllUpcomingDeliverables(limit = 10): Promise<DeliverableWithAssignee[]> {
  const { data, error } = await supabase
    .from('deliverables_with_assignee')
    .select('*')
    .neq('status', 'completed')
    .order('due_date', { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as DeliverableWithAssignee[]
}

export async function createDeliverable(
  deliverable: Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const { data, error } = await supabase
    .from('deliverables')
    .insert({
      project_id: deliverable.project_id,
      title: deliverable.title,
      description: deliverable.description,
      due_date: deliverable.due_date,
      status: deliverable.status,
      assigned_to: deliverable.assigned_to,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as number
}

export async function updateDeliverable(
  id: number,
  deliverable: Partial<Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('deliverables')
    .update(deliverable)
    .eq('id', id)
  if (error) throw error
}

export async function deleteDeliverable(id: number): Promise<void> {
  const { error } = await supabase.from('deliverables').delete().eq('id', id)
  if (error) throw error
}

export async function getProjectCount(): Promise<number> {
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  if (error) throw error
  return count ?? 0
}
