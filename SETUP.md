# AMP Calibration Dashboard Setup Guide

## Prerequisites

- Supabase account and project
- Node.js installed (for running the server)

## Setup Steps

### 1. Supabase Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `setup_database.sql` to create:
   - `user_profiles` table
   - Row Level Security (RLS) policies
   - Trigger function to auto-create profiles on user signup

### 2. Supabase Authentication Setup

1. In Supabase Dashboard, go to **Authentication > Providers**
2. Enable **Email** provider
3. Configure email templates:
   - Go to **Authentication > Email Templates**
   - Customize the "Magic Link" template if desired

### 3. Supabase Redirect URLs

1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Add these redirect URLs:
   - **Site URL**: `http://localhost:3000` (development) or your production URL
   - **Redirect URLs**:
     - `http://localhost:3000/verify`
     - `http://localhost:3000/dashboard`
     - Your production URLs (e.g., `https://yourdomain.com/verify`, `https://yourdomain.com/dashboard`)

### 4. Update External Links

In `dashboard.js`, update the external URLs:

```javascript
const EXTERNAL_LINKS = {
  technician: {
    ampcalOS: 'https://your-ampcalos-url.com' // Update this
  },
  customer: {
    vault: 'https://your-vault-url.com' // Update this
  }
};
```

### 5. Configure User Roles

To set user roles:

1. Go to Supabase Dashboard > Table Editor > `user_profiles`
2. Update the `role` column for users:
   - `technician` - Access to ampcalOS
   - `customer` - Access to The Vault
   - `admin` - Access to both

Or use SQL:

```sql
UPDATE user_profiles 
SET role = 'technician' 
WHERE email = 'user@example.com';
```

### 6. Install Dependencies

```bash
npm install
```

### 7. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## Testing

1. Visit `http://localhost:3000/login`
2. Enter your email address
3. Check your email for the magic link
4. Click the link to verify and login
5. You should be redirected to the dashboard with appropriate menu items based on your role

## Troubleshooting

### Users can't login
- Check that Email provider is enabled in Supabase
- Verify redirect URLs are configured correctly
- Check browser console for errors

### Users see "Profile not found"
- Ensure the database trigger is set up (from `setup_database.sql`)
- Manually create a profile:
  ```sql
  INSERT INTO user_profiles (id, email, role)
  VALUES ('user-uuid', 'user@example.com', 'customer');
  ```

### Magic link doesn't work
- Check that redirect URLs match exactly (including http/https and trailing slashes)
- Verify email templates are enabled
- Check spam folder for magic link emails

### Menu items not showing correctly
- Verify user has a role set in `user_profiles` table
- Check `dashboard.js` menu configuration
- Update external URLs in `dashboard.js` if needed

## Production Deployment

1. Update `config.js` with production Supabase credentials (or use environment variables)
2. Update redirect URLs in Supabase dashboard
3. Update external links in `dashboard.js`
4. Deploy server and static files
5. Test authentication flow

