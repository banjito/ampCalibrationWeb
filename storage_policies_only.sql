-- Storage policies for job-resumes bucket
-- Run this AFTER creating the bucket manually in the UI

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow anonymous upload to job-resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read from job-resumes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from job-resumes" ON storage.objects;

-- Policy: Allow anonymous users to upload resumes
CREATE POLICY "Allow anonymous upload to job-resumes"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'job-resumes');

-- Policy: Allow authenticated users to view all resumes (for admin)
CREATE POLICY "Allow authenticated read from job-resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'job-resumes');

-- Policy: Allow authenticated users to delete resumes (for admin)
CREATE POLICY "Allow authenticated delete from job-resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'job-resumes');

