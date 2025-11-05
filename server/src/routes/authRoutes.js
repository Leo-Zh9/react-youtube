import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save hook
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User logged in: ${user.email}${user.isAdmin ? ' (Admin)' : ''}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

// GET /api/auth/me - Get current user info (requires auth)
router.get('/me', async (req, res) => {
  try {
    // This route will be protected by auth middleware
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not (security)
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Email content (Netflix-style black and white design)
    const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password - ReactFlix</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Full Width Background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0d0d0d; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #000000;">
          
          <!-- Logo/Brand Section -->
          <tr>
            <td style="padding: 50px 40px 30px 40px; text-align: center; background-color: #000000;">
              <h1 style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 4px; margin: 0; text-transform: uppercase;">
                REACTFLIX
              </h1>
              <div style="width: 60px; height: 3px; background-color: #ffffff; margin: 20px auto 0 auto;"></div>
            </td>
          </tr>
          
          <!-- Main Content Section -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 60px 50px; border: 1px solid #1f1f1f;">
              
              <!-- Greeting -->
              <h2 style="color: #ffffff; font-size: 28px; font-weight: 600; margin: 0 0 24px 0; line-height: 1.3;">
                Reset Your Password
              </h2>
              
              <!-- Body Text -->
              <p style="color: #c4c4c4; font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
                We received a request to reset the password for your ReactFlix account. Click the button below to choose a new password.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 36px 0;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:54px;v-text-anchor:middle;width:240px;" arcsize="7%" strokecolor="#ffffff" fillcolor="#ffffff">
                      <w:anchorlock/>
                      <center style="color:#000000;font-family:sans-serif;font-size:16px;font-weight:700;">RESET PASSWORD</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; font-weight: 700; font-size: 16px; padding: 18px 60px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase; border: 2px solid #ffffff; transition: all 0.3s ease;">
                      Reset Password
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #2a2a2a; margin: 36px 0;"></div>
              
              <!-- Alternative Link Section -->
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <div style="margin: 0 0 32px 0; padding: 16px; background-color: #151515; border-radius: 6px; border: 1px solid #2a2a2a;">
                <p style="color: #5c9fff; font-size: 13px; line-height: 1.8; word-break: break-all; margin: 0; font-family: 'Courier New', Courier, monospace;">
                  ${resetUrl}
                </p>
              </div>
              
              <!-- Warning Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(90deg, #1a1a1a 0%, #0f0f0f 100%); border-left: 4px solid #ffffff; margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #ffffff; font-size: 15px; margin: 0; font-weight: 600;">
                      ⏰ This link expires in 15 minutes
                    </p>
                    <p style="color: #b3b3b3; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">
                      For your security, this password reset link can only be used once.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Note -->
              <div style="background-color: #0f0f0f; padding: 20px; border-radius: 6px; border: 1px solid #1f1f1f;">
                <p style="color: #999999; font-size: 14px; line-height: 1.7; margin: 0;">
                  <strong style="color: #cccccc;">Didn't request this?</strong><br>
                  If you didn't request a password reset, you can safely ignore this email. Your account remains secure and no changes have been made.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="background-color: #000000; padding: 40px 40px 50px 40px; text-align: center;">
              <p style="color: #666666; font-size: 13px; margin: 0 0 8px 0; line-height: 1.6;">
                © ${new Date().getFullYear()} ReactFlix. All rights reserved.
              </p>
              <p style="color: #4d4d4d; font-size: 12px; margin: 0; line-height: 1.5;">
                This is an automated message, please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
    `;

    // Send email (or print link in development)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - ReactFlix',
        html: message,
      });

      console.log(`✅ Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Email send failed:', emailError.message);
    }

    // In development, ALWAYS show the reset link in console (whether email sent or not)
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('🔗 PASSWORD RESET LINK (Copy this to test):');
      console.log(`   ${resetUrl}`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`📧 For user: ${user.email}`);
      console.log('⏰ Expires in: 15 minutes');
      console.log('═══════════════════════════════════════════════════════════\n');
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // If email fails, remove the reset token
    if (error.message === 'Failed to send email') {
      try {
        const user = await User.findOne({ email: req.body.email?.toLowerCase() });
        if (user) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();
        }
      } catch (err) {
        console.error('Error clearing reset token:', err);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error processing request. Please try again later.',
    });
  }
});

// POST /api/auth/reset-password/:token - Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.passwordHash = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
});

export default router;

