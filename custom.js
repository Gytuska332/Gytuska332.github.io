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
  const phoneDigitsMax = 9; // Lithuanian mobile digits after leading 6

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
    // final phone validation: must match +370 6xxx xxxx pattern (9 digits total)
    const val = phone.value.trim();
    const finalRegex = /^\+370\s6\d{3}\s\d{4}$/;
    if (!finalRegex.test(val)) {
      setError(phone, 'Telefono formatas turi būti +370 6xxx xxxx (9 skaičiai)');
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

    // Build formatted string: "+370 6xxx xxxx" (group 3 + 4)
    let formatted = '+370';
    if (digits.length === 0) {
      formatted += ' 6';
    } else {
      const first = digits[0]; // should be '6' if any
      const rest = digits.slice(1);
      formatted += ' ' + first;
      if (rest.length > 0) {
        if (rest.length <= 3) {
          formatted += rest;
        } else {
          formatted += rest.slice(0, 3) + ' ' + rest.slice(3);
        }
      }
    }

    phone.value = formatted;

    // Validate: must have exactly 9 digits (leading '6' + 8 more)
    if (digits.length < 9) {
      setError(phone, `Numerio formatas: +370 6xxx xxxx (liko ${9 - digits.length} skaičių)`);
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

  /* =====================
     Memory Game Implementation
     ===================== */
  function initMemoryGame() {
    const dataSet = [ '🧠','🎯','🚀','🎵','📚','💡','🌟','⚙️','🖥️','🔒','📐','🧩' ]; // 12 unique

    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
    const startBtn = document.getElementById('gameStart');
    const resetBtn = document.getElementById('gameReset');
    const board = document.getElementById('gameBoard');
    const movesEl = document.getElementById('movesCount');
    const matchesEl = document.getElementById('matchesCount');
    const timerEl = document.getElementById('gameTimer');
    const bestEasyEl = document.getElementById('bestEasy');
    const bestHardEl = document.getElementById('bestHard');
    const winMessageEl = document.getElementById('winMessage');

    let totalPairs = 6;
    let cards = [];
    let flipped = [];
    let moves = 0;
    let matches = 0;
    let timer = null;
    let seconds = 0;
    let gameStarted = false;

    // Load best scores
    function loadBests() {
      const be = localStorage.getItem('memory_best_easy');
      const bh = localStorage.getItem('memory_best_hard');
      bestEasyEl.textContent = be ? `${be} ėjimai` : '-';
      bestHardEl.textContent = bh ? `${bh} ėjimai` : '-';
    }

    function saveBest(level, movesCount) {
      const key = level === 'easy' ? 'memory_best_easy' : 'memory_best_hard';
      const prev = Number(localStorage.getItem(key) || 0);
      if (prev === 0 || movesCount < prev) {
        localStorage.setItem(key, movesCount);
        loadBests();
      }
    }

    function formatTime(s) {
      const mm = String(Math.floor(s/60)).padStart(2,'0');
      const ss = String(s%60).padStart(2,'0');
      return `${mm}:${ss}`;
    }

    function startTimer() {
      stopTimer();
      seconds = 0; timerEl.textContent = formatTime(seconds);
      timer = setInterval(() => { seconds++; timerEl.textContent = formatTime(seconds); }, 1000);
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    function shuffle(a) { for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

    function buildBoard(level) {
      board.innerHTML = '';
      board.className = 'game-board ' + (level === 'easy' ? 'easy' : 'hard');
      totalPairs = (level === 'easy') ? 6 : 12;
      const items = dataSet.slice(0, totalPairs);
      const deck = shuffle([...items, ...items]);
      cards = deck.map((val, idx) => {
        const card = document.createElement('div'); card.className = 'game-card';
        const inner = document.createElement('div'); inner.className = 'card-inner'; inner.setAttribute('data-value', val); inner.setAttribute('tabindex', 0);
        const front = document.createElement('div'); front.className = 'card-face card-front'; front.textContent = '';
        const back = document.createElement('div'); back.className = 'card-face card-back'; back.textContent = val;
        inner.appendChild(front); inner.appendChild(back);
        card.appendChild(inner);
        board.appendChild(card);
        // click handler
        inner.addEventListener('click', () => onCardClick(inner));
        inner.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(inner); } });
        return inner;
      });
    }

    function resetState() {
      flipped = []; moves = 0; matches = 0; movesEl.textContent = moves; matchesEl.textContent = matches; winMessageEl.textContent = '';
      stopTimer(); timerEl.textContent = '00:00'; gameStarted = false;
    }

    function startGame() {
      const level = document.querySelector('input[name="difficulty"]:checked').value;
      resetState(); buildBoard(level); loadBests(); startTimer(); gameStarted = true;
    }

    function onCardClick(inner) {
      if (!gameStarted) return;
      if (inner.classList.contains('flipped') || inner.classList.contains('matched')) return;
      if (flipped.length === 2) return;
      inner.classList.add('flipped');
      flipped.push(inner);
      if (flipped.length === 2) {
        moves++;
        movesEl.textContent = moves;
        const [a,b] = flipped;
        if (a.getAttribute('data-value') === b.getAttribute('data-value')) {
          // match
          a.classList.add('matched'); b.classList.add('matched');
          a.parentElement.classList.add('card-disabled'); b.parentElement.classList.add('card-disabled');
          matches++;
          matchesEl.textContent = matches;
          flipped = [];
          if (matches === totalPairs) {
            // win
            stopTimer(); gameStarted = false; winMessageEl.textContent = `Laimėjote! Laikas: ${formatTime(seconds)}, Bandymų: ${moves}`;
            const levelKey = document.querySelector('input[name="difficulty"]:checked').value;
            saveBest(levelKey, moves);
          }
        } else {
          // not match
          setTimeout(() => {
            flipped.forEach(c => c.classList.remove('flipped'));
            flipped = [];
          }, 1000);
        }
      }
    }

    // Controls
    startBtn.addEventListener('click', (e) => { startGame(); });
    resetBtn.addEventListener('click', (e) => { startGame(); });
    difficultyInputs.forEach(r => r.addEventListener('change', () => { startGame(); }));

    // Initialize UI
    loadBests(); movesEl.textContent = '0'; matchesEl.textContent = '0'; timerEl.textContent = '00:00';
  }

  // Initialize memory game
  initMemoryGame();
});
