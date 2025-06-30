import React, { useState, useEffect } from 'react'
import { Users, Plus, MoreVertical, Mail, Phone, MessageSquare, Calendar, Star, Clock, CheckCircle, AlertTriangle, X, XCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'
import { loadPipelineData, moveCandidateToStage, type PipelineStageWithCandidates, type PipelineCandidate } from '../../services/pipelineService'

interface MoveConfirmationModal {
  isOpen: boolean
  candidate: PipelineCandidate | null
  fromStage: string
  toStage: string
  emailTemplate: string
}

const DragDropPipeline: React.FC = () => {
  const { accessToken, isAuthenticated, user, isLoading: authLoading } = useAuth()
  
  const [stages, setStages] = useState<PipelineStageWithCandidates[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    }
  }, [isAuthenticated, user, authLoading])

  const loadPipelineDataForUser = async () => {
    try {
      console.log("DragDropPipeline - Starting to load pipeline data for user:", user?.id)
      setIsLoading(true)
      
      // Get the user's profile to find their recruiter ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .eq('role', 'recruiter')
        .single()

      console.log("DragDropPipeline - Profile query result:", { profile, error: profileError })

      if (profileError || !profile) {
        console.error('DragDropPipeline - Failed to get recruiter profile:', profileError)
        setStages([])
        return
      }

      console.log("DragDropPipeline - Calling loadPipelineData with profile ID:", profile.id)
      const pipelineData = await loadPipelineData(profile.id)
      console.log("DragDropPipeline - Pipeline data loaded:", pipelineData.length, "stages")
      setStages(pipelineData)
    } catch (error) {
      console.error('DragDropPipeline - Failed to load pipeline data:', error)
      setStages([])
    } finally {
      console.log("DragDropPipeline - Setting loading to false")
      setIsLoading(false)
    }
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
    setEmailError('')
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const sendPipelineEmail = async (
    recipientEmail: string, 
    subject: string, 
    message: string,
    candidateName: string,
    stageName: string
  ): Promise<boolean> => {
    try {
      setIsEmailSending(true)
      
      // Check if user is authenticated and has access token
      if (!isAuthenticated || !accessToken) {
        console.error('User not authenticated or access token not available')
        return false
      }
      
      // Call the pipeline email function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-pipeline-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail,
          candidateName,
          stageName,
          subject,
          message,
          recruiterName: user?.user_metadata?.full_name || 'ReelHunter Team',
          companyName: user?.user_metadata?.company || 'ReelHunter'
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Email API error:', errorData)
        throw new Error(`Failed to send email: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log('Email sent successfully:', result)
      return true

    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    } finally {
      setIsEmailSending(false)
    }
  }

  const confirmMove = async () => {
    // Validate email
    if (!candidateEmail.trim()) {
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(candidateEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (candidateEmail !== moveConfirmation.candidate?.email) {
      setEmailError('Email does not match candidate record')
      return
    }

    // Check authentication before proceeding
    if (!isAuthenticated || !accessToken || !user) {
      setEmailError('You must be logged in to move candidates')
      return
    }

    try {
      // Get the user's profile to find their recruiter ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'recruiter')
        .single()

      if (profileError || !profile) {
        setEmailError('Failed to get recruiter profile')
        return
      }

      // Perform the move
      const targetStageId = stages.find(s => s.stage_name === moveConfirmation.toStage)?.id
      
      if (!targetStageId || !draggedCandidate || !draggedFromStage) return

      await moveCandidateToStage(
        draggedCandidate.id,
        draggedFromStage,
        targetStageId,
        profile.id
      )

      // Update local state
      setStages(prevStages => {
        const newStages = prevStages.map(stage => {
          if (stage.id === draggedFromStage) {
            return {
              ...stage,
              candidates: stage.candidates.filter(c => c.id !== draggedCandidate.id)
            }
          }
          if (stage.id === targetStageId) {
            return {
              ...stage,
              candidates: [...stage.candidates, {
                ...draggedCandidate,
                lastCommunication: new Date().toISOString()
              }]
            }
          }
          return stage
        })
        return newStages
      })

      // Send email if template exists
      if (moveConfirmation.emailTemplate && moveConfirmation.candidate) {
        const emailSent = await sendPipelineEmail(
          candidateEmail,
          `Application Update: ${moveConfirmation.toStage}`,
          moveConfirmation.emailTemplate,
          moveConfirmation.candidate.name,
          moveConfirmation.toStage
        )

        if (emailSent) {
          showNotification(
            `✅ Candidate moved successfully`,
            `${moveConfirmation.candidate?.name} moved to ${moveConfirmation.toStage} - Professional email sent`
          )
        } else {
          showNotification(
            `⚠️ Candidate moved with email warning`,
            `${moveConfirmation.candidate?.name} moved to ${moveConfirmation.toStage} - Email delivery failed, please follow up manually`
          )
        }
      } else {
        showNotification(
          `✅ Candidate moved successfully`,
          `${moveConfirmation.candidate?.name} moved to ${moveConfirmation.toStage}`
        )
      }

      // Reset state
      closeMoveConfirmation()
    } catch (error) {
      console.error('Error moving candidate:', error)
      setEmailError('Failed to move candidate. Please try again.')
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

  const showNotification = (title: string, message: string) => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div>
          <p class="font-semibold">${title}</p>
          <p class="text-sm opacity-90">${message}</p>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 5000)
  }

  const getTotalCandidates = () => {
    return stages.reduce((total, stage) => total + stage.candidates.length, 0)
  }

  const getStageIcon = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case 'applied': return <Clock className="w-4 h-4" />
      case 'screening': return <MessageSquare className="w-4 h-4" />
      case 'interview': return <Users className="w-4 h-4" />
      case 'final review': return <Star className="w-4 h-4" />
      case 'offer': return <CheckCircle className="w-4 h-4" />
      case 'hired': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  // Show authentication warning if not logged in
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">Authentication Required</h3>
              <p className="text-yellow-300">Please log in to access the candidate pipeline.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || authLoading) {
    console.log("DragDropPipeline - Rendering loading state")
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-muted">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  console.log("DragDropPipeline - Rendering pipeline with stages:", stages.length)

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">ReelCV Candidate Pipeline</h2>
          <p className="text-text-secondary">
            {getTotalCandidates()} ReelCV candidates • Drag to move stages • Professional email integration
          </p>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 bg-background-panel border border-gray-600 rounded-xl"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.stage_color }}
                  />
                  <div className="flex items-center space-x-2">
                    {getStageIcon(stage.stage_name)}
                    <h3 className="font-semibold text-text-primary">{stage.stage_name}</h3>
                  </div>
                  <span className="bg-background-card text-text-muted px-2 py-1 rounded-full text-sm">
                    {stage.candidates.length}
                  </span>
                </div>
                <button className="text-text-muted hover:text-text-primary p-1 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              {stage.auto_email_template && (
                <div className="flex items-center space-x-2 text-xs text-text-muted">
                  <Mail className="w-3 h-3" />
                  <span>Auto-email enabled</span>
                </div>
              )}
            </div>

            {/* Candidates */}
            <div className="p-4 space-y-3 min-h-[200px]">
              {stage.candidates.map(candidate => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={() => handleDragStart(candidate, stage.id)}
                  className="bg-background-card border border-gray-600 rounded-lg p-4 cursor-move hover:border-primary-500 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{candidate.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{candidate.name}</p>
                      <p className="text-sm text-text-muted truncate">{candidate.email}</p>
                    </div>
                  </div>
                  
                  {candidate.notes && (
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{candidate.notes}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Added {new Date(candidate.addedAt).toLocaleDateString()}</span>
                    {candidate.lastCommunication && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>Email Sent</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300">
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs text-green-400 hover:text-green-300">
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300">
                      <Calendar className="w-3 h-3" />
                      <span>Schedule</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {stage.candidates.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  {getStageIcon(stage.stage_name)}
                  <div className="mt-2">
                    <p className="text-sm">No candidates in this stage</p>
                    <p className="text-xs">Drag ReelCV candidates here to move them</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Move Confirmation Modal */}
      {moveConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMoveConfirmation} />
          <div className="relative bg-background-panel border border-gray-600 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary">Confirm Stage Move</h2>
                  <p className="text-text-muted">Verify candidate details before moving</p>
                </div>
              </div>
              <button
                onClick={closeMoveConfirmation}
                className="text-text-muted hover:text-text-primary p-2 hover:bg-background-card rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Candidate Info */}
            <div className="bg-background-card border border-gray-600 rounded-xl p-6 mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {moveConfirmation.candidate?.avatar}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {moveConfirmation.candidate?.name}
                  </h3>
                  <p className="text-text-muted">{moveConfirmation.candidate?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-text-muted">From:</span>
                  <span className="font-medium text-text-primary">{moveConfirmation.fromStage}</span>
                </div>
                <span className="text-text-muted">→</span>
                <div className="flex items-center space-x-2">
                  <span className="text-text-muted">To:</span>
                  <span className={`font-medium ${
                    moveConfirmation.toStage === 'Rejected' ? 'text-red-400' : 'text-primary-400'
                  }`}>
                    {moveConfirmation.toStage}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Verification */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Verify Candidate Email *
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => {
                  setCandidateEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder="Enter candidate's email to confirm"
                className={`w-full px-4 py-3 bg-background-card border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  emailError 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-primary-500'
                }`}
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{emailError}</span>
                </p>
              )}
              <p className="mt-2 text-xs text-text-muted">
                This email verification prevents accidental moves and ensures communication accuracy
              </p>
            </div>

            {/* Email Template Preview */}
            {moveConfirmation.emailTemplate && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Preview</span>
                </h4>
                <div className={`border rounded-xl p-4 ${
                  moveConfirmation.toStage === 'Rejected' 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : 'bg-blue-500/10 border-blue-500/20'
                }`}>
                  <p className={`text-sm italic ${
                    moveConfirmation.toStage === 'Rejected' ? 'text-red-300' : 'text-blue-300'
                  }`}>
                    "{moveConfirmation.emailTemplate}"
                  </p>
                </div>
                <p className="mt-2 text-xs text-text-muted">
                  This professional email will be sent with delivery tracking
                </p>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Professional Email Integration Features</span>
              </div>
              <ul className="text-green-300 text-sm space-y-1">
                <li>• Professional email delivery with tracking</li>
                <li>• Email verification prevents accidental moves</li>
                <li>• Delivery confirmation and bounce handling</li>
                <li>• All moves logged for audit trail</li>
                <li>• Automatic candidate status updates</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-600">
              <button
                onClick={closeMoveConfirmation}
                className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmMove}
                disabled={!candidateEmail.trim() || !!emailError || isEmailSending || !accessToken}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                  moveConfirmation.toStage === 'Rejected'
                    ? 'bg-red-500 hover:bg-red-600 disabled:bg-gray-600'
                    : 'bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600'
                } disabled:cursor-not-allowed text-white`}
              >
                {isEmailSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Move & Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {getTotalCandidates() === 0 && (
        <div className="bg-background-panel border border-gray-600 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No candidates in pipeline</h3>
          <p className="text-text-muted mb-6">Start by searching for candidates and adding them to your pipeline</p>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200">
            Search Candidates
          </button>
        </div>
      )}
    </div>
  )
}

export default DragDropPipeline
