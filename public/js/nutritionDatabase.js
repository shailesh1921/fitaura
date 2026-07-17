/**
 * nutritionDatabase.js
 * Comprehensive Food Nutrition Database
 * Data sources aligned with: USDA FoodData Central, OpenFoodFacts,
 * Nutritionix API, and Indian Food Composition Tables (IFCT 2017)
 *
 * Format per 100g unless noted:
 * { id, name, category, aliases, cals, p, c, f, fiber, sugar, serving, servingLabel }
 */

const NutritionDatabase = {

  version: '2.0.0',
  lastUpdated: '2026-04',
  sources: ['USDA FoodData Central', 'OpenFoodFacts', 'Nutritionix', 'IFCT 2017'],

  // ─── DETECTION KEYWORDS ───────────────────────────────────────────────────
  // Used for CV keyword → food mapping
  detectionKeywords: {
    rice:       ['rice', 'chawal', 'biryani', 'pulao', 'fried rice', 'khichdi'],
    roti:       ['roti', 'chapati', 'phulka', 'wheat bread', 'flatbread', 'paratha'],
    dal:        ['dal', 'daal', 'lentil', 'lentils', 'mung', 'moong', 'toor', 'chana dal'],
    paneer:     ['paneer', 'cottage cheese', 'paneer tikka', 'palak paneer', 'shahi paneer'],
    chicken:    ['chicken', 'murgh', 'poultry', 'grilled chicken', 'chicken breast', 'tandoori chicken', 'tikka'],
    egg:        ['egg', 'anda', 'boiled egg', 'scrambled egg', 'omelette', 'sunny side'],
    banana:     ['banana', 'kela', 'plantain'],
    apple:      ['apple', 'green apple', 'red apple', 'seb'],
    oats:       ['oats', 'oatmeal', 'porridge', 'overnight oats', 'daliya'],
    milk:       ['milk', 'doodh', 'whole milk', 'skim milk', 'toned milk'],
    bread:      ['bread', 'toast', 'white bread', 'brown bread', 'multigrain'],
    vegetables: ['vegetables', 'salad', 'sabzi', 'mixed veg', 'greens', 'broccoli', 'spinach', 'palak', 'gobi', 'cauliflower', 'beans', 'peas', 'matar']
  },

  // ─── FOOD CATALOG ─────────────────────────────────────────────────────────
  foods: {

    // ── GRAINS & CARBS ──────────────────────────────────────────────────────
    rice: {
      id: 'rice', name: 'Steamed White Rice', category: 'grains',
      emoji: '🍚',
      per100g: { cals: 130, p: 2.7, c: 28.2, f: 0.3, fiber: 0.4, sugar: 0.1 },
      defaultServing: 200, servingLabel: '1 medium bowl (200g)',
      portionGuide: 'fist-sized mound = ~150g'
    },
    brown_rice: {
      id: 'brown_rice', name: 'Brown Rice', category: 'grains',
      emoji: '🍚',
      per100g: { cals: 123, p: 2.6, c: 25.6, f: 0.9, fiber: 1.8, sugar: 0.4 },
      defaultServing: 180, servingLabel: '1 bowl (180g)',
      portionGuide: 'fist-sized = ~150g'
    },
    roti: {
      id: 'roti', name: 'Whole Wheat Roti', category: 'grains',
      emoji: '🫓',
      per100g: { cals: 297, p: 9.7, c: 55.4, f: 3.7, fiber: 6.5, sugar: 1.5 },
      defaultServing: 35, servingLabel: '1 medium roti (35g)',
      portionGuide: '1 roti ≈ 35g | hand-sized'
    },
    paratha: {
      id: 'paratha', name: 'Plain Paratha', category: 'grains',
      emoji: '🫓',
      per100g: { cals: 326, p: 7.4, c: 49.2, f: 11.3, fiber: 4.2, sugar: 1.2 },
      defaultServing: 60, servingLabel: '1 paratha (60g)',
      portionGuide: '1 paratha ≈ 60g'
    },
    bread: {
      id: 'bread', name: 'Whole Wheat Bread', category: 'grains',
      emoji: '🍞',
      per100g: { cals: 247, p: 9.0, c: 46.1, f: 3.4, fiber: 6.0, sugar: 5.3 },
      defaultServing: 60, servingLabel: '2 slices (60g)',
      portionGuide: '1 slice ≈ 30g'
    },
    oats: {
      id: 'oats', name: 'Rolled Oats', category: 'grains',
      emoji: '🥣',
      per100g: { cals: 389, p: 16.9, c: 66.3, f: 6.9, fiber: 10.6, sugar: 0.99 },
      defaultServing: 80, servingLabel: 'Dry weight (80g ≈ 1 cup cooked)',
      portionGuide: '80g dry ≈ 1 serving'
    },
    khichdi: {
      id: 'khichdi', name: 'Khichdi (Rice + Dal)', category: 'grains',
      emoji: '🍛',
      per100g: { cals: 102, p: 4.1, c: 18.4, f: 1.5, fiber: 1.2, sugar: 0.5 },
      defaultServing: 250, servingLabel: '1 bowl (250g)',
      portionGuide: 'Standard bowl ≈ 250g'
    },

    // ── PROTEINS ─────────────────────────────────────────────────────────────
    chicken_breast: {
      id: 'chicken_breast', name: 'Grilled Chicken Breast', category: 'protein',
      emoji: '🍗',
      per100g: { cals: 165, p: 31.0, c: 0.0, f: 3.6, fiber: 0.0, sugar: 0.0 },
      defaultServing: 150, servingLabel: '1 palm-sized piece (150g)',
      portionGuide: 'palm of hand = ~100-130g'
    },
    chicken_thigh: {
      id: 'chicken_thigh', name: 'Chicken Thigh (Skinless)', category: 'protein',
      emoji: '🍗',
      per100g: { cals: 179, p: 24.0, c: 0.0, f: 9.0, fiber: 0.0, sugar: 0.0 },
      defaultServing: 120, servingLabel: '1 thigh (120g)',
      portionGuide: '1 thigh ≈ 100-140g'
    },
    tandoori_chicken: {
      id: 'tandoori_chicken', name: 'Tandoori Chicken', category: 'protein',
      emoji: '🍗',
      per100g: { cals: 152, p: 22.4, c: 3.8, f: 5.2, fiber: 0.4, sugar: 1.2 },
      defaultServing: 200, servingLabel: '2 pieces (200g)',
      portionGuide: '1 piece ≈ 100g'
    },
    paneer: {
      id: 'paneer', name: 'Paneer (Indian Cottage Cheese)', category: 'protein',
      emoji: '🧀',
      per100g: { cals: 265, p: 18.3, c: 3.4, f: 20.8, fiber: 0.0, sugar: 3.4 },
      defaultServing: 100, servingLabel: '1 serving (100g)',
      portionGuide: 'deck of cards = ~100g'
    },
    egg_whole: {
      id: 'egg_whole', name: 'Whole Egg (Boiled)', category: 'protein',
      emoji: '🥚',
      per100g: { cals: 155, p: 13.0, c: 1.1, f: 10.6, fiber: 0.0, sugar: 1.1 },
      defaultServing: 60, servingLabel: '1 large egg (60g)',
      portionGuide: '1 large egg ≈ 50-60g'
    },
    egg_white: {
      id: 'egg_white', name: 'Egg White (Cooked)', category: 'protein',
      emoji: '🥚',
      per100g: { cals: 52, p: 10.9, c: 0.7, f: 0.2, fiber: 0.0, sugar: 0.7 },
      defaultServing: 33, servingLabel: '1 egg white (33g)',
      portionGuide: '1 egg white ≈ 33g'
    },
    dal: {
      id: 'dal', name: 'Dal (Toor/Yellow Lentil, Cooked)', category: 'protein',
      emoji: '🍲',
      per100g: { cals: 116, p: 7.25, c: 20.1, f: 0.38, fiber: 4.0, sugar: 1.8 },
      defaultServing: 180, servingLabel: '1 katori (180g)',
      portionGuide: '1 katori ≈ 180g'
    },
    moong_dal: {
      id: 'moong_dal', name: 'Moong Dal (Cooked)', category: 'protein',
      emoji: '🍲',
      per100g: { cals: 105, p: 7.0, c: 19.1, f: 0.4, fiber: 5.1, sugar: 2.0 },
      defaultServing: 180, servingLabel: '1 bowl (180g)',
      portionGuide: '1 bowl ≈ 180g'
    },
    rajma: {
      id: 'rajma', name: 'Rajma (Red Kidney Beans, Cooked)', category: 'protein',
      emoji: '🫘',
      per100g: { cals: 127, p: 8.7, c: 22.8, f: 0.5, fiber: 6.4, sugar: 0.3 },
      defaultServing: 200, servingLabel: '1 bowl (200g)',
      portionGuide: '1 bowl ≈ 200g'
    },
    chole: {
      id: 'chole', name: 'Chole / Chana (Cooked)', category: 'protein',
      emoji: '🫘',
      per100g: { cals: 164, p: 8.9, c: 27.4, f: 2.6, fiber: 7.6, sugar: 4.8 },
      defaultServing: 200, servingLabel: '1 bowl (200g)',
      portionGuide: '1 bowl ≈ 200g'
    },

    // ── DAIRY ────────────────────────────────────────────────────────────────
    milk: {
      id: 'milk', name: 'Whole Milk (Toned)', category: 'dairy',
      emoji: '🥛',
      per100g: { cals: 61, p: 3.2, c: 4.8, f: 3.3, fiber: 0.0, sugar: 4.8 },
      defaultServing: 250, servingLabel: '1 glass (250ml)',
      portionGuide: '1 standard glass = 250ml'
    },
    curd: {
      id: 'curd', name: 'Curd / Dahi (Full Fat)', category: 'dairy',
      emoji: '🥛',
      per100g: { cals: 98, p: 11.0, c: 3.4, f: 4.3, fiber: 0.0, sugar: 3.4 },
      defaultServing: 150, servingLabel: '1 katori (150g)',
      portionGuide: '1 katori ≈ 150g'
    },
    greek_yogurt: {
      id: 'greek_yogurt', name: 'Greek Yogurt (Plain)', category: 'dairy',
      emoji: '🥛',
      per100g: { cals: 59, p: 10.0, c: 3.6, f: 0.4, fiber: 0.0, sugar: 3.6 },
      defaultServing: 200, servingLabel: '1 cup (200g)',
      portionGuide: '1 cup ≈ 200g'
    },

    // ── FRUITS ───────────────────────────────────────────────────────────────
    banana: {
      id: 'banana', name: 'Banana', category: 'fruits',
      emoji: '🍌',
      per100g: { cals: 89, p: 1.1, c: 22.8, f: 0.3, fiber: 2.6, sugar: 12.2 },
      defaultServing: 120, servingLabel: '1 medium banana (120g)',
      portionGuide: '1 medium ≈ 110-130g'
    },
    apple: {
      id: 'apple', name: 'Apple (Raw)', category: 'fruits',
      emoji: '🍎',
      per100g: { cals: 52, p: 0.3, c: 13.8, f: 0.2, fiber: 2.4, sugar: 10.4 },
      defaultServing: 150, servingLabel: '1 medium apple (150g)',
      portionGuide: '1 medium ≈ 150-180g'
    },
    mango: {
      id: 'mango', name: 'Mango (Alphonso)', category: 'fruits',
      emoji: '🥭',
      per100g: { cals: 60, p: 0.8, c: 15.0, f: 0.4, fiber: 1.6, sugar: 13.7 },
      defaultServing: 150, servingLabel: '1 cup sliced (150g)',
      portionGuide: '1 cup sliced ≈ 150g'
    },

    // ── VEGETABLES ───────────────────────────────────────────────────────────
    mixed_vegetables: {
      id: 'mixed_vegetables', name: 'Mixed Vegetables (Cooked)', category: 'vegetables',
      emoji: '🥗',
      per100g: { cals: 38, p: 2.1, c: 7.5, f: 0.3, fiber: 2.9, sugar: 3.5 },
      defaultServing: 150, servingLabel: '1 cup (150g)',
      portionGuide: '1 cup roughly chopped ≈ 150g'
    },
    spinach: {
      id: 'spinach', name: 'Spinach / Palak (Cooked)', category: 'vegetables',
      emoji: '🥬',
      per100g: { cals: 23, p: 2.97, c: 3.75, f: 0.26, fiber: 2.4, sugar: 0.42 },
      defaultServing: 100, servingLabel: '1 serving (100g)',
      portionGuide: '1 cup cooked ≈ 180g'
    },
    broccoli: {
      id: 'broccoli', name: 'Broccoli (Steamed)', category: 'vegetables',
      emoji: '🥦',
      per100g: { cals: 35, p: 2.4, c: 7.2, f: 0.4, fiber: 3.3, sugar: 1.7 },
      defaultServing: 150, servingLabel: '1 cup florets (150g)',
      portionGuide: '1 cup ≈ 150g'
    },
    salad: {
      id: 'salad', name: 'Garden Salad (Mixed Greens)', category: 'vegetables',
      emoji: '🥗',
      per100g: { cals: 18, p: 1.3, c: 3.1, f: 0.2, fiber: 2.1, sugar: 1.5 },
      defaultServing: 200, servingLabel: 'Large bowl (200g)',
      portionGuide: 'Large bowl ≈ 200g'
    },

    // ── SNACKS / OTHER ─────────────────────────────────────────────────────
    almonds: {
      id: 'almonds', name: 'Almonds (Raw)', category: 'snacks',
      emoji: '🌰',
      per100g: { cals: 579, p: 21.2, c: 21.6, f: 49.9, fiber: 12.5, sugar: 4.4 },
      defaultServing: 30, servingLabel: 'Small handful (30g ≈ 23 pieces)',
      portionGuide: '1 handful ≈ 28-30g'
    },
    peanut_butter: {
      id: 'peanut_butter', name: 'Peanut Butter (Natural)', category: 'snacks',
      emoji: '🥜',
      per100g: { cals: 598, p: 25.0, c: 20.1, f: 51.1, fiber: 5.0, sugar: 9.0 },
      defaultServing: 32, servingLabel: '2 tablespoons (32g)',
      portionGuide: '2 tbsp ≈ 30-32g'
    },
    whey_protein: {
      id: 'whey_protein', name: 'Whey Protein Isolate', category: 'supplements',
      emoji: '💊',
      per100g: { cals: 376, p: 80.0, c: 8.0, f: 4.0, fiber: 0.0, sugar: 4.0 },
      defaultServing: 30, servingLabel: '1 scoop (30g)',
      portionGuide: '1 scoop ≈ 25-35g'
    },

    // ── MEAL COMBOS (Multi-food plates) ──────────────────────────────────────
    dal_rice_combo: {
      id: 'dal_rice_combo', name: 'Dal Rice (Standard Thali)', category: 'combo',
      emoji: '🍛',
      per100g: { cals: 118, p: 4.5, c: 23.0, f: 0.8, fiber: 2.0, sugar: 0.8 },
      defaultServing: 400, servingLabel: '1 full thali (~400g)',
      portionGuide: 'Full plate ≈ 400g'
    },
    chicken_rice_combo: {
      id: 'chicken_rice_combo', name: 'Chicken & Rice Bowl', category: 'combo',
      emoji: '🍗',
      per100g: { cals: 152, p: 16.8, c: 16.4, f: 2.4, fiber: 0.4, sugar: 0.2 },
      defaultServing: 350, servingLabel: '1 meal bowl (~350g)',
      portionGuide: '1 bowl ≈ 350g'
    }
  },

  // ─── DETECTION ENGINE ─────────────────────────────────────────────────────
  /**
   * Simulates CV-based multi-food detection on a plate.
   * Returns 1-3 foods with realistic confidence scores.
   * In production: replace with TensorFlow.js / Google Vision API / Hugging Face
   */
  detectFoodsOnPlate(imageContext = 'random') {
    const allFoodIds = Object.keys(this.foods);

    // High-probability plate combos (simulates meal context)
    const commonCombos = [
      ['rice', 'dal', 'mixed_vegetables'],
      ['chicken_breast', 'rice', 'salad'],
      ['roti', 'paneer', 'dal'],
      ['oats', 'banana', 'milk'],
      ['egg_whole', 'bread', 'mixed_vegetables'],
      ['chicken_breast', 'broccoli'],
      ['rice', 'chicken_breast'],
      ['roti', 'chole'],
      ['paneer', 'roti', 'salad'],
      ['dal_rice_combo'],
      ['banana', 'milk', 'oats'],
      ['egg_whole', 'egg_white', 'spinach'],
      ['apple', 'greek_yogurt', 'almonds'],
      ['chicken_breast', 'salad'],
      ['brown_rice', 'chicken_breast', 'broccoli'],
      ['rajma', 'rice'],
      ['tandoori_chicken', 'roti', 'salad'],
    ];

    const selectedCombo = commonCombos[Math.floor(Math.random() * commonCombos.length)];

    return selectedCombo.map((foodId, idx) => {
      const food = this.foods[foodId];
      if (!food) return null;
      const confidence = Math.floor(
        Math.random() * (idx === 0 ? 7 : 12) + (idx === 0 ? 92 : 82)
      );
      return {
        foodId,
        food,
        confidence: Math.min(confidence, 99),
        detectedGrams: food.defaultServing
      };
    }).filter(Boolean);
  },

  /**
   * Calculates total nutrition for detected foods list
   * @param {Array} detectedItems - [{foodId, food, detectedGrams}]
   * @returns {Object} totals: {cals, p, c, f, fiber, sugar}
   */
  calculateTotals(detectedItems) {
    const totals = { cals: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0 };
    detectedItems.forEach(item => {
      const scale = item.detectedGrams / 100;
      totals.cals  += Math.round(item.food.per100g.cals  * scale);
      totals.p     += Math.round(item.food.per100g.p     * scale * 10) / 10;
      totals.c     += Math.round(item.food.per100g.c     * scale * 10) / 10;
      totals.f     += Math.round(item.food.per100g.f     * scale * 10) / 10;
      totals.fiber += Math.round(item.food.per100g.fiber * scale * 10) / 10;
      totals.sugar += Math.round(item.food.per100g.sugar * scale * 10) / 10;
    });
    // Round totals
    Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 10) / 10; });
    return totals;
  },

  /**
   * Get calorie quality rating
   */
  getNutritionRating(totals) {
    const proteinRatio = (totals.p * 4) / totals.cals;
    if (totals.cals < 200)  return { label: 'Light Snack',    color: '#00c3ff' };
    if (proteinRatio > 0.3) return { label: 'High Protein',   color: '#00ff80' };
    if (totals.fiber > 8)   return { label: 'High Fiber',     color: '#7000ff' };
    if (totals.cals > 800)  return { label: 'Heavy Meal',     color: '#ff3366' };
    return                         { label: 'Balanced Meal',  color: '#ffd700' };
  }
};

window.NutritionDatabase = NutritionDatabase;
