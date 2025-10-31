# Netlify Configuration for AMP Calibration Dashboard

## Problem

The `config.js` file contains Supabase credentials and is in `.gitignore` for security, so it's not deployed to Netlify. This causes a 404 error in production.

## Solution: Use Netlify Environment Variables

### Step 1: Add Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

   **Variable Name:** `SUPABASE_URL`  
   **Value:** `https://edcrednhbzpovwxriluc.supabase.co`

   **Variable Name:** `SUPABASE_ANON_KEY`  
   **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JlZG5oYnpwb3Z3eHJpbHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjkwMzAsImV4cCI6MjA3NzM0NTAzMH0.uMYJmXrg8yf29laB6eio1iVCSsVDfG17Uz2xvqjoAFA`

### Step 2: Create a Build Script (Optional)

If you want to inject environment variables at build time, create a `netlify.toml` or add a build script:

#### Option A: Use `netlify.toml`

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "."

[[plugins]]
  package = "@netlify/plugin-inline-source"

[build.environment]
  SUPABASE_URL = "https://edcrednhbzpovwxriluc.supabase.co"
  SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JlZG5oYnpwb3Z3eHJpbHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjkwMzAsImV4cCI6MjA3NzM0NTAzMH0.uMYJmXrg8yf29laB6eio1iVCSsVDfG17Uz2xvqjoAFA"
```

#### Option B: Create `_redirects` file (for Netlify Functions)

If using Netlify Functions, you can inject variables there.

### Step 3: Inject Environment Variables into HTML

Since Netlify environment variables aren't directly accessible in client-side JavaScript, you need to inject them. The updated `config.js` now supports this, but you need to add a script tag before `config.js` loads:

**Add to all HTML files (login.html, dashboard.html, verify.html):**

```html
<!-- Inject Netlify environment variables (only works if you set them up) -->
<script>
  // These will be available if Netlify injects them
  // For now, config.js will fall back to hardcoded values
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm" type="module"></script>
<script src="config.js"></script>
```

**Better Solution: Use Netlify Build Plugin or Build Script**

Create a simple build script that generates a `config.js` file with the environment variables:

Create `build-config.js`:

```javascript
// build-config.js - Run this during Netlify build
const fs = require('fs');
const config = `// Auto-generated config for Netlify
const SUPABASE_CONFIG = {
  url: '${process.env.SUPABASE_URL || 'https://edcrednhbzpovwxriluc.supabase.co'}',
  anonKey: '${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JlZG5oYnpwb3Z3eHJpbHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjkwMzAsImV4cCI6MjA3NzM0NTAzMH0.uMYJmXrg8yf29laB6eio1iVCSsVDfG17Uz2xvqjoAFA'}'
};
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
`;

fs.writeFileSync('config.js', config);
console.log('✅ Generated config.js from environment variables');
```

Then update `package.json` to run this before deploy:

```json
{
  "scripts": {
    "build": "node build-config.js",
    "prebuild": "node build-config.js"
  }
}
```

### Recommended Approach

The simplest solution: **Update `config.js` to commit it with your actual values** (since anon keys are safe to expose) and ensure it's NOT in `.gitignore`, OR use the updated `config.js` which has fallback values hardcoded.

The updated `config.js` now includes your credentials as fallback values, so it will work on Netlify without environment variables. The environment variable support is there for if you want to change them later without modifying code.

