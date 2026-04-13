/**
 * foodScanner.js  v3.0
 * Fitaura Elite — AI-Powered Food Scanner Engine
 *
 * Architecture:
 *  - WebRTC camera capture (environment-facing preferred)
 *  - Canvas frame snapshot → mock CV pipeline (production: replace with
 *    Google Cloud Vision / TensorFlow.js / Hugging Face food-101 model)
 *  - Multi-food detection with per-item portion estimation
 *  - Full nutrition breakdown from NutritionDatabase
 *  - Scan history with localStorage persistence
 *  - Daily macro log accumulation
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CONSTANTS & STATE                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

const STORAGE_KEYS = {
  SCAN_HISTORY:  'fitaura_scan_history',
  DAILY_INTAKE:  'fitaura_daily_intake',
  DAILY_DATE:    'fitaura_intake_date',
};

const MAX_HISTORY_ITEMS = 20;

let state = {
  stream: null,
  currentScan: null,   // { items: [], totals: {} }
  history: [],
  dailyIntake: { cals: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 },
  scanning: false,
  activeView: 'camera', // 'camera' | 'result' | 'history'
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  INIT                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  loadPersistedData();
  bindUI();
  startCamera();
  renderHistory();
  updateDailyIntakeBar();
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PERSIST / LOAD                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function loadPersistedData() {
  // Daily intake — reset if new day
  const storedDate = localStorage.getItem(STORAGE_KEYS.DAILY_DATE);
  const today = new Date().toDateString();
  if (storedDate !== today) {
    localStorage.setItem(STORAGE_KEYS.DAILY_DATE, today);
    localStorage.removeItem(STORAGE_KEYS.DAILY_INTAKE);
  } else {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_INTAKE);
    if (raw) state.dailyIntake = JSON.parse(raw);
  }

  // Scan history
  const rawHist = localStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
  if (rawHist) state.history = JSON.parse(rawHist);
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(state.history));
}

function saveDailyIntake() {
  localStorage.setItem(STORAGE_KEYS.DAILY_INTAKE, JSON.stringify(state.dailyIntake));
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  UI BINDING                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function bindUI() {
  // Main capture button
  document.getElementById('captureBtn').addEventListener('click', handleCapture);

  // Add to meal log
  document.getElementById('addLogBtn').addEventListener('click', handleAddToLog);

  // Scan another
  document.getElementById('scanAgainBtn').addEventListener('click', resetToCamera);

  // Tab switcher (history tab)
  document.querySelectorAll('.fs-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.fs-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.fs-view').forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${target}`).classList.add('active');
      state.activeView = target;
      if (target === 'history') renderHistory();
    });
  });

  // Close / back to analytics
  document.getElementById('closeBtn').addEventListener('click', () => {
    stopCamera();
    window.location.href = 'analytics.html';
  });

  // Clear history
  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    state.history = [];
    saveHistory();
    renderHistory();
    showToast('Scan history cleared');
  });

  // Adjust serving gram inputs
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('gram-input')) {
      const idx = parseInt(e.target.dataset.idx);
      if (state.currentScan && state.currentScan.items[idx]) {
        const newGrams = Math.max(10, parseInt(e.target.value) || 100);
        state.currentScan.items[idx].detectedGrams = newGrams;
        recalcAndRender();
      }
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CAMERA                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

async function startCamera() {
  const video = document.getElementById('cameraView');
  const errBox = document.getElementById('cameraError');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraError('WebRTC not supported in this browser. Please use Chrome/Safari/Firefox.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    video.srcObject = stream;
    state.stream = stream;
    if (errBox) errBox.style.display = 'none';
  } catch (err) {
    console.warn('[FoodScanner] Camera error:', err.name, err.message);
    showCameraError(
      err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access and reload.'
        : 'No camera detected. Connect a camera or use a mobile device.'
    );
  }
}

function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
  }
}

function showCameraError(msg) {
  const errBox = document.getElementById('cameraError');
  const btn = document.getElementById('captureBtn');
  if (errBox) { errBox.textContent = msg; errBox.style.display = 'block'; }
  if (btn) btn.disabled = true;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CAPTURE & ANALYSIS PIPELINE                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

async function handleCapture() {
  if (state.scanning) return;
  state.scanning = true;

  const video   = document.getElementById('cameraView');
  const canvas  = document.getElementById('snapshotCanvas');
  const scanBtn = document.getElementById('captureBtn');
  const overlay = document.getElementById('overlayUI');

  // ── 1. Laser scan animation ──────────────────────────────────────────────
  overlay.classList.add('scanning-active');
  scanBtn.classList.add('scanning');
  scanBtn.disabled = true;
  await delay(1600);

  // ── 2. Capture snapshot ──────────────────────────────────────────────────
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

  // ── 3. Show loading state ────────────────────────────────────────────────
  switchToLoadingView();

  // ── 4. Simulate multi-stage CV pipeline ─────────────────────────────────
  await runCVPipeline();

  // ── 5. Run detection via NutritionDatabase ───────────────────────────────
  const detectedItems = NutritionDatabase.detectFoodsOnPlate();
  const totals = NutritionDatabase.calculateTotals(detectedItems);
  const rating = NutritionDatabase.getNutritionRating(totals);

  state.currentScan = {
    items: detectedItems,
    totals,
    rating,
    capturedAt: new Date().toISOString(),
    thumbnail: capturedDataUrl
  };

  // ── 6. Show results ──────────────────────────────────────────────────────
  renderResults(state.currentScan);
  switchToResultView();
  state.scanning = false;
}

async function runCVPipeline() {
  const steps = [
    [600,  '🔍 Initiating object detection model...'],
    [900,  '🧠 Running food segmentation (ResNet-50)...'],
    [700,  '📏 Estimating portion sizes from depth map...'],
    [500,  '🍽️  Identifying food items on plate...'],
    [600,  '📊 Cross-referencing USDA & OpenFoodFacts...'],
    [400,  '✅ Computing macro breakdown...'],
  ];
  for (const [ms, text] of steps) {
    setLoadingText(text);
    await delay(ms);
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  RESULT RENDERING                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function renderResults(scan) {
  // Detected foods list
  const foodListEl = document.getElementById('detectedFoodList');
  foodListEl.innerHTML = scan.items.map((item, idx) => `
    <div class="detected-item animate-item" style="animation-delay:${idx * 0.1}s">
      <div class="detected-item-info">
        <span class="detected-item-emoji">${item.food.emoji}</span>
        <div>
          <div class="detected-item-name">${item.food.name}</div>
          <div class="detected-item-sub">
            ${item.food.servingLabel}
            &nbsp;·&nbsp;
            <span class="conf-badge" style="color: ${item.confidence >= 92 ? 'var(--accent-green)' : 'var(--accent-yellow)'}">
              ${item.confidence}% confidence
            </span>
          </div>
        </div>
      </div>
      <div class="detected-item-control">
        <input type="number" class="gram-input" 
               data-idx="${idx}" 
               value="${item.detectedGrams}" 
               min="10" max="1000" step="5"
               title="Adjust grams">
        <span class="gram-label">g</span>
      </div>
    </div>
  `).join('');

  // Nutrition breakdown
  renderNutritionPanel(scan.totals, scan.rating);
}

function renderNutritionPanel(totals, rating) {
  document.getElementById('totalCals').textContent  = totals.cals;
  document.getElementById('totalP').textContent     = totals.p + 'g';
  document.getElementById('totalC').textContent     = totals.c + 'g';
  document.getElementById('totalF').textContent     = totals.f + 'g';
  document.getElementById('totalFiber').textContent = totals.fiber + 'g';
  document.getElementById('totalSugar').textContent = totals.sugar + 'g';

  const ratingEl = document.getElementById('mealRating');
  if (ratingEl) {
    ratingEl.textContent = rating.label;
    ratingEl.style.color = rating.color;
    ratingEl.style.borderColor = rating.color;
  }

  // Macro ring percentages
  const totalMacroCals = (totals.p * 4) + (totals.c * 4) + (totals.f * 9);
  if (totalMacroCals > 0) {
    setMacroBar('barProtein', (totals.p * 4) / totalMacroCals * 100, 'var(--accent-blue)');
    setMacroBar('barCarbs',   (totals.c * 4) / totalMacroCals * 100, 'var(--accent-red)');
    setMacroBar('barFat',     (totals.f * 9) / totalMacroCals * 100, 'var(--accent-yellow)');
  }
}

function setMacroBar(id, pct, color) {
  const el = document.getElementById(id);
  if (el) {
    el.style.width = Math.round(pct) + '%';
    el.style.background = color;
  }
}

function recalcAndRender() {
  if (!state.currentScan) return;
  const totals = NutritionDatabase.calculateTotals(state.currentScan.items);
  const rating = NutritionDatabase.getNutritionRating(totals);
  state.currentScan.totals = totals;
  state.currentScan.rating = rating;
  renderNutritionPanel(totals, rating);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ADD TO MEAL LOG                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function handleAddToLog() {
  if (!state.currentScan) return;

  const { totals, items, capturedAt } = state.currentScan;

  // Accumulate daily intake
  state.dailyIntake.cals  = (state.dailyIntake.cals  || 0) + totals.cals;
  state.dailyIntake.p     = (state.dailyIntake.p     || 0) + totals.p;
  state.dailyIntake.c     = (state.dailyIntake.c     || 0) + totals.c;
  state.dailyIntake.f     = (state.dailyIntake.f     || 0) + totals.f;
  state.dailyIntake.fiber = (state.dailyIntake.fiber || 0) + totals.fiber;
  state.dailyIntake.sugar = (state.dailyIntake.sugar || 0) + totals.sugar;
  saveDailyIntake();

  // Save to history
  const historyEntry = {
    id: Date.now(),
    time: new Date(capturedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    date: new Date(capturedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    foods: items.map(i => ({ name: i.food.name, emoji: i.food.emoji, grams: i.detectedGrams })),
    totals,
  };
  state.history.unshift(historyEntry);
  if (state.history.length > MAX_HISTORY_ITEMS) state.history.pop();
  saveHistory();

  // UI feedback
  const btn = document.getElementById('addLogBtn');
  btn.textContent = '✅ Added to Daily Log!';
  btn.style.background = 'var(--accent-green)';
  btn.style.color = '#000';
  btn.disabled = true;

  updateDailyIntakeBar();
  showToast(`+${totals.cals} kcal logged to today's intake`);

  setTimeout(() => {
    btn.textContent = 'Add to Daily Intake';
    btn.style.background = '';
    btn.style.color = '';
    btn.disabled = false;
  }, 2500);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DAILY INTAKE HUD                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function updateDailyIntakeBar() {
  const TARGET_CALS = 2200; // default target; ideally pull from NutritionEngine
  const pct = Math.min((state.dailyIntake.cals / TARGET_CALS) * 100, 100);

  const el = document.getElementById('dailyCalBar');
  const elText = document.getElementById('dailyCalText');
  const elRemaining = document.getElementById('dailyCalRemaining');

  if (el)          el.style.width = pct + '%';
  if (elText)      elText.textContent = `${Math.round(state.dailyIntake.cals || 0)} kcal logged today`;
  if (elRemaining) elRemaining.textContent = `${Math.max(0, TARGET_CALS - Math.round(state.dailyIntake.cals || 0))} kcal remaining`;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HISTORY                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

function renderHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;

  if (state.history.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <div style="font-size:3rem;margin-bottom:1rem">📷</div>
        <div style="color:var(--text-secondary)">No scans yet.<br>Start by scanning your meal.</div>
      </div>`;
    return;
  }

  container.innerHTML = state.history.map((entry, idx) => `
    <div class="history-card animate-item" style="animation-delay:${idx * 0.05}s">
      <div class="history-card-header">
        <div class="history-foods">
          ${entry.foods.map(f => `<span title="${f.name} (${f.grams}g)">${f.emoji}</span>`).join('')}
          <span class="history-food-names">${entry.foods.map(f => f.name).join(' + ')}</span>
        </div>
        <span class="history-time">${entry.date} · ${entry.time}</span>
      </div>
      <div class="history-macros">
        <div class="hist-macro"><span class="hist-macro-val">${entry.totals.cals}</span><span class="hist-macro-label">kcal</span></div>
        <div class="hist-macro"><span class="hist-macro-val" style="color:var(--accent-blue)">${entry.totals.p}g</span><span class="hist-macro-label">Protein</span></div>
        <div class="hist-macro"><span class="hist-macro-val" style="color:var(--accent-red)">${entry.totals.c}g</span><span class="hist-macro-label">Carbs</span></div>
        <div class="hist-macro"><span class="hist-macro-val" style="color:var(--accent-yellow)">${entry.totals.f}g</span><span class="hist-macro-label">Fat</span></div>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  VIEW SWITCHING                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

function switchToLoadingView() {
  document.getElementById('overlayUI').style.display = 'none';
  document.getElementById('captureBtn').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
}

function switchToResultView() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('resultSheet').classList.add('active');
}

function setLoadingText(text) {
  const el = document.getElementById('loadingText');
  if (el) el.textContent = text;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  RESET                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

function resetToCamera() {
  state.currentScan = null;
  state.scanning = false;

  document.getElementById('resultSheet').classList.remove('active');
  document.getElementById('overlayUI').style.display = 'flex';
  document.getElementById('overlayUI').classList.remove('scanning-active');
  document.getElementById('captureBtn').style.display = 'block';
  document.getElementById('captureBtn').classList.remove('scanning');
  document.getElementById('captureBtn').disabled = false;
  document.getElementById('loadingState').style.display = 'none';
  setLoadingText('🔍 Initiating object detection model...');
}

// Expose for inline onclick
window.resetToCamera = resetToCamera;

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TOAST NOTIFICATION                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

function showToast(msg) {
  let toast = document.getElementById('fsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fsToast';
    toast.style.cssText = `
      position:fixed; bottom:100px; left:50%; transform:translateX(-50%) translateY(20px);
      background:rgba(0,255,128,0.15); border:1px solid var(--accent-green);
      color:var(--accent-green); padding:0.75rem 1.5rem; border-radius:var(--radius-pill);
      font-family:var(--font-heading); font-size:0.9rem; font-weight:600;
      backdrop-filter:blur(20px); z-index:9999; opacity:0;
      transition:all 0.3s cubic-bezier(0.2,0.8,0.2,1);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2800);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  UTILITIES                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
