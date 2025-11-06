import * as brevo from '@getbrevo/brevo';

/**
 * Check if email is configured
 */
export const isEmailConfigured = () => {
  return !!(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
};

/**
 * Send email using Brevo (Sendinblue)
 * @param {Object} options - Email options (to, subject, text, html)
 */
export const sendEmail = async (options) => {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email not configured - Skipping email send (Development Mode)');
    console.log('📧 Would have sent email to:', options.to);
    console.log('📝 Subject:', options.subject);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️  BREVO API KEY MISSING');
    console.log('Add these to your environment variables:');
    console.log('   BREVO_API_KEY=xkeysib-your-api-key');
    console.log('   EMAIL_FROM=Your Name <your-email@gmail.com>');
    console.log('═══════════════════════════════════════════════════════════');
    
    // In development, don't throw error - just log it
    if (process.env.NODE_ENV === 'development') {
      return { messageId: 'dev-mode-no-email' };
    }
    
    throw new Error('Email configuration missing');
  }

  try {
    console.log(`📧 Attempting to send email to: ${options.to}`);
    console.log(`   Using Brevo API (no port blocking!)`);
    
    // Initialize Brevo API
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    // Parse sender email
    const senderMatch = process.env.EMAIL_FROM.match(/(?:"?([^"]*)"?\s)?(?:<)?([^>]+)(?:>)?/);
    const senderName = senderMatch[1] || 'ReactFlix';
    const senderEmail = senderMatch[2] || process.env.EMAIL_FROM;

    // Prepare email
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: options.to }];
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html;
    sendSmtpEmail.textContent = options.text || 'Please enable HTML to view this email';

    // Send email via Brevo
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log(`✅ Email sent successfully to: ${options.to}`);
    console.log(`   Message ID: ${response.messageId}`);
    return { 
      messageId: response.messageId,
      success: true 
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    if (error.response) {
      console.error('   Brevo Error:', error.response.text || error.response.body);
    }
    throw new Error('Failed to send email');
  }
};

