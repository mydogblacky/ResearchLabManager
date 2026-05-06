<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const mode = ref<'sign_in' | 'sign_up'>('sign_in')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const error = ref('')
const info = ref('')

async function submit() {
  error.value = ''
  info.value = ''
  submitting.value = true
  try {
    if (mode.value === 'sign_in') {
      await auth.signIn(email.value.trim(), password.value)
      router.replace('/')
    } else {
      await auth.signUp(email.value.trim(), password.value)
      info.value = 'Account created. If your project requires email confirmation, check your inbox before signing in.'
      mode.value = 'sign_in'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Authentication failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-bg p-6">
    <div class="w-full max-w-sm bg-card rounded-2xl p-8 shadow-sm">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-blue flex items-center justify-center font-bold text-white">RLM</div>
        <h1 class="text-lg font-semibold text-text">Research Lab Manager</h1>
      </div>

      <h2 class="text-sm font-medium text-text mb-1">
        {{ mode === 'sign_in' ? 'Sign in to your lab' : 'Create an account' }}
      </h2>
      <p class="text-xs text-text-secondary mb-6">
        {{ mode === 'sign_in'
          ? 'Use the same credentials as your colleagues to access the shared database.'
          : 'Sign up once, then sign in on each computer where you use the app.' }}
      </p>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-xs text-text-secondary mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-blue"
          />
        </div>
        <div>
          <label class="block text-xs text-text-secondary mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            :autocomplete="mode === 'sign_in' ? 'current-password' : 'new-password'"
            class="w-full px-4 py-2.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-blue"
          />
        </div>

        <p v-if="error" class="text-xs text-danger">{{ error }}</p>
        <p v-if="info" class="text-xs text-text-secondary">{{ info }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full px-5 py-2.5 bg-blue text-white text-sm font-medium rounded-xl hover:bg-blue-dark transition-colors disabled:opacity-50"
        >
          {{ submitting
            ? 'Working...'
            : mode === 'sign_in' ? 'Sign in' : 'Create account' }}
        </button>
      </form>

      <button
        @click="mode = mode === 'sign_in' ? 'sign_up' : 'sign_in'"
        class="mt-4 w-full text-xs text-text-secondary hover:text-text transition-colors"
      >
        {{ mode === 'sign_in' ? 'Need an account? Sign up' : 'Already have an account? Sign in' }}
      </button>
    </div>
  </div>
</template>
