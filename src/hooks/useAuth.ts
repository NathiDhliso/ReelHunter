import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true
  const [isEmployer, setIsEmployer] = useState(false)
  const [authChecked, setAuthChecked] = useState(false) // Track if auth has been checked

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('[Auth] Getting initial session...')
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error)
          // Don't immediately fail - might be temporary network issue
        }
        
        if (session) {
          console.log('[Auth] Found initial session for user:', session.user.email)
          await handleSession(session)
        } else {
          console.log('[Auth] No initial session found')
          setIsLoading(false)
          setAuthChecked(true)
        }
      } catch (error) {
        console.error('[Auth] Failed to get initial session:', error)
        setIsLoading(false)
        setAuthChecked(true)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Handle these events immediately
          await handleSession(session)
        } else if (event === 'SIGNED_IN') {
          // User signed in
          await handleSession(session)
        }
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
      
      try {
        // Check if profile exists with simpler query to avoid RLS issues
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, first_name, last_name')
          .eq('user_id', currentUser.id)
          .single()
        
        let profile = profileData

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
              first_name: currentUser.user_metadata?.first_name || 
                          currentUser.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: currentUser.user_metadata?.last_name || 
                         currentUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
            })
            .select('id, role, first_name, last_name')
            .single()

          if (createError) {
            console.error('[Auth] Error creating profile:', createError)
            // Don't fail auth completely - user might still be able to use app
          } else {
            console.log('[Auth] Profile created successfully:', newProfile)
            profile = newProfile
          }
        } else if (profileError) {
          console.error('[Auth] Profile query error:', profileError)
          // Don't fail auth - might be RLS policy issue but user could still be valid
        }

        // Set employer status based on role
        setIsEmployer(profile?.role === 'recruiter')
        console.log('[Auth] User role set to:', profile?.role)
      } catch (error) {
        console.error('[Auth] Error handling session:', error)
        // Don't fail auth completely
      }
    } else {
      setIsEmployer(false)
      console.log('[Auth] User signed out')
    }
    
    setIsLoading(false)
    setAuthChecked(true)
  }

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Signing in user:', email)
    setIsLoading(true)
    
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      return result
    } catch (error) {
      console.error('[Auth] Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: { firstName?: string, lastName?: string }) => {
    console.log('[Auth] Signing up user:', email)
    setIsLoading(true)
    
    try {
      const result = await supabase.auth.signUp({
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
      return result
    } catch (error) {
      console.error('[Auth] Sign up error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    console.log('[Auth] Signing out user')
    setIsLoading(true)
    
    try {
      const result = await supabase.auth.signOut()
      return result
    } catch (error) {
      console.error('[Auth] Sign out error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    session,
    isLoading,
    isEmployer,
    isAuthenticated: !!user,
    authChecked, // Export this so components know when auth check is complete
    accessToken: session?.access_token || null,
    signIn,
    signUp,
    signOut,
  }
}