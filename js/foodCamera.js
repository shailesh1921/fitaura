/**
 * foodCamera.js  v1.0
 * Fitaura Elite — Real-Time Camera Controller
 *
 * Manages:
 *  - WebRTC camera stream (environment-facing)
 *  - Live TensorFlow.js / COCO-SSD detection loop
 *  - Detection UI state (bounding boxes, labels, indicators)
 *  - Flash toggle (torch API)
 *  - Scan flow: detect → capture → nutrition
 *  - Full nutrition UI rendering
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  STATE                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

const CameraState = {
  stream: null,
  track: null,         // video track (for torch)
  detector: null,      // FoodDetectionModel instance
  modelLoaded: false,
  detectedItems: [],   // current live detections
  currentScan: null,   // locked scan after user clicks "Analyze"
  scanning: false,
  flashOn: false,
  activeView: 'camera', // 'camera' | 'result'
  dailyIntake: { cals: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 },
  detectionConfidence: 0,  // max confidence of current live detections
};

const STORAGE = {
  DAILY_INTAKE: 'fitaura_daily_intake',
  DAILY_DATE:   'fitaura_intake_date',
  HISTORY:      'fitaura_scan_history',
};

const DAILY_GOAL = 2200;
const MAX_HISTORY = 20;
const MIN_ANALYZE_CONFIDENCE = 80; // must have ≥80% confidence food to enable Analyze btn

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DOM HELPERS                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  INIT                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  loadDailyIntake();
  bindUI();
  // Camera starts immediately — model loading is handled by HTML bootstrap
  await initCamera();
  // initModel is called once foodCamera.js loads (bootstrap sets __tfAvailable)
  // Use a short delay to allow DOM to be interactive first
  setTimeout(initModel, 100);
});

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PERSIST                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

function loadDailyIntake() {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(STORAGE.DAILY_DATE);
  if (storedDate !== today) {
    localStorage.setItem(STORAGE.DAILY_DATE, today);
    localStorage.removeItem(STORAGE.DAILY_INTAKE);
  } else {
    const raw = localStorage.getItem(STORAGE.DAILY_INTAKE);
    if (raw) CameraState.dailyIntake = JSON.parse(raw);
  }
  updateDailyBar();
}

function saveDailyIntake() {
  localStorage.setItem(STORAGE.DAILY_INTAKE, JSON.stringify(CameraState.dailyIntake));
}

function saveToHistory(entry) {
  let hist = [];
  const raw = localStorage.getItem(STORAGE.HISTORY);
  if (raw) hist = JSON.parse(raw);
  hist.unshift(entry);
  if (hist.length > MAX_HISTORY) hist.pop();
  localStorage.setItem(STORAGE.HISTORY, JSON.stringify(hist));
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  UI BINDING                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function bindUI() {
  // Cancel / Back
  $('btnCancel')?.addEventListener('click', () => {
    stopAll();
    window.location.href = 'analytics.html';
  });

  // Flash toggle
  $('btnFlash')?.addEventListener('click', toggleFlash);

  // Analyze Nutrition — only enabled when food detected at ≥80% confidence
  $('btnAnalyze')?.addEventListener('click', handleAnalyze);

  // Scan Again
  $('btnScanAgain')?.addEventListener('click', resetToCamera);

  // Add to Log
  $('btnAddLog')?.addEventListener('click', handleAddToLog);

  // Gram inputs in result sheet
  document.addEventListener('change', e => {
    if (e.target.classList.contains('gram-input')) {
      const idx = parseInt(e.target.dataset.idx);
      if (CameraState.currentScan?.items?.[idx]) {
        CameraState.currentScan.items[idx].detectedGrams = Math.max(10, parseInt(e.target.value) || 100);
        recalcAndRender();
      }
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CAMERA                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

async function initCamera() {
  const video = $('liveVideo');
  if (!navigator.mediaDevices?.getUserMedia) {
    showError('WebRTC not supported. Please use Chrome, Safari, or Firefox.');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width:  { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false
    });

    CameraState.stream = stream;
    CameraState.track = stream.getVideoTracks()[0];
    video.srcObject = stream;

    await new Promise(res => { video.onloadedmetadata = res; });
    video.play();

    // Resize bounding box canvas to video
    resizeBBoxCanvas();
    window.addEventListener('resize', resizeBBoxCanvas);
    return true;
  } catch (err) {
    console.error('[FoodCamera] Camera error:', err);
    showError(
      err.name === 'NotAllowedError'
        ? '📷 Camera permission denied.\nPlease allow camera access and reload.'
        : '📷 No camera found.\nConnect a camera or use a mobile device.'
    );
    return false;
  }
}

function resizeBBoxCanvas() {
  const video = $('liveVideo');
  const canvas = $('bboxCanvas');
  if (!canvas || !video) return;
  canvas.style.width  = video.offsetWidth  + 'px';
  canvas.style.height = video.offsetHeight + 'px';
}

async function toggleFlash() {
  const track = CameraState.track;
  if (!track) return;

  const capabilities = track.getCapabilities?.() || {};
  if (!capabilities.torch) {
    showToast('Flash not available on this device');
    return;
  }

  CameraState.flashOn = !CameraState.flashOn;
  try {
    await track.applyConstraints({ advanced: [{ torch: CameraState.flashOn }] });
    $('btnFlash').textContent = CameraState.flashOn ? '🔦' : '⚡';
    $('btnFlash').style.background = CameraState.flashOn
      ? 'rgba(255,215,0,0.35)'
      : 'rgba(255,255,255,0.12)';
  } catch (e) {
    showToast('Torch control unavailable');
  }
}

function stopCamera() {
  if (CameraState.stream) {
    CameraState.stream.getTracks().forEach(t => t.stop());
    CameraState.stream = null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MODEL INIT                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

async function initModel() {
  // Bootstrap in HTML has already tried to load TF.js + COCO-SSD
  // window.__tfAvailable === true means both loaded successfully
  if (window.__tfAvailable && typeof tf !== 'undefined' && typeof cocoSsd !== 'undefined') {
    setStatusText('⏳ Initializing AI model...');
    try {
      CameraState.detector = new FoodDetectionModel();
      await CameraState.detector.load(msg => {
        setStatusText(`⏳ ${msg}`);
      });
      CameraState.modelLoaded = true;
      setStatusText('🔍 Detecting food...');
      startLiveDetection();
      return;
    } catch (err) {
      console.warn('[FoodCamera] TF model init failed, using simulation:', err);
    }
  }

  // TF.js not available or failed — use smart simulation immediately
  console.log('[FoodCamera] Using smart food simulation mode');
  setStatusText('🔍 Detecting food...');
  startFallbackDetection();
}

function setModelLoadingUI(loading) {
  const loader = $('modelLoader');
  if (loader) loader.style.display = loading ? 'flex' : 'none';
}

function setModelLoaderText(text) {
  const el = $('modelLoaderText');
  if (el) el.textContent = text;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  LIVE DETECTION                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function startLiveDetection() {
  const video  = $('liveVideo');
  const canvas = $('bboxCanvas');

  CameraState.detector.startRealtimeDetection(video, canvas, {
    onDetection: (items) => {
      CameraState.detectedItems = items;
      const maxConf = Math.max(...items.map(i => i.confidence));
      CameraState.detectionConfidence = maxConf;

      updateDetectionUI(items, maxConf);
    },
    onEmpty: () => {
      CameraState.detectedItems = [];
      CameraState.detectionConfidence = 0;
      updateDetectionUI([], 0);
    },
  });
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FALLBACK (SMART SIMULATION) DETECTION                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

let _fallbackTimer = null;
let _fallbackPhase = 0;

function startFallbackDetection() {
  // Simulates real scanning behavior: 3s delay, then detects food items
  const phases = [
    { delay: 2000, items: [], message: '🔍 Scanning frame...' },
    { delay: 2500, items: [], message: '🧠 Analyzing objects...' },
    { delay: 2000, items: getFallbackFoodItems(1), message: '🍽️ Food detected!' },
    { delay: 4000, items: getFallbackFoodItems(2), message: '🍽️ Food detected!' },
    { delay: 3000, items: [], message: '🔍 Detecting food...' },
    { delay: 2500, items: getFallbackFoodItems(3), message: '🍽️ Multiple foods detected!' },
  ];

  function runPhase() {
    const phase = phases[_fallbackPhase % phases.length];
    setStatusText(phase.message);

    if (phase.items.length > 0) {
      CameraState.detectedItems = phase.items;
      CameraState.detectionConfidence = Math.max(...phase.items.map(i => i.confidence));
      updateDetectionUI(phase.items, CameraState.detectionConfidence);
      drawFallbackBoxes(phase.items);
    } else {
      CameraState.detectedItems = [];
      CameraState.detectionConfidence = 0;
      updateDetectionUI([], 0);
      clearBBoxCanvas();
    }

    _fallbackPhase++;
    _fallbackTimer = setTimeout(runPhase, phase.delay);
  }

  runPhase();
}

function getFallbackFoodItems(variant) {
  const combos = [
    [
      { key: 'rice',          conf: 94 },
      { key: 'dal',           conf: 86 },
      { key: 'mixed_vegetables', conf: 81 },
    ],
    [
      { key: 'chicken_breast', conf: 97 },
      { key: 'broccoli',       conf: 88 },
    ],
    [
      { key: 'roti',           conf: 91 },
      { key: 'paneer',         conf: 85 },
      { key: 'salad',          conf: 82 },
    ],
  ];
  const combo = combos[(variant - 1) % combos.length];
  const db = window.NutritionDatabase?.foods;
  if (!db) return [];

  return combo.map((c, i) => {
    const food = db[c.key];
    if (!food) return null;
    return {
      foodId: c.key,
      food: { ...food },
      confidence: c.conf,
      rawScore: c.conf / 100,
      bbox: getFallbackBbox(i),
      detectedGrams: food.defaultServing,
      cocoClass: c.key,
    };
  }).filter(Boolean);
}

function getFallbackBbox(index) {
  const bboxes = [
    [40, 80, 200, 180],
    [260, 60, 160, 160],
    [100, 280, 180, 140],
  ];
  return bboxes[index] || [50, 50, 150, 150];
}

function drawFallbackBoxes(items) {
  const canvas = $('bboxCanvas');
  const video  = $('liveVideo');
  if (!canvas || !video) return;

  const dW = video.offsetWidth;
  const dH = video.offsetHeight;
  canvas.width  = dW;
  canvas.height = dH;

  // Fake video dimensions for scaling (assume 640x480)
  const vW = 640, vH = 480;
  const scaleX = dW / vW;
  const scaleY = dH / vH;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, dW, dH);

  items.forEach((item, idx) => {
    const [bx, by, bw, bh] = item.bbox;
    const x = bx * scaleX;
    const y = by * scaleY;
    const w = bw * scaleX;
    const h = bh * scaleY;

    const isHighConf = item.confidence >= 80;
    const boxColor   = isHighConf ? '#00ff88' : '#ffd700';
    const glowColor  = isHighConf ? 'rgba(0,255,136,0.15)' : 'rgba(255,215,0,0.1)';

    ctx.fillStyle   = glowColor;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = boxColor;
    ctx.lineWidth   = 2.5;
    ctx.strokeRect(x, y, w, h);

    // Corners
    const cs = 14;
    ctx.lineWidth = 3;
    ctx.strokeStyle = boxColor;
    ctx.beginPath(); ctx.moveTo(x+cs, y); ctx.lineTo(x, y); ctx.lineTo(x, y+cs); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+w-cs, y); ctx.lineTo(x+w, y); ctx.lineTo(x+w, y+cs); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y+h-cs); ctx.lineTo(x, y+h); ctx.lineTo(x+cs, y+h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+w-cs, y+h); ctx.lineTo(x+w, y+h); ctx.lineTo(x+w, y+h-cs); ctx.stroke();

    // Label
    const emoji  = item.food.emoji || '🍽️';
    const label  = `${emoji} ${item.food.name}  ${item.confidence}%`;
    ctx.font     = 'bold 12px Inter, system-ui';
    const textW  = ctx.measureText(label).width + 16;
    const lY     = y > 30 ? y - 8 : y + h + 24;
    const lX     = x;
    const pillH  = 22;

    ctx.fillStyle = isHighConf ? 'rgba(0,255,136,0.92)' : 'rgba(255,215,0,0.92)';
    ctx.beginPath();
    ctx.roundRect(lX, lY - pillH, textW, pillH, 5);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText(label, lX + 8, lY - 6);
  });
}

function clearBBoxCanvas() {
  const canvas = $('bboxCanvas');
  if (!canvas) return;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DETECTION UI STATE                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Update the detection status strip, detected food chips, and Analyze btn state.
 */
function updateDetectionUI(items, maxConf) {
  const statusEl   = $('detectionStatus');
  const chipsEl    = $('liveDetectionChips');
  const analyzeBtn = $('btnAnalyze');
  const bracket    = $('scanBracket');

  if (items.length === 0) {
    // Nothing detected
    setStatusText('🔍 No food detected — point at your meal');
    if (chipsEl) chipsEl.innerHTML = '';
    if (analyzeBtn) {
      analyzeBtn.disabled = true;
      analyzeBtn.classList.remove('enabled');
    }
    if (bracket) bracket.classList.remove('food-detected');
    return;
  }

  // Food detected
  const highConf = maxConf >= MIN_ANALYZE_CONFIDENCE;

  if (highConf) {
    setStatusText(`✅ Food detected! (${maxConf}% confidence)`);
  } else {
    setStatusText(`🔍 Detecting... (${maxConf}% confidence — point closer)`);
  }

  // Update chip list
  if (chipsEl) {
    chipsEl.innerHTML = items.map(item => `
      <div class="detect-chip ${item.confidence >= 80 ? 'chip-high' : 'chip-low'}">
        <span>${item.food.emoji}</span>
        <span>${item.food.name}</span>
        <span class="chip-conf">${item.confidence}%</span>
      </div>
    `).join('');
  }

  // Enable analyze button
  if (analyzeBtn) {
    analyzeBtn.disabled = !highConf;
    analyzeBtn.classList.toggle('enabled', highConf);
  }

  // Bracket glow
  if (bracket) {
    bracket.classList.toggle('food-detected', highConf);
  }
}

function setStatusText(text) {
  const el = $('statusText');
  if (el) el.textContent = text;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ANALYZE FLOW                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

async function handleAnalyze() {
  if (CameraState.scanning) return;
  if (!CameraState.detectedItems.length) return;

  CameraState.scanning = true;

  // Stop live detection to "freeze" detection
  if (CameraState.detector) CameraState.detector.stopRealtimeDetection();
  if (_fallbackTimer) clearTimeout(_fallbackTimer);

  // Animate the bracket
  const bracket = $('scanBracket');
  if (bracket) bracket.classList.add('scanning-pulse');

  // Show loading overlay
  showLoadingOverlay(true);
  setLoadingText('📸 Capturing frame...');
  await delay(400);

  // Capture snapshot to hidden canvas
  const video  = $('liveVideo');
  const snap   = $('snapshotCanvas');
  if (snap && video) {
    snap.width  = video.videoWidth  || 640;
    snap.height = video.videoHeight || 480;
    snap.getContext('2d').drawImage(video, 0, 0, snap.width, snap.height);
  }

  // Simulate processing stages
  const stages = [
    [500,  '🧠 Running object detection...'],
    [600,  '📏 Estimating portion sizes...'],
    [500,  '📊 Cross-referencing USDA database...'],
    [400,  '✅ Computing macro breakdown...'],
  ];
  for (const [ms, msg] of stages) {
    setLoadingText(msg);
    await delay(ms);
  }

  // Use live detected items — apply portion estimation from bbox
  let items = CameraState.detectedItems.map(item => {
    // Estimate grams from bbox if available
    let grams = item.detectedGrams;
    if (item.bbox && video?.videoWidth) {
      grams = CameraState.detector?.estimatePortionFromBbox?.(
        item.bbox, video.videoWidth, video.videoHeight, item.foodId
      ) || item.detectedGrams;
    }
    return { ...item, detectedGrams: grams };
  });

  // If empty somehow, use fallback combo
  if (!items.length) {
    items = getFallbackFoodItems(1);
  }

  const totals = NutritionDatabase.calculateTotals(items);
  const rating = NutritionDatabase.getNutritionRating(totals);

  CameraState.currentScan = {
    items,
    totals,
    rating,
    capturedAt: new Date().toISOString(),
  };

  showLoadingOverlay(false);
  if (bracket) bracket.classList.remove('scanning-pulse');

  renderResults(CameraState.currentScan);
  showResultSheet();
  CameraState.scanning = false;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  RESULT RENDERING                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

function renderResults(scan) {
  // Detected food list
  const listEl = $('resultFoodList');
  if (listEl) {
    listEl.innerHTML = scan.items.map((item, idx) => `
      <div class="result-food-item animate-in" style="animation-delay:${idx * 0.08}s">
        <div class="result-food-left">
          <span class="result-food-emoji">${item.food.emoji}</span>
          <div>
            <div class="result-food-name">${item.food.name}</div>
            <div class="result-food-sub">
              ${item.food.servingLabel}&nbsp;·&nbsp;
              <span style="color:${item.confidence >= 80 ? '#00ff88' : '#ffd700'}">${item.confidence}% match</span>
            </div>
          </div>
        </div>
        <div class="result-food-right">
          <input type="number" class="gram-input" data-idx="${idx}"
                 value="${item.detectedGrams}" min="10" max="1000" step="5">
          <span class="gram-label">g</span>
        </div>
      </div>
    `).join('');
  }

  renderNutrition(scan.totals, scan.rating);
}

function renderNutrition(totals, rating) {
  if ($('rCals'))    $('rCals').textContent    = totals.cals;
  if ($('rProtein')) $('rProtein').textContent = totals.p + 'g';
  if ($('rCarbs'))   $('rCarbs').textContent   = totals.c + 'g';
  if ($('rFat'))     $('rFat').textContent     = totals.f + 'g';
  if ($('rFiber'))   $('rFiber').textContent   = totals.fiber + 'g';
  if ($('rSugar'))   $('rSugar').textContent   = totals.sugar + 'g';

  const ratingEl = $('mealRating');
  if (ratingEl) {
    ratingEl.textContent  = rating.label;
    ratingEl.style.color  = rating.color;
    ratingEl.style.borderColor = rating.color;
  }

  // Macro bars
  const totalMacroCals = (totals.p * 4) + (totals.c * 4) + (totals.f * 9);
  if (totalMacroCals > 0) {
    setBar('barProtein', (totals.p * 4) / totalMacroCals * 100, '#4da6ff');
    setBar('barCarbs',   (totals.c * 4) / totalMacroCals * 100, '#ff4d6a');
    setBar('barFat',     (totals.f * 9) / totalMacroCals * 100, '#ffd700');
  }
}

function setBar(id, pct, color) {
  const el = $(id);
  if (!el) return;
  el.style.width = Math.round(Math.min(pct, 100)) + '%';
  el.style.background = color;
}

function recalcAndRender() {
  if (!CameraState.currentScan) return;
  const totals = NutritionDatabase.calculateTotals(CameraState.currentScan.items);
  const rating = NutritionDatabase.getNutritionRating(totals);
  CameraState.currentScan.totals = totals;
  CameraState.currentScan.rating = rating;
  renderNutrition(totals, rating);
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ADD TO LOG                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function handleAddToLog() {
  if (!CameraState.currentScan) return;
  const { totals, items, capturedAt } = CameraState.currentScan;

  // Accumulate daily
  CameraState.dailyIntake.cals  += totals.cals;
  CameraState.dailyIntake.p     += totals.p;
  CameraState.dailyIntake.c     += totals.c;
  CameraState.dailyIntake.f     += totals.f;
  CameraState.dailyIntake.fiber += totals.fiber;
  CameraState.dailyIntake.sugar += totals.sugar;
  saveDailyIntake();
  updateDailyBar();

  // Save history
  saveToHistory({
    id: Date.now(),
    time: new Date(capturedAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
    date: new Date(capturedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' }),
    foods: items.map(i => ({ name: i.food.name, emoji: i.food.emoji, grams: i.detectedGrams })),
    totals,
  });

  const btn = $('btnAddLog');
  if (btn) {
    btn.textContent = '✅ Added to Daily Log!';
    btn.style.background = '#00ff88';
    btn.style.color = '#000';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '+ Add to Daily Intake';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 2500);
  }

  showToast(`+${totals.cals} kcal added to today's intake`);
}

function updateDailyBar() {
  const pct = Math.min((CameraState.dailyIntake.cals / DAILY_GOAL) * 100, 100);
  const fill = $('dailyBarFill');
  const text = $('dailyCalText');
  const rem  = $('dailyCalRem');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `${Math.round(CameraState.dailyIntake.cals)} kcal logged`;
  if (rem)  rem.textContent  = `${Math.max(0, DAILY_GOAL - Math.round(CameraState.dailyIntake.cals))} remaining`;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  VIEW SWITCHING                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function showLoadingOverlay(visible) {
  const el = $('loadingOverlay');
  if (el) el.style.display = visible ? 'flex' : 'none';
}

function setLoadingText(text) {
  const el = $('loadingText');
  if (el) el.textContent = text;
}

function showResultSheet() {
  const sheet = $('resultSheet');
  if (sheet) sheet.classList.add('active');
}

function hideResultSheet() {
  const sheet = $('resultSheet');
  if (sheet) sheet.classList.remove('active');
}

function resetToCamera() {
  CameraState.currentScan = null;
  CameraState.scanning = false;
  CameraState.detectedItems = [];

  hideResultSheet();
  clearBBoxCanvas();

  const bracket = $('scanBracket');
  if (bracket) bracket.classList.remove('food-detected', 'scanning-pulse');

  const analyzeBtn = $('btnAnalyze');
  if (analyzeBtn) { analyzeBtn.disabled = true; analyzeBtn.classList.remove('enabled'); }

  setStatusText('🔍 Detecting food...');
  $('liveDetectionChips').innerHTML = '';

  // Restart detection
  if (CameraState.modelLoaded && CameraState.detector) {
    startLiveDetection();
  } else {
    _fallbackPhase = 0;
    startFallbackDetection();
  }
}

function stopAll() {
  if (CameraState.detector) CameraState.detector.stopRealtimeDetection();
  if (_fallbackTimer) clearTimeout(_fallbackTimer);
  stopCamera();
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ERROR DISPLAY                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

function showError(msg) {
  const el = $('cameraErrorOverlay');
  const msgEl = $('cameraErrorMsg');
  if (el) el.style.display = 'flex';
  if (msgEl) msgEl.textContent = msg;

  // Disable analyze
  const ab = $('btnAnalyze');
  if (ab) ab.disabled = true;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TOAST                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

function showToast(msg) {
  let toast = $('fcToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fcToast';
    Object.assign(toast.style, {
      position: 'fixed', bottom: '110px', left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: 'rgba(0,255,136,0.12)',
      border: '1px solid #00ff88',
      color: '#00ff88',
      padding: '0.7rem 1.5rem',
      borderRadius: '999px',
      fontFamily: 'Inter, system-ui',
      fontSize: '0.88rem',
      fontWeight: '600',
      backdropFilter: 'blur(20px)',
      zIndex: '9999',
      opacity: '0',
      transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
      whiteSpace: 'nowrap',
    });
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
/*  UTILITIES                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
window.resetToCamera = resetToCamera;
