# Supabase OTP (PIN Code) Email Template Setup

To send PIN codes instead of magic links, you need to configure the email template in Supabase.

## Steps to Configure OTP Email Template

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open Email Templates**
   - Go to **Authentication** → **Email Templates**
   - Find the **"Magic Link"** template (or "Email OTP" template if available)

3. **Update the Template**

   Replace the existing template content with:

   ```html
   <h2>Your AMP Calibration PIN Code</h2>
   <p>Enter this code to log in to your account:</p>
   <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; margin: 20px 0;">{{ .Token }}</h1>
   <p>This code expires in 5 minutes.</p>
   <p>If you didn't request this code, you can safely ignore this email.</p>
   ```

   **Important:** Use `{{ .Token }}` to display the 6-digit PIN code. Do NOT use `{{ .ConfirmationURL }}` (that's for magic links).

4. **Template Variables Available**
   - `{{ .Token }}` - The 6-digit PIN code
   - `{{ .SiteURL }}` - Your site URL
   - `{{ .Email }}` - User's email address

5. **Save the Template**
   - Click **Save** to apply the changes

## Alternative: Use "Email OTP" Template

If Supabase has a separate "Email OTP" template:
1. Go to **Authentication** → **Email Templates**
2. Select **"Email OTP"** template
3. Customize it to show `{{ .Token }}`
4. Ensure it's enabled

## Testing

After updating the template:
1. Go to your login page
2. Enter your email
3. Check your email - you should now receive a 6-digit PIN code instead of a magic link
4. Enter the code on the login page to complete authentication

## Troubleshooting

- **Still getting magic links?** Make sure you saved the template changes
- **PIN not working?** Verify the template uses `{{ .Token }}` not `{{ .ConfirmationURL }}`
- **Template not found?** Check if your Supabase plan supports custom email templates

