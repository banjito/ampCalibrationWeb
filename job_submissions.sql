-- Create job_submissions table for AMP Calibration jobs form
-- Run this SQL in your Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS job_submissions (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  message TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE job_submissions IS 'Stores job application submissions from the website';

-- Add comments to columns
COMMENT ON COLUMN job_submissions.id IS 'Unique identifier for each submission';
COMMENT ON COLUMN job_submissions.first_name IS 'First name of the applicant';
COMMENT ON COLUMN job_submissions.last_name IS 'Last name of the applicant (optional)';
COMMENT ON COLUMN job_submissions.email IS 'Email address of the applicant';
COMMENT ON COLUMN job_submissions.message IS 'Application message from the applicant (optional)';
COMMENT ON COLUMN job_submissions.resume_url IS 'URL to the uploaded resume file in Supabase Storage (optional)';
COMMENT ON COLUMN job_submissions.created_at IS 'Timestamp when the application was submitted';

-- Enable Row Level Security (RLS)
ALTER TABLE job_submissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions (required for policies to work)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON job_submissions TO anon;
GRANT USAGE, SELECT ON SEQUENCE job_submissions_id_seq TO anon;

-- Drop existing policies if they exist (allows re-running this script)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON job_submissions;
DROP POLICY IF EXISTS "Allow authenticated selects" ON job_submissions;

-- Create policy to allow anonymous users to INSERT (submit applications)
CREATE POLICY "Allow anonymous inserts"
  ON job_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to SELECT (view submissions)
-- Only if you want authenticated users to view submissions
CREATE POLICY "Allow authenticated selects"
  ON job_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Add index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_job_submissions_email ON job_submissions(email);

-- Optional: Add index on created_at for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_job_submissions_created_at ON job_submissions(created_at DESC);

