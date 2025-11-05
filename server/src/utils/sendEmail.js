import nodemailer from 'nodemailer';

/**
 * Check if email is configured
 */
export const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

/**
 * Send email using Gmail SMTP on port 465 (SSL)
 * @param {Object} options - Email options (to, subject, text, html)
 */
export const sendEmail = async (options) => {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email not configured - Skipping email send (Development Mode)');
    console.log('📧 Would have sent email to:', options.to);
    console.log('📝 Subject:', options.subject);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️  EMAIL CONFIGURATION MISSING');
    console.log('Add these to your environment variables:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=465');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
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
    console.log(`   Using Gmail SMTP on port 465 (SSL)`);
    
    // Create transporter with SSL (port 465)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: true, // true for port 465, false for port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"ReactFlix" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || 'Please enable HTML to view this email',
      html: options.html,
    };

    // Send email with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout after 20 seconds')), 20000)
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    
    console.log(`✅ Email sent successfully to: ${options.to}`);
    console.log(`   Message ID: ${info.messageId}`);
    return { 
      messageId: info.messageId,
      success: true 
    };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('   Error details:', error);
    throw new Error('Failed to send email');
  }
};

