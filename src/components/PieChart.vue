<script setup lang="ts">
import { computed } from 'vue'

interface Slice {
  label: string
  value: number
  color?: string
}

const props = defineProps<{
  data: Slice[]
  size?: number
  highlightLabel?: string
}>()

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#eab308', '#64748b', '#0ea5e9',
]

const size = computed(() => props.size ?? 160)
const radius = computed(() => size.value / 2)
const cx = computed(() => radius.value)
const cy = computed(() => radius.value)

const total = computed(() =>
  props.data.reduce((sum, s) => sum + (s.value > 0 ? s.value : 0), 0)
)

interface RenderedSlice {
  label: string
  value: number
  pct: number
  color: string
  path: string
  highlighted: boolean
}

const slices = computed<RenderedSlice[]>(() => {
  const items = props.data.filter(s => s.value > 0)
  if (items.length === 0 || total.value === 0) return []

  // Single full-circle slice — SVG arcs can't draw a 360° arc, so use a circle path.
  if (items.length === 1) {
    const s = items[0]
    return [{
      label: s.label,
      value: s.value,
      pct: 100,
      color: s.color ?? PALETTE[0],
      path: `M ${cx.value} ${cy.value - radius.value} a ${radius.value} ${radius.value} 0 1 1 0 ${radius.value * 2} a ${radius.value} ${radius.value} 0 1 1 0 -${radius.value * 2} Z`,
      highlighted: props.highlightLabel === s.label,
    }]
  }

  let cumulative = 0
  return items.map((s, i) => {
    const fraction = s.value / total.value
    const startAngle = cumulative * Math.PI * 2 - Math.PI / 2
    cumulative += fraction
    const endAngle = cumulative * Math.PI * 2 - Math.PI / 2

    const x1 = cx.value + radius.value * Math.cos(startAngle)
    const y1 = cy.value + radius.value * Math.sin(startAngle)
    const x2 = cx.value + radius.value * Math.cos(endAngle)
    const y2 = cy.value + radius.value * Math.sin(endAngle)
    const largeArc = fraction > 0.5 ? 1 : 0

    return {
      label: s.label,
      value: s.value,
      pct: fraction * 100,
      color: s.color ?? PALETTE[i % PALETTE.length],
      path: `M ${cx.value} ${cy.value} L ${x1} ${y1} A ${radius.value} ${radius.value} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      highlighted: props.highlightLabel === s.label,
    }
  })
})

function formatPct(pct: number): string {
  if (pct >= 10) return pct.toFixed(0)
  return pct.toFixed(1)
}
</script>

<template>
  <div v-if="slices.length === 0" class="flex items-center justify-center text-xs text-text-muted" :style="{ height: size + 'px' }">
    No data
  </div>
  <div v-else class="flex items-center gap-5">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="shrink-0">
      <path
        v-for="s in slices"
        :key="s.label"
        :d="s.path"
        :fill="s.color"
        :stroke="s.highlighted ? '#0f172a' : '#ffffff'"
        :stroke-width="s.highlighted ? 2 : 1"
        class="transition-opacity"
      >
        <title>{{ s.label }}: {{ s.value }} ({{ formatPct(s.pct) }}%)</title>
      </path>
    </svg>
    <ul class="text-xs space-y-1.5 min-w-0">
      <li v-for="s in slices" :key="s.label" class="flex items-center gap-2">
        <span class="inline-block w-2.5 h-2.5 rounded-sm shrink-0" :style="{ backgroundColor: s.color }"></span>
        <span :class="['truncate', s.highlighted ? 'font-semibold text-text' : 'text-text-secondary']">{{ s.label }}</span>
        <span class="text-text-muted ml-auto pl-2 tabular-nums">{{ s.value }} · {{ formatPct(s.pct) }}%</span>
      </li>
    </ul>
  </div>
</template>
