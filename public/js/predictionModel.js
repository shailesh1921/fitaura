/**
 * predictionModel.js  v1.0
 * Fitaura Elite — Adaptive Athlete Prediction Engine
 *
 * Science references:
 *  - Banister Impulse-Response model (performance = fitness - fatigue)
 *  - Epley 1RM formula
 *  - ACWR (Acute:Chronic Workload Ratio) for injury/overtraining risk
 *  - Hall et al. energy balance model for weight prediction
 *  - Rate of Perceived Exertion (RPE) for fatigue tracking
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CONSTANTS                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

const PM = {

  /* ── 1RM Estimation (Epley formula) ──────────────────────────────────────
   * 1RM = weight × (1 + reps / 30)
   */
  estimate1RM(weight, reps) {
    if (!weight || !reps) return 0;
    return Math.round(weight * (1 + reps / 30));
  },

  /* ── Weekly Strength Progression Rate ────────────────────────────────────
   * Based on experience level:
   *   Beginner:     +2.5–5% per week (fast linear progression)
   *   Intermediate: +0.5–1.5% per week
   *   Advanced:     +0.1–0.5% per week
   */
  weeklyProgressionRate(experience, fatigueScore) {
    const base = {
      beginner:     0.035,  // 3.5%
      intermediate: 0.010,  // 1.0%
      advanced:     0.004,  // 0.4%
    }[experience] || 0.010;

    // Fatigue penalty: high fatigue cuts progression
    const fatiguePenalty = Math.max(0, (100 - fatigueScore) / 100) * 0.6;
    return base * (1 - fatiguePenalty);
  },

  /* ── Predicted Strength Next Week ────────────────────────────────────────
   * Returns { predicted1RM, delta, percentGain }
   */
  predictStrength(current1RM, experience, readinessScore, weeksSincePlateau = 0) {
    const rate = this.weeklyProgressionRate(experience, readinessScore);

    // Plateau penalty after 4+ stagnant weeks
    const plateauPenalty = weeksSincePlateau > 4 ? 0.3 : 0;
    const effectiveRate  = rate * (1 - plateauPenalty);
    const delta          = Math.round(current1RM * effectiveRate * 10) / 10;
    const predicted1RM   = Math.round((current1RM + delta) * 10) / 10;

    return {
      predicted1RM,
      delta: Math.max(delta, 0),
      percentGain: Math.round(effectiveRate * 100 * 10) / 10,
      plateau: weeksSincePlateau > 4,
    };
  },

  /* ── PR Prediction ───────────────────────────────────────────────────────
   * Estimates days until next PR based on readiness, progression rate, and
   * gap between current and last PR.
   */
  predictPR(current1RM, lastPR, experience, readinessScore) {
    if (!lastPR || lastPR <= current1RM) {
      // Already at or above last PR — PR expected within days
      const rate = this.weeklyProgressionRate(experience, readinessScore);
      const daysToNextBump = Math.round(2.5 / (rate * 100)); // days per kg
      return { daysUntilPR: Math.max(1, daysToNextBump), description: 'Current PR territory' };
    }
    const gap  = lastPR - current1RM;
    const rate = this.weeklyProgressionRate(experience, readinessScore);
    const daysPerKg     = 7 / (current1RM * rate);
    const daysUntilPR   = Math.round(gap * daysPerKg);
    return { daysUntilPR: Math.min(daysUntilPR, 90), description: `${gap.toFixed(1)}kg gap to last PR` };
  },

  /* ── ACWR — Acute:Chronic Workload Ratio ─────────────────────────────────
   * ACWR = acute load (last 7 days) / chronic load (last 28 days avg)
   * Safe zone: 0.8–1.3   |   High risk: >1.5   |   Undertraining: <0.8
   */
  computeACWR(weeklyLoads) {
    // weeklyLoads: array of last 4 weeks' total session loads (volume × RPE)
    if (!weeklyLoads || weeklyLoads.length < 2) return 1.0;
    const acute   = weeklyLoads[weeklyLoads.length - 1] || 0;
    const chronic = weeklyLoads.reduce((s, v) => s + v, 0) / weeklyLoads.length;
    if (!chronic) return 1.0;
    return Math.round((acute / chronic) * 100) / 100;
  },

  /* ── Fatigue Risk Classification ─────────────────────────────────────────
   * Returns { level: 'Low'|'Medium'|'High'|'Critical', color, advice, acwr }
   */
  classifyFatigue(acwr, recentRPEAvg, sleepHours, stressLevel) {
    let score = 0;

    // ACWR contribution
    if (acwr > 1.5)      score += 40;
    else if (acwr > 1.3) score += 20;
    else if (acwr < 0.8) score += 5; // undertraining is mild concern

    // RPE contribution
    if (recentRPEAvg >= 9)      score += 30;
    else if (recentRPEAvg >= 8) score += 15;

    // Sleep debt
    if (sleepHours < 6)         score += 25;
    else if (sleepHours < 7)    score += 10;

    // Stress
    if (stressLevel >= 8)       score += 20;
    else if (stressLevel >= 6)  score += 10;

    score = Math.min(score, 100);

    if (score >= 70)  return { level: 'Critical', color: '#ff3366', score, advice: 'Full rest required. CNS overloaded. No training today.' };
    if (score >= 45)  return { level: 'High',     color: '#ff6b35', score, advice: 'Reduce volume 30%. Low intensity only. Prioritize sleep.' };
    if (score >= 25)  return { level: 'Medium',   color: '#ffd700', score, advice: 'Train intelligently. Avoid failure sets. Buffer 2RIR.' };
    return               { level: 'Low',      color: '#00ff80', score, advice: 'Optimal state. Push hard. PR opportunity.' };
  },

  /* ── Recovery Hours Required ─────────────────────────────────────────────
   * Based on workout intensity, volume, and athlete level.
   */
  estimateRecoveryHours(lastRPE, setsCompleted, experience, sleepHours) {
    const baseHours = {
      beginner:     56,   // needs more recovery
      intermediate: 48,
      advanced:     36,
    }[experience] || 48;

    // RPE intensity multiplier
    const intensityMult = 1 + (Math.max(0, lastRPE - 7) * 0.12);

    // Volume multiplier (sets above 15 = more recovery)
    const volumeMult = 1 + (Math.max(0, setsCompleted - 15) * 0.02);

    // Sleep bonus (good sleep reduces recovery time)
    const sleepBonus = sleepHours >= 8 ? 0.85 : (sleepHours >= 7 ? 0.95 : 1.15);

    const hours = Math.round(baseHours * intensityMult * volumeMult * sleepBonus);
    return Math.max(24, Math.min(hours, 96)); // clamp 24–96h
  },

  /* ── Weight Change Prediction ────────────────────────────────────────────
   * Uses Hall energy balance: Δweight ≈ energy deficit/surplus / 7700 kcal/kg
   * Returns predictions for 1 week and 4 weeks.
   */
  predictWeightChange(currentWeight, dailyCalories, tdee, goal) {
    const dailyBalance = dailyCalories - tdee;
    const weeklyBalanceKcal = dailyBalance * 7;
    const weeklyKg  = Math.round((weeklyBalanceKcal / 7700) * 100) / 100;
    const monthlyKg = Math.round(weeklyKg * 4.3 * 10) / 10;

    let trajectory = 'Maintenance';
    let color       = '#00c3ff';
    if (dailyBalance < -200)      { trajectory = 'Fat Loss';   color = '#00ff80'; }
    else if (dailyBalance > 200)  { trajectory = 'Mass Gain';  color = '#ffd700'; }

    // Goal alignment check
    let aligned = true;
    if (goal === 'fat_loss'  && dailyBalance > 0)  aligned = false;
    if (goal === 'mass_gain' && dailyBalance < 0)  aligned = false;

    return {
      weeklyChange:  weeklyKg,
      monthlyChange: monthlyKg,
      projectedWeight1w: Math.round((currentWeight + weeklyKg) * 10) / 10,
      projectedWeight4w: Math.round((currentWeight + monthlyKg) * 10) / 10,
      trajectory,
      color,
      aligned,
      dailyBalance,
    };
  },

  /* ── Adaptive Intelligence Rules Engine ──────────────────────────────────
   * Returns array of { priority, category, recommendation, action }
   */
  getAdaptiveRecommendations(twinData) {
    const recs = [];
    const {
      fatigueRisk, readinessScore, acwr, weeksSincePlateau,
      weightDeviation, goal, sleepHours, stressLevel, nutritionStatus
    } = twinData;

    // ── Rule 1: High fatigue → reduce volume
    if (fatigueRisk === 'Critical' || fatigueRisk === 'High') {
      recs.push({
        priority: 1,
        category: 'Recovery',
        icon: '🛑',
        color: '#ff3366',
        title: 'Reduce Training Volume',
        body: 'Fatigue markers are elevated. Cut sets by 30% and prioritize Zone 2 cardio (30 min walk). CNS recovery is non-negotiable.',
        action: 'Activate Deload Protocol',
      });
    }

    // ── Rule 2: Strong readiness → increase load
    if (readinessScore >= 85 && fatigueRisk === 'Low') {
      recs.push({
        priority: 1,
        category: 'Performance',
        icon: '⚡',
        color: '#00ff80',
        title: 'Optimal Load Day — Push Hard',
        body: 'All systems green. Today is ideal for a PR attempt or max effort set. Increase your working weight by 2.5–5kg on primary compound lifts.',
        action: 'Log Workout',
      });
    }

    // ── Rule 3: Plateau detected → change stimulus
    if (weeksSincePlateau > 4) {
      recs.push({
        priority: 2,
        category: 'Programming',
        icon: '🔄',
        color: '#7000ff',
        title: 'Training Plateau — Change Stimulus',
        body: 'Strength has stalled for 4+ weeks. Switch primary movement pattern (e.g., Squat → Front Squat, Bench → Incline) or change rep range from 8–12 to 4–6 for 3 weeks.',
        action: 'Phase Shift Workout',
      });
    }

    // ── Rule 4: Weight not changing → adjust calories
    if (Math.abs(weightDeviation || 0) < 0.2 && goal !== 'maintenance') {
      recs.push({
        priority: 2,
        category: 'Nutrition',
        icon: '🍽️',
        color: '#ffd700',
        title: `Adjust Calories for ${goal === 'fat_loss' ? 'Fat Loss' : 'Muscle Gain'}`,
        body: goal === 'fat_loss'
          ? 'Scale not moving. Reduce intake by 150–200 kcal/day or add 20 min LISS cardio. Maintain protein at ≥2g/kg.'
          : 'Scale not moving. Add 150–200 kcal/day from carbs (oats, rice). Keep protein stable. Re-assess in 2 weeks.',
        action: 'Adjust Nutrition Plan',
      });
    }

    // ── Rule 5: Poor sleep → recovery priority
    if (sleepHours < 7) {
      recs.push({
        priority: 2,
        category: 'Recovery',
        icon: '😴',
        color: '#00c3ff',
        title: 'Prioritize Sleep for Adaptation',
        body: `Current: ${sleepHours}h/night. Below the 7–9h minimum for muscle protein synthesis. Training adaptation is compromised. Aim for bed 1h earlier tonight.`,
        action: 'Set Sleep Reminder',
      });
    }

    // ── Rule 6: High stress → cortisol management
    if (stressLevel >= 7) {
      recs.push({
        priority: 3,
        category: 'Lifestyle',
        icon: '🧘',
        color: '#ffd700',
        title: 'High Stress Detected — Manage Cortisol',
        body: 'Chronic stress elevates cortisol, impairing muscle synthesis and fat burning. Consider 10 min breathwork, reduce caffeine after noon, and train before fatigue peaks.',
        action: 'Stress Protocol',
      });
    }

    // ── Rule 7: ACWR too low → increase load gradually
    if (acwr < 0.8) {
      recs.push({
        priority: 3,
        category: 'Programming',
        icon: '📈',
        color: '#00c3ff',
        title: 'Increase Training Stimulus',
        body: 'Workload ratio is low — you are under-stimulating adaptation. Add 1 set per compound movement this week or introduce an extra training session.',
        action: 'Adjust Weekly Plan',
      });
    }

    // Sort by priority and return top 4
    return recs.sort((a, b) => a.priority - b.priority).slice(0, 4);
  },

  /* ── Readiness Score (composite) ─────────────────────────────────────────
   * Combines sleep, stress, fatigue, nutrition, and HRV-simulated variance.
   */
  computeReadiness(sleepHours, stressLevel, fatiguePct, nutritionAdherence = 80) {
    let score = 100;

    // Sleep (0–30 pts)
    if (sleepHours >= 8)      score -= 0;
    else if (sleepHours >= 7) score -= 8;
    else if (sleepHours >= 6) score -= 18;
    else                      score -= 30;

    // Stress (0–20 pts)
    score -= Math.round((stressLevel / 10) * 20);

    // Fatigue from ACWR (0–30 pts)
    score -= Math.round((fatiguePct / 100) * 30);

    // Nutrition adherence (0–15 pts)
    score -= Math.round(((100 - nutritionAdherence) / 100) * 15);

    // Biological variance ±5
    const variance = (Math.random() * 10) - 5;
    score += variance;

    return Math.max(5, Math.min(100, Math.round(score)));
  },

  /* ── 4-Week Strength Forecast (chart data) ────────────────────────────────
   * Returns array of { week, predicted1RM } for up to 8 weeks.
   */
  strengthen4WeekForecast(current1RM, experience, readinessScore) {
    const data = [];
    let running = current1RM;
    for (let w = 0; w <= 8; w++) {
      const rate  = this.weeklyProgressionRate(experience, readinessScore);
      const noise = (Math.random() * 1.5) - 0.5; // biological variance
      if (w === 0) {
        data.push({ week: 'Now', value: running, predicted: false });
      } else {
        running = Math.round((running + running * rate + noise) * 10) / 10;
        data.push({ week: `W+${w}`, value: running, predicted: true });
      }
    }
    return data;
  },

  /* ── Bodyweight Forecast (8-week chart data) ─────────────────────────────
   */
  weight8WeekForecast(currentWeight, dailyCalories, tdee) {
    const data = [];
    const dailyBalance = dailyCalories - tdee;
    const weeklyDelta  = (dailyBalance * 7) / 7700;
    let running = currentWeight;
    for (let w = 0; w <= 8; w++) {
      const noise = (Math.random() * 0.4) - 0.2;
      if (w === 0) {
        data.push({ week: 'Now', value: running, predicted: false });
      } else {
        running = Math.round((running + weeklyDelta + noise) * 10) / 10;
        data.push({ week: `W+${w}`, value: running, predicted: true });
      }
    }
    return data;
  },

};

window.PredictionModel = PM;
