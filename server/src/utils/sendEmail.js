import { Resend } from 'resend';

/**
 * Check if email is configured
 */
export const isEmailConfigured = () => {
  // Check for Resend API key (starts with re_)
  const hasResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_');
  
  if (!hasResend) {
    console.warn('⚠️  Resend API key not configured');
    return false;
  }
  
  return true;
};

/**
 * Send email using Resend
 * @param {Object} options - Email options (to, subject, text, html)
 */
export const sendEmail = async (options) => {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email not configured - Skipping email send (Development Mode)');
    console.log('📧 Would have sent email to:', options.to);
    console.log('📝 Subject:', options.subject);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️  RESEND API KEY MISSING');
    console.log('Add this to your environment variables:');
    console.log('   RESEND_API_KEY=re_your-api-key');
    console.log('   EMAIL_FROM=ReactFlix <onboarding@resend.dev>');
    console.log('═══════════════════════════════════════════════════════════');
    
    // In development, don't throw error - just log it
    if (process.env.NODE_ENV === 'development') {
      return { id: 'dev-mode-no-email' };
    }
    
    throw new Error('Email configuration missing');
  }

  try {
    console.log(`📧 Attempting to send email to: ${options.to}`);
    console.log(`   Using Resend API`);
    
    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'ReactFlix <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      throw new Error(error.message || 'Failed to send email');
    }
    
    console.log(`✅ Email sent successfully to: ${options.to}`);
    console.log(`   Email ID: ${data.id}`);
    return { 
      messageId: data.id,
      success: true 
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};

