<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const ready = ref(false)

onMounted(async () => {
  await auth.init()
  ready.value = true
})
</script>

<template>
  <router-view v-if="ready" />
  <div v-else class="flex items-center justify-center h-screen bg-bg">
    <div class="text-center">
      <div class="w-14 h-14 rounded-xl bg-blue flex items-center justify-center font-bold text-white text-lg mx-auto mb-4">
        RLM
      </div>
      <p class="text-text-muted text-sm">Loading...</p>
    </div>
  </div>
</template>
