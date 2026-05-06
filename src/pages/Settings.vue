<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Upload, Check, AlertTriangle, LogOut, Cloud } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { exportAllTablesAsJson, importFromJson } from '@/utils/migrate'

const router = useRouter()
const auth = useAuthStore()

const exportStatus = ref<'idle' | 'success' | 'error'>('idle')
const importStatus = ref<'idle' | 'success' | 'error'>('idle')
const importError = ref('')

async function handleExport() {
  try {
    const json = await exportAllTablesAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `research-lab-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    exportStatus.value = 'success'
    setTimeout(() => { exportStatus.value = 'idle' }, 3000)
  } catch (err) {
    console.error(err)
    exportStatus.value = 'error'
    setTimeout(() => { exportStatus.value = 'idle' }, 3000)
  }
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importFromJson(data)
      importStatus.value = 'success'
      importError.value = ''
      setTimeout(() => { importStatus.value = 'idle' }, 3000)
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      importStatus.value = 'error'
      importError.value = err instanceof Error ? err.message : 'Import failed'
      setTimeout(() => { importStatus.value = 'idle' }, 8000)
    }
  }
  input.click()
}

async function handleSignOut() {
  await auth.signOut()
  router.replace('/login')
}
</script>

<template>
  <div>
    <div class="mb-10">
      <h1 class="text-2xl font-bold text-text">Settings</h1>
      <p class="text-text-secondary mt-2">Manage your data and account</p>
    </div>

    <div class="max-w-2xl space-y-16">
      <!-- Account -->
      <div class="bg-card rounded-2xl p-10 shadow-sm">
        <div class="flex items-start gap-6">
          <div class="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
            <Cloud :size="22" class="text-blue" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold text-text">Account</h2>
            <p class="text-sm text-text-secondary mt-2 mb-4 leading-relaxed">
              You are signed in to the shared lab database. All edits are visible to everyone in your lab in real time.
            </p>
            <div class="bg-hover/60 rounded-xl px-5 py-3.5 mb-5 overflow-hidden">
              <p class="text-[11px] text-text-muted mb-1 uppercase tracking-wide">Signed in as</p>
              <p class="text-sm text-text font-mono truncate">{{ auth.user?.email ?? '—' }}</p>
            </div>
            <button
              @click="handleSignOut"
              class="flex items-center gap-2 px-5 py-2.5 border border-border text-sm text-text-secondary rounded-xl hover:bg-hover transition-colors"
            >
              <LogOut :size="16" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="bg-card rounded-2xl p-10 shadow-sm">
        <div class="flex items-start gap-6">
          <div class="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
            <Download :size="22" class="text-blue" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold text-text">Export Data</h2>
            <p class="text-sm text-text-secondary mt-2 mb-5 leading-relaxed">
              Download a JSON snapshot of all lab data — useful for backups or moving between Supabase projects.
            </p>
            <button @click="handleExport" class="flex items-center gap-2 px-5 py-2.5 bg-blue text-white text-sm font-medium rounded-xl hover:bg-blue-dark transition-colors">
              <Check v-if="exportStatus === 'success'" :size="16" />
              <Download v-else :size="16" />
              {{ exportStatus === 'success' ? 'Exported!' : exportStatus === 'error' ? 'Export Failed' : 'Export JSON' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Import -->
      <div class="bg-card rounded-2xl p-10 shadow-sm">
        <div class="flex items-start gap-6">
          <div class="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <Upload :size="22" class="text-warning" />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-semibold text-text">Import Data</h2>
            <p class="text-sm text-text-secondary mt-2 mb-3 leading-relaxed">
              Restore from a previously exported backup, or load an export from the legacy local-SQLite version of the app. This <strong>replaces all data in the shared database</strong> for everyone.
            </p>
            <div class="flex items-center gap-2 text-xs text-warning mb-5">
              <AlertTriangle :size="14" />
              <span>Warning: importing overwrites every colleague's view, not just yours.</span>
            </div>
            <button @click="handleImport" class="flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-medium rounded-xl hover:bg-hover transition-colors">
              <Check v-if="importStatus === 'success'" :size="16" class="text-success" />
              <Upload v-else :size="16" />
              {{ importStatus === 'success' ? 'Imported!' : importStatus === 'error' ? 'Import Failed' : 'Import JSON' }}
            </button>
            <p v-if="importStatus === 'error' && importError" class="text-xs text-danger mt-3">{{ importError }}</p>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="bg-card rounded-2xl p-10 shadow-sm">
        <h2 class="text-lg font-semibold text-text mb-3">About</h2>
        <div class="space-y-2 text-sm text-text-secondary leading-relaxed">
          <p><span class="font-medium text-text">Research Lab Manager</span> v0.1.0</p>
          <p>A free, open-source project management tool for research lab teams.</p>
          <p>Built with Tauri, Vue, TypeScript, and Supabase.</p>
        </div>
      </div>
    </div>
  </div>
</template>
