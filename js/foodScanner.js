/**
 * foodScanner.js  v4.0 — REAL AI FOOD SCANNER
 * FitAura — powered by Google Gemini Vision API
 *
 * Flow:
 *   1. Camera opens automatically
 *   2. User taps capture button (or auto-scan)
 *   3. Frame → Base64 → POST /api/food/scan
 *   4. Gemini Vision identifies real foods + real nutrition
 *   5. Results rendered in bottom sheet
 */

'use strict';

const STORAGE_KEYS = {
  SCAN_HISTORY: 'fitaura_scan_history',
  DAILY_INTAKE: 'fitaura_daily_intake',
  DAILY_DATE:   'fitaura_intake_date',
};

const MAX_HISTORY = 20;
const DAILY_GOAL = 2200;

let state = {
  stream: null,
  currentScan: null,
  history: [],
  dailyIntake: { cals: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 },
  scanning: false,
  autoScanTimer: null,
};

/* ── INIT ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadPersistedData();
  bindUI();
  startCamera();
  renderHistory();
  updateDailyBar();
});

/* ── PERSIST ─────────────────────────────────────────────────────────── */
function loadPersistedData() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_DATE);
  if (stored !== today) {
    localStorage.setItem(STORAGE_KEYS.DAILY_DATE, today);
    localStorage.removeItem(STORAGE_KEYS.DAILY_INTAKE);
  } else {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_INTAKE);
    if (raw) state.dailyIntake = JSON.parse(raw);
  }
  const h = localStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
  if (h) state.history = JSON.parse(h);
}

function saveHistory() { localStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(state.history)); }
function saveDailyIntake() { localStorage.setItem(STORAGE_KEYS.DAILY_INTAKE, JSON.stringify(state.dailyIntake)); }

/* ── UI BIND ─────────────────────────────────────────────────────────── */
function bindUI() {
  document.getElementById('captureBtn')?.addEventListener('click', handleCapture);
  document.getElementById('addLogBtn')?.addEventListener('click', handleAddToLog);
  document.getElementById('scanAgainBtn')?.addEventListener('click', resetToCamera);
  document.getElementById('closeBtn')?.addEventListener('click', () => { stopCamera(); window.location.href = 'analytics.html'; });
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => { state.history = []; saveHistory(); renderHistory(); showToast('History cleared'); });

  // Tab switching
  document.querySelectorAll('.fs-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fs-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.fs-view').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${target}`)?.classList.add('active');
      if (target === 'history') renderHistory();
    });
  });

  // Gram adjustment
  document.addEventListener('change', e => {
    if (e.target.classList.contains('gram-input') && state.currentScan) {
      const idx = parseInt(e.target.dataset.idx);
      const item = state.currentScan.items[idx];
      if (item) {
        const newGrams = Math.max(10, parseInt(e.target.value) || 100);
        // Recalculate nutrition proportionally
        const ratio = newGrams / item.estimatedGrams;
        item.estimatedGrams = newGrams;
        const n = item.nutrition;
        Object.keys(n).forEach(k => { n[k] = Math.round(n[k] * ratio * 10) / 10; });
        recalcTotals();
      }
    }
  });
}

/* ── CAMERA ──────────────────────────────────────────────────────────── */
async function startCamera() {
  const video = document.getElementById('cameraView');
  if (!navigator.mediaDevices?.getUserMedia) {
    showCameraError('WebRTC not supported. Use Chrome/Safari/Firefox.');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    video.srcObject = stream;
    state.stream = stream;
  } catch (err) {
    showCameraError(err.name === 'NotAllowedError'
      ? 'Camera permission denied. Allow access and reload.'
      : 'No camera detected.');
  }
}

function stopCamera() {
  if (state.stream) { state.stream.getTracks().forEach(t => t.stop()); state.stream = null; }
}

function showCameraError(msg) {
  const el = document.getElementById('cameraError');
  const btn = document.getElementById('captureBtn');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
  if (btn) btn.disabled = true;
}

/* ── CAPTURE & REAL AI SCAN ─────────────────────────────────────────── */
async function handleCapture() {
  if (state.scanning) return;
  state.scanning = true;

  const video = document.getElementById('cameraView');
  const canvas = document.getElementById('snapshotCanvas');
  const overlay = document.getElementById('overlayUI');
  const scanBtn = document.getElementById('captureBtn');

  // 1. Laser animation
  overlay?.classList.add('scanning-active');
  scanBtn?.classList.add('scanning');
  if (scanBtn) scanBtn.disabled = true;

  // 2. Capture frame to canvas
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert to base64
  const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

  // 3. Show loading
  switchToLoadingView('📸 Capturing frame...');

  // 4. Call real API
  try {
    setLoadingText('🧠 Analyzing food with AI...');
    const result = await callFoodScanAPI(base64, 'image/jpeg');

    if (!result || !result.foods || result.foods.length === 0) {
      setLoadingText('❌ No food detected — try again');
      await delay(1500);
      resetToCamera();
      return;
    }

    // Map to display format
    state.currentScan = {
      items: result.foods.map(f => ({
        food: { name: f.name, emoji: f.emoji || '🍽️', servingLabel: `${f.estimatedGrams}g serving` },
        foodId: f.name.toLowerCase().replace(/\s+/g, '_'),
        confidence: f.confidence || 85,
        estimatedGrams: f.estimatedGrams,
        nutrition: f.nutrition || {},
        per100g: f.per100g || {},
        category: f.category || 'other',
      })),
      totals: {
        cals: result.totalCalories || 0,
        p: result.totalProtein || 0,
        c: result.totalCarbs || 0,
        f: result.totalFat || 0,
        fiber: result.totalFiber || 0,
        sugar: result.totalSugar || 0,
      },
      mealType: result.mealType || 'balanced',
      healthNote: result.healthNote || '',
      source: result.source || 'gemini-vision',
    };

    renderResults(state.currentScan);
    switchToResultView();

  } catch (err) {
    console.error('[FoodScanner] Scan error:', err);
    const msg = err.message || 'Scan failed';
    setLoadingText(`❌ ${msg}`);
    await delay(2000);
    resetToCamera();
  }

  state.scanning = false;
}

/* ── API CALL ────────────────────────────────────────────────────────── */
async function callFoodScanAPI(base64, mimeType) {
  const response = await fetch('/api/food/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, mimeType }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || err.hint || `Server error ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}

/* ── RECALC TOTALS ──────────────────────────────────────────────────── */
function recalcTotals() {
  if (!state.currentScan) return;
  const t = { cals: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 };
  state.currentScan.items.forEach(item => {
    const n = item.nutrition;
    t.cals += n.calories || 0;
    t.p += n.protein || 0;
    t.c += n.carbs || 0;
    t.f += n.fat || 0;
    t.fiber += n.fiber || 0;
    t.sugar += n.sugar || 0;
  });
  Object.keys(t).forEach(k => { t[k] = Math.round(t[k] * 10) / 10; });
  state.currentScan.totals = t;
  renderNutritionPanel(t);
}

/* ── RENDER RESULTS ──────────────────────────────────────────────────── */
function renderResults(scan) {
  // Foods
  const list = document.getElementById('detectedFoodList');
  if (list) {
    list.innerHTML = scan.items.map((item, idx) => `
      <div class="detected-item animate-item" style="animation-delay:${idx * 0.08}s">
        <div class="detected-item-info">
          <span class="detected-item-emoji">${item.food.emoji}</span>
          <div>
            <div class="detected-item-name">${item.food.name}</div>
            <div class="detected-item-sub">
              ${item.category ? `<span style="color:var(--accent-blue);text-transform:capitalize;font-size:0.7rem">${item.category}</span> · ` : ''}
              <span class="conf-badge" style="color: ${item.confidence >= 85 ? 'var(--accent-green)' : 'var(--accent-yellow)'}">
                ${item.confidence}% AI confidence
              </span>
            </div>
          </div>
        </div>
        <div class="detected-item-control">
          <input type="number" class="gram-input" data-idx="${idx}" value="${item.estimatedGrams}" min="10" max="2000" step="5">
          <span class="gram-label">g</span>
        </div>
      </div>
    `).join('');
  }

  // Health note
  if (scan.healthNote) {
    const noteEl = document.getElementById('healthNote');
    if (noteEl) noteEl.textContent = '💡 ' + scan.healthNote;
  }

  renderNutritionPanel(scan.totals, scan.mealType);
}

function renderNutritionPanel(totals, mealType) {
  document.getElementById('totalCals').textContent = Math.round(totals.cals);
  document.getElementById('totalP').textContent = Math.round(totals.p) + 'g';
  document.getElementById('totalC').textContent = Math.round(totals.c) + 'g';
  document.getElementById('totalF').textContent = Math.round(totals.f) + 'g';
  document.getElementById('totalFiber').textContent = Math.round(totals.fiber) + 'g';
  document.getElementById('totalSugar').textContent = Math.round(totals.sugar) + 'g';

  const ratingEl = document.getElementById('mealRating');
  if (ratingEl) {
    const typeLabels = {
      'high-protein': { label: 'High Protein 💪', color: '#00ff80' },
      'balanced': { label: 'Balanced Meal ✅', color: '#ffd700' },
      'high-carb': { label: 'High Carb ⚡', color: '#ff4d6a' },
      'light-snack': { label: 'Light Snack 🍎', color: '#00c3ff' },
      'heavy-meal': { label: 'Heavy Meal 🔥', color: '#ff3366' },
      'low-fat': { label: 'Low Fat 💚', color: '#10b981' },
      'high-fiber': { label: 'High Fiber 🌿', color: '#7000ff' },
    };
    const mt = typeLabels[mealType] || typeLabels['balanced'];
    ratingEl.textContent = mt.label;
    ratingEl.style.color = mt.color;
    ratingEl.style.borderColor = mt.color;
  }

  const totalMacroCals = (totals.p * 4) + (totals.c * 4) + (totals.f * 9);
  if (totalMacroCals > 0) {
    setBar('barProtein', (totals.p * 4) / totalMacroCals * 100, 'var(--accent-blue)');
    setBar('barCarbs', (totals.c * 4) / totalMacroCals * 100, 'var(--accent-red)');
    setBar('barFat', (totals.f * 9) / totalMacroCals * 100, 'var(--accent-yellow)');
  }
}

function setBar(id, pct, color) {
  const el = document.getElementById(id);
  if (el) { el.style.width = Math.min(pct, 100) + '%'; el.style.background = color; }
}

/* ── ADD TO LOG ──────────────────────────────────────────────────────── */
function handleAddToLog() {
  if (!state.currentScan) return;
  const { totals, items } = state.currentScan;

  state.dailyIntake.cals += totals.cals;
  state.dailyIntake.p += totals.p;
  state.dailyIntake.c += totals.c;
  state.dailyIntake.f += totals.f;
  state.dailyIntake.fiber += totals.fiber;
  state.dailyIntake.sugar += totals.sugar;
  saveDailyIntake();

  const entry = {
    id: Date.now(),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    foods: items.map(i => ({ name: i.food.name, emoji: i.food.emoji, grams: i.estimatedGrams })),
    totals,
    source: state.currentScan.source,
  };
  state.history.unshift(entry);
  if (state.history.length > MAX_HISTORY) state.history.pop();
  saveHistory();

  const btn = document.getElementById('addLogBtn');
  if (btn) {
    btn.textContent = '✅ Added to Daily Log!';
    btn.style.background = 'var(--accent-green)';
    btn.style.color = '#000';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = '+ Add to Daily Intake'; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 2500);
  }

  updateDailyBar();
  showToast(`+${Math.round(totals.cals)} kcal logged`);
}

function updateDailyBar() {
  const pct = Math.min((state.dailyIntake.cals / DAILY_GOAL) * 100, 100);
  const fill = document.getElementById('dailyCalBar');
  const text = document.getElementById('dailyCalText');
  const rem = document.getElementById('dailyCalRemaining');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `${Math.round(state.dailyIntake.cals)} kcal logged today`;
  if (rem) rem.textContent = `${Math.max(0, DAILY_GOAL - Math.round(state.dailyIntake.cals))} kcal remaining`;
}

/* ── HISTORY ─────────────────────────────────────────────────────────── */
function renderHistory() {
  const c = document.getElementById('historyList');
  if (!c) return;
  if (state.history.length === 0) {
    c.innerHTML = '<div class="history-empty"><div style="font-size:3rem;margin-bottom:1rem">📷</div><div style="color:var(--text-secondary)">No scans yet.<br>Scan your first meal!</div></div>';
    return;
  }
  c.innerHTML = state.history.map((e, i) => `
    <div class="history-card animate-item" style="animation-delay:${i * 0.05}s">
      <div class="history-card-header">
        <div class="history-foods">
          ${e.foods.map(f => `<span title="${f.name}">${f.emoji}</span>`).join('')}
          <span class="history-food-names">${e.foods.map(f => f.name).join(' + ')}</span>
        </div>
        <span class="history-time">${e.date} · ${e.time}</span>
      </div>
      <div class="history-macros">
        <div class="hist-macro"><span class="hist-macro-val">${Math.round(e.totals.cals)}</span><span class="hist-macro-label">kcal</span></div>
        <div class="hist-macro"><span class="hist-macro-val" style="color:var(--accent-blue)">${Math.round(e.totals.p)}g</span><span class="hist-macro-label">Protein</span></div>
        <div class="hist-macro"><span class="hist-macro-val" style="color:var(--accent-red)">${Math.round(e.totals.c)}g</span><span class="hist-macro-label">Carbs</span></div>
        <div class="hist-macro"><span class="hist-macro-val" style="color:var(--accent-yellow)">${Math.round(e.totals.f)}g</span><span class="hist-macro-label">Fat</span></div>
      </div>
    </div>
  `).join('');
}

/* ── VIEW SWITCHING ──────────────────────────────────────────────────── */
function switchToLoadingView(msg) {
  const overlay = document.getElementById('overlayUI');
  const btn = document.getElementById('captureBtn');
  const loading = document.getElementById('loadingState');
  if (overlay) overlay.style.display = 'none';
  if (btn) btn.style.display = 'none';
  if (loading) loading.style.display = 'flex';
  setLoadingText(msg || '');
}

function switchToResultView() {
  const loading = document.getElementById('loadingState');
  const sheet = document.getElementById('resultSheet');
  if (loading) loading.style.display = 'none';
  if (sheet) sheet.classList.add('active');
}

function setLoadingText(text) {
  const el = document.getElementById('loadingText');
  if (el) el.textContent = text;
}

function resetToCamera() {
  state.currentScan = null;
  state.scanning = false;
  const sheet = document.getElementById('resultSheet');
  const overlay = document.getElementById('overlayUI');
  const btn = document.getElementById('captureBtn');
  const loading = document.getElementById('loadingState');
  if (sheet) sheet.classList.remove('active');
  if (overlay) { overlay.style.display = 'flex'; overlay.classList.remove('scanning-active'); }
  if (btn) { btn.style.display = 'block'; btn.classList.remove('scanning'); btn.disabled = false; }
  if (loading) loading.style.display = 'none';
}
window.resetToCamera = resetToCamera;

/* ── TOAST ───────────────────────────────────────────────────────────── */
function showToast(msg) {
  let t = document.getElementById('fsToast');
  if (!t) {
    t = document.createElement('div'); t.id = 'fsToast';
    t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(0,255,128,0.15);border:1px solid var(--accent-green);color:var(--accent-green);padding:0.75rem 1.5rem;border-radius:999px;font-family:var(--font-heading);font-size:0.9rem;font-weight:600;backdrop-filter:blur(20px);z-index:9999;opacity:0;transition:all 0.3s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2800);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
