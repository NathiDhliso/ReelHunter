import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  /**
   * React children to be wrapped by the error boundary.
   */
  children: ReactNode
}

interface ErrorBoundaryState {
  /**
   * Flag indicating whether an error has been caught.
   */
  hasError: boolean
  /**
   * The error instance that was caught (optional).
   */
  error?: Error
}

/**
 * A reusable error boundary that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI so the entire application doesn\'t crash.
 *
 * NOTE: This must be a class component – hooks based components cannot implement
 * `componentDidCatch`.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-primary px-4">
          <div className="max-w-md text-center space-y-6">
            <h1 className="text-3xl font-bold text-red-400">
              Something went wrong
            </h1>
            <p className="text-text-secondary">
              {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 