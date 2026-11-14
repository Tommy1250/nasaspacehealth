(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const isLogin = location.pathname === '/login';

  if (!document.getElementById('astramed-motion-engine')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'astramed-motion-engine';
    styleEl.textContent = `
      @keyframes cardRise {
        0% { opacity: 0; transform: translateY(22px) scale(0.96); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes modalSpring {
        0% { opacity: 0; transform: scale(0.88) translateY(18px); }
        70% { opacity: 1; transform: scale(1.015) translateY(-2px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes stepSlideIn {
        0% { opacity: 0; transform: translateX(-18px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes radarPing {
        0% { box-shadow: 0 0 0 0 rgba(255, 125, 133, 0.55); }
        70% { box-shadow: 0 0 0 14px rgba(255, 125, 133, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 125, 133, 0); }
      }
      @keyframes warnPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(245, 189, 103, 0.25); }
        50% { box-shadow: 0 0 18px 2px rgba(245, 189, 103, 0.45); }
      }
      @keyframes barShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes dashFlow {
        to { stroke-dashoffset: -24; }
      }
      @keyframes dashFlowRev {
        to { stroke-dashoffset: 24; }
      }
      @keyframes floatY {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
      }

      /* دخول متدرج لكروت القياسات عند تحميل الصفحة */
      .metric-card, .vital-card, .treatment-card, .panel-card {
        animation: cardRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;
        transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .metric-card:nth-child(1), .vital-card:nth-child(1) { animation-delay: 0.05s; }
      .metric-card:nth-child(2), .vital-card:nth-child(2) { animation-delay: 0.12s; }
      .metric-card:nth-child(3), .vital-card:nth-child(3) { animation-delay: 0.19s; }
      .metric-card:nth-child(4), .vital-card:nth-child(4) { animation-delay: 0.26s; }
      .metric-card:nth-child(5), .vital-card:nth-child(5) { animation-delay: 0.33s; }
      .metric-card:nth-child(6), .vital-card:nth-child(6) { animation-delay: 0.40s; }

      .metric-card:hover, .vital-card:hover, .treatment-card:hover {
        transform: translateY(-4px);
        border-color: rgba(86, 212, 232, 0.45) !important;
        box-shadow: 0 12px 28px rgba(4, 12, 24, 0.55);
      }

      /* أنيميشن فتح المودال */
      .modal-backdrop.visible .modal-card,
      .modal-backdrop.visible .modal-dialog,
      .modal-backdrop.visible > div {
        animation: modalSpring 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      /* بطاقات خطوات العلاج */
      .proto-step-card {
        opacity: 0;
        animation: stepSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
      }
      .proto-step-card:hover {
        transform: translateX(6px);
        border-color: rgba(86, 212, 232, 0.5) !important;
        background: rgba(16, 42, 72, 0.9) !important;
      }

      /* حالات الخطر والتحذير */
      .card-is-critical, .banner-critical {
        border-color: rgba(255, 125, 133, 0.75) !important;
        animation: radarPing 1.8s infinite !important;
      }
      .card-is-warn {
        border-color: rgba(245, 189, 103, 0.65) !important;
        animation: warnPulse 2.2s infinite !important;
      }

      /* حركة الأشرطة والـ SVG */
      .danger-bar i, .track-fill {
        transition: width 0.65s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.35s ease;
        background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: barShimmer 2.4s linear infinite;
      }
      .svg-flow { stroke-dasharray: 5 3; animation: dashFlow 0.85s linear infinite; }
      .svg-flow-rev { stroke-dasharray: 5 3; animation: dashFlowRev 0.85s linear infinite; }
      .svg-float { animation: floatY 2.4s ease-in-out infinite; }
    `;
    document.head.appendChild(styleEl);
  }

  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) throw new Error(data.msg || `Request failed (${response.status})`);
    return data;
  }

  function showToast(message, error = false) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('toast-error', error);
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  if (isLogin) {
    const form = $('#loginForm');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const error = $('#loginError');
      const username = $('#username').value.trim();
      if (!username) return;
      button.disabled = true;
      button.querySelector('span').textContent = 'Connecting…';
      error.textContent = '';
      try {
        await request('/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        location.assign('/');
      } catch (err) {
        error.textContent = err.message || 'Unable to start your crew session. Try again.';
        button.disabled = false;
        button.querySelector('span').textContent = 'Enter mission control';
      }
    });
    return;
  }

  // ---------- 1. الحدود الدقيقة لكل بيئة (NASA-STD-3001 Reference Baselines) ----------
  const ENV_LIMITS = {
    spacecraft: {
      label: 'Spacecraft',
      bpm: { min: 60, max: 100, criticalLow: 45, criticalHigh: 135, unit: 'BPM' },
      spo2: { min: 95, max: 100, criticalLow: 90, criticalHigh: 101, unit: '%' },
      temp: { min: 36.1, max: 37.2, criticalLow: 35.0, criticalHigh: 38.3, unit: '°C' },
      sleep: { min: 7.0, max: 9.0, criticalLow: 4.5, criticalHigh: 12.0, unit: 'hrs' },
      hydration: { min: 70, max: 100, criticalLow: 50, criticalHigh: 101, unit: '%' },
      radiation: { min: 0, max: 0.5, criticalLow: -1, criticalHigh: 1.0, unit: 'mSv' }
    },
    station: {
      label: 'Space station',
      bpm: { min: 55, max: 100, criticalLow: 45, criticalHigh: 130, unit: 'BPM' },
      spo2: { min: 95, max: 100, criticalLow: 91, criticalHigh: 101, unit: '%' },
      temp: { min: 36.1, max: 37.3, criticalLow: 35.2, criticalHigh: 38.2, unit: '°C' },
      sleep: { min: 7.0, max: 9.0, criticalLow: 5.0, criticalHigh: 11.0, unit: 'hrs' },
      hydration: { min: 70, max: 100, criticalLow: 55, criticalHigh: 101, unit: '%' },
      radiation: { min: 0, max: 0.4, criticalLow: -1, criticalHigh: 0.8, unit: 'mSv' }
    },
    lunar: {
      label: 'Lunar base',
      bpm: { min: 60, max: 115, criticalLow: 50, criticalHigh: 145, unit: 'BPM' },
      spo2: { min: 94, max: 100, criticalLow: 89, criticalHigh: 101, unit: '%' },
      temp: { min: 36.0, max: 37.5, criticalLow: 34.8, criticalHigh: 38.5, unit: '°C' },
      sleep: { min: 6.5, max: 9.0, criticalLow: 4.5, criticalHigh: 12.0, unit: 'hrs' },
      hydration: { min: 75, max: 100, criticalLow: 60, criticalHigh: 101, unit: '%' },
      radiation: { min: 0, max: 0.35, criticalLow: -1, criticalHigh: 0.7, unit: 'mSv' }
    }
  };

  // ---------- 2. بروتوكولات العلاج + رسومات SVG متحركة واضحة ومكبرة (145x95) ----------
  const CRITICAL_PROTOCOLS = {
    bpm: {
      metricLabel: 'Heart Rate (BPM)',
      name: 'Non-Pharmacological Cardiac Stabilization (Vagal Maneuvers)',
      source: 'NASA HRP Exploration Medical Capability (ExMC) & ISS Crew Medical Checklist',
      action: 'Execute physical vagal maneuvers: Neutral Rest, 4-6 Paced Breathing, & Modified Valsalva.',
      intro: 'No injection or oral medication is used initially for acute tachycardia. Perform these 4 physical self-regulation steps to stimulate the vagus nerve and lower heart rate naturally:',
      steps: [
        {
          title: 'Neutral Body Posture (NBP) & Knee Elevation',
          detail: 'Stop all physical activity immediately. Secure yourself in a reclined position and draw your knees slightly toward your chest to improve venous return and reduce cardiac workload.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="-8 50 54; 4 50 54; -8 50 54" dur="3s" repeatCount="indefinite"/>
              <circle cx="32" cy="52" r="8" fill="#56d4e8"/>
              <path d="M40 52 L74 52 L92 34 L112 46" stroke="#62d7b0" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M48 52 L58 64 L74 64" stroke="#8da4bd" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            </g>
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,4; 0,-4; 0,4" dur="1.5s" repeatCount="indefinite"/>
              <path d="M92 26 L92 14 M88 18 L92 14 L96 18" stroke="#f5bd67" stroke-width="2.2" fill="none" stroke-linecap="round"/>
            </g>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">RECLINE &amp; ELEVATE KNEES</text>
          </svg>`
        },
        {
          title: 'Diaphragmatic Paced Breathing (4s Inhale / 6s Exhale)',
          detail: 'Place one hand on your chest and one on your abdomen. Inhale slowly through the nose for 4 seconds (belly expands), then exhale slowly through pursed lips for 6 seconds to trigger parasympathetic slowing.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#62d7b0" stroke-width="1.5"/>
            <circle cx="46" cy="26" r="8" fill="#56d4e8"/>
            <path d="M46 35 L46 62 L66 62" stroke="#edf5ff" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path class="svg-flow" d="M16 24 L36 24" stroke="#56d4e8" stroke-width="2.5" fill="none"/>
            <text x="24" y="17" fill="#56d4e8" font-size="7.5" font-weight="bold" text-anchor="middle">IN 4s</text>
            <path class="svg-flow" d="M56 26 L80 26" stroke="#62d7b0" stroke-width="2.5" fill="none"/>
            <text x="68" y="17" fill="#62d7b0" font-size="7.5" font-weight="bold" text-anchor="middle">OUT 6s</text>
            <ellipse cx="52" cy="49" rx="7" ry="5" fill="#f5bd67" opacity="0.35" stroke="#f5bd67" stroke-width="1.8">
              <animate attributeName="rx" values="5;12;5" dur="3.6s" repeatCount="indefinite"/>
              <animate attributeName="ry" values="4;7;4" dur="3.6s" repeatCount="indefinite"/>
            </ellipse>
            <text x="105" y="46" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">BELLY</text>
            <text x="105" y="56" fill="#8da4bd" font-size="7" text-anchor="middle">BREATHING</text>
            <text x="72" y="81" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">STIMULATE VAGUS NERVE</text>
          </svg>`
        },
        {
          title: 'Modified Valsalva Maneuver (15-Second Strain)',
          detail: 'While seated, blow forcefully into a closed 10 ml syringe barrel (or pinched nose/mouth) for 15 seconds as if inflating a stiff balloon, then immediately lie flat with legs raised at 45° for 15 seconds.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#f5bd67" stroke-width="1.5"/>
            <circle cx="38" cy="30" r="8" fill="#56d4e8"/>
            <path d="M38 39 L38 62 L56 62" stroke="#edf5ff" stroke-width="4" fill="none" stroke-linecap="round"/>
            <rect x="48" y="27" width="26" height="6" rx="2" fill="#f5bd67"/>
            <line class="svg-flow" x1="76" y1="30" x2="96" y2="30" stroke="#ff7d85" stroke-width="2.5"/>
            <circle cx="106" cy="30" r="6" fill="none" stroke="#ff7d85" stroke-width="2">
              <animate attributeName="r" values="3;10;3" dur="1.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0.15;1" dur="1.4s" repeatCount="indefinite"/>
            </circle>
            <text x="106" y="50" fill="#f5bd67" font-size="8" font-weight="bold" text-anchor="middle">BLOW 15s</text>
            <text x="106" y="60" fill="#8da4bd" font-size="7" text-anchor="middle">THEN LIE FLAT</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">MODIFIED VALSALVA</text>
          </svg>`
        },
        {
          title: 'Cold Facial Compress (Mammalian Dive Reflex)',
          detail: 'Hold a cold wet towel or cooling gel pack firmly across your forehead, eyes, and upper cheeks for 15–20 seconds while holding your breath. This triggers the Dive Reflex to rapidly slow heart rate.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <circle cx="48" cy="40" r="16" fill="#132e4a" stroke="#edf5ff" stroke-width="2"/>
            <rect x="33" y="30" width="30" height="10" rx="4" fill="#56d4e8">
              <animate attributeName="opacity" values="1;0.45;1" dur="1.4s" repeatCount="indefinite"/>
            </rect>
            <text x="48" y="37" fill="#09192b" font-size="6.5" font-weight="bold" text-anchor="middle">COLD</text>
            <path d="M42 48 Q48 52 54 48" stroke="#8da4bd" stroke-width="1.8" fill="none"/>
            <text x="102" y="34" fill="#56d4e8" font-size="8" font-weight="bold" text-anchor="middle">DIVE REFLEX</text>
            <g>
              <animateTransform attributeName="transform" type="translate" values="0,-3; 0,4; 0,-3" dur="1.4s" repeatCount="indefinite"/>
              <text x="102" y="49" fill="#62d7b0" font-size="9" font-weight="bold" text-anchor="middle">↓ HEART RATE</text>
            </g>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">COLD COMPRESS ON FACE (15s)</text>
          </svg>`
        }
      ],
      tip: 'NASA FLIGHT SURGEON RULE: If heart rate stays >140 BPM after 2 cycles of Vagal Maneuvers, or if accompanied by chest pain or dizziness, contact Mission Control immediately.'
    },

    spo2: {
      metricLabel: 'Blood Oxygen (SpO₂)',
      name: 'Self-Administered Oxygenation & Airway Expansion Protocol',
      source: 'NASA-STD-3001 Vol. 2 (Sec. 6.2) & ISS Integrated Medical Group (IMG) Checklist',
      action: 'Assume upright chest-open posture, seal O₂ mask (4–6 L/min), & perform pursed-lip breathing.',
      intro: 'When blood oxygen drops (<95% review, <90% critical), follow these exact physical and equipment steps to maximize alveolar oxygen uptake:',
      steps: [
        {
          title: 'Upright Tripod Posture (Open Rib Cage)',
          detail: 'Sit upright and lean slightly forward with forearms resting on your thighs or cabin rail. This posture unloads abdominal pressure from the diaphragm and maximizes lung expansion.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 46 56; 12 46 56; 0 46 56" dur="2.6s" repeatCount="indefinite"/>
              <circle cx="50" cy="24" r="8" fill="#56d4e8"/>
              <path d="M48 33 L44 56 L68 56 L72 68" stroke="#62d7b0" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M48 38 L64 52" stroke="#f5bd67" stroke-width="3" fill="none" stroke-linecap="round"/>
            </g>
            <text x="104" y="38" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">LEAN</text>
            <text x="104" y="49" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">FORWARD</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">TRIPOD LUNG EXPANSION</text>
          </svg>`
        },
        {
          title: 'Don O₂ Mask & Tighten Head Strap (4–6 L/min)',
          detail: 'Turn the Portable Oxygen System (POS) valve to 4–6 L/min, place the mask over both nose and mouth, pinch the metal nose bridge, and pull elastic straps snug so zero oxygen leaks around your cheeks.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#62d7b0" stroke-width="1.5"/>
            <rect x="18" y="18" width="22" height="44" rx="5" fill="#132e4a" stroke="#56d4e8" stroke-width="1.8"/>
            <text x="29" y="43" fill="#56d4e8" font-size="9" font-weight="bold" text-anchor="middle">O₂</text>
            <path class="svg-flow" d="M40 36 Q60 22 76 40" stroke="#56d4e8" stroke-width="2.8" fill="none"/>
            <circle cx="94" cy="36" r="15" fill="#132e4a" stroke="#edf5ff" stroke-width="1.8"/>
            <path d="M78 38 Q88 31 94 43 L82 48 Z" fill="#62d7b0">
              <animate attributeName="opacity" values="1;0.55;1" dur="1.4s" repeatCount="indefinite"/>
            </path>
            <line x1="94" y1="35" x2="109" y2="33" stroke="#f5bd67" stroke-width="2"/>
            <text x="72" y="81" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">SEAL MASK &amp; SET 4–6 L/MIN</text>
          </svg>`
        },
        {
          title: 'Pursed-Lip Deep Ventilation Technique',
          detail: 'Inhale deeply through your nose for 3 seconds to fill lower lung alveoli, pause 1 second, then exhale slowly through tightly pursed lips (like blowing through a straw) for 5 seconds to keep airways open.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <g transform="translate(52, 42)">
              <animateTransform attributeName="transform" type="scale" additive="sum" values="0.82;1.22;0.82" dur="3.4s" repeatCount="indefinite"/>
              <path d="M-3 -16 C-18 -16, -24 5, -18 16 C-11 20, -2 16, -2 7 Z" fill="#56d4e8" opacity="0.45" stroke="#56d4e8" stroke-width="1.8"/>
              <path d="M3 -16 C18 -16, 24 5, 18 16 C11 20, 2 16, 2 7 Z" fill="#56d4e8" opacity="0.45" stroke="#56d4e8" stroke-width="1.8"/>
            </g>
            <text x="106" y="36" fill="#56d4e8" font-size="8" font-weight="bold" text-anchor="middle">DEEP IN 3s</text>
            <text x="106" y="49" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">SLOW OUT 5s</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">PURSED-LIP ALVEOLAR EXPANSION</text>
          </svg>`
        },
        {
          title: 'Warm Finger & Re-Check Pulse Oximeter',
          detail: 'Rub your hands together for 10 seconds to restore capillary blood flow, clip the oximeter onto your index or middle finger, keep hand still at heart level, and verify SpO₂ rises ≥95%.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#62d7b0" stroke-width="1.5"/>
            <rect x="18" y="32" width="48" height="18" rx="9" fill="#132e4a" stroke="#edf5ff" stroke-width="1.8"/>
            <rect x="48" y="24" width="38" height="32" rx="5" fill="#10233a" stroke="#62d7b0" stroke-width="2"/>
            <polyline class="svg-flow" points="52,43 59,43 63,31 67,49 71,36 75,43 83,43" fill="none" stroke="#62d7b0" stroke-width="1.8"/>
            <text x="112" y="37" fill="#62d7b0" font-size="9.5" font-weight="bold" text-anchor="middle">≥95%</text>
            <text x="112" y="49" fill="#8da4bd" font-size="7" text-anchor="middle">WARM HAND</text>
            <text x="72" y="81" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">VERIFY STABLE READING ≥95%</text>
          </svg>`
        }
      ],
      tip: 'CRITICAL ESCALATION (NASA IMG): If SpO₂ stays <90% after 3 minutes on O₂, or if dizziness/confusion occurs, activate Priority 1 Emergency Protocol immediately.'
    },

    temp: {
      metricLabel: 'Core Body Temperature',
      name: 'Self-Applied Thermal Regulation Protocol',
      source: 'NASA-STD-3001 Vol. 2 (Sec. 6.6 Thermal Limits) & ISS Medical Checklist',
      action: 'Apply targeted vascular cooling packs (if hot) or thermal insulation wrap (if cold).',
      intro: 'Because microgravity eliminates natural air convection around the body, you must actively apply conductive cooling or insulation directly to key heat-exchange zones:',
      steps: [
        {
          title: 'Remove Outer Layers & Expose Vascular Zones (If Hot >38.3°C)',
          detail: 'Unzip and remove outer flight suit layers immediately. Expose high-blood-flow heat-exchange areas: neck, armpits (axillae), wrists, and forehead.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <circle cx="48" cy="24" r="8" fill="#edf5ff"/>
            <path d="M48 33 L48 62 M30 40 L66 40" stroke="#edf5ff" stroke-width="4" stroke-linecap="round"/>
            <circle cx="48" cy="34" r="4" fill="#56d4e8"><animate attributeName="r" values="3;7;3" dur="1.3s" repeatCount="indefinite"/></circle>
            <circle cx="35" cy="41" r="4" fill="#56d4e8"><animate attributeName="r" values="3;7;3" dur="1.3s" repeatCount="indefinite"/></circle>
            <circle cx="61" cy="41" r="4" fill="#56d4e8"><animate attributeName="r" values="3;7;3" dur="1.3s" repeatCount="indefinite"/></circle>
            <text x="102" y="36" fill="#56d4e8" font-size="8.5" font-weight="bold" text-anchor="middle">NECK &amp;</text>
            <text x="102" y="48" fill="#56d4e8" font-size="8.5" font-weight="bold" text-anchor="middle">ARMPITS</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">PLACE COLD PACKS ON PULSE ZONES</text>
          </svg>`
        },
        {
          title: 'Sip Cool Potable Water & Maximize Cabin Airflow',
          detail: 'Drink 200–300 ml of cool water slowly and position yourself directly in front of an active cabin ventilation duct to restore evaporative cooling.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#62d7b0" stroke-width="1.5"/>
            <path class="svg-flow" d="M18 30 Q36 24 54 30 T84 30" stroke="#56d4e8" stroke-width="2.6" fill="none"/>
            <path class="svg-flow" d="M18 44 Q36 38 54 44 T84 44" stroke="#56d4e8" stroke-width="2.6" fill="none"/>
            <rect x="96" y="22" width="26" height="38" rx="5" fill="#132e4a" stroke="#62d7b0" stroke-width="1.8"/>
            <text x="109" y="44" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">H₂O</text>
            <text x="72" y="81" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">CABIN AIRFLOW + COOL WATER</text>
          </svg>`
        },
        {
          title: 'Wrap in Aluminized Thermal Blanket (If Cold <35.0°C)',
          detail: 'If hypothermic, move to the warmest module, wrap your entire torso and head (leaving face clear) in a reflective thermal blanket, and hold a warm drink pouch against your chest.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#f5bd67" stroke-width="1.5"/>
            <circle cx="48" cy="23" r="8" fill="#edf5ff"/>
            <path d="M34 33 L62 33 L67 64 L29 64 Z" fill="#f5bd67" opacity="0.35" stroke="#f5bd67" stroke-width="2.2">
              <animate attributeName="opacity" values="0.2;0.65;0.2" dur="1.8s" repeatCount="indefinite"/>
            </path>
            <text x="102" y="38" fill="#f5bd67" font-size="8.5" font-weight="bold" text-anchor="middle">RETAIN</text>
            <text x="102" y="50" fill="#edf5ff" font-size="7.5" text-anchor="middle">BODY HEAT</text>
            <text x="72" y="81" fill="#f5bd67" font-size="8" font-weight="bold" text-anchor="middle">FULL TORSO THERMAL WRAP</text>
          </svg>`
        }
      ],
      tip: 'CRITICAL ESCALATION: Core temp >39.5°C or <34.5°C with confusion or slurred speech requires immediate Flight Surgeon intervention.'
    },

    hydration: {
      metricLabel: 'Hydration Index',
      name: 'Self-Administered Oral Electrolyte Rehydration (ORS)',
      source: 'NASA HRP Fluid & Electrolyte Countermeasures & ISS Medical Kit Protocol',
      action: 'Mix 1 ORS packet in 250–500 ml water, sip slowly over 20 mins, & avoid caffeine.',
      intro: 'Follow this exact mixing and sipping technique so your stomach absorbs fluids rapidly without causing microgravity nausea:',
      steps: [
        {
          title: 'Inject 250–500 ml Potable Water into Electrolyte Pouch',
          detail: 'Connect the onboard potable water dispenser nozzle to the Oral Rehydration Salts (ORS) pouch, fill with 250–500 ml ambient water, and knead the pouch for 20 seconds until powder fully dissolves.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <rect x="26" y="18" width="34" height="46" rx="6" fill="#132e4a" stroke="#56d4e8" stroke-width="1.8"/>
            <rect x="30" y="34" width="26" height="26" rx="3" fill="#56d4e8" opacity="0.55">
              <animate attributeName="height" values="8;26;18;26" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="y" values="52;34;42;34" dur="2s" repeatCount="indefinite"/>
            </rect>
            <text x="43" y="50" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">ORS</text>
            <text x="100" y="38" fill="#56d4e8" font-size="8.5" font-weight="bold" text-anchor="middle">250–500 ml</text>
            <text x="100" y="50" fill="#8da4bd" font-size="7" text-anchor="middle">SHAKE 20 SEC</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">MIX ELECTROLYTES IN POUCH</text>
          </svg>`
        },
        {
          title: 'Sip Small Amounts via Straw Over 15–20 Minutes',
          detail: 'Sit upright, clamp the straw clip between sips, and take small swallows every 1–2 minutes. Never squeeze the entire pouch down at once in weightlessness.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#62d7b0" stroke-width="1.5"/>
            <circle cx="44" cy="28" r="8" fill="#56d4e8"/>
            <path d="M44 37 L44 62 L62 62" stroke="#edf5ff" stroke-width="4" fill="none" stroke-linecap="round"/>
            <rect x="62" y="34" width="18" height="26" rx="4" fill="#132e4a" stroke="#62d7b0" stroke-width="1.8"/>
            <path class="svg-flow-rev" d="M68 34 L52 29" stroke="#f5bd67" stroke-width="2.5"/>
            <text x="108" y="38" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">SMALL SIPS</text>
            <text x="108" y="50" fill="#8da4bd" font-size="7" text-anchor="middle">15–20 MINS</text>
            <text x="72" y="81" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">SLOW STRAW INTAKE (NO GULPING)</text>
          </svg>`
        },
        {
          title: 'Rest 45 Minutes & Re-Check Hydration Index',
          detail: 'Avoid coffee, tea, or salty snacks while rehydrating. Allow 45 minutes for intestinal absorption and plasma volume expansion, then log your updated vitals.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#f5bd67" stroke-width="1.5"/>
            <circle cx="46" cy="40" r="16" fill="#132e4a" stroke="#f5bd67" stroke-width="1.8"/>
            <line x1="46" y1="40" x2="46" y2="28" stroke="#f5bd67" stroke-width="2.4" stroke-linecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 46 40" to="360 46 40" dur="3s" repeatCount="indefinite"/>
            </line>
            <text x="100" y="38" fill="#62d7b0" font-size="9" font-weight="bold" text-anchor="middle">+45 MINS</text>
            <text x="100" y="50" fill="#edf5ff" font-size="7.5" text-anchor="middle">TARGET &gt;75%</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">ABSORB &amp; RE-VERIFY INDEX</text>
          </svg>`
        }
      ],
      tip: 'CRITICAL ESCALATION: Persistent vomiting or inability to keep fluids down requires IV saline infusion per Flight Surgeon orders.'
    },

    sleep: {
      metricLabel: 'Sleep Duration',
      name: 'Circadian Reset & Recovery Sleep Protocol',
      source: 'NASA-STD-3001 Vol. 2 (Sec. 7.3 Work-Rest Cycles) & NASA Fatigue Management',
      action: 'Halt critical tasks, block blue light (<10 lux), wear earplugs, & sleep 8 hours.',
      intro: 'Orbital sunrises every 90 minutes suppress natural melatonin. Execute these steps to prepare your sleep station and achieve restorative sleep:',
      steps: [
        {
          title: 'Hand Over High-Risk Tasks & Enter Sleep Bag Restraint',
          detail: 'Stand down from EVA, robotics, or navigation duties. Enter your crew quarters sleeping bag and fasten the light elastic torso strap so you feel grounded in microgravity.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#b49aff" stroke-width="1.5"/>
            <g class="svg-float">
              <rect x="20" y="30" width="74" height="26" rx="13" fill="#132e4a" stroke="#b49aff" stroke-width="1.8"/>
              <circle cx="33" cy="43" r="7" fill="#edf5ff"/>
              <line x1="54" y1="30" x2="54" y2="56" stroke="#f5bd67" stroke-width="2.5"/>
            </g>
            <text x="116" y="46" fill="#b49aff" font-size="7.5" font-weight="bold" text-anchor="middle">STRAP IN</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">SECURE SLEEPING BAG RESTRAINT</text>
          </svg>`
        },
        {
          title: 'Block Cabin Light (<10 Lux) & Insert Acoustic Earplugs',
          detail: 'Close the sleep station privacy door, switch off blue-spectrum LEDs (<10 lux), put on a contoured sleep mask, and insert foam earplugs to block continuous fan noise.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <circle cx="48" cy="40" r="16" fill="#132e4a" stroke="#edf5ff" stroke-width="1.8"/>
            <rect x="33" y="33" width="30" height="9" rx="4.5" fill="#b49aff">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
            </rect>
            <circle cx="30" cy="40" r="3.5" fill="#f5bd67"/>
            <circle cx="66" cy="40" r="3.5" fill="#f5bd67"/>
            <text x="105" y="37" fill="#b49aff" font-size="8" font-weight="bold" text-anchor="middle">EYE MASK</text>
            <text x="105" y="49" fill="#f5bd67" font-size="7.5" text-anchor="middle">+ EARPLUGS</text>
            <text x="72" y="81" fill="#56d4e8" font-size="8" font-weight="bold" text-anchor="middle">ELIMINATE LIGHT &amp; ECLSS NOISE</text>
          </svg>`
        },
        {
          title: 'Complete Uninterrupted 8.0-Hour Recovery Cycle',
          detail: 'Set station cooling to ~19°C and complete a full 8-hour sleep block before logging your recovery score and resuming operational shifts.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#62d7b0" stroke-width="1.5"/>
            <text x="72" y="42" fill="#62d7b0" font-size="15" font-weight="bold" text-anchor="middle">
              8.0 HOURS
              <animate attributeName="opacity" values="1;0.45;1" dur="2.2s" repeatCount="indefinite"/>
            </text>
            <text x="72" y="55" fill="#8da4bd" font-size="7.5" text-anchor="middle">19°C · ZERO CAFFEINE</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">FULL CIRCADIAN RECOVERY</text>
          </svg>`
        }
      ],
      tip: 'MEDICAL NOTE: Chronic sleep deficit >3 days should be reported to Flight Surgeon for circadian light/melatonin scheduling.'
    },

    radiation: {
      metricLabel: 'Radiation Exposure',
      name: 'Solar Particle Event (SPE) Storm Shelter Protocol',
      source: 'NASA Space Radiation Analysis Group (SRAG) & NASA-STD-3001 Vol. 2 (Sec. 6.4)',
      action: 'Ingress airlock immediately, move behind water-wall shelter, & check dosimeter.',
      intro: 'During high solar proton flux (>0.7–1.0 mSv), high-hydrogen mass (water and polyethylene) is your primary shield. Execute immediately:',
      steps: [
        {
          title: 'Terminate EVA & Seal Pressure Hatches Immediately',
          detail: 'Stop external work immediately, translate back into the airlock, equalize pressure, and dog shut all exterior hatches.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#ff7d85" stroke-width="1.5"/>
            <rect x="30" y="20" width="28" height="42" rx="5" fill="#132e4a" stroke="#ff7d85" stroke-width="2"/>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 44 41" to="360 44 41" dur="2.5s" repeatCount="indefinite"/>
              <circle cx="44" cy="41" r="7" fill="none" stroke="#f5bd67" stroke-width="2"/>
              <line x1="37" y1="41" x2="51" y2="41" stroke="#f5bd67" stroke-width="2"/>
            </g>
            <text x="100" y="38" fill="#ff7d85" font-size="8.5" font-weight="bold" text-anchor="middle">INGRESS</text>
            <text x="100" y="50" fill="#edf5ff" font-size="7.5" text-anchor="middle">LOCK HATCH</text>
            <text x="72" y="81" fill="#ff7d85" font-size="8" font-weight="bold" text-anchor="middle">ABORT EXTERNAL OPS &amp; SEAL</text>
          </svg>`
        },
        {
          title: 'Position Body Behind Water-Wall Storm Shelter',
          detail: 'Move into the central core module surrounded by potable water storage bags and high-density polyethylene blocks until solar flux subsides.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#56d4e8" stroke-width="1.5"/>
            <path class="svg-flow" d="M12 30 L38 30 M12 50 L38 50" stroke="#ff7d85" stroke-width="2.6"/>
            <rect x="44" y="18" width="14" height="44" rx="4" fill="#56d4e8">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
            </rect>
            <circle cx="84" cy="30" r="7" fill="#62d7b0"/>
            <path d="M84 38 L84 58" stroke="#62d7b0" stroke-width="4" stroke-linecap="round"/>
            <text x="114" y="44" fill="#56d4e8" font-size="7.5" font-weight="bold" text-anchor="middle">H₂O WALL</text>
            <text x="72" y="81" fill="#62d7b0" font-size="8" font-weight="bold" text-anchor="middle">STAY BEHIND HYDROGEN SHIELDING</text>
          </svg>`
        },
        {
          title: 'Read Personal Active Dosimeter & Report to SRAG',
          detail: 'Check your clipped Crew Active Dosimeter (CAD) cumulative mSv reading and transmit telemetry to NASA SRAG for exposure clearance.',
          svg: `<svg width="145" height="95" viewBox="0 0 145 95" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="137" height="87" rx="10" fill="#09192b" stroke="#f5bd67" stroke-width="1.5"/>
            <rect x="28" y="22" width="44" height="38" rx="6" fill="#132e4a" stroke="#f5bd67" stroke-width="1.8"/>
            <text x="50" y="44" fill="#f5bd67" font-size="9.5" font-weight="bold" text-anchor="middle">
              mSv
              <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
            </text>
            <text x="104" y="38" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">CHECK CAD</text>
            <text x="104" y="50" fill="#8da4bd" font-size="7" text-anchor="middle">LOG DOSE</text>
            <text x="72" y="81" fill="#edf5ff" font-size="8" font-weight="bold" text-anchor="middle">VERIFY DOSIMETER &amp; MONITOR SYMPTOMS</text>
          </svg>`
        }
      ],
      tip: 'CRITICAL ESCALATION: Sudden nausea, vomiting, or severe fatigue after radiation exposure requires immediate Flight Surgeon alert.'
    }
  };

  let currentEnv = 'spacecraft';
  let lastHealth = {};
  let liveBpm = 72;
  let liveSpo2 = 98;
  let targetBpm = 72;
  let targetSpo2 = 98;

  function getLimits() {
    return ENV_LIMITS[currentEnv] || ENV_LIMITS.spacecraft;
  }

  function statusFor(key, value) {
    const lim = getLimits()[key];
    if (!lim || !Number.isFinite(value)) return { label: 'NO DATA', level: 'none' };
    if (value <= lim.criticalLow || value >= lim.criticalHigh) return { label: 'CRITICAL', level: 'critical' };
    if (value < lim.min || value > lim.max) return { label: 'REVIEW', level: 'warn' };
    return { label: key === 'sleep' || key === 'hydration' ? 'ON TARGET' : 'IN RANGE', level: 'good' };
  }

  // ---------- Guides ----------
  const names = {
    heart: { icon: '♡', title: 'Measure your heart rate', intro: 'Heart rate tells the crew how fast the heart is beating. Compare it with your own mission baseline and report unusual symptoms.', steps: ['Sit or rest in the position recommended by your crew medical checklist.', 'Place two fingers on your wrist pulse, or use the approved monitor.', 'Count beats for a full 60 seconds. If using a device, wait for a stable reading.', 'Record the value in BPM and note symptoms, activity, and time.'], tip: 'A reading outside the expected range, especially with chest pain, fainting, or shortness of breath, needs immediate medical communication.' },
    oxygen: { icon: '◉', title: 'Check blood oxygen', intro: 'SpO₂ estimates the percentage of oxygen carried by your blood. Follow the device and mission procedure.', steps: ['Use the approved pulse oximeter and check that it is functioning.', 'Place it on the recommended finger; keep your hand still and warm.', 'Wait until the number stabilizes and the signal indicator is reliable.', 'Record SpO₂ and any breathing symptoms. Repeat only as directed by protocol.'], tip: 'A low or falling reading, or any severe breathing difficulty, should be reported immediately. Do not rely on a single number alone.' },
    temperature: { icon: '♨', title: 'Take your temperature', intro: 'Temperature can help identify changes that may need medical review.', steps: ['Use only the approved mission thermometer.', 'Follow its instructions for placement and measurement time.', 'Wait for the completion signal; do not estimate the result.', 'Record the value, time, and any symptoms such as chills or feeling feverish.'], tip: 'Report fever or an unusually low temperature to the medical support team, especially with other symptoms.' },
    hydration: { icon: '◌', title: 'Review hydration', intro: 'Hydration supports circulation, temperature regulation, and daily performance. This dashboard field is an index, not a direct diagnosis.', steps: ['Review the fluid-intake plan assigned by the crew medical team.', 'Log fluid intake using the approved onboard tracking method.', 'Note symptoms such as unusual thirst, dizziness, or reduced urination.', 'Enter the hydration index supplied by the mission system.'], tip: 'Do not change fluid or electrolyte intake based only on this dashboard. Follow your mission-specific plan.' }
  };

  // ---------- Treatments with text + SVG illustrations ----------
  const treatments = [
    {
      id: 'electrolyte',
      title: 'Electrolyte rehydration',
      short: 'For low hydration index or high workload (lunar EVA).',
      icon: '◌',
      intro: 'Restore fluid and electrolytes according to the mission medical kit protocol.',
      steps: [
        'Confirm the packet is the approved electrolyte mix for your mission.',
        'Mix with the specified volume of potable water (usually 250–500 ml).',
        'Shake or stir until fully dissolved. Do not use hot water unless directed.',
        'Drink slowly over 10–20 minutes while seated or restrained.',
        'Log intake time and residual symptoms in the health record.'
      ],
      tip: 'If vomiting, severe dizziness, or inability to keep fluids down occurs, contact medical support immediately.',
      svg: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="30" width="50" height="70" rx="6" fill="#1a3a55" stroke="#56d4e8" stroke-width="2"/>
        <rect x="28" y="40" width="34" height="45" rx="3" fill="#56d4e8" opacity="0.35"/>
        <text x="45" y="70" text-anchor="middle" fill="#edf5ff" font-size="11" font-family="sans-serif">MIX</text>
        <path class="svg-flow" d="M80 55 L110 55 L110 75 L140 75" stroke="#8da4bd" stroke-width="2" fill="none"/>
        <circle cx="165" cy="70" r="28" fill="#10233a" stroke="#62d7b0" stroke-width="2"/>
        <path d="M155 70 Q165 55 175 70 Q165 85 155 70" fill="#62d7b0" opacity="0.6"/>
        <text x="165" y="105" text-anchor="middle" fill="#8da4bd" font-size="9">DRINK</text>
      </svg>`
    },
    {
      id: 'analgesic',
      title: 'Analgesic (pain relief)',
      short: 'Mild to moderate pain — follow dose limits strictly.',
      icon: '✚',
      intro: 'Use only the medication listed in the crew medical kit for the indicated symptom.',
      steps: [
        'Identify the correct blister pack or vial labeled for pain relief.',
        'Check the dose against the current medical checklist (do not exceed).',
        'Take with a small amount of water unless the label says otherwise.',
        'Note time of dose and pain level (0–10) in the health log.',
        'Reassess after 30–60 minutes; do not redose early.'
      ],
      tip: 'Chest pain, sudden severe headache, or neurological symptoms are emergencies — do not self-medicate; contact Mission Control.',
      svg: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="30" y="40" width="40" height="25" rx="4" fill="#ff7d85" opacity="0.9"/>
        <rect x="35" y="45" width="30" height="6" fill="#edf5ff" opacity="0.5"/>
        <rect x="80" y="40" width="40" height="25" rx="4" fill="#ff7d85" opacity="0.9"/>
        <rect x="85" y="45" width="30" height="6" fill="#edf5ff" opacity="0.5"/>
        <path class="svg-flow" d="M130 52 L155 52" stroke="#8da4bd" stroke-width="2"/>
        <circle cx="170" cy="52" r="18" fill="#10233a" stroke="#f5bd67" stroke-width="2"/>
        <text x="170" y="56" text-anchor="middle" fill="#f5bd67" font-size="14">+</text>
        <text x="100" y="95" text-anchor="middle" fill="#8da4bd" font-size="9">CHECK DOSE → TAKE WITH WATER</text>
      </svg>`
    },
    {
      id: 'antiemetic',
      title: 'Antiemetic (nausea)',
      short: 'Space motion sickness or post-EVA nausea.',
      icon: '◈',
      intro: 'Nausea is common in microgravity and after suit operations. Use the designated antiemetic only as directed.',
      steps: [
        'Confirm the medication is the approved antiemetic for your mission.',
        'Take the prescribed dose at the first sign of sustained nausea.',
        'Remain still or use a restrained position; avoid rapid head movements.',
        'Sip small amounts of fluid if tolerated; do not force large volumes.',
        'Record onset, dose time, and response in the health system.'
      ],
      tip: 'Persistent vomiting with inability to keep fluids, or signs of dehydration, requires immediate medical support.',
      svg: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="60" cy="55" rx="28" ry="35" fill="#1a3a55" stroke="#b49aff" stroke-width="2"/>
        <ellipse cx="60" cy="55" rx="14" ry="18" fill="#b49aff" opacity="0.4"/>
        <path class="svg-flow" d="M100 55 L125 55" stroke="#8da4bd" stroke-width="2"/>
        <rect x="135" y="35" width="35" height="40" rx="6" fill="#10233a" stroke="#56d4e8" stroke-width="2"/>
        <circle cx="152" cy="55" r="8" fill="#56d4e8" opacity="0.7"/>
        <text x="100" y="100" text-anchor="middle" fill="#8da4bd" font-size="9">TABLET / INJECTABLE AS TRAINED</text>
      </svg>`
    },
    {
      id: 'oxygen_support',
      title: 'Supplemental oxygen',
      short: 'Low SpO₂ or breathing difficulty under protocol.',
      icon: '◉',
      intro: 'Only use supplemental O₂ when indicated by readings and crew medical direction.',
      steps: [
        'Verify the oxygen system and mask/cannula are the approved type.',
        'Set flow rate exactly as specified in the medical checklist.',
        'Secure the interface; ensure a proper seal without over-tightening.',
        'Monitor SpO₂ and symptoms continuously while on support.',
        'Do not discontinue without medical confirmation unless an emergency procedure requires it.'
      ],
      tip: 'Sudden severe breathlessness, blue lips, or unresponsiveness = emergency. Activate emergency protocol first.',
      svg: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="25" y="25" width="40" height="70" rx="8" fill="#1a3a55" stroke="#56d4e8" stroke-width="2"/>
        <text x="45" y="65" text-anchor="middle" fill="#56d4e8" font-size="10">O₂</text>
        <path class="svg-flow" d="M70 50 Q100 30 130 50" stroke="#56d4e8" stroke-width="3" fill="none"/>
        <ellipse cx="155" cy="55" rx="25" ry="20" fill="#10233a" stroke="#62d7b0" stroke-width="2"/>
        <path d="M140 55 Q155 40 170 55" stroke="#62d7b0" stroke-width="2" fill="none"/>
        <text x="100" y="105" text-anchor="middle" fill="#8da4bd" font-size="9">FLOW → MASK / CANNULA</text>
      </svg>`
    }
  ];

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    if (!$('.modal-backdrop.visible')) document.body.classList.remove('modal-open');
  }

  // ---------- فتح نافذة العلاج مع المصادر الموثقة والأنيميشن المستقل لكل خطوة ----------
  function openProtocolForMetric(key) {
    const proto = CRITICAL_PROTOCOLS[key];
    const lim = getLimits()[key];
    if (!proto || !lim) return;

    const rawVal = key === 'radiation' ? (Number(lastHealth.radiation) / 10000) : Number(lastHealth[key]);
    const st = statusFor(key, rawVal);
    const formattedVal = Number.isFinite(rawVal)
      ? (key === 'temp' ? rawVal.toFixed(1) : key === 'radiation' ? rawVal.toFixed(2) : Math.round(rawVal))
      : '--';

    const critBoundText = lim.criticalHigh > 100 && (key === 'spo2' || key === 'hydration')
      ? `< ${lim.criticalLow}${lim.unit}`
      : lim.criticalLow < 0
        ? `> ${lim.criticalHigh}${lim.unit}`
        : `< ${lim.criticalLow} or > ${lim.criticalHigh}${lim.unit}`;

    const valColor = st.level === 'critical' ? '#ff7d85' : st.level === 'warn' ? '#f5bd67' : '#62d7b0';

    $('#treatIllustration').innerHTML = `
      <div style="width:100%; display:flex; flex-direction:column; gap:8px;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; background:rgba(10,22,40,0.95); border:1px solid ${valColor}; border-radius:10px; padding:10px; text-align:center;">
          <div>
            <div style="font-size:0.68rem; color:#8da4bd; text-transform:uppercase;">Current ${proto.metricLabel}</div>
            <div style="font-size:1.25rem; font-weight:700; color:${valColor};">${formattedVal} ${lim.unit}</div>
          </div>
          <div style="border-left:1px solid rgba(255,255,255,0.08); border-right:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.68rem; color:#8da4bd; text-transform:uppercase;">Safe Target (${getLimits().label})</div>
            <div style="font-size:1.05rem; font-weight:700; color:#62d7b0;">${lim.min}–${lim.max} ${lim.unit}</div>
          </div>
          <div>
            <div style="font-size:0.68rem; color:#8da4bd; text-transform:uppercase;">Critical Threshold</div>
            <div style="font-size:1.05rem; font-weight:700; color:#f5bd67;">${critBoundText}</div>
          </div>
        </div>
        <div style="font-size:0.74rem; color:#56d4e8; background:rgba(86,212,232,0.08); border:1px solid rgba(86,212,232,0.25); border-radius:6px; padding:6px 10px;">
          <strong>Clinical Reference:</strong> ${proto.source}
        </div>
      </div>
    `;

    $('#treatTitle').textContent = `${st.label}: ${proto.metricLabel} — ${proto.name}`;
    $('#treatIntro').textContent = proto.intro;

    const stepsEl = $('#treatSteps');
    stepsEl.style.listStyle = 'none';
    stepsEl.style.paddingLeft = '0';
    stepsEl.innerHTML = proto.steps.map((step, idx) => `
      <li class="proto-step-card" style="animation-delay:${idx * 0.14}s; display:grid; grid-template-columns:1fr 148px; gap:14px; align-items:center; background:rgba(13,33,55,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px; margin-bottom:10px;">
        <div>
          <div style="font-weight:700; color:#edf5ff; font-size:0.92rem; margin-bottom:4px;">
            <span style="color:#56d4e8; margin-right:6px;">Step ${idx + 1}:</span>${step.title}
          </div>
          <div style="font-size:0.82rem; color:#b8c7d9; line-height:1.45;">${step.detail}</div>
        </div>
        <div style="display:flex; justify-content:center; align-items:center;">
          ${step.svg}
        </div>
      </li>
    `).join('');

    $('#treatTip').textContent = proto.tip;
    openModal('treatmentModal');
  }

  $$('[data-guide]').forEach(button => button.addEventListener('click', () => {
    const guide = names[button.dataset.guide];
    if (!guide) return;
    $('#modalIcon').textContent = guide.icon;
    $('#modalTitle').textContent = guide.title;
    $('#modalIntro').textContent = guide.intro;
    $('#modalSteps').innerHTML = guide.steps.map(step => `<li>${step}</li>`).join('');
    $('#modalTip').textContent = guide.tip;
    openModal('guideModal');
  }));

  $$('[data-close]').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.close)));
  $$('.modal-backdrop').forEach(modal => modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal.id); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal-backdrop.visible').forEach(m => closeModal(m.id)); });

  // ---------- Render treatments ----------
  function renderTreatments() {
    const grid = $('#treatmentsGrid');
    if (!grid) return;
    grid.innerHTML = treatments.map(t => `
      <article class="treatment-card">
        <div class="treat-icon">${t.icon}</div>
        <h3>${t.title}</h3>
        <p>${t.short}</p>
        <button class="btn btn-ghost" data-treat="${t.id}">How to take it <span>→</span></button>
      </article>
    `).join('');
    $$('[data-treat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = treatments.find(x => x.id === btn.dataset.treat);
        if (!t) return;
        const stepsEl = $('#treatSteps');
        stepsEl.style.listStyle = 'decimal';
        stepsEl.style.paddingLeft = '20px';
        $('#treatIllustration').innerHTML = t.svg;
        $('#treatTitle').textContent = t.title;
        $('#treatIntro').textContent = t.intro;
        stepsEl.innerHTML = t.steps.map(s => `<li>${s}</li>`).join('');
        $('#treatTip').textContent = t.tip;
        openModal('treatmentModal');
      });
    });
  }

  // ---------- Limits panel ----------
  function renderLimits() {
    const lim = getLimits();
    $('#limitsTitle').textContent = `${lim.label} thresholds`;
    const keys = [
      ['bpm', 'Heart rate'],
      ['spo2', 'SpO₂'],
      ['temp', 'Temperature'],
      ['sleep', 'Sleep'],
      ['hydration', 'Hydration'],
      ['radiation', 'Radiation']
    ];
    $('#limitsGrid').innerHTML = keys.map(([k, label]) => {
      const L = lim[k];
      const critText = L.criticalHigh > 100 && (k === 'spo2' || k === 'hydration')
        ? `Critical &lt;${L.criticalLow}${L.unit}`
        : L.criticalLow < 0
          ? `Critical &gt;${L.criticalHigh}${L.unit}`
          : `Critical &lt;${L.criticalLow} or &gt;${L.criticalHigh}`;
      return `<div class="limit-item">
        <strong>${label}</strong>
        <span class="lim-ok">OK ${L.min}–${L.max} ${L.unit}</span>
        <span class="lim-crit">${critText}</span>
      </div>`;
    }).join('');
  }

  function setMetric(id, value, statusId, statusObj) {
    const valueEl = document.getElementById(id);
    const stateEl = document.getElementById(statusId);
    if (valueEl) valueEl.textContent = value;
    if (stateEl) {
      stateEl.textContent = statusObj.label;
      stateEl.className = `metric-state state-${statusObj.level}`;
      const card = stateEl.closest('.metric-card, .vital-card, article');
      if (card) {
        card.classList.toggle('card-is-critical', statusObj.level === 'critical');
        card.classList.toggle('card-is-warn', statusObj.level === 'warn');
      }
    }
  }

  function updateDangerBar(barId, value, key) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    const lim = getLimits()[key];
    if (!lim || !Number.isFinite(value)) {
      bar.querySelector('i').style.width = '0%';
      bar.className = 'danger-bar';
      return;
    }
    const low = Math.max(0, lim.criticalLow);
    const high = Math.min(lim.criticalHigh, key === 'spo2' || key === 'hydration' ? 100 : lim.criticalHigh);
    const range = high - low || 1;
    const pct = Math.max(0, Math.min(100, ((value - low) / range) * 100));
    bar.querySelector('i').style.width = `${pct}%`;
    const st = statusFor(key, value);
    bar.className = `danger-bar bar-${st.level}`;
  }

  function renderHealth(data) {
    lastHealth = data;
    const lim = getLimits();

    $('#bpmRange').innerHTML = `${lim.bpm.min}–${lim.bpm.max} <i>ref</i>`;
    $('#spo2Range').innerHTML = `${lim.spo2.min}–${lim.spo2.max}% <i>ref</i>`;
    $('#tempRange').innerHTML = `${lim.temp.min}–${lim.temp.max} <i>ref</i>`;
    $('#sleepRange').innerHTML = `${lim.sleep.min}–${lim.sleep.max} hrs <i>target</i>`;
    $('#hydrationRange').innerHTML = `${lim.hydration.min}–${lim.hydration.max}% <i>target</i>`;
    $('#radiationRange').innerHTML = `Alert &gt;${lim.radiation.max} <i>mSv</i>`;

    const bpm = Number(data.bpm);
    const spo2 = Number(data.spo2);
    const temp = Number(data.temp);
    const sleep = Number(data.sleep);
    const hydration = Number(data.hydration);
    const radiation = Number(data.radiation);
    const radiationMsV = radiation / 10000;

    if (Number.isFinite(bpm)) { targetBpm = bpm; liveBpm = bpm; }
    if (Number.isFinite(spo2)) { targetSpo2 = spo2; liveSpo2 = spo2; }

    setMetric('bpmValue', Number.isFinite(bpm) ? Math.round(bpm) : '--', 'bpmState', statusFor('bpm', bpm));
    setMetric('spo2Value', Number.isFinite(spo2) ? Math.round(spo2) : '--', 'spo2State', statusFor('spo2', spo2));
    setMetric('tempValue', Number.isFinite(temp) ? temp.toFixed(1) : '--', 'tempState', statusFor('temp', temp));
    setMetric('sleepValue', Number.isFinite(sleep) ? sleep : '--', 'sleepState', statusFor('sleep', sleep));
    setMetric('hydrationValue', Number.isFinite(hydration) ? hydration : '--', 'hydrationState', statusFor('hydration', hydration));
    setMetric('radiationValue', Number.isFinite(radiationMsV) ? radiationMsV.toFixed(2) : '--', 'radiationState',
      statusFor('radiation', radiationMsV));

    if ($('#spo2Track')) $('#spo2Track').style.width = `${Math.max(0, Math.min(100, spo2 || 0))}%`;
    if ($('#hydrationTrack')) $('#hydrationTrack').style.width = `${Math.max(0, Math.min(100, hydration || 0))}%`;
    if ($('#sleepTrack')) $('#sleepTrack').style.width = `${Math.max(0, Math.min(100, ((sleep || 0) / 9) * 100))}%`;
    if ($('#radiationTrack')) $('#radiationTrack').style.width = `${Math.max(0, Math.min(100, (radiationMsV / 4) * 100))}%`;
    if ($('#tempScaleFill')) {
      const tPct = Number.isFinite(temp) ? Math.max(0, Math.min(100, ((temp - 34) / 6) * 100)) : 0;
      $('#tempScaleFill').style.width = `${tPct}%`;
    }

    updateDangerBar('bpmDangerBar', bpm, 'bpm');
    updateDangerBar('spo2DangerBar', spo2, 'spo2');
    updateDangerBar('tempDangerBar', temp, 'temp');
    updateDangerBar('sleepDangerBar', sleep, 'sleep');
    updateDangerBar('hydrationDangerBar', hydration, 'hydration');
    updateDangerBar('radiationDangerBar', radiationMsV, 'radiation');

    const respEst = Number.isFinite(spo2) ? Math.round(12 + (100 - spo2) * 0.8 + (Math.random() * 2 - 1)) : '--';
    if ($('#respRateValue')) $('#respRateValue').textContent = respEst;

    // ---------- Banner + أزرار العلاج التفاعلية لكل قياس ----------
    const allKeys = ['bpm', 'spo2', 'temp', 'sleep', 'hydration', 'radiation'];
    const criticals = allKeys.filter(k => {
      const val = k === 'radiation' ? radiationMsV : Number(data[k]);
      return statusFor(k, val).level === 'critical';
    });
    const warnings = allKeys.filter(k => {
      const val = k === 'radiation' ? radiationMsV : Number(data[k]);
      return statusFor(k, val).level === 'warn';
    });

    const banner = $('#healthBanner');
    const bannerTag = $('#bannerTag');

    if (criticals.length) {
      const firstCrit = criticals[0];
      const proto = CRITICAL_PROTOCOLS[firstCrit];
      banner.classList.add('banner-warning', 'banner-critical');
      $('#bannerTitle').textContent = `CRITICAL ALERT: ${criticals.map(k => k.toUpperCase()).join(', ')} — ${proto.name}`;

      const actionButtons = criticals.map(k => {
        const L = getLimits()[k];
        return `<button type="button" data-open-proto="${k}" class="btn btn-danger" style="margin:6px 8px 0 0; padding:5px 12px; font-size:0.8rem;">
          How to Treat ${k.toUpperCase()} (Target: ${L.min}–${L.max}${L.unit}) →
        </button>`;
      }).join('');

      $('#bannerText').innerHTML = `<div>${proto.action}</div><div style="margin-top:4px;">${actionButtons}</div>`;
      bannerTag.textContent = 'CRITICAL';

      $$('[data-open-proto]').forEach(btn => {
        btn.addEventListener('click', () => openProtocolForMetric(btn.dataset.openProto));
      });
    } else if (warnings.length) {
      banner.classList.add('banner-warning');
      banner.classList.remove('banner-critical');
      $('#bannerTitle').textContent = 'Some readings need your attention';
      const warnButtons = warnings.map(k => {
        const L = getLimits()[k];
        return `<button type="button" data-open-proto="${k}" class="btn btn-ghost" style="margin:6px 8px 0 0; padding:4px 10px; font-size:0.78rem;">
          ${k.toUpperCase()} Steps (Target: ${L.min}–${L.max}${L.unit}) →
        </button>`;
      }).join('');
      $('#bannerText').innerHTML = `<div>Review: ${warnings.map(k => k.toUpperCase()).join(', ')} against ${getLimits().label} baseline.</div><div>${warnButtons}</div>`;
      bannerTag.textContent = 'REVIEW NEEDED';

      $$('[data-open-proto]').forEach(btn => {
        btn.addEventListener('click', () => openProtocolForMetric(btn.dataset.openProto));
      });
    } else {
      banner.classList.remove('banner-warning', 'banner-critical');
      $('#bannerTitle').textContent = 'Your dashboard is ready';
      $('#bannerText').textContent = `All core vitals within ${getLimits().label} reference ranges.`;
      bannerTag.textContent = 'CREW STATUS';
    }

    ['bpm', 'spo2', 'temp', 'sleep', 'hydration'].forEach(key => {
      const input = document.getElementById(`${key}Input`);
      if (input && document.activeElement !== input) {
        input.value = data[key] ?? '';
      }
    });
    const radInput = $('#radiationInput');
    if (radInput && document.activeElement !== radInput) {
      radInput.value = Number.isFinite(radiationMsV) ? radiationMsV.toFixed(2) : '';
    }
  }

  async function loadHealth(silent = false) {
    const refresh = $('#refreshBtn');
    const poll = $('#pollStatus');
    if (!silent && refresh) { refresh.disabled = true; refresh.textContent = '↻ Loading…'; }
    if (poll) poll.textContent = '· syncing';
    try {
      const data = await request('/astro/health');
      renderHealth(data);
      if (poll) poll.textContent = '· live';
    } catch (err) {
      if (!silent) showToast('Could not load health readings. Please refresh or sign in again.', true);
      if (poll) poll.textContent = '· offline';
      console.error(err);
    } finally {
      if (refresh) { refresh.disabled = false; refresh.textContent = '↻ Refresh readings'; }
    }
  }

  setInterval(() => loadHealth(true), 6000);

  $('#healthForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const values = {};
    const fields = {
      bpm: $('#bpmInput')?.value,
      spo2: $('#spo2Input')?.value,
      temp: $('#tempInput')?.value,
      sleep: $('#sleepInput')?.value,
      hydration: $('#hydrationInput')?.value,
      radiation: $('#radiationInput')?.value
    };

    for (const [key, raw] of Object.entries(fields)) {
      if (raw === undefined || raw.trim() === '') continue;
      const number = Number(raw);
      if (!Number.isFinite(number)) { showToast(`Enter a valid ${key} value.`, true); return; }
      values[key] = key === 'radiation' ? Math.round(number * 10000) : number;
    }

    if (!Object.keys(values).length) { showToast('Enter at least one measurement first.', true); return; }

    const save = event.currentTarget.querySelector('button[type="submit"]');
    save.disabled = true;
    $('#saveMessage').textContent = 'Saving…';

    try {
      const result = await request('/astro/health/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      renderHealth(result.astroHealthData || values);
      $('#saveMessage').textContent = 'Saved successfully';
      showToast('Health record updated.');
      setTimeout(() => { $('#saveMessage').textContent = ''; }, 3500);
    } catch (err) {
      $('#saveMessage').textContent = 'Could not save';
      showToast(err.message || 'Could not save the health record.', true);
    } finally {
      save.disabled = false;
    }
  });

  $('#refreshBtn')?.addEventListener('click', () => loadHealth(false));
  $('#emergencyBtn')?.addEventListener('click', () => openModal('emergencyModal'));
  $('#menuBtn')?.addEventListener('click', () => $('#sidebar').classList.toggle('sidebar-open'));
  $$('.nav-link').forEach(link => link.addEventListener('click', () => $('#sidebar').classList.remove('sidebar-open')));

  $('#environment')?.addEventListener('change', e => {
    currentEnv = e.target.value;
    renderLimits();
    if (lastHealth && Object.keys(lastHealth).length) renderHealth(lastHealth);
    const label = e.target.options[e.target.selectedIndex].text.replace(/^[◈◎◒]\s*/, '');
    showToast(`Environment set to ${label}. Danger limits updated.`);
  });

  // ---------- تسجيل الخروج من الفرونت إند فقط بدون لمس الباك إند ----------
  function handleLogout() {
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }

  $('#logoutBtn')?.addEventListener('click', handleLogout);
  $('.logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });

  async function loadUser() {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const username = data.username || 'Crew member';
      $('#welcomeName').textContent = username;
      $('#sidebarUsername').textContent = username;
      $('#userAvatar').textContent = username.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    } catch (_) {}
  }

  const date = new Date();
  $('#currentDate').textContent = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();

  // ---------- Live BPM / SpO2 oscillation ----------
  function tickLiveVitals() {
    liveBpm += (targetBpm - liveBpm) * 0.15 + (Math.random() - 0.5) * 0.8;
    liveSpo2 += (targetSpo2 - liveSpo2) * 0.15 + (Math.random() - 0.5) * 0.1;
    liveBpm = Math.max(40, Math.min(180, liveBpm));
    liveSpo2 = Math.max(75, Math.min(100, liveSpo2));
    if ($('#bpmValue')) $('#bpmValue').textContent = Math.round(liveBpm);
    if ($('#spo2Value')) $('#spo2Value').textContent = liveSpo2.toFixed(0);
    const icon = $('.pulse-icon');
    if (icon) {
      icon.style.transform = `scale(${1 + 0.16 * Math.sin(Date.now() / (60000 / Math.max(liveBpm, 40)))})`;
    }
  }
  setInterval(tickLiveVitals, 120);

  // ---------- ECG canvas ----------
  function drawEcg() {
    const canvas = $('#ecgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const points = [];
    function frame() {
      ctx.fillStyle = 'rgba(7,20,38,0.35)';
      ctx.fillRect(0, 0, w, h);
      const bpm = liveBpm || 72;
      const period = Math.max(8, Math.round(60 / (bpm / 60) * 2));
      const t = (Date.now() / 30) % 1000;
      let y = h / 2;
      const phase = (t % period) / period;
      if (phase < 0.08) y = h / 2 - Math.sin(phase / 0.08 * Math.PI) * (h * 0.38);
      else if (phase < 0.14) y = h / 2 + Math.sin((phase - 0.08) / 0.06 * Math.PI) * (h * 0.12);
      else y = h / 2 + Math.sin(phase * 6) * 2;
      points.push(y);
      if (points.length > w) points.shift();
      ctx.beginPath();
      ctx.strokeStyle = '#ff7d85';
      ctx.lineWidth = 1.5;
      points.forEach((py, i) => {
        if (i === 0) ctx.moveTo(i, py);
        else ctx.lineTo(i, py);
      });
      ctx.stroke();
      requestAnimationFrame(frame);
    }
    frame();
  }

  // ---------- Respiration wave CSS animation speed ----------
  function updateRespWave() {
    const wave = $('#respWave');
    if (!wave) return;
    const rate = Number($('#respRateValue')?.textContent) || 14;
    wave.style.animationDuration = `${60 / Math.max(rate, 6)}s`;
  }
  setInterval(updateRespWave, 2000);

  // ---------- Three.js 3D — real GLTF (NASA Astronaut + X-Ray Anatomy + Auto-Orbit) ----------
  function init3D() {
    const canvas = $('#body3dCanvas');
    if (!canvas || typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
      console.warn('Three.js or GLTFLoader not ready');
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1b30);
    scene.fog = new THREE.Fog(0x0b1b30, 4, 12);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 50);
    camera.position.set(0, 1.05, 3.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const hemi = new THREE.HemisphereLight(0xb0d0ff, 0x1a2030, 0.65);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(2.5, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x56d4e8, 0.45);
    fill.position.set(-3, 1, -2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xff7d85, 0.3);
    rim.position.set(0, 2, -4);
    scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x0a1628, metalness: 0.2, roughness: 0.9, transparent: true, opacity: 0.85 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    scene.add(ground);

    const loader = new THREE.GLTFLoader();

    if (typeof THREE.DRACOLoader !== 'undefined') {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
      loader.setDRACOLoader(dracoLoader);
    }

    if (typeof MeshoptDecoder !== 'undefined') {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }

    const xraySuitMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x56d4e8) },
        uRimPower: { value: 2.2 },
        uOpacity: { value: 0.32 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uRimPower;
        uniform float uOpacity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), uRimPower);
          float alpha = clamp(fresnel * 0.85 + 0.06, 0.0, 1.0) * uOpacity * 2.2;
          gl_FragColor = vec4(uColor * (0.6 + fresnel * 1.4), alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    let astronaut = null;
    let heartModel = null;
    let lungsModel = null;
    let focus = 'full';
    let drag = false, prevX = 0, prevY = 0;
    let rotY = 0.25, rotX = 0.05;
    let desiredCamPos = new THREE.Vector3(0, 1.05, 3.4);

    let heartPhase = 0;
    let lungPhase = 0;
    let floatPhase = 0;
    let lastFrameTime = performance.now();

    const statusEl = document.createElement('div');
    statusEl.className = 'model-load-status';
    statusEl.textContent = 'Loading NASA astronaut model…';
    canvas.parentElement.appendChild(statusEl);

    function fitObject(obj, targetHeight = 1.85, centerY = false) {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3());
      const scale = targetHeight / Math.max(size.y, 0.001);
      obj.scale.multiplyScalar(scale);
      box.setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.x -= center.x;
      obj.position.z -= center.z;
      if (centerY) {
        obj.position.y -= center.y;
      } else {
        obj.position.y -= box.min.y;
      }
      obj.userData.baseY = obj.position.y;
    }

    function applySuitMode(isXray) {
      if (!astronaut) return;
      astronaut.traverse((c) => {
        if (c.isMesh) {
          if (!c.userData.origMaterial) {
            c.userData.origMaterial = c.material;
          }
          c.material = isXray ? xraySuitMaterial : c.userData.origMaterial;
          c.renderOrder = isXray ? 2 : 0;
        }
      });
    }

    function setModelVisible(mode) {
      const isXray = (mode === 'xray');
      applySuitMode(isXray);

      if (astronaut) {
        astronaut.visible = (mode === 'full' || isXray);
      }

      if (heartModel) {
        heartModel.visible = (mode === 'heart' || isXray);
        if (isXray) {
          heartModel.scale.setScalar(heartModel.userData.xrayScale || 0.22);
          heartModel.position.set(0.035, 1.24, 0.05);
        } else {
          heartModel.scale.setScalar(heartModel.userData.soloScale || 1);
          heartModel.position.set(0, 0.95, 0);
        }
      }

      if (lungsModel) {
        lungsModel.visible = (mode === 'lungs' || isXray);
        if (isXray) {
          lungsModel.scale.setScalar(lungsModel.userData.xrayScale || 0.28);
          lungsModel.position.set(0, 1.26, 0.02);
        } else {
          lungsModel.scale.setScalar(lungsModel.userData.soloScale || 1);
          lungsModel.position.set(0, 0.95, 0);
        }
      }
    }

    loader.load('/models/Astronaut.glb', (gltf) => {
      astronaut = gltf.scene;
      astronaut.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material) {
            c.material.envMapIntensity = 0.6;
            if (c.material.metalness !== undefined) c.material.metalness = Math.min(c.material.metalness || 0.2, 0.4);
            c.userData.origMaterial = c.material;
          }
        }
      });
      fitObject(astronaut, 1.85, false);
      rigGroup.add(astronaut);
      statusEl.textContent = '';
      statusEl.remove();
      setModelVisible(focus);
    }, undefined, (err) => {
      console.error('Astronaut load failed', err);
      statusEl.textContent = 'Astronaut model failed — check /models/Astronaut.glb';
    });

    loader.load('/models/heart.glb', (gltf) => {
      heartModel = gltf.scene;
      heartModel.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.emissive = new THREE.Color(0xff2a4b);
          c.material.emissiveIntensity = 0.45;
          c.material.metalness = 0.2;
          c.material.roughness = 0.4;
          c.renderOrder = 1;
        }
      });
      fitObject(heartModel, 0.75, true);
      heartModel.userData.soloScale = heartModel.scale.x;
      heartModel.userData.xrayScale = heartModel.scale.x * 0.22;
      heartModel.position.set(0, 0.95, 0);
      heartModel.visible = false;
      rigGroup.add(heartModel);
      setModelVisible(focus);
    }, undefined, (err) => console.warn('Heart GLB optional load failed', err));

    loader.load('/models/lungs.glb', (gltf) => {
      lungsModel = gltf.scene;
      lungsModel.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.transparent = true;
          c.material.opacity = 0.75;
          c.material.metalness = 0.1;
          c.material.roughness = 0.5;
          c.material.emissive = new THREE.Color(0x38bdf8);
          c.material.emissiveIntensity = 0.35;
          c.renderOrder = 1;
        }
      });
      fitObject(lungsModel, 0.85, true);
      lungsModel.userData.soloScale = lungsModel.scale.x;
      lungsModel.userData.xrayScale = lungsModel.scale.x * 0.30;
      lungsModel.position.set(0, 0.95, 0);
      lungsModel.visible = false;
      rigGroup.add(lungsModel);
      setModelVisible(focus);
    }, undefined, (err) => console.warn('Lungs GLB optional load failed', err));

    function resize() {
      const wrap = canvas.parentElement;
      const w = wrap.clientWidth;
      const h = Math.max(320, wrap.clientHeight || 380);
      canvas.width = w;
      canvas.height = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('pointerdown', e => {
      drag = true; prevX = e.clientX; prevY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointerup', () => { drag = false; });
    canvas.addEventListener('pointermove', e => {
      if (!drag) return;
      rotY += (e.clientX - prevX) * 0.008;
      rotX += (e.clientY - prevY) * 0.006;
      rotX = Math.max(-0.55, Math.min(0.55, rotX));
      prevX = e.clientX; prevY = e.clientY;
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      desiredCamPos.z = Math.max(1.1, Math.min(6, desiredCamPos.z + e.deltaY * 0.004));
    }, { passive: false });

    function applyFocus(f) {
      focus = f;
      if (f === 'heart') desiredCamPos.set(0, 0.95, 1.8);
      else if (f === 'lungs') desiredCamPos.set(0, 0.95, 2.0);
      else if (f === 'xray') desiredCamPos.set(0, 1.15, 2.35);
      else desiredCamPos.set(0, 1.05, 3.4);

      setModelVisible(f);
      updateRegionInfo(f);
      $$('[data-view]').forEach(c => c.classList.toggle('active', c.dataset.view === f));
    }

    $$('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => applyFocus(btn.dataset.view));
    });

    function updateRegionInfo(f) {
      const info = $('#regionInfo');
      const vitals = $('#regionVitals');
      if (f === 'xray') {
        info.textContent = 'X-Ray Bio-Scan — translucent suit overlay revealing live cardiac pulse & pulmonary respiration inside the crew member.';
        vitals.innerHTML = `<div><span>Heart rate</span><b>${Math.round(liveBpm)} BPM</b></div>
          <div><span>SpO₂</span><b>${liveSpo2.toFixed(0)}%</b></div>
          <div><span>Scan mode</span><b>X-RAY ACTIVE</b></div>`;
      } else if (f === 'heart') {
        info.textContent = 'Cardiac anatomy (GLTF) — live BPM linked to pulse animation on the heart model.';
        vitals.innerHTML = `<div><span>Heart rate</span><b>${Math.round(liveBpm)} BPM</b></div>
          <div><span>Status</span><b>${statusFor('bpm', targetBpm).label}</b></div>
          <div><span>Model</span><b>heart.glb</b></div>`;
      } else if (f === 'lungs') {
        info.textContent = 'Respiratory anatomy (GLTF) — SpO₂ and estimated breathing rate drive subtle lung scale.';
        vitals.innerHTML = `<div><span>SpO₂</span><b>${liveSpo2.toFixed(0)}%</b></div>
          <div><span>Resp. rate</span><b>${$('#respRateValue')?.textContent || '--'} /min</b></div>
          <div><span>Model</span><b>lungs.glb</b></div>`;
      } else {
        info.textContent = 'NASA Astronaut (official GLB) — full crew body context for mission health.';
        vitals.innerHTML = `<div><span>Temp</span><b>${lastHealth.temp != null ? Number(lastHealth.temp).toFixed(1) : '--'} °C</b></div>
          <div><span>Hydration</span><b>${lastHealth.hydration ?? '--'}%</b></div>
          <div><span>Model</span><b>NASA Astronaut.glb</b></div>`;
      }
    }
    updateRegionInfo('full');

    const hotspots = [
      { id: 'full', label: 'Astronaut' },
      { id: 'xray', label: 'X-Ray Scan' },
      { id: 'heart', label: 'Heart' },
      { id: 'lungs', label: 'Lungs' }
    ];
    $('#hotspotList').innerHTML = hotspots.map(h =>
      `<button class="hotspot-btn" data-hs="${h.id}">${h.label}</button>`
    ).join('');
    $$('[data-hs]').forEach(b => b.addEventListener('click', () => applyFocus(b.dataset.hs)));

    $$('[data-view]').forEach(c => c.classList.toggle('active', c.dataset.view === 'full'));

    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;
      floatPhase += dt;

      // دوران تلقائي ناعم عند عدم السحب بالماوس
      if (!drag) {
        rotY += dt * 0.25;
      }

      const isXray = (focus === 'xray');

      if (heartModel && heartModel.visible) {
        const baseScale = isXray ? heartModel.userData.xrayScale : heartModel.userData.soloScale;
        if (baseScale) {
          const bpm = Math.max(40, Math.min(180, liveBpm || 72));
          heartPhase += dt * (bpm / 60) * Math.PI * 2;
          const pulseWave = Math.pow(Math.max(0, Math.sin(heartPhase)), 4);
          const beat = 1 + 0.12 * pulseWave;
          heartModel.scale.setScalar(baseScale * beat);
        }
      }

      if (lungsModel && lungsModel.visible) {
        const baseScale = isXray ? lungsModel.userData.xrayScale : lungsModel.userData.soloScale;
        if (baseScale) {
          const rate = Number($('#respRateValue')?.textContent) || 14;
          lungPhase += dt * (rate / 60) * Math.PI * 2;
          const breath = 1 + 0.08 * Math.sin(lungPhase);
          lungsModel.scale.set(
            baseScale * breath,
            baseScale * breath * 1.03,
            baseScale * breath
          );
        }
      }

      rigGroup.rotation.y = rotY;
      rigGroup.rotation.x = rotX;
      if (astronaut && astronaut.visible) {
        rigGroup.position.y = (Math.sin(floatPhase * 1.6) + 1) * 0.022;
      } else {
        rigGroup.position.y = 0;
      }

      const lookTarget = new THREE.Vector3(0, focus === 'xray' ? 1.15 : 0.95, 0);
      camera.position.lerp(desiredCamPos, 0.08);
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }

  // Boot
  renderTreatments();
  renderLimits();
  loadUser();
  loadHealth();
  drawEcg();

  const try3d = () => {
    if (
      typeof THREE !== 'undefined' &&
      typeof THREE.GLTFLoader !== 'undefined' &&
      typeof THREE.DRACOLoader !== 'undefined' &&
      typeof MeshoptDecoder !== 'undefined'
    ) {
      init3D();
    } else {
      setTimeout(try3d, 80);
    }
  };
  try3d();
})();