<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BookOpen, RefreshCw, ExternalLink, AlertCircle, Search } from 'lucide-vue-next'
import { useTeamStore } from '@/stores/teamStore'
import { usePublicationStore } from '@/stores/publicationStore'
import type { TeamMember, Publication } from '@/types'

const teamStore = useTeamStore()
const publicationStore = usePublicationStore()

const expandedId = ref<number | null>(null)
const includeInactive = ref(false)
const yearFilter = ref<number | null>(null)
const typeFilter = ref<string>('')

onMounted(async () => {
  await teamStore.loadMembers()
  await publicationStore.fetchForMembers(eligibleMembers.value)
})

const eligibleMembers = computed<TeamMember[]>(() =>
  teamStore.members.filter(m => (includeInactive.value || m.is_active) && (m.ugent_id ?? '').trim() !== '')
)

const membersWithoutId = computed<TeamMember[]>(() =>
  teamStore.members.filter(m => m.is_active && (m.ugent_id ?? '').trim() === '')
)

function filteredPubs(member_id: number): Publication[] {
  const data = publicationStore.byMember[member_id]
  if (!data) return []
  return data.publications.filter(p => {
    if (yearFilter.value !== null && p.year !== yearFilter.value) return false
    if (typeFilter.value && p.type !== typeFilter.value) return false
    return true
  })
}

const totals = computed(() => {
  let total = 0
  let published = 0
  const byType: Record<string, number> = {}
  const byYear: Record<number, number> = {}
  for (const m of eligibleMembers.value) {
    const data = publicationStore.byMember[m.id]
    if (!data) continue
    for (const p of data.publications) {
      total++
      if (p.publication_status === 'published') published++
      if (p.type) byType[p.type] = (byType[p.type] ?? 0) + 1
      if (p.year) byYear[p.year] = (byYear[p.year] ?? 0) + 1
    }
  }
  return { total, published, byType, byYear }
})

const allYears = computed(() =>
  Object.keys(totals.value.byYear).map(Number).sort((a, b) => b - a)
)

const allTypes = computed(() => Object.keys(totals.value.byType).sort())

function publicationCount(memberId: number): number {
  return publicationStore.byMember[memberId]?.publications.length ?? 0
}

function memberError(memberId: number): string | undefined {
  return publicationStore.byMember[memberId]?.error
}

async function refreshAll() {
  await publicationStore.fetchForMembers(eligibleMembers.value)
}

async function refreshOne(member: TeamMember) {
  await publicationStore.fetchForMember(member)
}

function biblioUrl(p: Publication): string {
  if (p.handle) return `https://hdl.handle.net/${p.handle}`
  if (p.biblio_id) return `https://biblio.ugent.be/publication/${p.biblio_id}`
  return ''
}

function typeLabel(t: string): string {
  if (!t) return 'Other'
  return t.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
}

const someLoading = computed(() => publicationStore.loadingIds.size > 0)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text">Publications</h1>
        <p class="text-text-secondary mt-2">Pulled from Biblio UGent using each member's UGent ID</p>
      </div>
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input type="checkbox" v-model="includeInactive" class="rounded border-border" />
          Include inactive
        </label>
        <button @click="refreshAll" :disabled="someLoading" class="flex items-center gap-2 px-5 py-2.5 bg-blue text-white text-sm font-medium rounded-xl hover:bg-blue-dark transition-colors disabled:opacity-50">
          <RefreshCw :size="16" :class="someLoading ? 'animate-spin' : ''" />
          {{ someLoading ? 'Fetching...' : 'Refresh All' }}
        </button>
      </div>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-text-muted mb-2">Total Publications</div>
        <p class="text-2xl font-bold text-text">{{ totals.total }}</p>
      </div>
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-text-muted mb-2">Published</div>
        <p class="text-2xl font-bold text-text">{{ totals.published }}</p>
      </div>
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-text-muted mb-2">Members Tracked</div>
        <p class="text-2xl font-bold text-text">{{ eligibleMembers.length }}</p>
      </div>
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="text-xs uppercase tracking-wide text-text-muted mb-2">Distinct Years</div>
        <p class="text-2xl font-bold text-text">{{ allYears.length }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="totals.total > 0" class="bg-card rounded-2xl p-6 mb-8 shadow-sm">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 text-text-muted text-sm">
          <Search :size="14" />
          <span>Filters</span>
        </div>
        <select v-model="yearFilter" class="border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 bg-bg">
          <option :value="null">All years</option>
          <option v-for="y in allYears" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="typeFilter" class="border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 bg-bg">
          <option value="">All types</option>
          <option v-for="t in allTypes" :key="t" :value="t">{{ typeLabel(t) }} ({{ totals.byType[t] }})</option>
        </select>
        <button v-if="yearFilter !== null || typeFilter" @click="yearFilter = null; typeFilter = ''" class="text-xs text-text-muted hover:text-text underline">Clear</button>
      </div>
    </div>

    <!-- Members without UGent ID -->
    <div v-if="membersWithoutId.length > 0" class="bg-warning/10 border border-warning/30 rounded-2xl p-6 mb-8">
      <div class="flex items-start gap-3">
        <AlertCircle :size="18" class="text-warning shrink-0 mt-0.5" />
        <div class="text-sm">
          <p class="font-medium text-text mb-1">{{ membersWithoutId.length }} active {{ membersWithoutId.length === 1 ? 'member has' : 'members have' }} no UGent ID</p>
          <p class="text-text-secondary">
            Set a UGent ID on the Team page to include these members:
            <span class="font-medium text-text">{{ membersWithoutId.map(m => m.name).join(', ') }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Per member -->
    <div class="space-y-4">
      <div v-for="member in eligibleMembers" :key="member.id" class="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-8 py-6 cursor-pointer hover:bg-hover/50 transition-colors" @click="expandedId = expandedId === member.id ? null : member.id">
          <div class="flex items-center gap-5 min-w-0">
            <div class="w-11 h-11 rounded-full bg-hover flex items-center justify-center text-sm font-medium text-text-secondary overflow-hidden shrink-0">
              <img v-if="member.photo" :src="member.photo" class="w-full h-full object-cover" />
              <template v-else>{{ member.name.split(' ').map(n => n[0]).join('') }}</template>
            </div>
            <div class="min-w-0">
              <h3 class="font-semibold text-text">{{ member.name }}</h3>
              <p class="text-xs text-text-muted mt-0.5">UGent ID {{ member.ugent_id }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <p v-if="memberError(member.id)" class="text-xs text-danger flex items-center gap-1.5">
              <AlertCircle :size="12" /> {{ memberError(member.id) }}
            </p>
            <div v-else class="text-right">
              <p class="text-xl font-bold text-text">{{ publicationCount(member.id) }}</p>
              <p class="text-[10px] uppercase tracking-wide text-text-muted">publications</p>
            </div>
            <button
              @click.stop="refreshOne(member)"
              :disabled="publicationStore.isLoading(member.id)"
              class="p-2 rounded-lg hover:bg-hover text-text-muted transition-colors disabled:opacity-50"
              :title="`Refresh ${member.name}`"
            >
              <RefreshCw :size="14" :class="publicationStore.isLoading(member.id) ? 'animate-spin' : ''" />
            </button>
          </div>
        </div>

        <div v-if="expandedId === member.id && !memberError(member.id)" class="border-t border-border">
          <div v-if="filteredPubs(member.id).length === 0" class="px-8 py-6 text-sm text-text-muted">
            No publications match the current filters.
          </div>
          <ul v-else class="divide-y divide-border">
            <li v-for="p in filteredPubs(member.id)" :key="p.biblio_id" class="px-8 py-5">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-text leading-snug">{{ p.title || '(untitled)' }}</p>
                  <p v-if="p.authors.length > 0" class="text-xs text-text-secondary mt-1.5 leading-relaxed">{{ p.authors.join(', ') }}</p>
                  <div class="flex items-center gap-2 mt-2 flex-wrap">
                    <span v-if="p.year" class="text-[10px] font-medium px-2 py-1 rounded-md bg-hover text-text-secondary">{{ p.year }}</span>
                    <span v-if="p.type" class="text-[10px] font-medium px-2 py-1 rounded-md bg-blue/10 text-blue">{{ typeLabel(p.type) }}</span>
                    <span v-if="p.publication_status && p.publication_status !== 'published'" class="text-[10px] font-medium px-2 py-1 rounded-md bg-warning/10 text-warning">{{ p.publication_status }}</span>
                    <span v-if="p.journal" class="text-xs text-text-muted italic truncate">{{ p.journal }}</span>
                  </div>
                </div>
                <a v-if="biblioUrl(p)" :href="biblioUrl(p)" target="_blank" rel="noopener" class="p-2 rounded-lg hover:bg-hover text-text-muted hover:text-text transition-colors shrink-0" :title="p.doi || biblioUrl(p)">
                  <ExternalLink :size="14" />
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="eligibleMembers.length === 0" class="text-center py-20 text-text-secondary">
      <BookOpen :size="48" class="mx-auto mb-4 text-text-muted" />
      <p class="text-lg font-medium mb-1">No members to track</p>
      <p class="text-sm">Add a UGent ID to a team member to start tracking their publications.</p>
    </div>
  </div>
</template>
