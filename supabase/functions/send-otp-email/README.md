# Custom OTP Email Function via Resend

This Edge Function sends OTP PIN codes via Resend instead of using Supabase's built-in email service.

## Setup Instructions

### 1. Create the Edge Function

Deploy this function to Supabase:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-otp-email
```

### 2. Set Environment Variables

In Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add environment variable:
   - Key: `RESEND_API_KEY`
   - Value: Your Resend API key

### 3. Configure Supabase to Use Custom Email Function

1. Go to **Authentication** → **Email Templates**
2. Find the email template you want to customize
3. Use Supabase's webhook/custom email feature OR
4. Configure the function as a webhook endpoint

### 4. Update Your From Email

Edit `index.ts` line 29 to use your verified domain:
```typescript
from: 'AMP Calibration <noreply@yourdomain.com>',
```

### 5. Update Auth Code (Optional)

If using webhooks, you may need to update your auth code to call this function. However, Supabase should handle this automatically when configured in the dashboard.

## Alternative: Use Template Method (Simpler)

**Note:** The simpler approach is to just edit the email template in Supabase Dashboard (see `SUPABASE_OTP_SETUP.md`). This Edge Function approach gives you more control but requires more setup.

