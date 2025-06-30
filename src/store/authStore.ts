import { create } from 'zustand'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isEmployer: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  getAccessToken: () => string | null
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isEmployer: false,

  getAccessToken: () => {
    const { session } = get()
    return session?.access_token || null
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      set({ 
        user: data.user,
        session: data.session,
        isEmployer: true, // TODO: Determine from user role/metadata
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, session: null, isEmployer: false, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ 
        user: session?.user ?? null,
        session: session,
        isEmployer: !!session?.user, // TODO: Proper role checking
        isLoading: false 
      })

      supabase.auth.onAuthStateChange((event, session) => {
        set({ 
          user: session?.user ?? null,
          session: session,
          isEmployer: !!session?.user,
          isLoading: false 
        })
      })
    } catch (error) {
      set({ isLoading: false })
    }
  },
}))