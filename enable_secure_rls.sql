-- Create contact_submissions table for AMP Calibration contact form
-- Run this SQL in your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from the website';

-- Add comments to columns
COMMENT ON COLUMN contact_submissions.id IS 'Unique identifier for each submission';
COMMENT ON COLUMN contact_submissions.first_name IS 'First name of the person submitting the form';
COMMENT ON COLUMN contact_submissions.last_name IS 'Last name of the person submitting the form (optional)';
COMMENT ON COLUMN contact_submissions.email IS 'Email address of the person submitting the form';
COMMENT ON COLUMN contact_submissions.message IS 'Message content from the contact form (optional)';
COMMENT ON COLUMN contact_submissions.created_at IS 'Timestamp when the submission was created';

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions (required for policies to work)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON contact_submissions TO anon;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO anon;

-- Drop existing policies if they exist (allows re-running this script)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated selects" ON contact_submissions;

-- Create policy to allow anonymous users to INSERT (submit forms)
CREATE POLICY "Allow anonymous inserts"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to SELECT (view submissions)
-- Only if you want authenticated users to view submissions
CREATE POLICY "Allow authenticated selects"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Add index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Optional: Add index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

