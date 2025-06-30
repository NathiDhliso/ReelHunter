import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Type definitions
interface InterviewRequest {
  candidateName: string
  candidateEmail: string
  interviewType: 'video' | 'phone' | 'in-person'
  date: string
  time: string
  duration: string
  interviewers: string
  location?: string
  notes?: string
  timezone: string
}

interface VideoMeeting {
  meetingId: string
  joinUrl: string
  attendeeId: string
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req)
    
    // Parse and validate request
    const interviewData = await parseRequest(req)
    
    // Initialize Supabase client
    const supabase = createSupabaseClient()
    
    // Generate meeting link for video calls
    let meetingDetails = null
    if (interviewData.interviewType === 'video') {
      meetingDetails = await createVideoMeeting(interviewData)
    }
    
    // Save interview to database
    const interview = await saveInterview(supabase, user.id, interviewData, meetingDetails)
    
    // Generate calendar invite
    const calendarInvite = generateCalendarInvite(interviewData, meetingDetails)
    
    // Send email notifications
    await sendEmailNotifications(interviewData, meetingDetails, calendarInvite)
    
    return createSuccessResponse({
      interviewId: interview.id,
      meetingDetails,
      message: 'Interview scheduled successfully'
    })
    
  } catch (error) {
    return createErrorResponse(error)
  }
})

// Authentication helper
async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing authorization header')
  }

  const supabase = createSupabaseClient()
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

// Request parsing helper
async function parseRequest(req: Request): Promise<InterviewRequest> {
  const body = await req.json()
  
  // Validate required fields
  const requiredFields = ['candidateName', 'candidateEmail', 'interviewType', 'date', 'time', 'interviewers']
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.candidateEmail)) {
    throw new Error('Invalid candidate email format')
  }
  
  // Validate interviewer emails
  const interviewerEmails = body.interviewers.split(',').map((email: string) => email.trim())
  for (const email of interviewerEmails) {
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid interviewer email format: ${email}`)
    }
  }
  
  return body as InterviewRequest
}

// Supabase client factory
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Video meeting creator
async function createVideoMeeting(interviewData: InterviewRequest): Promise<VideoMeeting> {
  try {
    // Generate meeting details
    const meetingId = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const joinUrl = `https://meet.reelhunter.com/${meetingId}`
    const attendeeId = `attendee-${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Creating video meeting for interview:', {
      candidateName: interviewData.candidateName,
      date: interviewData.date,
      time: interviewData.time
    })
    
    // In production, integrate with your preferred video conferencing service
    // Examples: Zoom, Google Meet, Microsoft Teams, Jitsi, etc.
    
    return {
      meetingId,
      joinUrl,
      attendeeId
    }
  } catch (error) {
    console.error('Failed to create video meeting:', error)
    throw new Error('Failed to create video meeting')
  }
}

// Interview database saver
async function saveInterview(supabase: any, userId: string, interviewData: InterviewRequest, meetingDetails: VideoMeeting | null) {
  const interviewDateTime = new Date(`${interviewData.date}T${interviewData.time}:00`)
  
  const { data: interview, error } = await supabase
    .from('interviews')
    .insert({
      recruiter_id: userId,
      candidate_name: interviewData.candidateName,
      candidate_email: interviewData.candidateEmail,
      interview_type: interviewData.interviewType,
      scheduled_at: interviewDateTime.toISOString(),
      duration_minutes: parseInt(interviewData.duration),
      interviewers: interviewData.interviewers.split(',').map((email: string) => email.trim()),
      location: interviewData.location || null,
      notes: interviewData.notes || null,
      timezone: interviewData.timezone,
      meeting_url: meetingDetails?.joinUrl || null,
      meeting_id: meetingDetails?.meetingId || null,
      status: 'scheduled'
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to save interview: ${error.message}`)
  }
  
  return interview
}

// Calendar invite generator
function generateCalendarInvite(interviewData: InterviewRequest, meetingDetails: VideoMeeting | null): string {
  const startDateTime = new Date(`${interviewData.date}T${interviewData.time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + parseInt(interviewData.duration) * 60000)
  
  // Format dates for iCalendar
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  let description = `Interview with ${interviewData.candidateName}`
  if (interviewData.notes) {
    description += `\n\nNotes: ${interviewData.notes}`
  }
  
  if (meetingDetails) {
    description += `\n\nJoin Video Call: ${meetingDetails.joinUrl}`
  } else if (interviewData.interviewType === 'in-person' && interviewData.location) {
    description += `\n\nLocation: ${interviewData.location}`
  }
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ReelHunter//Interview Scheduler//EN',
    'BEGIN:VEVENT',
    `UID:interview-${Date.now()}@reelhunter.com`,
    `DTSTART:${formatDate(startDateTime)}`,
    `DTEND:${formatDate(endDateTime)}`,
    `SUMMARY:Interview: ${interviewData.candidateName}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `ORGANIZER:MAILTO:${interviewData.interviewers.split(',')[0].trim()}`,
    `ATTENDEE:MAILTO:${interviewData.candidateEmail}`,
    ...interviewData.interviewers.split(',').map((email: string) => 
      `ATTENDEE:MAILTO:${email.trim()}`
    ),
    interviewData.location ? `LOCATION:${interviewData.location}` : '',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Interview reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n')
  
  return icsContent
}

// Email notification sender
async function sendEmailNotifications(interviewData: InterviewRequest, meetingDetails: VideoMeeting | null, calendarInvite: string) {
  try {
    const interviewDateTime = new Date(`${interviewData.date}T${interviewData.time}:00`)
    const formattedDate = interviewDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = interviewDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    
    // Candidate email
    const candidateEmailContent = generateCandidateEmail(
      interviewData,
      meetingDetails,
      formattedDate,
      formattedTime
    )
    
    // Interviewer email
    const interviewerEmailContent = generateInterviewerEmail(
      interviewData,
      meetingDetails,
      formattedDate,
      formattedTime
    )
    
    // Send emails (simulated for demo)
    console.log('Sending candidate email to:', interviewData.candidateEmail)
    console.log('Candidate email content:', candidateEmailContent)
    
    const interviewerEmails = interviewData.interviewers.split(',').map(email => email.trim())
    for (const email of interviewerEmails) {
      console.log('Sending interviewer email to:', email)
      console.log('Interviewer email content:', interviewerEmailContent)
    }
    
    console.log('Calendar invite (.ics file):', calendarInvite)
    
    // In production, integrate with your email service provider
    // Examples: SendGrid, Mailgun, Postmark, etc.
    
  } catch (error) {
    console.error('Failed to send email notifications:', error)
    throw new Error('Failed to send email notifications')
  }
}

// Candidate email template
function generateCandidateEmail(interviewData: InterviewRequest, meetingDetails: VideoMeeting | null, formattedDate: string, formattedTime: string): string {
  let meetingInfo = ''
  
  if (interviewData.interviewType === 'video' && meetingDetails) {
    meetingInfo = `
      <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="color: #0369a1; margin: 0 0 8px 0;">🎥 Video Interview Details</h3>
        <p style="margin: 4px 0;"><strong>Join Link:</strong> <a href="${meetingDetails.joinUrl}" style="color: #0ea5e9;">${meetingDetails.joinUrl}</a></p>
        <p style="margin: 4px 0; font-size: 14px; color: #64748b;">Please test your camera and microphone before the interview.</p>
      </div>
    `
  } else if (interviewData.interviewType === 'in-person' && interviewData.location) {
    meetingInfo = `
      <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="color: #15803d; margin: 0 0 8px 0;">📍 In-Person Interview</h3>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${interviewData.location}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #64748b;">Please arrive 10 minutes early.</p>
      </div>
    `
  } else if (interviewData.interviewType === 'phone') {
    meetingInfo = `
      <div style="background-color: #fefce8; border: 1px solid #eab308; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="color: #a16207; margin: 0 0 8px 0;">📞 Phone Interview</h3>
        <p style="margin: 4px 0;">We will call you at the scheduled time. Please ensure you're in a quiet location.</p>
      </div>
    `
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Interview Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #14b8a6; color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h1 style="margin: 0;">Interview Confirmed! 🎉</h1>
      </div>
      
      <div style="padding: 20px 0;">
        <p>Dear ${interviewData.candidateName},</p>
        
        <p>Your interview has been successfully scheduled. We're excited to meet with you!</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #1e293b; margin-top: 0;">Interview Details</h2>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> ${interviewData.duration} minutes</p>
          <p><strong>Type:</strong> ${interviewData.interviewType.charAt(0).toUpperCase() + interviewData.interviewType.slice(1)} Interview</p>
        </div>
        
        ${meetingInfo}
        
        ${interviewData.notes ? `
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="color: #475569; margin: 0 0 8px 0;">📝 Additional Notes</h3>
            <p style="margin: 0;">${interviewData.notes}</p>
          </div>
        ` : ''}
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0 0 8px 0;">📅 Calendar Reminder</h3>
          <p style="margin: 0;">A calendar invite (.ics file) is attached to this email. Click to add this interview to your calendar.</p>
        </div>
        
        <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
        
        <p>Best regards,<br>The ReelHunter Team</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; font-size: 12px; color: #64748b;">
        <p>This email was sent by ReelHunter. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
}

// Interviewer email template
function generateInterviewerEmail(interviewData: InterviewRequest, meetingDetails: VideoMeeting | null, formattedDate: string, formattedTime: string): string {
  let meetingInfo = ''
  
  if (interviewData.interviewType === 'video' && meetingDetails) {
    meetingInfo = `
      <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="color: #0369a1; margin: 0 0 8px 0;">🎥 Video Meeting Link</h3>
        <p style="margin: 4px 0;"><strong>Join Link:</strong> <a href="${meetingDetails.joinUrl}" style="color: #0ea5e9;">${meetingDetails.joinUrl}</a></p>
        <p style="margin: 4px 0;"><strong>Meeting ID:</strong> ${meetingDetails.meetingId}</p>
      </div>
    `
  } else if (interviewData.interviewType === 'in-person' && interviewData.location) {
    meetingInfo = `
      <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h3 style="color: #15803d; margin: 0 0 8px 0;">📍 Meeting Location</h3>
        <p style="margin: 4px 0;">${interviewData.location}</p>
      </div>
    `
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Interview Scheduled</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #14b8a6; color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h1 style="margin: 0;">New Interview Scheduled 📅</h1>
      </div>
      
      <div style="padding: 20px 0;">
        <p>Hello,</p>
        
        <p>A new interview has been scheduled and you've been added as an interviewer.</p>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #1e293b; margin-top: 0;">Interview Details</h2>
          <p><strong>Candidate:</strong> ${interviewData.candidateName}</p>
          <p><strong>Email:</strong> ${interviewData.candidateEmail}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> ${interviewData.duration} minutes</p>
          <p><strong>Type:</strong> ${interviewData.interviewType.charAt(0).toUpperCase() + interviewData.interviewType.slice(1)} Interview</p>
        </div>
        
        ${meetingInfo}
        
        ${interviewData.notes ? `
          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="color: #475569; margin: 0 0 8px 0;">📝 Interview Notes</h3>
            <p style="margin: 0;">${interviewData.notes}</p>
          </div>
        ` : ''}
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0 0 8px 0;">📅 Calendar Reminder</h3>
          <p style="margin: 0;">A calendar invite (.ics file) is attached to this email. Click to add this interview to your calendar.</p>
        </div>
        
        <p>Please prepare for the interview and contact the candidate if you need to reschedule.</p>
        
        <p>Best regards,<br>ReelHunter Platform</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; font-size: 12px; color: #64748b;">
        <p>This email was sent by ReelHunter. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `
}

// Response helpers
function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function createErrorResponse(error: any) {
  console.error('Error in schedule-interview:', error)
  
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}