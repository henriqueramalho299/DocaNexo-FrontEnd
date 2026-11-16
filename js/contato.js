'use strict';

const contactForm = document.getElementById('contact-form');
const contactFeedback = document.getElementById('contact-feedback');
const contactFields = Array.from(contactForm.querySelectorAll('[required]'));

for (const field of contactFields) {
  const error = document.createElement('span');
  error.id = field.id + '-error';
  error.className = 'field-error';
  field.after(error);
  field.setAttribute('aria-describedby', error.id);
  field.addEventListener('input', () => {
    field.removeAttribute('aria-invalid');
    error.textContent = '';
  });
}

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  let firstInvalid = null;
  let firstMessage = '';
  for (const field of contactFields) {
    field.value = field.value.trim();
    field.removeAttribute('aria-invalid');
    const error = document.getElementById(field.id + '-error');
    error.textContent = '';
    if (field.validity.valid) continue;

    const label = field.labels[0].textContent.trim();
    const message = field.validity.typeMismatch ? 'Informe um e-mail válido, como nome@exemplo.com.' :
      'Preencha o campo ' + label + '.';
    error.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    if (!firstInvalid) {
      firstInvalid = field;
      firstMessage = message;
    }
  }

  if (firstInvalid) {
    contactFeedback.textContent = firstMessage;
    contactFeedback.classList.add('error');
    firstInvalid.focus();
    return;
  }

  contactForm.reset();
  contactFeedback.classList.remove('error');
  contactFeedback.textContent = 'Validação concluída. Esta é uma simulação: sua mensagem não foi enviada nem salva.';
});
