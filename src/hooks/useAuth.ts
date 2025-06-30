import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true
  const [isEmployer, setIsEmployer] = useState(false)

  useEffect(() => {
    // onAuthStateChange handles both initial session and subsequent changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // If there's a user, check their role.
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', currentUser.id)
            .single()
          setIsEmployer(profile?.role === 'recruiter')
        } else {
          setIsEmployer(false)
        }
        // This is the crucial part: set loading to false AFTER the first auth check.
        setIsLoading(false)
      }
    )

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array ensures this runs only once.

  const signIn = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = (email: string, password: string, userData?: { firstName?: string, lastName?: string }) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData?.firstName || '',
          last_name: userData?.lastName || '',
        }
      }
    })
  }

  const signOut = () => {
    return supabase.auth.signOut()
  }

  return {
    user,
    session,
    isLoading,
    isEmployer,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }
}