import sgMail from '@sendgrid/mail';

/**
 * Check if email is configured
 */
export const isEmailConfigured = () => {
  // Check for SendGrid API key (starts with SG.)
  const hasSendGrid = process.env.EMAIL_PASS && process.env.EMAIL_PASS.startsWith('SG.');
  
  if (!hasSendGrid) {
    console.warn('⚠️  SendGrid API key not configured');
    return false;
  }
  
  return true;
};

/**
 * Send email using SendGrid HTTP API
 * @param {Object} options - Email options (to, subject, text, html)
 */
export const sendEmail = async (options) => {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email not configured - Skipping email send (Development Mode)');
    console.log('📧 Would have sent email to:', options.to);
    console.log('📝 Subject:', options.subject);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️  SENDGRID API KEY MISSING');
    console.log('Add this to your environment variables:');
    console.log('   EMAIL_PASS=SG.your-sendgrid-api-key');
    console.log('   EMAIL_FROM=Your Name <email@example.com>');
    console.log('═══════════════════════════════════════════════════════════');
    
    // In development, don't throw error - just log it
    if (process.env.NODE_ENV === 'development') {
      return { messageId: 'dev-mode-no-email' };
    }
    
    throw new Error('Email configuration missing');
  }

  try {
    console.log(`📧 Attempting to send email to: ${options.to}`);
    console.log(`   Using SendGrid HTTP API (not SMTP)`);
    
    // Set SendGrid API key
    sgMail.setApiKey(process.env.EMAIL_PASS);

    // Prepare email message
    const msg = {
      to: options.to,
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      subject: options.subject,
      text: options.text || 'Please enable HTML to view this email',
      html: options.html,
    };

    // Send email via SendGrid HTTP API
    const [response] = await sgMail.send(msg);
    
    console.log(`✅ Email sent successfully to: ${options.to}`);
    console.log(`   Status Code: ${response.statusCode}`);
    return { 
      messageId: response.headers['x-message-id'],
      statusCode: response.statusCode 
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    // SendGrid-specific error handling
    if (error.response) {
      console.error('   SendGrid Error:', error.response.body);
    }
    
    throw new Error('Failed to send email');
  }
};

