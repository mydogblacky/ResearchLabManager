<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Banknote, Wallet, Users, FolderKanban } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projectStore'
import type { Project, FundingBreakdown } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'

const projectStore = useProjectStore()

onMounted(() => projectStore.loadProjects())

const currencyFmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const numberFmt = new Intl.NumberFormat('en-IE', { maximumFractionDigits: 1 })

function fundingLabel(funding: string) {
  return funding.trim() === '' ? 'Unspecified' : funding
}

const breakdowns = computed<FundingBreakdown[]>(() => {
  const groups = new Map<string, Project[]>()
  for (const p of projectStore.projects) {
    const key = fundingLabel(p.funding || '')
    const arr = groups.get(key) ?? []
    arr.push(p)
    groups.set(key, arr)
  }
  return Array.from(groups.entries())
    .map(([funding, projects]) => ({
      funding,
      project_count: projects.length,
      total_budget: projects.reduce((s, p) => s + (Number(p.budget) || 0), 0),
      total_person_months: projects.reduce((s, p) => s + (Number(p.person_months) || 0), 0),
      projects,
    }))
    .sort((a, b) => b.total_budget - a.total_budget)
})

const totals = computed(() => ({
  budget: breakdowns.value.reduce((s, b) => s + b.total_budget, 0),
  person_months: breakdowns.value.reduce((s, b) => s + b.total_person_months, 0),
  projects: projectStore.projects.length,
  funding_sources: breakdowns.value.length,
}))

const maxGroupBudget = computed(() => Math.max(1, ...breakdowns.value.map(b => b.total_budget)))
</script>

<template>
  <div v-if="projectStore.loading && projectStore.projects.length === 0" class="flex items-center justify-center h-64 text-text-secondary">Loading...</div>
  <div v-else>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-text">Budget Estimation</h1>
      <p class="text-text-secondary mt-2">Breakdown of project budget and person months grouped by funding source</p>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-3 text-text-muted mb-2"><Wallet :size="16" /><span class="text-xs uppercase tracking-wide">Total Budget</span></div>
        <p class="text-2xl font-bold text-text">{{ currencyFmt.format(totals.budget) }}</p>
      </div>
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-3 text-text-muted mb-2"><Users :size="16" /><span class="text-xs uppercase tracking-wide">Person Months</span></div>
        <p class="text-2xl font-bold text-text">{{ numberFmt.format(totals.person_months) }}</p>
      </div>
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-3 text-text-muted mb-2"><FolderKanban :size="16" /><span class="text-xs uppercase tracking-wide">Projects</span></div>
        <p class="text-2xl font-bold text-text">{{ totals.projects }}</p>
      </div>
      <div class="bg-card rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-3 text-text-muted mb-2"><Banknote :size="16" /><span class="text-xs uppercase tracking-wide">Funding Sources</span></div>
        <p class="text-2xl font-bold text-text">{{ totals.funding_sources }}</p>
      </div>
    </div>

    <!-- Per funding -->
    <div class="space-y-6">
      <div v-for="b in breakdowns" :key="b.funding" class="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div class="px-8 py-6 border-b border-border">
          <div class="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h3 class="text-lg font-semibold text-text">{{ b.funding }}</h3>
              <p class="text-xs text-text-muted mt-1">{{ b.project_count }} {{ b.project_count === 1 ? 'project' : 'projects' }}</p>
            </div>
            <div class="flex items-center gap-8">
              <div class="text-right">
                <p class="text-[11px] text-text-muted uppercase tracking-wide">Budget</p>
                <p class="text-base font-semibold text-text">{{ currencyFmt.format(b.total_budget) }}</p>
              </div>
              <div class="text-right">
                <p class="text-[11px] text-text-muted uppercase tracking-wide">Person Months</p>
                <p class="text-base font-semibold text-text">{{ numberFmt.format(b.total_person_months) }}</p>
              </div>
            </div>
          </div>
          <div class="h-2 rounded-full bg-hover overflow-hidden">
            <div class="h-full bg-blue rounded-full" :style="{ width: `${(b.total_budget / maxGroupBudget) * 100}%` }" />
          </div>
        </div>
        <div class="px-8 py-5">
          <div class="space-y-2">
            <div v-for="p in b.projects" :key="p.id" class="flex items-center justify-between gap-4 px-4 py-3 rounded-xl hover:bg-hover/60 transition-colors">
              <div class="flex items-center gap-4 min-w-0">
                <div class="w-2.5 h-8 rounded-full shrink-0" :style="{ backgroundColor: p.color }" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-text truncate">{{ p.name }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <StatusBadge :status="p.status" />
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-8 shrink-0 text-right">
                <div class="w-28">
                  <p class="text-[11px] text-text-muted uppercase tracking-wide">Budget</p>
                  <p class="text-sm text-text">{{ currencyFmt.format(Number(p.budget) || 0) }}</p>
                </div>
                <div class="w-28">
                  <p class="text-[11px] text-text-muted uppercase tracking-wide">Person Months</p>
                  <p class="text-sm text-text">{{ numberFmt.format(Number(p.person_months) || 0) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="breakdowns.length === 0" class="text-center py-20 text-text-secondary">
      <Banknote :size="48" class="mx-auto mb-4 text-text-muted" />
      <p class="text-lg font-medium mb-1">No projects yet</p>
      <p class="text-sm">Add projects with a budget and funding source to see a breakdown here.</p>
    </div>
  </div>
</template>
