import React, { useState, useEffect } from 'react'
import { Users, Plus, MoreVertical, Mail, MessageSquare, Calendar, Clock, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'
import { loadPipelineData, moveCandidateToStage, type PipelineStageWithCandidates, type PipelineCandidate } from '../../services/pipelineService'
import { PIPELINE_THEME, PIPELINE_STAGE_CONFIG, ACTION_BUTTONS, getStageConfig } from './PipelineStyles'

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
            return
          }

          recruiterProfileId = profile.id
        } catch (err) {
          console.error('DragDropPipeline - Error fetching profile:', err)
          // Fall back to default stages
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
          return
        }
      }

      // If we have a real profile ID, try to load pipeline data
      if (recruiterProfileId) {
        const pipelineData = await loadPipelineData(recruiterProfileId)
        
        if (pipelineData && pipelineData.length > 0) {
          setStages(pipelineData)
          setError(null)
          console.log("DragDropPipeline - Successfully loaded pipeline data:", pipelineData.length, "stages")
        } else {
          console.log("DragDropPipeline - No pipeline data found, using default stages")
          // Use default stages if no pipeline exists
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
              recruiter_id: recruiterProfileId
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
              recruiter_id: recruiterProfileId
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
              recruiter_id: recruiterProfileId
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
              recruiter_id: recruiterProfileId
            }
          ]
          setStages(defaultStages)
          setError(null)
        }
      }
    } catch (error) {
      console.error('DragDropPipeline - Error loading pipeline data:', error)
      setError('Failed to load pipeline data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const retryLoad = () => {
    if (isAuthenticated && user) {
      loadPipelineDataForUser()
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
    if (!moveConfirmation.candidate || !draggedFromStage || !user?.id) return

    try {
      setIsEmailSending(true)
      setEmailError('')
      
      const targetStage = stages.find(s => s.stage_name === moveConfirmation.toStage)
      if (!targetStage) return

      // Move candidate first
      const userId = user.id as string
      await moveCandidateToStage(
        moveConfirmation.candidate.id,
        draggedFromStage,
        targetStage.id,
        userId
      )

      // Send notification email if email template exists
      if (moveConfirmation.emailTemplate && candidateEmail) {
        try {
          // Import email service dynamically to avoid circular dependencies
          const { sendStageNotificationEmail } = await import('../../services/emailService')
          
          await sendStageNotificationEmail({
            candidateEmail,
            candidateName: moveConfirmation.candidate.name,
            fromStage: moveConfirmation.fromStage,
            toStage: moveConfirmation.toStage,
            companyName: 'ReelHunter',
            recruiterName: user.email || 'Your Recruiter'
          })
        } catch (emailError) {
          console.warn('Failed to send email notification:', emailError)
          // Don't fail the entire operation if email fails
        }
      }

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
      <div className={PIPELINE_THEME.state.container}>
        <div className={PIPELINE_THEME.state.centerContent}>
          <div className={PIPELINE_THEME.state.textCenter}>
            <RefreshCw className={PIPELINE_THEME.state.loadingIcon} />
            <h2 className={PIPELINE_THEME.state.title}>
              {authLoading ? 'Authenticating...' : 'Loading Pipeline...'}
            </h2>
            <p className={PIPELINE_THEME.state.subtitle}>
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
      <div className={PIPELINE_THEME.state.container}>
        <div className={PIPELINE_THEME.state.centerContent}>
          <div className={PIPELINE_THEME.state.textCenter}>
            <AlertTriangle className={PIPELINE_THEME.state.errorIcon} />
            <h2 className={PIPELINE_THEME.state.title}>Unable to Load Pipeline</h2>
            <p className={`${PIPELINE_THEME.state.subtitle} mb-4`}>{error}</p>
            {isAuthenticated && (
              <button onClick={retryLoad} className={PIPELINE_THEME.state.retryButton}>
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
      <div className={PIPELINE_THEME.state.container}>
        <div className={PIPELINE_THEME.state.centerContent}>
          <div className={PIPELINE_THEME.state.textCenter}>
            <AlertTriangle className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className={PIPELINE_THEME.state.title}>Authentication Required</h2>
            <p className={PIPELINE_THEME.state.subtitle}>Please log in to access your candidate pipeline.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={PIPELINE_THEME.container}>
      {/* Enhanced Pipeline Header */}
      <div className={PIPELINE_THEME.header.container}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={PIPELINE_THEME.header.title}>Recruitment Pipeline</h1>
            <p className={PIPELINE_THEME.header.subtitle}>Manage candidates through your hiring process</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={PIPELINE_THEME.header.statsText}>
              Total Candidates: {getTotalCandidates()}
            </div>
            <button
              onClick={retryLoad}
              disabled={isLoading}
              className={PIPELINE_THEME.header.refreshButton}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Pipeline Progress Indicator */}
        <div className={PIPELINE_THEME.progress.container}>
          {Object.entries(PIPELINE_STAGE_CONFIG).map(([key, config], index) => {
            const stageData = stages.find(s => s.stage_name.toLowerCase().replace(/\s+/g, '_') === key)
            const candidateCount = stageData?.candidates.length || 0
            
            return (
              <div key={key} className={PIPELINE_THEME.progress.stageItem}>
                <div className={PIPELINE_THEME.progress.stageIndicator}>
                  <Users className={PIPELINE_THEME.progress.stageIcon} />
                  <span className={PIPELINE_THEME.progress.stageText}>
                    {config.name} ({candidateCount})
                  </span>
                </div>
                {index < Object.keys(PIPELINE_STAGE_CONFIG).length - 1 && (
                  <div className={PIPELINE_THEME.progress.connector} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Enhanced Pipeline Columns */}
      <div className={PIPELINE_THEME.columns.container}>
        {stages.map((stage) => {
          const stageConfig = getStageConfig(stage.stage_name)
          
          return (
            <div
              key={stage.id}
              className={PIPELINE_THEME.columns.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Enhanced Stage Header */}
              <div className={PIPELINE_THEME.columns.header}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-text-muted" />
                    <h3 className={PIPELINE_THEME.columns.title}>
                      {stage.stage_name}
                    </h3>
                  </div>
                  <div className={PIPELINE_THEME.columns.count}>
                    {stage.candidates.length}
                  </div>
                </div>
                <p className={PIPELINE_THEME.columns.description}>
                  {stageConfig.description}
                </p>
              </div>

              {/* Candidates List */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {stage.candidates.length === 0 ? (
                  <div className={PIPELINE_THEME.empty.container}>
                    <Users className={PIPELINE_THEME.empty.icon} />
                    <p className={PIPELINE_THEME.empty.text}>
                      No candidates in this stage
                    </p>
                  </div>
                ) : (
                  stage.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      draggable
                      onDragStart={() => handleDragStart(candidate, stage.id)}
                      className={PIPELINE_THEME.candidate.container}
                    >
                      {/* Enhanced Candidate Card */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={PIPELINE_THEME.candidate.avatar}>
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className={PIPELINE_THEME.candidate.name}>
                              {candidate.name}
                            </h4>
                            <p className={PIPELINE_THEME.candidate.role}>
                              Candidate
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {getCandidateStatusBadge(candidate)}
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4 text-text-muted" />
                          </button>
                        </div>
                      </div>

                      {/* Candidate Details */}
                      <div className="space-y-2">
                        <div className={PIPELINE_THEME.candidate.email}>
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className={PIPELINE_THEME.candidate.date}>
                          <Clock className="w-3 h-3" />
                          <span>Added {new Date(candidate.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className={PIPELINE_THEME.candidate.actions}>
                        <button className={`${PIPELINE_THEME.candidate.actionButton} ${ACTION_BUTTONS.email.style}`}>
                          <Mail className={ACTION_BUTTONS.email.icon} />
                          Email
                        </button>
                        <button className={`${PIPELINE_THEME.candidate.actionButton} ${ACTION_BUTTONS.schedule.style}`}>
                          <Calendar className={ACTION_BUTTONS.schedule.icon} />
                          Schedule
                        </button>
                        <button className={`${PIPELINE_THEME.candidate.actionButton} ${ACTION_BUTTONS.note.style}`}>
                          <MessageSquare className={ACTION_BUTTONS.note.icon} />
                          Note
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Candidate Button */}
              <div className="p-4 border-t border-gray-600">
                <button className={PIPELINE_THEME.addButton}>
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
        <div className={PIPELINE_THEME.modal.overlay}>
          <div className={PIPELINE_THEME.modal.container}>
            <h3 className={PIPELINE_THEME.modal.title}>
              Move Candidate
            </h3>
            <p className={PIPELINE_THEME.modal.text}>
              Move <strong>{moveConfirmation.candidate?.name}</strong> from{' '}
              <span className="font-medium">{moveConfirmation.fromStage}</span> to{' '}
              <span className="font-medium">{moveConfirmation.toStage}</span>?
            </p>
            
            {moveConfirmation.emailTemplate && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className={PIPELINE_THEME.modal.input}
                  placeholder="candidate@example.com"
                />
                {emailError && (
                  <p className="text-red-400 text-sm mt-1">{emailError}</p>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={confirmMove}
                disabled={isEmailSending}
                className={PIPELINE_THEME.modal.confirmButton}
              >
                {isEmailSending ? 'Moving...' : 'Confirm Move'}
              </button>
              <button
                onClick={closeMoveConfirmation}
                className={PIPELINE_THEME.modal.cancelButton}
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
