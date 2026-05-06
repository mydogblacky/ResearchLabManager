import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const ready = ref(false)
  const isAuthenticated = computed(() => !!session.value)

  async function init() {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
    ready.value = true

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { session, user, ready, isAuthenticated, init, signIn, signUp, signOut }
})
