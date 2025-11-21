document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('contactForm');
  const submitButton = document.getElementById('submitButton');
  const formMessage = document.getElementById('formMessage');

  if (!form) return;

  // Wait for Supabase to be initialized
  let supabaseReady = false;
  let retries = 0;
  while (!supabaseReady && retries < 20) {
    if (typeof getSupabaseClient === 'function') {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabaseReady = true;
        break;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const supabase = getSupabaseClient();
    if (!supabase) {
      showMessage('Database connection error. Please try again.', 'error');
      return;
    }

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


