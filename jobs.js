import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://edcrednhbzpovwxriluc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JlZG5oYnpwb3Z3eHJpbHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjkwMzAsImV4cCI6MjA3NzM0NTAzMH0.uMYJmXrg8yf29laB6eio1iVCSsVDfG17Uz2xvqjoAFA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('jobForm');
  const submitButton = document.getElementById('submitButton');
  const formMessage = document.getElementById('formMessage');
  const resumeInput = document.getElementById('resume');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const formData = new FormData(form);
    let resumeUrl = null;

    // Handle resume upload if file is selected
    const resumeFile = resumeInput.files[0];
    if (resumeFile) {
      // Validate file size (10MB max)
      if (resumeFile.size > 10 * 1024 * 1024) {
        showMessage('Resume file is too large. Maximum size is 10MB.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
        return;
      }

      try {
        // Generate unique filename
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('job-resumes')
          .upload(filePath, resumeFile);

        if (uploadError) {
          showMessage(
            uploadError.message || 'There was an error uploading your resume. Please try again.',
            'error'
          );
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Application';
          return;
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('job-resumes')
          .getPublicUrl(filePath);

        resumeUrl = urlData.publicUrl;
      } catch (uploadErr) {
        showMessage('An error occurred while uploading your resume. Please try again.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
        return;
      }
    }

    const submission = {
      first_name: formData.get('first_name')?.toString().trim(),
      last_name: formData.get('last_name')?.toString().trim() || null,
      email: formData.get('email')?.toString().trim(),
      message: formData.get('message')?.toString().trim() || null,
      resume_url: resumeUrl,
    };

    try {
      const { error } = await supabase
        .from('job_submissions')
        .insert([submission]);

      if (error) {
        showMessage(
          error.message || 'There was an error submitting your application. Please try again.',
          'error'
        );
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
        return;
      }

      showMessage('Thank you! Your application has been submitted successfully.', 'success');
      form.reset();

      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
        formMessage.classList.add('hidden');
      }, 3000);
    } catch (err) {
      showMessage('An unexpected error occurred. Please try again.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Application';
    }
  });

  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `text-white text-sm ${
      type === 'success' ? 'text-green-200' : 'text-red-200'
    }`;
    formMessage.classList.remove('hidden');
  }
});


