# Password Reset Functionality Guide

## Overview

This guide explains how to set up and use the forgot password functionality in the AgriLink application.

## Features

- ✅ Secure password reset via email
- ✅ Time-limited reset tokens (1 hour expiry)
- ✅ Beautiful email templates
- ✅ Frontend validation and user feedback
- ✅ Security best practices (doesn't reveal if email exists)

## Setup Instructions

### 1. Backend Dependencies

The following packages have been installed:

- `nodemailer` - For sending emails
- `crypto` - For generating secure tokens

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:8080
```

### 3. Gmail App Password Setup

To use Gmail for sending emails:

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the generated password
4. Use this password in `EMAIL_PASS`

### 4. Database Schema Updates

The User model has been updated with:

- `resetPasswordToken` - Hashed reset token
- `resetPasswordExpires` - Token expiry timestamp

## API Endpoints

### POST /api/auth/forgot-password

Request password reset email.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### GET /api/auth/verify-reset-token/:token

Verify if a reset token is valid.

**Response:**

```json
{
  "message": "Token is valid",
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password

Reset password using token.

**Request:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123"
}
```

**Response:**

```json
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## Frontend Pages

### 1. Forgot Password Page (`/forgot-password`)

- Email input form
- Success state with instructions
- Links back to login

### 2. Reset Password Page (`/reset-password/:token`)

- Token validation
- New password and confirm password fields
- Password strength validation
- Success state

### 3. Updated Login Page

- Added "Forgot your password?" link
- Seamless navigation to forgot password flow

## Security Features

1. **Token Security:**

   - 32-byte random tokens
   - SHA-256 hashed storage
   - 1-hour expiration

2. **Email Privacy:**

   - Same response for existing/non-existing emails
   - Prevents email enumeration attacks

3. **Password Validation:**

   - Minimum 8 characters
   - Must contain letters and numbers
   - Frontend and backend validation

4. **Token Usage:**
   - Single-use tokens
   - Cleared after successful reset

## Testing

### Run the Test Script

```bash
node test-password-reset.cjs
```

### Manual Testing Flow

1. Go to `/login`
2. Click "Forgot your password?"
3. Enter email address
4. Check email for reset link
5. Click link to go to reset page
6. Enter new password
7. Verify login with new password

## Email Templates

### Password Reset Request Email

- Professional design with AgriLink branding
- Clear call-to-action button
- Security information
- Fallback text link

### Password Reset Success Email

- Confirmation of successful reset
- Security tips
- Professional branding

## Troubleshooting

### Email Not Sending

1. Check Gmail app password is correct
2. Verify 2FA is enabled on Gmail account
3. Check server logs for email errors
4. Ensure EMAIL_USER and EMAIL_PASS are set

### Token Not Working

1. Check token hasn't expired (1 hour limit)
2. Verify token is being used only once
3. Check server logs for validation errors

### Frontend Issues

1. Ensure all routes are properly configured
2. Check browser console for errors
3. Verify API endpoints are accessible

## Customization

### Email Templates

Edit `backend/utils/email.js` to customize:

- Email design and branding
- Email content and messaging
- Reset URL format

### Token Expiry

Modify the expiry time in `authController.js`:

```javascript
user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
```

### Password Requirements

Update validation in both frontend and backend:

- Frontend: `src/pages/ResetPassword.tsx`
- Backend: `backend/controllers/authController.js`

## Production Considerations

1. **Email Service:**

   - Consider using a dedicated email service (SendGrid, Mailgun)
   - Set up proper SPF/DKIM records
   - Monitor email delivery rates

2. **Security:**

   - Use HTTPS in production
   - Set up rate limiting on reset endpoints
   - Monitor for abuse patterns

3. **Monitoring:**
   - Log password reset attempts
   - Monitor failed reset attempts
   - Track email delivery success rates
