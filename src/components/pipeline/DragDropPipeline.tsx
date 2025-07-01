import React, { useState, useEffect } from 'react'
import { Users, Plus, MoreVertical, Mail, MessageSquare, Calendar, Clock, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'
import { loadPipelineData, moveCandidateToStage, type PipelineStageWithCandidates, type PipelineCandidate } from '../../services/pipelineService'

// Pipeline stage configuration for UI rendering
const PIPELINE_STAGE_CONFIG = {
  applied: {
    name: 'Applied',
    description: 'New applications received',
    icon: Users,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500'
  },
  screening: {
    name: 'Screening',
    description: 'Initial qualification review',
    icon: Users,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    iconColor: 'text-indigo-500'
  },
  interview: {
    name: 'Interview',
    description: 'Interview process',
    icon: Users,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-500'
  },
  offer: {
    name: 'Offer',
    description: 'Job offer extended',
    icon: Users,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconColor: 'text-green-500'
  }
}

interface MoveConfirmationModal {
  isOpen: boolean
  candidate: PipelineCandidate | null
  fromStage: string
  toStage: string
  emailTemplate: string
}

const DragDropPipeline: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, profileId } = useAuth()
  
  const [stages, setStages] = useState<PipelineStageWithCandidates[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedCandidate, setDraggedCandidate] = useState<PipelineCandidate | null>(null)
  const [draggedFromStage, setDraggedFromStage] = useState<string | null>(null)
  const [moveConfirmation, setMoveConfirmation] = useState<MoveConfirmationModal>({
    isOpen: false,
    candidate: null,
    fromStage: '',
    toStage: '',
    emailTemplate: ''
  })
  const [candidateEmail, setCandidateEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isEmailSending, setIsEmailSending] = useState(false)

  // Load pipeline data on component mount
  useEffect(() => {
    console.log("DragDropPipeline - Auth state:", { isAuthenticated, userId: user?.id, authLoading })
    
    // Wait for auth to complete loading
    if (authLoading) {
      console.log("DragDropPipeline - Auth still loading, waiting...")
      return
    }
    
    if (isAuthenticated && user) {
      console.log("DragDropPipeline - Loading pipeline data for authenticated user")
      loadPipelineDataForUser()
    } else {
      console.log("DragDropPipeline - User not authenticated, setting loading to false")
      setIsLoading(false)
      setError("Please log in to access your pipeline")
    }
  }, [isAuthenticated, user, authLoading])

  const loadPipelineDataForUser = async () => {
    try {
      console.log("DragDropPipeline - Starting to load pipeline data for user:", user?.id)
      setIsLoading(true)
      setError(null)
      
      // Use profileId from auth hook to avoid RLS recursion issues
      let recruiterProfileId = null
      
      // Check if we have a profileId from the auth hook
      if (profileId && !profileId.startsWith('temp-')) {
        // We have a real profile ID
        recruiterProfileId = profileId
        console.log("DragDropPipeline - Using profileId from auth hook:", recruiterProfileId)
      } else if (profileId && profileId.startsWith('temp-')) {
        // We're in fallback mode due to RLS issues
        console.warn("DragDropPipeline - Using temporary profile mode, some features may be limited")
        // For now, use a default stage structure
        const defaultStages: PipelineStageWithCandidates[] = [
          {
            id: crypto.randomUUID(),
            stage_name: 'Applied',
            stage_order: 1,
            stage_color: '#3B82F6',
            auto_email_template: '',
            candidates: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            recruiter_id: profileId
          },
          {
            id: crypto.randomUUID(),
            stage_name: 'Screening',
            stage_order: 2,
            stage_color: '#F59E0B',
            auto_email_template: '',
            candidates: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            recruiter_id: profileId
          },
          {
            id: crypto.randomUUID(),
            stage_name: 'Interview',
            stage_order: 3,
            stage_color: '#8B5CF6',
            auto_email_template: '',
            candidates: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            recruiter_id: profileId
          },
          {
            id: crypto.randomUUID(),
            stage_name: 'Offer',
            stage_order: 4,
            stage_color: '#10B981',
            auto_email_template: '',
            candidates: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            recruiter_id: profileId
          }
        ]
        setStages(defaultStages)
        setError(null)
        console.log("DragDropPipeline - Using default stages due to RLS policy issues")
        return
      } else {
        // Try to get profile (this might fail due to RLS issues)
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('user_id', user?.id)
            .single()

          console.log("DragDropPipeline - Profile query result:", { profile, error: profileError })

          if (profileError || !profile) {
            console.warn('DragDropPipeline - Profile query failed, using fallback mode')
            // Fallback to default stages
            const tempProfileId = `temp-${user?.id || 'unknown'}`
            const defaultStages: PipelineStageWithCandidates[] = [
              {
                id: 'applied',
                stage_name: 'Applied',
                stage_order: 1,
                stage_color: '#3B82F6',
                auto_email_template: '',
                candidates: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                recruiter_id: tempProfileId
              },
              {
                id: 'screening',
                stage_name: 'Screening',
                stage_order: 2,
                stage_color: '#F59E0B',
                auto_email_template: '',
                candidates: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                recruiter_id: tempProfileId
              },
              {
                id: 'interview',
                stage_name: 'Interview',
                stage_order: 3,
                stage_color: '#8B5CF6',
                auto_email_template: '',
                candidates: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                recruiter_id: tempProfileId
              },
              {
                id: 'offer',
                stage_name: 'Offer',
                stage_order: 4,
                stage_color: '#10B981',
                auto_email_template: '',
                candidates: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                recruiter_id: tempProfileId
              }
            ]
            setStages(defaultStages)
            setError(null)
            console.log("DragDropPipeline - Using default stages due to profile query failure")
            return
          }

          if (profile.role !== 'recruiter') {
            console.error('DragDropPipeline - User is not a recruiter:', profile.role)
            setError('Access denied. This feature is only available to recruiters.')
            setStages([])
            return
          }

          recruiterProfileId = profile.id
        } catch (queryError) {
          console.warn('DragDropPipeline - Profile query threw error, using fallback mode:', queryError)
          // Use default stages in case of any error
          const tempProfileId = `temp-${user?.id || 'unknown'}`
          const defaultStages: PipelineStageWithCandidates[] = [
            {
              id: 'applied',
              stage_name: 'Applied',
              stage_order: 1,
              stage_color: '#3B82F6',
              auto_email_template: '',
              candidates: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true,
              recruiter_id: tempProfileId
            },
            {
              id: 'screening',
              stage_name: 'Screening',
              stage_order: 2,
              stage_color: '#F59E0B',
              auto_email_template: '',
              candidates: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true,
              recruiter_id: tempProfileId
            },
            {
              id: 'interview',
              stage_name: 'Interview',
              stage_order: 3,
              stage_color: '#8B5CF6',
              auto_email_template: '',
              candidates: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true,
              recruiter_id: tempProfileId
            },
            {
              id: 'offer',
              stage_name: 'Offer',
              stage_order: 4,
              stage_color: '#10B981',
              auto_email_template: '',
              candidates: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true,
              recruiter_id: tempProfileId
            }
          ]
          setStages(defaultStages)
          setError(null)
          console.log("DragDropPipeline - Using default stages due to query exception")
          return
        }
      }

      if (recruiterProfileId) {
        console.log("DragDropPipeline - Calling loadPipelineData with profile ID:", recruiterProfileId)
        const pipelineData = await loadPipelineData(recruiterProfileId)
        console.log("DragDropPipeline - Pipeline data loaded:", pipelineData.length, "stages")
        setStages(pipelineData)
        setError(null)
      }
    } catch (error) {
      console.error('DragDropPipeline - Failed to load pipeline data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load pipeline data')
      setStages([])
    } finally {
      console.log("DragDropPipeline - Setting loading to false")
      setIsLoading(false)
    }
  }

  const retryLoad = () => {
    if (isAuthenticated && user) {
      loadPipelineDataForUser()
    }
  }

  const getStageConfig = (stageName: string) => {
    // Map database stage names to configuration
    const normalizedStageId = stageName.toLowerCase().replace(/\s+/g, '_')
    const configs: Record<string, { name: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; borderColor: string; textColor: string; iconColor: string }> = {
      applied: {
        name: stageName,
        description: 'New applications received',
        icon: Users,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-500'
      },
      screening: {
        name: stageName,
        description: 'Initial qualification review',
        icon: Users,
        color: 'indigo',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        textColor: 'text-indigo-700',
        iconColor: 'text-indigo-500'
      },
      interview: {
        name: stageName,
        description: 'Interview process',
        icon: Users,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        iconColor: 'text-purple-500'
      },
      offer: {
        name: stageName,
        description: 'Job offer extended',
        icon: Users,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        iconColor: 'text-green-500'
      }
    }
    
    return configs[normalizedStageId] || {
      name: stageName,
      description: 'Custom pipeline stage',
      icon: Users,
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-500'
    }
  }

  const getCandidateStatusBadge = (candidate: PipelineCandidate) => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(candidate.addedAt).getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceUpdate > 7) {
      return <div className="w-2 h-2 bg-red-400 rounded-full" title="Stale - No activity for over a week" />
    } else if (daysSinceUpdate > 3) {
      return <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Needs attention - No activity for 3+ days" />
    } else {
      return <div className="w-2 h-2 bg-green-400 rounded-full" title="Active - Recent activity" />
    }
  }

  const getTotalCandidates = () => {
    return stages.reduce((total, stage) => total + stage.candidates.length, 0)
  }

  const handleDragStart = (candidate: PipelineCandidate, stageId: string) => {
    setDraggedCandidate(candidate)
    setDraggedFromStage(stageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault()
    
    if (!draggedCandidate || !draggedFromStage || draggedFromStage === targetStageId) {
      setDraggedCandidate(null)
      setDraggedFromStage(null)
      return
    }

    // Find stage names and email template
    const fromStage = stages.find(s => s.id === draggedFromStage)
    const toStage = stages.find(s => s.id === targetStageId)
    
    if (!fromStage || !toStage) return

    // Show confirmation modal with email verification
    setMoveConfirmation({
      isOpen: true,
      candidate: draggedCandidate,
      fromStage: fromStage.stage_name,
      toStage: toStage.stage_name,
      emailTemplate: toStage.auto_email_template || ''
    })
    setCandidateEmail(draggedCandidate.email)
  }

  const confirmMove = async () => {
    if (!moveConfirmation.candidate || !draggedFromStage || !user) return

    try {
      setIsEmailSending(true)
      
      const targetStage = stages.find(s => s.stage_name === moveConfirmation.toStage)
      if (!targetStage) return

      await moveCandidateToStage(
        moveConfirmation.candidate.id,
        draggedFromStage,
        targetStage.id,
        user.id || ''
      )

      // Refresh pipeline data
      await loadPipelineDataForUser()
      
      closeMoveConfirmation()
    } catch (error) {
      console.error('Failed to move candidate:', error)
      setEmailError('Failed to move candidate. Please try again.')
    } finally {
      setIsEmailSending(false)
    }
  }

  const closeMoveConfirmation = () => {
    setMoveConfirmation({
      isOpen: false,
      candidate: null,
      fromStage: '',
      toStage: '',
      emailTemplate: ''
    })
    setCandidateEmail('')
    setEmailError('')
    setDraggedCandidate(null)
    setDraggedFromStage(null)
  }

  // Show loading spinner while auth is loading or pipeline is loading
  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {authLoading ? 'Authenticating...' : 'Loading Pipeline...'}
            </h2>
            <p className="text-text-muted">
              {authLoading ? 'Verifying your credentials' : 'Fetching your candidate pipeline'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Unable to Load Pipeline</h2>
            <p className="text-text-muted mb-4">{error}</p>
            {isAuthenticated && (
              <button
                onClick={retryLoad}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Authentication Required</h2>
            <p className="text-text-muted">Please log in to access your candidate pipeline.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Enhanced Pipeline Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h1>
            <p className="text-gray-600 mt-1">Manage candidates through your hiring process</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Total Candidates: {getTotalCandidates()}
            </div>
            <button
              onClick={retryLoad}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Pipeline Progress Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {Object.entries(PIPELINE_STAGE_CONFIG).map(([key, config], index) => {
            const stageData = stages.find(s => s.stage_name.toLowerCase().replace(/\s+/g, '_') === key)
            const candidateCount = stageData?.candidates.length || 0
            const Icon = config.icon
            
            return (
              <div key={key} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  <span className={`text-sm font-medium ${config.textColor}`}>
                    {config.name} ({candidateCount})
                  </span>
                </div>
                {index < Object.keys(PIPELINE_STAGE_CONFIG).length - 2 && (
                  <div className="w-6 h-px bg-gray-300" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Enhanced Pipeline Columns */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {stages.map((stage) => {
          const stageConfig = getStageConfig(stage.stage_name)
          const Icon = stageConfig.icon
          
          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 ${stageConfig.bgColor} ${stageConfig.borderColor} border rounded-lg`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Enhanced Stage Header */}
              <div className={`p-4 border-b ${stageConfig.borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${stageConfig.iconColor}`} />
                    <h3 className={`font-semibold ${stageConfig.textColor}`}>
                      {stage.stage_name}
                    </h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${stageConfig.textColor} bg-white/50`}>
                    {stage.candidates.length}
                  </div>
                </div>
                <p className={`text-xs ${stageConfig.textColor} opacity-75`}>
                  {stageConfig.description}
                </p>
              </div>

              {/* Candidates List */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {stage.candidates.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon className={`w-8 h-8 ${stageConfig.iconColor} mx-auto mb-2 opacity-50`} />
                    <p className={`text-sm ${stageConfig.textColor} opacity-75`}>
                      No candidates in this stage
                    </p>
                  </div>
                ) : (
                  stage.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={() => handleDragStart(candidate, stage.id)}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move group"
                    >
                      {/* Enhanced Candidate Card */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {candidate.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Candidate
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getCandidateStatusBadge(candidate)}
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Candidate Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Added {new Date(candidate.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          <Mail className="w-3 h-3" />
                          Email
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                          <Calendar className="w-3 h-3" />
                          Schedule
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                          <MessageSquare className="w-3 h-3" />
                          Note
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Candidate Button */}
              <div className="p-4 border-t border-gray-200">
                <button className={`w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed ${stageConfig.borderColor} ${stageConfig.textColor} rounded-lg hover:bg-white/50 transition-colors`}>
                  <Plus className="w-4 h-4" />
                  Add Candidate
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Move Confirmation Modal - Enhanced */}
      {moveConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Move Candidate
            </h3>
            <p className="text-gray-600 mb-4">
              Move <strong>{moveConfirmation.candidate?.name}</strong> from{' '}
              <span className="font-medium">{moveConfirmation.fromStage}</span> to{' '}
              <span className="font-medium">{moveConfirmation.toStage}</span>?
            </p>
            
            {moveConfirmation.emailTemplate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="candidate@example.com"
                />
                {emailError && (
                  <p className="text-red-600 text-sm mt-1">{emailError}</p>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={confirmMove}
                disabled={isEmailSending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isEmailSending ? 'Moving...' : 'Confirm Move'}
              </button>
              <button
                onClick={closeMoveConfirmation}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DragDropPipeline
