import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import type { Publication, MemberPublications, TeamMember } from '@/types'

export const usePublicationStore = defineStore('publication', () => {
  const byMember = ref<Record<number, MemberPublications>>({})
  const loadingIds = ref<Set<number>>(new Set())

  function setLoading(memberId: number, loading: boolean) {
    const next = new Set(loadingIds.value)
    if (loading) next.add(memberId)
    else next.delete(memberId)
    loadingIds.value = next
  }

  function isLoading(memberId: number): boolean {
    return loadingIds.value.has(memberId)
  }

  async function fetchForMember(member: TeamMember): Promise<MemberPublications> {
    const ugentId = (member.ugent_id ?? '').trim()
    const base: MemberPublications = {
      member_id: member.id,
      member_name: member.name,
      ugent_id: ugentId,
      publications: [],
      fetched_at: new Date().toISOString(),
    }

    if (!ugentId) {
      const result = { ...base, error: 'No UGent ID set for this member.' }
      byMember.value[member.id] = result
      return result
    }

    setLoading(member.id, true)
    try {
      const publications = await invoke<Publication[]>('fetch_biblio_publications', { ugentId })
      const result = { ...base, publications }
      byMember.value[member.id] = result
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const result = { ...base, error: message }
      byMember.value[member.id] = result
      return result
    } finally {
      setLoading(member.id, false)
    }
  }

  async function fetchForMembers(members: TeamMember[]) {
    await Promise.all(members.map(m => fetchForMember(m)))
  }

  function clear() {
    byMember.value = {}
  }

  return { byMember, loadingIds, isLoading, fetchForMember, fetchForMembers, clear }
})
