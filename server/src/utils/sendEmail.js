import nodemailer from 'nodemailer';

/**
 * Check if email is configured
 */
export const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

/**
 * Send email using nodemailer
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
    console.log('Add these to server/.env to enable email:');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('═══════════════════════════════════════════════════════════');
    
    // In development, don't throw error - just log it
    if (process.env.NODE_ENV === 'development') {
      return { messageId: 'dev-mode-no-email' };
    }
    
    throw new Error('Email configuration missing');
  }

  try {
    console.log(`📧 Attempting to send email to: ${options.to}`);
    console.log(`   Using SMTP: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
    
    // Create transporter with timeout
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 15000,     // 15 seconds
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"ReactFlix Support" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Send email with timeout promise
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout after 20 seconds')), 20000)
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    
    console.log(`✅ Email sent successfully to: ${options.to}`);
    console.log(`   Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('   Error details:', error);
    throw new Error('Failed to send email');
  }
};

