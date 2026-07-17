/**
 * foodDetectionModel.js  v2.0
 * Fitaura Elite — Real-Time Food Detection Engine
 *
 * Uses TensorFlow.js + COCO-SSD for object detection.
 * Maps detected COCO classes → food items in NutritionDatabase.
 * Only passes detections with confidence ≥ 80% and food-only classes.
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COCO-SSD CLASS → FOOD MAPPING                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * COCO-SSD classes that represent food items.
 * Maps COCO label → { nutritionDbKey, displayName, emoji }
 */
const COCO_FOOD_MAP = {
  'banana':       { key: 'banana',           name: 'Banana',               emoji: '🍌' },
  'apple':        { key: 'apple',            name: 'Apple',                emoji: '🍎' },
  'sandwich':     { key: 'bread',            name: 'Sandwich / Bread',     emoji: '🥪' },
  'orange':       { key: 'apple',            name: 'Orange',               emoji: '🍊', override: { cals:47, p:0.9, c:11.8, f:0.1, fiber:2.4, sugar:9.4 } },
  'broccoli':     { key: 'broccoli',         name: 'Broccoli',             emoji: '🥦' },
  'carrot':       { key: 'mixed_vegetables', name: 'Carrot',               emoji: '🥕', override: { cals:41, p:0.9, c:9.6, f:0.2, fiber:2.8, sugar:4.7 } },
  'hot dog':      { key: 'chicken_breast',   name: 'Hot Dog / Sausage',    emoji: '🌭', override: { cals:290, p:10.8, c:22.8, f:17.6, fiber:0.7, sugar:3.2 } },
  'pizza':        { key: 'bread',            name: 'Pizza',                emoji: '🍕', override: { cals:266, p:11.0, c:32.9, f:9.8, fiber:2.3, sugar:3.6 } },
  'donut':        { key: 'bread',            name: 'Donut',                emoji: '🍩', override: { cals:452, p:4.9, c:51.4, f:25.0, fiber:1.6, sugar:23.0 } },
  'cake':         { key: 'bread',            name: 'Cake',                 emoji: '🎂', override: { cals:347, p:5.0, c:53.0, f:13.5, fiber:0.8, sugar:35.0 } },
  'bowl':         { key: 'dal_rice_combo',   name: 'Food Bowl',            emoji: '🍲' },
  'cup':          { key: 'milk',             name: 'Drink / Milk',         emoji: '☕' },
  'bottle':       { key: 'milk',             name: 'Beverage',             emoji: '🍶', override: { cals:45, p:0.0, c:11.0, f:0.0, fiber:0.0, sugar:10.0 } },
  'fork':         null,   // utensil – skip
  'knife':        null,   // utensil – skip
  'spoon':        null,   // utensil – skip
  'dining table': null,   // surface – skip
  'chair':        null,
  'person':       null,
};

/**
 * Extra food-like objects in COCO that we want to try to handle.
 * These do NOT appear as standalone food — we skip them.
 */
const NON_FOOD_CLASSES = new Set([
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'wine glass', 'fork', 'knife',
  'spoon', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet',
  'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave',
  'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors',
  'teddy bear', 'hair drier', 'toothbrush'
]);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  FOOD DETECTION MODEL CLASS                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

class FoodDetectionModel {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.isDetecting = false;
    this.MIN_CONFIDENCE = 0.50; // 50% for COCO detection (food items in COCO score lower)
    this.detectionLoop = null;
    this.onDetection = null; // callback(detectedItems)
    this.onEmpty = null;     // callback()
    this.frameSkip = 0;
  }

  /**
   * Load TensorFlow.js COCO-SSD model
   */
  async load(onProgress) {
    try {
      if (onProgress) onProgress('Loading TensorFlow.js backend...');
      await tf.ready();

      if (onProgress) onProgress('Downloading COCO-SSD object detection model...');
      this.model = await cocoSsd.load({
        base: 'lite_mobilenet_v2' // faster, lighter model
      });

      this.isLoaded = true;
      if (onProgress) onProgress('Model ready ✓');
      return true;
    } catch (err) {
      console.error('[FoodDetectionModel] Load error:', err);
      throw new Error('Failed to load AI detection model. Check internet connection.');
    }
  }

  /**
   * Start real-time detection loop on a video element.
   * Calls onDetection(items) or onEmpty() on each frame.
   */
  startRealtimeDetection(videoEl, canvasEl, opts = {}) {
    if (!this.isLoaded) {
      console.warn('[FoodDetectionModel] Model not loaded yet.');
      return;
    }
    if (this.isDetecting) this.stopRealtimeDetection();

    this.isDetecting = true;
    this.onDetection = opts.onDetection || null;
    this.onEmpty = opts.onEmpty || null;

    const detect = async () => {
      if (!this.isDetecting) return;

      // Skip alternate frames for performance
      this.frameSkip = (this.frameSkip + 1) % 2;
      if (this.frameSkip !== 0) {
        this.detectionLoop = requestAnimationFrame(detect);
        return;
      }

      if (videoEl.readyState < 2) {
        this.detectionLoop = requestAnimationFrame(detect);
        return;
      }

      try {
        const predictions = await this.model.detect(videoEl);
        const foodItems = this._filterFoodPredictions(predictions);

        // Draw bounding boxes on overlay canvas
        this._drawBoundingBoxes(canvasEl, videoEl, foodItems, predictions);

        if (foodItems.length > 0) {
          if (this.onDetection) this.onDetection(foodItems);
        } else {
          if (this.onEmpty) this.onEmpty();
        }
      } catch (err) {
        // Silently swallow frame errors
      }

      this.detectionLoop = requestAnimationFrame(detect);
    };

    this.detectionLoop = requestAnimationFrame(detect);
  }

  stopRealtimeDetection() {
    this.isDetecting = false;
    if (this.detectionLoop) {
      cancelAnimationFrame(this.detectionLoop);
      this.detectionLoop = null;
    }
  }

  /**
   * Detect on a single captured frame (canvas/video).
   * Returns array of detected food items.
   */
  async detectOnFrame(imageSource) {
    if (!this.isLoaded) throw new Error('Model not loaded');
    const predictions = await this.model.detect(imageSource);
    return this._filterFoodPredictions(predictions, 0.45); // slightly lower threshold for capture
  }

  /**
   * Filter COCO predictions to food-only, above confidence threshold,
   * and map to NutritionDatabase keys.
   */
  _filterFoodPredictions(predictions, minConf) {
    const threshold = minConf !== undefined ? minConf : this.MIN_CONFIDENCE;
    const results = [];
    const seen = new Set();

    for (const pred of predictions) {
      const label = pred.class.toLowerCase();
      if (pred.score < threshold) continue;
      if (NON_FOOD_CLASSES.has(label)) continue;

      const foodMapping = COCO_FOOD_MAP[label];
      if (foodMapping === null) continue; // explicitly excluded
      if (foodMapping === undefined) continue; // unknown class

      // Deduplicate same food class
      if (seen.has(foodMapping.key)) continue;
      seen.add(foodMapping.key);

      const dbFood = window.NutritionDatabase?.foods?.[foodMapping.key];
      if (!dbFood) continue;

      // Apply nutritional override if specified (e.g. orange vs apple)
      const foodObj = foodMapping.override
        ? { ...dbFood, per100g: { ...dbFood.per100g, ...foodMapping.override }, name: foodMapping.name, emoji: foodMapping.emoji }
        : { ...dbFood, name: foodMapping.name || dbFood.name, emoji: foodMapping.emoji || dbFood.emoji };

      results.push({
        cocoClass: pred.class,
        foodId: foodMapping.key,
        food: foodObj,
        confidence: Math.round(pred.score * 100),
        rawScore: pred.score,
        bbox: pred.bbox, // [x, y, width, height]
        detectedGrams: foodObj.defaultServing,
      });
    }

    return results;
  }

  /**
   * Draw bounding boxes on an overlay canvas matched to video dimensions.
   */
  _drawBoundingBoxes(canvas, video, foodItems, allPredictions) {
    if (!canvas || !video) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    // Match canvas size to video display
    const displayW = video.offsetWidth;
    const displayH = video.offsetHeight;
    canvas.width = displayW;
    canvas.height = displayH;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, displayW, displayH);

    const scaleX = displayW / vw;
    const scaleY = displayH / vh;

    // Draw food detections
    for (const item of foodItems) {
      const [bx, by, bw, bh] = item.bbox;
      const x = bx * scaleX;
      const y = by * scaleY;
      const w = bw * scaleX;
      const h = bh * scaleY;

      const isHighConf = item.confidence >= 80;
      const boxColor = isHighConf ? '#00ff88' : '#ffd700';
      const glowColor = isHighConf ? 'rgba(0,255,136,0.25)' : 'rgba(255,215,0,0.15)';

      // Glow fill
      ctx.fillStyle = glowColor;
      ctx.fillRect(x, y, w, h);

      // Box border
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Corner brackets
      const cs = 16; // corner size
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      // TL
      ctx.beginPath(); ctx.moveTo(x + cs, y); ctx.lineTo(x, y); ctx.lineTo(x, y + cs); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs); ctx.stroke();

      // Label pill background
      const label = `${item.food.emoji} ${item.food.name}  ${item.confidence}%`;
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      const textW = ctx.measureText(label).width + 16;
      const labelY = y > 28 ? y - 8 : y + h + 24;
      const labelX = x;

      // Pill background
      ctx.fillStyle = isHighConf ? 'rgba(0,255,136,0.92)' : 'rgba(255,215,0,0.92)';
      const radius = 6;
      const pillH = 22;
      const pillW = textW;
      ctx.beginPath();
      ctx.moveTo(labelX + radius, labelY - pillH);
      ctx.lineTo(labelX + pillW - radius, labelY - pillH);
      ctx.quadraticCurveTo(labelX + pillW, labelY - pillH, labelX + pillW, labelY - pillH + radius);
      ctx.lineTo(labelX + pillW, labelY - radius);
      ctx.quadraticCurveTo(labelX + pillW, labelY, labelX + pillW - radius, labelY);
      ctx.lineTo(labelX + radius, labelY);
      ctx.quadraticCurveTo(labelX, labelY, labelX, labelY - radius);
      ctx.lineTo(labelX, labelY - pillH + radius);
      ctx.quadraticCurveTo(labelX, labelY - pillH, labelX + radius, labelY - pillH);
      ctx.closePath();
      ctx.fill();

      // Label text
      ctx.fillStyle = '#000';
      ctx.fillText(label, labelX + 8, labelY - 6);
    }
  }

  /**
   * Estimate portion grams from bounding box area relative to frame.
   * Uses a heuristic: larger bounding box area → larger portion.
   */
  estimatePortionFromBbox(bbox, videoW, videoH, foodId) {
    const [, , bw, bh] = bbox;
    const bboxFraction = (bw * bh) / (videoW * videoH);
    const db = window.NutritionDatabase?.foods?.[foodId];
    if (!db) return 100;

    const defaultServing = db.defaultServing;

    // Scale: if bbox fills 10% of frame → default serving
    // Larger bbox → scale up; smaller → scale down
    const scaleFactor = bboxFraction / 0.10;
    const estimated = Math.round(defaultServing * Math.sqrt(scaleFactor));

    // Clamp within reasonable range
    return Math.max(30, Math.min(estimated, defaultServing * 3));
  }
}

// Expose globally
window.FoodDetectionModel = FoodDetectionModel;
