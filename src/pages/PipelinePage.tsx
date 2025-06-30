import React from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import DragDropPipeline from '../components/pipeline/DragDropPipeline'
import { useAuth } from '../hooks/useAuth'
import { Users, AlertTriangle } from 'lucide-react'

const PipelinePage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Authentication Required</h2>
              <p className="text-text-muted">Please log in to access your candidate pipeline.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <DragDropPipeline />
      </div>
    </DashboardLayout>
  )
}

export default PipelinePage