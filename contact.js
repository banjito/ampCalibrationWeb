import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://edcrednhbzpovwxriluc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkY3JlZG5oYnpwb3Z3eHJpbHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjkwMzAsImV4cCI6MjA3NzM0NTAzMH0.uMYJmXrg8yf29laB6eio1iVCSsVDfG17Uz2xvqjoAFA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const submitButton = document.getElementById('submitButton');
  const formMessage = document.getElementById('formMessage');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const formData = new FormData(form);
    const submission = {
      first_name: formData.get('first_name')?.toString().trim(),
      last_name: formData.get('last_name')?.toString().trim() || null,
      email: formData.get('email')?.toString().trim(),
      message: formData.get('message')?.toString().trim() || null,
    };

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([submission]);

      if (error) {
        showMessage(
          error.message || 'There was an error submitting your message. Please try again.',
          'error'
        );
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        return;
      }

      showMessage('Thank you! Your message has been sent successfully.', 'success');
      form.reset();

      setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        formMessage.classList.add('hidden');
      }, 3000);
    } catch (err) {
      showMessage('An unexpected error occurred. Please try again.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
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


