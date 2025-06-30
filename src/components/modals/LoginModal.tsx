import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner'
import { X } from 'lucide-react'

interface LoginModalProps {
  onClose?: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setIsSubmitting(true)
      await signIn(email, password)
      setIsSubmitting(false)
      onClose?.()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to sign in')
      }
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Use the signUp function from useAuth hook
      await signUp(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })

      // The signUp function should handle profile creation automatically
      // If successful, sign in the user
      await signIn(email, password)
      onClose?.()
      
      setIsSubmitting(false)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create account')
      }
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFirstName('')
    setLastName('')
    setError(null)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      data-login-modal
    >
      <div className="w-full max-w-md p-8 bg-background-panel border border-gray-600 rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-text-primary">
            {isSignUp ? 'Join ReelHunter' : 'Sign in to ReelHunter'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-2 hover:bg-background-card rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-text-primary">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="John"
                  required={isSignUp}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-text-primary">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Doe"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-text-primary">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-text-muted">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-text-primary">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your password"
                required={isSignUp}
              />
            </div>
          )}

          <button
            type="submit"
            className="relative inline-flex items-center justify-center w-full px-6 py-3 font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="absolute left-4">
                <LoadingSpinner size="sm" color="white" />
              </span>
            )}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-muted text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={toggleMode}
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {isSignUp && (
          <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <p className="text-primary-300 text-xs text-center">
              By creating an account, you'll join ReelHunter as a recruiter with access to verified talent from the ReelCV platform.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginModal