<template>
  <img :src="logoUrl" :width="size" :height="size" alt="Research Lab Manager" />
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo.png'

withDefaults(defineProps<{ size?: number }>(), { size: 32 })
</script>
