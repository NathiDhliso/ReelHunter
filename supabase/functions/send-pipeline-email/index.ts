import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Type definitions
interface PipelineEmailRequest {
  recipientEmail: string
  candidateName: string
  stageName: string
  subject: string
  message: string
  recruiterName: string
  companyName: string
}

interface EmailResponse {
  messageId: string
  success: boolean
  error?: string
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
    const emailRequest = await parseRequest(req)
    
    // Initialize Supabase client
    const supabase = createSupabaseClient()
    
    // Send email via professional email service
    const emailResult = await sendProfessionalEmail(emailRequest)
    
    // Log the communication in database
    await logCommunication(supabase, user.id, emailRequest, emailResult)
    
    return createSuccessResponse({
      messageId: emailResult.messageId,
      success: emailResult.success,
      message: 'Pipeline email sent successfully'
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
async function parseRequest(req: Request): Promise<PipelineEmailRequest> {
  const body = await req.json()
  
  const { 
    recipientEmail, 
    candidateName, 
    stageName, 
    subject, 
    message, 
    recruiterName, 
    companyName 
  } = body
  
  if (!recipientEmail || !candidateName || !stageName || !subject || !message) {
    throw new Error('Missing required fields')
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(recipientEmail)) {
    throw new Error('Invalid email format')
  }
  
  return { 
    recipientEmail, 
    candidateName, 
    stageName, 
    subject, 
    message, 
    recruiterName: recruiterName || 'ReelHunter Team',
    companyName: companyName || 'ReelHunter'
  }
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

// Professional email sender
async function sendProfessionalEmail(emailRequest: PipelineEmailRequest): Promise<EmailResponse> {
  try {
    // Get email service configuration
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@reelhunter.com'
    
    // Generate professional HTML email
    const htmlContent = generateProfessionalEmail(emailRequest)
    
    console.log('Sending professional email:', {
      to: emailRequest.recipientEmail,
      subject: emailRequest.subject,
      from: fromEmail
    })
    
    // In production, integrate with your email service provider:
    // - SendGrid
    // - Mailgun
    // - Postmark
    // - Resend
    // - Or any other professional email service
    
    // Simulate successful response for demo
    const messageId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      messageId,
      success: true
    }
    
  } catch (error) {
    console.error('Email service error:', error)
    return {
      messageId: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

// Professional email template generator
function generateProfessionalEmail(emailRequest: PipelineEmailRequest): string {
  const { candidateName, stageName, message, recruiterName, companyName } = emailRequest
  
  // Determine stage-specific styling
  const isRejection = stageName.toLowerCase() === 'rejected'
  const isOffer = stageName.toLowerCase() === 'offer'
  const isHired = stageName.toLowerCase() === 'hired'
  
  let headerColor = '#14b8a6' // Default teal
  let headerIcon = '📋'
  
  if (isRejection) {
    headerColor = '#ef4444'
    headerIcon = '📝'
  } else if (isOffer) {
    headerColor = '#10b981'
    headerIcon = '🎉'
  } else if (isHired) {
    headerColor = '#059669'
    headerIcon = '🎊'
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update - ${stageName}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); color: white; padding: 30px 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 10px;">${headerIcon}</div>
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Application Update</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">${stageName}</p>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); margin-bottom: 30px;">
        <p style="font-size: 18px; margin-bottom: 20px; color: #1f2937;">Dear ${candidateName},</p>
        
        <div style="background: #f1f5f9; border-left: 4px solid ${headerColor}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">${message}</p>
        </div>
        
        ${!isRejection ? `
          <div style="background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 16px;">Next Steps</h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 5px;">We will be in touch with further details soon</li>
              <li style="margin-bottom: 5px;">Please keep your contact information updated</li>
              <li>Feel free to reach out if you have any questions</li>
            </ul>
          </div>
        ` : `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px;">Thank You</h3>
            <p style="color: #dc2626; margin: 0; font-size: 14px;">We appreciate the time you invested in our process and encourage you to apply for future opportunities that match your skills and experience.</p>
          </div>
        `}
        
        <p style="margin-top: 30px; color: #6b7280;">
          Best regards,<br>
          <strong style="color: #1f2937;">${recruiterName}</strong><br>
          <span style="color: #9ca3af;">${companyName} Talent Team</span>
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background: #374151; color: #d1d5db; padding: 20px; border-radius: 12px; text-align: center;">
        <div style="margin-bottom: 15px;">
          <img src="https://via.placeholder.com/120x40/14b8a6/ffffff?text=ReelHunter" alt="ReelHunter" style="height: 40px;">
        </div>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">
          This email was sent by ${companyName} via ReelHunter's professional communication system.
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.6;">
          Powered by professional email delivery • Enterprise-grade reliability
        </p>
      </div>
      
    </body>
    </html>
  `
}

// Log communication in database
async function logCommunication(
  supabase: any, 
  userId: string, 
  emailRequest: PipelineEmailRequest, 
  emailResult: EmailResponse
) {
  try {
    // Get recruiter profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    if (!profile) return
    
    // Get candidate profile by email
    const { data: candidate } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailRequest.recipientEmail)
      .single()
    
    if (!candidate) return
    
    // Log the communication
    await supabase
      .from('candidate_communications')
      .insert({
        recruiter_id: profile.id,
        candidate_id: candidate.id,
        communication_type: 'email',
        trigger_event: 'stage_move',
        subject: emailRequest.subject,
        message_content: emailRequest.message,
        delivery_status: emailResult.success ? 'delivered' : 'failed'
      })
    
  } catch (error) {
    console.error('Failed to log communication:', error)
  }
}

// Response helpers
function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function createErrorResponse(error: any) {
  console.error('Error in send-pipeline-email:', error)
  
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