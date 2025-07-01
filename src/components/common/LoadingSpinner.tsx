import React, { memo } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  const colorClasses = {
    primary: 'text-primary-500',
    white: 'text-white',
    gray: 'text-gray-400'
  }
  
  return (
    <div 
      className={`
        inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
})

LoadingSpinner.displayName = 'LoadingSpinner'

export default LoadingSpinner