/**
 * foodCamera.js  v2.0 — REAL AI FOOD SCANNER (Live Camera)
 * FitAura — powered by Google Gemini Vision API
 *
 * Camera opens immediately → detects food in real-time → Analyze button
 * sends the live frame to Gemini for real nutrition data.
 */

'use strict';

const CS = {
  stream: null, track: null,
  detectedItems: [], currentScan: null,
  scanning: false, flashOn: false,
  autoScanInterval: null,
  dailyIntake: { cals: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 },
  detectionConfidence: 0,
};

const STORAGE = { DAILY_INTAKE: 'fitaura_daily_intake', DAILY_DATE: 'fitaura_intake_date', HISTORY: 'fitaura_scan_history' };
const DAILY_GOAL = 2200;
const MAX_HISTORY = 20;

const $ = id => document.getElementById(id);

/* ── INIT ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  loadDailyIntake();
  bindUI();
  await initCamera();
  // Auto-scan every 4 seconds when camera is active
  startAutoScan();
});

/* ── PERSIST ─────────────────────────────────────────────────────────── */
function loadDailyIntake() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(STORAGE.DAILY_DATE);
  if (stored !== today) { localStorage.setItem(STORAGE.DAILY_DATE, today); localStorage.removeItem(STORAGE.DAILY_INTAKE); }
  else { const r = localStorage.getItem(STORAGE.DAILY_INTAKE); if (r) CS.dailyIntake = JSON.parse(r); }
  updateDailyBar();
}
function saveDailyIntake() { localStorage.setItem(STORAGE.DAILY_INTAKE, JSON.stringify(CS.dailyIntake)); }
function saveToHistory(entry) {
  let h = []; const r = localStorage.getItem(STORAGE.HISTORY); if (r) h = JSON.parse(r);
  h.unshift(entry); if (h.length > MAX_HISTORY) h.pop();
  localStorage.setItem(STORAGE.HISTORY, JSON.stringify(h));
}

/* ── UI BIND ─────────────────────────────────────────────────────────── */
function bindUI() {
  $('btnCancel')?.addEventListener('click', stopAllAndGoBack);
  $('btnFlash')?.addEventListener('click', toggleFlash);
  $('btnAnalyze')?.addEventListener('click', handleAnalyze);
  $('btnScanAgain')?.addEventListener('click', resetToCamera);
  $('btnAddLog')?.addEventListener('click', handleAddToLog);

  document.addEventListener('change', e => {
    if (e.target.classList.contains('gram-input') && CS.currentScan) {
      const idx = parseInt(e.target.dataset.idx);
      const item = CS.currentScan.items[idx];
      if (item) {
        const ng = Math.max(10, parseInt(e.target.value) || 100);
        const ratio = ng / item.estimatedGrams;
        item.estimatedGrams = ng;
        Object.keys(item.nutrition).forEach(k => { item.nutrition[k] = Math.round(item.nutrition[k] * ratio * 10) / 10; });
        recalcAndRender();
      }
    }
  });
}

/* ── CAMERA ──────────────────────────────────────────────────────────── */
async function initCamera() {
  const video = $('liveVideo');
  if (!navigator.mediaDevices?.getUserMedia) { showError('WebRTC not supported.'); return false; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    });
    CS.stream = stream; CS.track = stream.getVideoTracks()[0];
    video.srcObject = stream;
    await new Promise(r => { video.onloadedmetadata = r; });
    video.play();
    resizeBBoxCanvas();
    window.addEventListener('resize', resizeBBoxCanvas);
    setStatusText('🔍 Camera ready — point at your food');
    return true;
  } catch (err) {
    showError(err.name === 'NotAllowedError' ? '📷 Camera permission denied.\nAllow access and reload.' : '📷 No camera found.');
    return false;
  }
}

function resizeBBoxCanvas() {
  const v = $('liveVideo'), c = $('bboxCanvas');
  if (c && v) { c.style.width = v.offsetWidth + 'px'; c.style.height = v.offsetHeight + 'px'; }
}

async function toggleFlash() {
  if (!CS.track) return;
  const caps = CS.track.getCapabilities?.() || {};
  if (!caps.torch) { showToast('Flash not available'); return; }
  CS.flashOn = !CS.flashOn;
  try {
    await CS.track.applyConstraints({ advanced: [{ torch: CS.flashOn }] });
    const btn = $('btnFlash');
    if (btn) { btn.textContent = CS.flashOn ? '🔦' : '⚡'; btn.style.background = CS.flashOn ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.12)'; }
  } catch (e) { showToast('Torch unavailable'); }
}

function stopCamera() { if (CS.stream) { CS.stream.getTracks().forEach(t => t.stop()); CS.stream = null; } }

/* ── AUTO-SCAN (periodic frame check) ───────────────────────────────── */
function startAutoScan() {
  stopAutoScan();
  CS.autoScanInterval = setInterval(autoScanFrame, 4000);
}

function stopAutoScan() {
  if (CS.autoScanInterval) { clearInterval(CS.autoScanInterval); CS.autoScanInterval = null; }
}

async function autoScanFrame() {
  if (CS.scanning || CS.currentScan) return;
  const video = $('liveVideo');
  if (!video || video.readyState < 2) return;

  setStatusText('🔍 Scanning...');
  const canvas = $('snapshotCanvas');
  canvas.width = Math.min(video.videoWidth, 640);
  canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

  try {
    const result = await callFoodScanAPI(base64, 'image/jpeg');
    if (result && result.foods && result.foods.length > 0) {
      CS.detectedItems = result.foods;
      CS.detectionConfidence = Math.max(...result.foods.map(f => f.confidence || 0));
      updateDetectionUI(result.foods);
      setStatusText(`✅ ${result.foods.length} food(s) detected! Tap Analyze`);
      enableAnalyze(true);
    } else {
      CS.detectedItems = [];
      CS.detectionConfidence = 0;
      updateDetectionUI([]);
      setStatusText('🔍 No food found — point at your meal');
      enableAnalyze(false);
    }
  } catch (err) {
    // Silent fail for auto-scan — don't spam errors
    console.warn('[FoodCamera] Auto-scan:', err.message);
    setStatusText('🔍 Scanning...');
    enableAnalyze(false);
  }
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
    throw new Error(err.error || err.hint || `Error ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

/* ── DETECTION UI ────────────────────────────────────────────────────── */
function updateDetectionUI(foods) {
  const chips = $('liveDetectionChips');
  if (chips) {
    if (foods.length === 0) {
      chips.innerHTML = '';
    } else {
      chips.innerHTML = foods.map(f => `
        <div class="detect-chip chip-high">
          <span>${f.emoji || '🍽️'}</span>
          <span>${f.name}</span>
          <span class="chip-conf">${f.confidence || 0}%</span>
        </div>
      `).join('');
    }
  }

  const bracket = $('scanBracket');
  if (bracket) bracket.classList.toggle('food-detected', foods.length > 0);
}

function enableAnalyze(enabled) {
  const btn = $('btnAnalyze');
  if (btn) { btn.disabled = !enabled; btn.classList.toggle('enabled', enabled); }
}

function setStatusText(text) { const el = $('statusText'); if (el) el.textContent = text; }

/* ── ANALYZE (full scan with high-res capture) ──────────────────────── */
async function handleAnalyze() {
  if (CS.scanning) return;
  CS.scanning = true;
  stopAutoScan();

  const video = $('liveVideo');
  const snap = $('snapshotCanvas');
  const bracket = $('scanBracket');

  if (bracket) bracket.classList.add('scanning-pulse');
  showLoadingOverlay(true);
  setLoadingText('📸 Capturing high-res frame...');
  await delay(300);

  // High-res capture
  snap.width = video.videoWidth || 1280;
  snap.height = video.videoHeight || 720;
  snap.getContext('2d').drawImage(video, 0, 0, snap.width, snap.height);
  const base64 = snap.toDataURL('image/jpeg', 0.85).split(',')[1];

  try {
    setLoadingText('🧠 Analyzing with Gemini AI...');
    const result = await callFoodScanAPI(base64, 'image/jpeg');

    if (!result || !result.foods || result.foods.length === 0) {
      setLoadingText('❌ No food detected — try again');
      await delay(1500);
      showLoadingOverlay(false);
      if (bracket) bracket.classList.remove('scanning-pulse');
      resetToCamera();
      return;
    }

    CS.currentScan = {
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

    renderResults(CS.currentScan);
    showLoadingOverlay(false);
    if (bracket) bracket.classList.remove('scanning-pulse');
    showResultSheet();

  } catch (err) {
    console.error('[FoodCamera] Analyze error:', err);
    setLoadingText(`❌ ${err.message || 'Scan failed'}`);
    await delay(2000);
    showLoadingOverlay(false);
    if (bracket) bracket.classList.remove('scanning-pulse');
    resetToCamera();
  }

  CS.scanning = false;
}

/* ── RENDER RESULTS ──────────────────────────────────────────────────── */
function renderResults(scan) {
  const list = $('resultFoodList');
  if (list) {
    list.innerHTML = scan.items.map((item, idx) => `
      <div class="result-food-item animate-in" style="animation-delay:${idx * 0.08}s">
        <div class="result-food-left">
          <span class="result-food-emoji">${item.food.emoji}</span>
          <div>
            <div class="result-food-name">${item.food.name}</div>
            <div class="result-food-sub">
              ${item.category ? `<span style="color:var(--blue);text-transform:capitalize;font-size:0.7rem">${item.category}</span> · ` : ''}
              <span style="color:${item.confidence >= 85 ? 'var(--green)' : 'var(--yellow)'}">${item.confidence}% AI match</span>
            </div>
          </div>
        </div>
        <div class="result-food-right">
          <input type="number" class="gram-input" data-idx="${idx}" value="${item.estimatedGrams}" min="10" max="2000" step="5">
          <span class="gram-label">g</span>
        </div>
      </div>
    `).join('');
  }

  if (scan.healthNote) { const n = document.getElementById('healthNote'); if (n) { n.textContent = '💡 ' + scan.healthNote; n.style.display = 'block'; } }
  renderNutrition(scan.totals, scan.mealType);
}

function renderNutrition(t, mealType) {
  $('rCals') && ($('rCals').textContent = Math.round(t.cals));
  $('rProtein') && ($('rProtein').textContent = Math.round(t.p) + 'g');
  $('rCarbs') && ($('rCarbs').textContent = Math.round(t.c) + 'g');
  $('rFat') && ($('rFat').textContent = Math.round(t.f) + 'g');
  $('rFiber') && ($('rFiber').textContent = Math.round(t.fiber) + 'g');
  $('rSugar') && ($('rSugar').textContent = Math.round(t.sugar) + 'g');

  const ratingEl = $('mealRating');
  if (ratingEl) {
    const labels = {
      'high-protein': ['High Protein 💪', '#00ff80'],
      'balanced': ['Balanced Meal ✅', '#ffd700'],
      'high-carb': ['High Carb ⚡', '#ff4d6a'],
      'light-snack': ['Light Snack 🍎', '#00c3ff'],
      'heavy-meal': ['Heavy Meal 🔥', '#ff3366'],
      'low-fat': ['Low Fat 💚', '#10b981'],
      'high-fiber': ['High Fiber 🌿', '#7000ff'],
    };
    const [label, color] = labels[mealType] || labels['balanced'];
    ratingEl.textContent = label;
    ratingEl.style.color = color;
    ratingEl.style.borderColor = color;
  }

  const mc = (t.p * 4) + (t.c * 4) + (t.f * 9);
  if (mc > 0) {
    setBar('barProtein', (t.p * 4) / mc * 100, '#4da6ff');
    setBar('barCarbs', (t.c * 4) / mc * 100, '#ff4d6a');
    setBar('barFat', (t.f * 9) / mc * 100, '#ffd700');
  }
}

function setBar(id, pct, color) {
  const el = $(id);
  if (el) { el.style.width = Math.min(pct, 100) + '%'; el.style.background = color; }
}

function recalcAndRender() {
  if (!CS.currentScan) return;
  const t = { cals: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 };
  CS.currentScan.items.forEach(i => {
    const n = i.nutrition;
    t.cals += n.calories || 0; t.p += n.protein || 0; t.c += n.carbs || 0;
    t.f += n.fat || 0; t.fiber += n.fiber || 0; t.sugar += n.sugar || 0;
  });
  Object.keys(t).forEach(k => { t[k] = Math.round(t[k] * 10) / 10; });
  CS.currentScan.totals = t;
  renderNutrition(t, CS.currentScan.mealType);
}

/* ── ADD TO LOG ──────────────────────────────────────────────────────── */
function handleAddToLog() {
  if (!CS.currentScan) return;
  const { totals, items } = CS.currentScan;
  CS.dailyIntake.cals += totals.cals; CS.dailyIntake.p += totals.p;
  CS.dailyIntake.c += totals.c; CS.dailyIntake.f += totals.f;
  CS.dailyIntake.fiber += totals.fiber; CS.dailyIntake.sugar += totals.sugar;
  saveDailyIntake(); updateDailyBar();

  saveToHistory({
    id: Date.now(),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    foods: items.map(i => ({ name: i.food.name, emoji: i.food.emoji, grams: i.estimatedGrams })),
    totals, source: CS.currentScan.source,
  });

  const btn = $('btnAddLog');
  if (btn) {
    btn.textContent = '✅ Added!'; btn.style.background = '#00ff88'; btn.style.color = '#000'; btn.disabled = true;
    setTimeout(() => { btn.textContent = '+ Add to Daily Intake'; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 2500);
  }
  showToast(`+${Math.round(totals.cals)} kcal added`);
}

function updateDailyBar() {
  const pct = Math.min((CS.dailyIntake.cals / DAILY_GOAL) * 100, 100);
  const fill = $('dailyBarFill'), text = $('dailyCalText'), rem = $('dailyCalRem');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `${Math.round(CS.dailyIntake.cals)} kcal logged`;
  if (rem) rem.textContent = `${Math.max(0, DAILY_GOAL - Math.round(CS.dailyIntake.cals))} remaining`;
}

/* ── VIEW SWITCHING ──────────────────────────────────────────────────── */
function showLoadingOverlay(v) { const el = $('loadingOverlay'); if (el) el.style.display = v ? 'flex' : 'none'; }
function setLoadingText(t) { const el = $('loadingText'); if (el) el.textContent = t; }
function showResultSheet() { const s = $('resultSheet'); if (s) s.classList.add('active'); }
function hideResultSheet() { const s = $('resultSheet'); if (s) s.classList.remove('active'); }

function resetToCamera() {
  CS.currentScan = null; CS.scanning = false; CS.detectedItems = [];
  hideResultSheet();
  const bracket = $('scanBracket');
  if (bracket) bracket.classList.remove('food-detected', 'scanning-pulse');
  enableAnalyze(false);
  setStatusText('🔍 Camera ready — point at your food');
  const chips = $('liveDetectionChips'); if (chips) chips.innerHTML = '';
  startAutoScan();
}

function stopAllAndGoBack() { stopAutoScan(); stopCamera(); window.location.href = 'analytics.html'; }
function stopAll() { stopAutoScan(); stopCamera(); }

function showError(msg) {
  const el = $('cameraErrorOverlay'), m = $('cameraErrorMsg');
  if (el) el.style.display = 'flex'; if (m) m.textContent = msg;
  enableAnalyze(false);
}

/* ── TOAST ───────────────────────────────────────────────────────────── */
function showToast(msg) {
  let t = $('fcToast');
  if (!t) {
    t = document.createElement('div'); t.id = 'fcToast';
    Object.assign(t.style, { position:'fixed', bottom:'110px', left:'50%', transform:'translateX(-50%) translateY(20px)', background:'rgba(0,255,136,0.12)', border:'1px solid #00ff88', color:'#00ff88', padding:'0.7rem 1.5rem', borderRadius:'999px', fontFamily:'Inter,system-ui', fontSize:'0.88rem', fontWeight:'600', backdropFilter:'blur(20px)', zIndex:'9999', opacity:'0', transition:'all 0.3s', whiteSpace:'nowrap' });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2800);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
window.resetToCamera = resetToCamera;
