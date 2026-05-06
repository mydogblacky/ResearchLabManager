import { supabase } from '@/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function subscribeToTables(
  channelName: string,
  tables: string[],
  onChange: () => void
): RealtimeChannel {
  const channel = supabase.channel(channelName)
  for (const table of tables) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => onChange())
  }
  channel.subscribe()
  return channel
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms = 150): T {
  let t: ReturnType<typeof setTimeout> | null = null
  return ((...args: unknown[]) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }) as T
}
