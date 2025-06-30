import React, { useState } from 'react'
import { X, Calendar, Clock, Users, Video, MapPin, MessageSquare, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
}

interface InterviewData {
  candidateName: string
  candidateEmail: string
  interviewType: 'video' | 'phone' | 'in-person'
  date: string
  time: string
  duration: string
  interviewers: string
  location: string
  notes: string
  timezone: string
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ isOpen, onClose }) => {
  const { accessToken, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState<InterviewData>({
    candidateName: '',
    candidateEmail: '',
    interviewType: 'video',
    date: '',
    time: '',
    duration: '60',
    interviewers: '',
    location: '',
    notes: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    // Check authentication
    if (!isAuthenticated || !accessToken) {
      setSubmitStatus('error')
      setErrorMessage('You must be logged in to schedule interviews')
      setIsSubmitting(false)
      return
    }

    try {
      // Call the schedule interview function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/schedule-interview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Interview scheduling API error:', errorData)
        throw new Error(`Failed to schedule interview: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log('Interview scheduled successfully:', result)
      
      setSubmitStatus('success')
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        resetForm()
      }, 2000)

    } catch (error) {
      console.error('Error scheduling interview:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to schedule interview')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      candidateName: '',
      candidateEmail: '',
      interviewType: 'video',
      date: '',
      time: '',
      duration: '60',
      interviewers: '',
      location: '',
      notes: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
    setSubmitStatus('idle')
    setErrorMessage('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const interviewTypes = [
    { 
      value: 'video', 
      label: 'Video Call', 
      icon: <Video className="w-4 h-4" />,
      description: 'Video meeting link will be generated'
    },
    { 
      value: 'phone', 
      label: 'Phone Call', 
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'Phone number will be shared via email'
    },
    { 
      value: 'in-person', 
      label: 'In Person', 
      icon: <MapPin className="w-4 h-4" />,
      description: 'Location details will be included'
    }
  ]

  const durations = [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ]

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Africa/Johannesburg'
  ]

  // Show authentication warning if not logged in
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-background-panel border border-gray-600 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="p-4 bg-yellow-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-2">Authentication Required</h3>
            <p className="text-text-secondary mb-4">
              Please log in to schedule interviews.
            </p>
            <button
              onClick={onClose}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-background-panel border border-gray-600 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="p-4 bg-green-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-2">Interview Scheduled!</h3>
            <p className="text-text-secondary mb-4">
              Calendar invites and confirmation emails have been sent to all participants.
            </p>
            <div className="bg-background-card border border-gray-600 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <Mail className="w-4 h-4" />
                <span>Email notifications sent</span>
              </div>
              {formData.interviewType === 'video' && (
                <div className="flex items-center space-x-2 text-sm text-text-muted mt-2">
                  <Video className="w-4 h-4" />
                  <span>Video meeting link generated</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-background-panel border border-gray-600 rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-text-primary">Schedule Interview</h2>
              <p className="text-text-muted text-sm">Automated emails and calendar invites will be sent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-2 hover:bg-background-card rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Error scheduling interview</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Information */}
          <div className="bg-background-card border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Candidate Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Candidate Name *
                </label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="Enter candidate name"
                  className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Candidate Email *
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  value={formData.candidateEmail}
                  onChange={handleChange}
                  placeholder="candidate@example.com"
                  className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Interview Type */}
          <div className="bg-background-card border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Interview Type *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interviewTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex flex-col space-y-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    formData.interviewType === type.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="interviewType"
                    value={type.value}
                    checked={formData.interviewType === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      formData.interviewType === type.value
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'bg-background-primary text-text-muted'
                    }`}>
                      {type.icon}
                    </div>
                    <span className="text-text-primary font-medium">{type.label}</span>
                  </div>
                  <p className="text-xs text-text-muted">{type.description}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-background-card border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Date & Time</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {durations.map(duration => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>
                      {tz.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-background-card border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Participants</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Interviewer Emails *
              </label>
              <input
                type="text"
                name="interviewers"
                value={formData.interviewers}
                onChange={handleChange}
                placeholder="john@company.com, jane@company.com"
                className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-text-muted mt-1">
                Separate multiple emails with commas. Calendar invites will be sent to all participants.
              </p>
            </div>
          </div>

          {/* Location (for in-person interviews) */}
          {formData.interviewType === 'in-person' && (
            <div className="bg-background-card border border-gray-600 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Location Details</span>
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Meeting Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="123 Main St, Conference Room A, City, Country"
                  className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required={formData.interviewType === 'in-person'}
                />
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className="bg-background-card border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Additional Information</h3>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Interview Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any special instructions, agenda items, or preparation notes..."
                rows={3}
                className="w-full px-4 py-3 bg-background-primary border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>

          {/* Email Preview */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center space-x-2">
              <Send className="w-5 h-5 text-blue-400" />
              <span>What happens next?</span>
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <span>Confirmation email sent to candidate with interview details</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <span>Calendar invites (.ics files) sent to all participants</span>
              </div>
              {formData.interviewType === 'video' && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span>Video meeting link automatically generated</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <span>Interview saved to your pipeline for tracking</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !accessToken}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Interview</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleInterviewModal