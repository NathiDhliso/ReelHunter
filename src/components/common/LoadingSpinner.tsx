import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    primary: 'text-primary-500',
    white: 'text-white'
  }

  // Debug: Log spinner render details
  console.log('[LoadingSpinner] Render', { size, color })

  return (
    <div className="flex items-center justify-center">
      <div className={`
        animate-spin rounded-full border-2 border-gray-300 border-t-current
        ${sizeClasses[size]} ${colorClasses[color]}
      `} />
    </div>
  )
}

export default LoadingSpinner