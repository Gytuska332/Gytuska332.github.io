// Contact form validation, phone formatting, submit handling
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const q1 = document.getElementById('q1');
  const q2 = document.getElementById('q2');
  const q3 = document.getElementById('q3');
  const q1Val = document.getElementById('q1Val');
  const q2Val = document.getElementById('q2Val');
  const q3Val = document.getElementById('q3Val');
  const formResults = document.getElementById('formResults');

  // Create popup container
  const popup = document.createElement('div');
  popup.className = 'popup-message';
  popup.setAttribute('role', 'status');
  popup.setAttribute('aria-live', 'polite');
  popup.textContent = 'Duomenys pateikti sėkmingai!';
  document.body.appendChild(popup);

  // Utility validators
  const nameRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s'-]+$/u;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneDigitsMax = 8// Lithuanian mobile digits after leading 6

  function setError(el, message) {
    el.classList.add('invalid');
    const err = document.querySelector(`.error-text[data-for="${el.id}"]`);
    if (err) err.textContent = message;
  }
  function clearError(el) {
    el.classList.remove('invalid');
    const err = document.querySelector(`.error-text[data-for="${el.id}"]`);
    if (err) err.textContent = '';
  }

  function validateNotEmpty(el) {
    if (!el.value || !el.value.trim()) {
      setError(el, 'Laukas negali būti tuščias');
      return false;
    }
    clearError(el);
    return true;
  }

  function validateName(el) {
    if (!validateNotEmpty(el)) return false;
    if (!nameRegex.test(el.value.trim())) {
      setError(el, 'Vardas ir pavardė turi būti sudaryti tik iš raidžių');
      return false;
    }
    clearError(el);
    return true;
  }

  function validateEmail() {
    if (!validateNotEmpty(email)) return false;
    if (!emailRegex.test(email.value.trim())) {
      setError(email, 'Neteisingas el. pašto formatas');
      return false;
    }
    clearError(email);
    return true;
  }

  function validateAddress() {
    if (!validateNotEmpty(address)) return false;
    // Address is free text; accept anything non-empty
    clearError(address);
    return true;
  }

  function validatePhoneFinal() {
    // final phone validation: must match +370 6xx xxxxx pattern (8 digits total)
    const val = phone.value.trim();
    const finalRegex = /^\+370\s6\d{2}\s\d{5}$/;
    if (!finalRegex.test(val)) {
      setError(phone, 'Telefono formatas turi būti +370 6xx xxxxx(8 skaičiai)');
      return false;
    }
    clearError(phone);
    return true;
  }

  function overallValidity() {
    const v1 = validateName(firstName);
    const v2 = validateName(lastName);
    const v3 = validateEmail();
    const v4 = validateAddress();
    const v5 = validatePhoneFinal();
    return v1 && v2 && v3 && v4 && v5;
  }

  // Real-time events
  firstName.addEventListener('input', () => { validateName(firstName); toggleSubmit(); });
  lastName.addEventListener('input', () => { validateName(lastName); toggleSubmit(); });
  email.addEventListener('input', () => { validateEmail(); toggleSubmit(); });
  address.addEventListener('input', () => { validateAddress(); toggleSubmit(); });

  // Slider live values
  function updateSliderDisplay(slider, display) { display.textContent = slider.value; }
  updateSliderDisplay(q1, q1Val); updateSliderDisplay(q2, q2Val); updateSliderDisplay(q3, q3Val);
  q1.addEventListener('input', () => updateSliderDisplay(q1, q1Val));
  q2.addEventListener('input', () => updateSliderDisplay(q2, q2Val));
  q3.addEventListener('input', () => updateSliderDisplay(q3, q3Val));

// Phone input formatting (real-time) - lock prefix "+370 6"
phone.addEventListener('input', (e) => {
    const raw = phone.value || '';
    // keep digits only from entire input
    let digits = raw.replace(/\D/g, '');

    // Remove accidental country/local prefixes the user might type:
    // - remove leading '370' if present (user typed +370)
    // - remove leading '8' if present (local dialing prefix)
    if (digits.startsWith('370')) digits = digits.slice(3);
    if (digits.startsWith('8')) digits = digits.slice(1);

    // Ensure the sequence starts with '6' (mobile starter). If user typed other digits,
    // drop them until we find a leading '6' (prevents '370' turning into '6 70' etc).
    while (digits.length > 0 && digits[0] !== '6') {
        digits = digits.slice(1);
    }

    // Limit to 9 digits total (leading '6' + up to 8 more)
    digits = digits.slice(0, 9);

    // Build formatted string: "+370 6xx xxxxx" (show a space after two digits for readability)
    let formatted = '+370';
    if (digits.length === 0) {
        formatted += ' 6';
    } else {
        const first = digits[0]; // should be '6' if any
        const rest = digits.slice(1);
        formatted += ' ' + first;
        if (rest.length > 0) {
            if (rest.length <= 2) {
                formatted += rest;
            } else {
                formatted += rest.slice(0, 2) + ' ' + rest.slice(2);
            }
        }
    }

    phone.value = formatted;

    // Validate: must have exactly 8 digits (leading '6' + 7 more)
    if (digits.length < 8) {
        setError(phone, `Numerio formatas: +370 6xx xxxxx (liko ${8 - digits.length} skaičių)`);
    } else {
        clearError(phone);
    }
    toggleSubmit();
});

  function toggleSubmit() {
    if (overallValidity()) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  }

  // Form submit handling
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // final validation
    if (!overallValidity()) {
      // focus first invalid
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const data = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      address: address.value.trim(),
      q1: Number(q1.value),
      q2: Number(q2.value),
      q3: Number(q3.value),
      average: Number(((Number(q1.value) + Number(q2.value) + Number(q3.value)) / 3).toFixed(1)),
      submittedAt: new Date().toISOString()
    };

    console.log('Contact form submitted:', data);

    // Render results
    renderResults(data);

    // Show popup
    showPopup();
  });

  function renderResults(data) {
    const lines = [];
    lines.push(`<p><strong>Vardas:</strong> ${escapeHtml(data.firstName)}</p>`);
    lines.push(`<p><strong>Pavardė:</strong> ${escapeHtml(data.lastName)}</p>`);
    lines.push(`<p><strong>El. paštas:</strong> ${escapeHtml(data.email)}</p>`);
    lines.push(`<p><strong>Tel. numeris:</strong> ${escapeHtml(data.phone)}</p>`);
    lines.push(`<p><strong>Adresas:</strong> ${escapeHtml(data.address)}</p>`);
    lines.push(`<p><strong>Klausimų įvertinimai:</strong> ${data.q1}, ${data.q2}, ${data.q3}</p>`);
    lines.push(`<p><strong>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}:</strong> ${data.average}</p>`);
    formResults.innerHTML = lines.join('\n');
  }

  function showPopup() {
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3500);
  }

  // simple escape helper for injection safety in rendering
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
    })[c]);
  }

  // Initial toggle
  toggleSubmit();
});
