import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoginModal from '../modals/LoginModal'

const LoginManager: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    // If user is authenticated, don't show login modal
    if (isAuthenticated) {
      setShowLogin(false)
      return
    }

    // Add global click listener to capture any click when not authenticated
    const handleGlobalClick = (e: MouseEvent) => {
      // Don't show modal if it's already showing
      if (showLogin) return
      
      // Don't show modal if clicking on the modal itself
      const target = e.target as HTMLElement
      if (target.closest('[data-login-modal]')) return
      
      // Show login modal on any click when not authenticated
      setShowLogin(true)
    }

    // Add the event listener to capture all clicks
    document.addEventListener('click', handleGlobalClick, true)
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', handleGlobalClick, true)
    }
  }, [isAuthenticated, showLogin])

  // Don't render anything if user is authenticated
  if (isAuthenticated) return null

  return showLogin ? (
    <div data-login-modal>
      <LoginModal onClose={() => setShowLogin(false)} />
    </div>
  ) : null
}

export default LoginManager