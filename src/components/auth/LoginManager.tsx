import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoginModal from '../modals/LoginModal'

const LoginManager: React.FC = () => {
  const { isAuthenticated, authChecked } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)

  useEffect(() => {
    // If user is authenticated, don't show login modal
    if (isAuthenticated) {
      setShowLogin(false)
      return
    }

    // Only show login modal if auth check is complete and user is not authenticated
    // AND user has interacted with the page
    if (authChecked && !isAuthenticated && userInteracted) {
      // Show login modal after a brief delay to avoid immediate popup
      const timer = setTimeout(() => {
        setShowLogin(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, authChecked, userInteracted])

  useEffect(() => {
    // Track user interaction to avoid immediate login popup
    const handleUserInteraction = () => {
      setUserInteracted(true)
    }

    // Listen for meaningful user interactions
    document.addEventListener('click', handleUserInteraction, { once: true })
    document.addEventListener('keydown', handleUserInteraction, { once: true })
    document.addEventListener('scroll', handleUserInteraction, { once: true })
    
    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction)
    }
  }, [])

  // Don't render anything if auth is still loading or user is authenticated
  if (!authChecked || isAuthenticated) return null

  return showLogin ? (
    <div data-login-modal>
      <LoginModal onClose={() => setShowLogin(false)} />
    </div>
  ) : (
    // Show a subtle banner instead of immediate modal
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <p className="text-sm mb-2">Authentication Required</p>
      <p className="text-xs mb-3">Please log in to view your stats and reviews.</p>
      <button
        onClick={() => setShowLogin(true)}
        className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        Log In
      </button>
    </div>
  )
}

export default LoginManager