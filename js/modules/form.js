/* ============================================================
   form.js — contact form (POSTs to formsubmit.co via fetch)
   ============================================================ */

function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const status = document.getElementById('contactFormStatus');
        const formData = new URLSearchParams();

        // Bot filled the honeypot: pretend it worked, send nothing
        const honey = contactForm.querySelector('input[name="_honey"]');
        if (honey && honey.value.trim() !== '') {
            if (status) {
                status.dataset.state = 'success';
                status.textContent = 'Message sent. Thank you!';
            }
            contactForm.reset();
            return;
        }

        new FormData(contactForm).forEach((value, key) => formData.append(key, String(value)));

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
        }
        if (status) {
            status.dataset.state = 'sending';
            status.textContent = 'Sending your message...';
        }

        try {
            const response = await fetch('https://formsubmit.co/ajax/hmuesett2002@gmail.com', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });
            const result = await response.json();

            if (!response.ok || (result.success !== true && result.success !== 'true')) {
                throw new Error(result.message || 'Message could not be sent.');
            }

            if (status) {
                status.dataset.state = 'success';
                status.textContent = 'Message sent. Thank you!';
            }
            contactForm.reset();
        } catch {
            if (status) {
                status.dataset.state = 'error';
                status.textContent = 'Could not send your message. Please email hmuesett2002@gmail.com instead.';
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Send in Email';
            }
        }
    });
}
