import { supabase } from './supabase'

export interface EmailTemplate {
  subject: string
  body: string
  variables?: Record<string, string>
}

export interface EmailConfig {
  fromEmail: string
  fromName: string
  replyTo?: string
  trackOpens?: boolean
  trackClicks?: boolean
}

export interface SendEmailRequest {
  to: string | string[]
  subject: string
  body: string
  isHtml?: boolean
  attachments?: EmailAttachment[]
  replyTo?: string
  cc?: string[]
  bcc?: string[]
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * ReelHunter Email Service
 * 
 * Currently configured to use Supabase's built-in email service (Inbucket for development).
 * For production, this should be configured with AWS SES or another production email service.
 */
class EmailService {
  private config: EmailConfig = {
    fromEmail: 'noreply@reelhunter.co.za',
    fromName: 'ReelHunter Platform',
    replyTo: 'support@reelhunter.co.za',
    trackOpens: true,
    trackClicks: true
  }

  /**
   * Get the current email configuration
   */
  getConfig(): EmailConfig {
    return { ...this.config }
  }

  /**
   * Update email configuration
   */
  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Send an email using Supabase Edge Function (recommended for production)
   */
  async sendEmail(request: SendEmailRequest): Promise<EmailSendResult> {
    try {
      console.log('[EmailService] Sending email to:', request.to)
      
      // Input validation
      if (!request.to || (Array.isArray(request.to) && request.to.length === 0)) {
        throw new Error('No recipients specified')
      }
      
      if (!request.subject || request.subject.trim().length === 0) {
        throw new Error('Email subject is required')
      }
      
      if (!request.body || request.body.trim().length === 0) {
        throw new Error('Email body is required')
      }

      // For development, we'll use Supabase's built-in email service
      // In production, this should call a Supabase Edge Function that integrates with SES
      const emailData = {
        to: Array.isArray(request.to) ? request.to : [request.to],
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        subject: request.subject,
        html: request.isHtml ? request.body : undefined,
        text: !request.isHtml ? request.body : undefined,
        replyTo: request.replyTo || this.config.replyTo,
        cc: request.cc,
        bcc: request.bcc,
        attachments: request.attachments
      }

      // In development mode, log the email instead of sending
      if (import.meta.env.DEV) {
        console.log('[EmailService] Development mode - Email would be sent:', {
          ...emailData,
          body: request.body.slice(0, 100) + '...'
        })
        
        return {
          success: true,
          messageId: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      }

      // For production, call the email Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      })

      if (error) {
        console.error('[EmailService] Failed to send email:', error)
        return {
          success: false,
          error: error.message || 'Failed to send email'
        }
      }

      console.log('[EmailService] Email sent successfully:', data?.messageId)
      return {
        success: true,
        messageId: data?.messageId
      }

    } catch (error) {
      console.error('[EmailService] Email sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      }
    }
  }

  /**
   * Send a pipeline stage transition email
   */
  async sendStageTransitionEmail(
    candidateEmail: string,
    candidateName: string,
    fromStage: string,
    toStage: string,
    template?: string
  ): Promise<EmailSendResult> {
    try {
      const subject = `Update on Your Application - ${toStage} Stage`
      
      let body = template || this.getDefaultStageTransitionTemplate(fromStage, toStage)
      
      // Replace variables in the template
      body = body
        .replace(/\{\{candidateName\}\}/g, candidateName)
        .replace(/\{\{fromStage\}\}/g, fromStage)
        .replace(/\{\{toStage\}\}/g, toStage)
        .replace(/\{\{companyName\}\}/g, 'Our Company')

      return await this.sendEmail({
        to: candidateEmail,
        subject,
        body,
        isHtml: true
      })

    } catch (error) {
      console.error('[EmailService] Stage transition email error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send stage transition email'
      }
    }
  }

  /**
   * Send interview scheduling email
   */
  async sendInterviewInvite(
    candidateEmail: string,
    candidateName: string,
    interviewDetails: {
      date: string
      time: string
      type: string
      location?: string
      duration: string
      interviewers: string
    }
  ): Promise<EmailSendResult> {
    try {
      const subject = `Interview Invitation - ${interviewDetails.type} Interview`
      
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Invitation</h2>
          
          <p>Dear ${candidateName},</p>
          
          <p>We are pleased to invite you for an interview for the position you applied for.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Interview Details:</h3>
            <p><strong>Date:</strong> ${interviewDetails.date}</p>
            <p><strong>Time:</strong> ${interviewDetails.time}</p>
            <p><strong>Type:</strong> ${interviewDetails.type}</p>
            <p><strong>Duration:</strong> ${interviewDetails.duration} minutes</p>
            <p><strong>Interviewer(s):</strong> ${interviewDetails.interviewers}</p>
            ${interviewDetails.location ? `<p><strong>Location:</strong> ${interviewDetails.location}</p>` : ''}
          </div>
          
          <p>Please confirm your attendance by replying to this email.</p>
          
          <p>If you have any questions or need to reschedule, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          The ReelHunter Team</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent by ReelHunter Platform. Please do not reply to this automated message.
          </p>
        </div>
      `

      return await this.sendEmail({
        to: candidateEmail,
        subject,
        body,
        isHtml: true
      })

    } catch (error) {
      console.error('[EmailService] Interview invite email error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send interview invitation'
      }
    }
  }

  /**
   * Get default stage transition email template
   */
  private getDefaultStageTransitionTemplate(fromStage: string, toStage: string): string {
    const templates: Record<string, string> = {
      'Applied': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Received</h2>
          <p>Dear {{candidateName}},</p>
          <p>Thank you for your application. We have received your profile and will review it shortly.</p>
          <p>We will be in touch with next steps within 2-3 business days.</p>
          <p>Best regards,<br>The ReelHunter Team</p>
        </div>
      `,
      'Screening': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Screening Stage</h2>
          <p>Dear {{candidateName}},</p>
          <p>Congratulations! Your profile has passed our initial review. We would like to schedule a screening call with you.</p>
          <p>We will be in touch shortly to arrange a convenient time.</p>
          <p>Best regards,<br>The ReelHunter Team</p>
        </div>
      `,
      'Interview': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Stage</h2>
          <p>Dear {{candidateName}},</p>
          <p>Great news! We would like to invite you for an interview. Please let us know your availability for the coming week.</p>
          <p>We look forward to speaking with you soon.</p>
          <p>Best regards,<br>The ReelHunter Team</p>
        </div>
      `,
      'Offer': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Job Offer</h2>
          <p>Dear {{candidateName}},</p>
          <p>Excellent! We are pleased to extend you an offer. Please review the attached details and let us know if you have any questions.</p>
          <p>We are excited about the possibility of having you join our team.</p>
          <p>Best regards,<br>The ReelHunter Team</p>
        </div>
      `,
      'Hired': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Welcome to the Team!</h2>
          <p>Dear {{candidateName}},</p>
          <p>Welcome to the team! We are excited to have you on board. HR will be in touch with onboarding details.</p>
          <p>Looking forward to working with you!</p>
          <p>Best regards,<br>The ReelHunter Team</p>
        </div>
      `,
      'Rejected': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Application Update</h2>
          <p>Dear {{candidateName}},</p>
          <p>Thank you for your time and interest in our company. While we will not be moving forward with your application at this time, we encourage you to apply for future opportunities that match your skills.</p>
          <p>We wish you the best in your career journey.</p>
          <p>Best regards,<br>The ReelHunter Team</p>
        </div>
      `
    }

    return templates[toStage] || templates['Applied']
  }

  /**
   * Validate email configuration for production use
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.config.fromEmail || !this.isValidEmail(this.config.fromEmail)) {
      errors.push('Invalid from email address')
    }

    if (!this.config.fromName || this.config.fromName.trim().length === 0) {
      errors.push('From name is required')
    }

    // Check if SES is properly configured (this would be environment-specific)
    if (!import.meta.env.DEV) {
      // In production, you would check for SES credentials here
      // For now, we'll assume it's configured if not in dev mode
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Get email delivery statistics (if using SES)
   */
  async getEmailStats(): Promise<{ sent: number; delivered: number; bounced: number; complaints: number } | null> {
    try {
      // This would integrate with SES APIs to get delivery statistics
      // For now, return mock data
      return {
        sent: 150,
        delivered: 145,
        bounced: 3,
        complaints: 2
      }
    } catch (error) {
      console.error('[EmailService] Failed to get email stats:', error)
      return null
    }
  }
}

// Additional interfaces for pipeline notifications
export interface StageNotificationData {
  candidateEmail: string
  candidateName: string
  fromStage: string
  toStage: string
  companyName: string
  recruiterName: string
}

/**
 * Send a stage notification email when a candidate is moved in the pipeline
 */
export async function sendStageNotificationEmail(data: StageNotificationData): Promise<EmailSendResult> {
  try {
    const subject = `Application Update: ${data.toStage} Stage`
    
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Application Update</h1>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear ${data.candidateName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We wanted to update you on the status of your application with ${data.companyName}. 
            Your application has been moved from <strong>${data.fromStage}</strong> to <strong>${data.toStage}</strong>.
          </p>
          
          <div style="background: #f8fafc; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #0f766e; font-weight: 500;">
              Current Status: ${data.toStage}
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We will keep you updated as your application progresses. If you have any questions, 
            please don't hesitate to reach out.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Best regards,<br>
            ${data.recruiterName}<br>
            ${data.companyName}
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">This is an automated notification from ${data.companyName} recruitment system.</p>
        </div>
      </div>
    `

    return await emailService.sendEmail({
      to: data.candidateEmail,
      subject,
      body,
      isHtml: true
    })

  } catch (error) {
    console.error('[EmailService] Stage notification email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send stage notification email'
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export default for easier importing
export default emailService 