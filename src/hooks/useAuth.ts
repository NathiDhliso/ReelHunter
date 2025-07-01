import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true
  const [isEmployer, setIsEmployer] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('[Auth] Getting initial session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[Auth] Error getting initial session:', error)
      }
      
      if (session) {
        console.log('[Auth] Found initial session for user:', session.user.email)
        await handleSession(session)
      } else {
        console.log('[Auth] No initial session found')
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event, session?.user?.email)
        await handleSession(session)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSession = async (session: Session | null) => {
    setSession(session)
    const currentUser = session?.user ?? null
    setUser(currentUser)

    if (currentUser) {
      console.log('[Auth] User authenticated, checking/creating profile...')
      
      // Check if profile exists
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      console.log('[Auth] Profile query result:', { profile, profileError })

      // If no profile exists, create one with recruiter role
      if (profileError && profileError.code === 'PGRST116') {
        console.log('[Auth] No profile found, creating recruiter profile...')
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: currentUser.id,
            email: currentUser.email!,
            role: 'recruiter',
            first_name: currentUser.user_metadata?.first_name || currentUser.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: currentUser.user_metadata?.last_name || currentUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
          })
          .select()
          .single()

        if (createError) {
          console.error('[Auth] Error creating profile:', createError)
        } else {
          console.log('[Auth] Profile created successfully:', newProfile)
          profile = newProfile
        }
      }

      // Set employer status based on role
      setIsEmployer(profile?.role === 'recruiter')
      console.log('[Auth] User role set to:', profile?.role)
    } else {
      setIsEmployer(false)
      console.log('[Auth] User signed out')
    }
    
    setIsLoading(false)
  }

  const signIn = (email: string, password: string) => {
    console.log('[Auth] Signing in user:', email)
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email: string, password: string, userData?: { firstName?: string, lastName?: string }) => {
    console.log('[Auth] Signing up user:', email)
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
          full_name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim()
        }
      }
    })
  }

  const signOut = () => {
    console.log('[Auth] Signing out user')
    return supabase.auth.signOut()
  }

  return {
    user,
    session,
    isLoading,
    isEmployer,
    isAuthenticated: !!user,
    accessToken: session?.access_token || null,
    signIn,
    signUp,
    signOut,
  }
}