/**
 * performanceEngine.js  v1.0
 * Fitaura Elite — Digital Twin Orchestration Engine
 *
 * Manages:
 *  - Athlete profile storage and TDEE calculation
 *  - Workout + nutrition log accumulation
 *  - Digital Twin computation (calls PredictionModel)
 *  - Chart data generation for the UI
 *  - Adaptive coaching rule engine
 */

'use strict';

class PerformanceEngine {

  constructor() {
    this.STORAGE = {
      PROFILE:    'fitaura_twin_profile',
      WORKOUTS:   'fitaura_twin_workouts',
      WEIGHTS:    'fitaura_twin_weights',
      NUTRITION:  'fitaura_twin_nutrition',
      LIFTS:      'fitaura_twin_lifts',
    };

    this.profile  = null;
    this.workouts = [];
    this.weights  = [];
    this.nutrition = [];
    this.lifts    = {}; // { squat: [{date, 1rm}], bench: [...], deadlift: [...] }
    this.twin     = null; // computed twin state
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  INIT                                                                     */
  /* ──────────────────────────────────────────────────────────────────────── */

  init() {
    this.profile   = this._load(this.STORAGE.PROFILE);
    this.workouts  = this._load(this.STORAGE.WORKOUTS)  || [];
    this.weights   = this._load(this.STORAGE.WEIGHTS)   || [];
    this.nutrition = this._load(this.STORAGE.NUTRITION) || [];
    this.lifts     = this._load(this.STORAGE.LIFTS)     || {
      squat:     [],
      bench:     [],
      deadlift:  [],
      ohp:       [],
    };

    if (!this.profile) {
      this.profile = this._defaultProfile();
    }

    this.twin = this.computeTwin();
    return this;
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  PROFILE                                                                  */
  /* ──────────────────────────────────────────────────────────────────────── */

  _defaultProfile() {
    return {
      name:         'Athlete',
      age:          25,
      weight:       75,      // kg
      height:       175,     // cm
      sex:          'male',
      goal:         'recomposition',
      experience:   'intermediate',
      trainingDays: 4,
      sleepHours:   7,
      stressLevel:  5,        // 1–10
      dailyCalories: 2400,
      createdAt:    new Date().toISOString(),
    };
  }

  saveProfile(data) {
    this.profile = { ...this.profile, ...data };
    this._save(this.STORAGE.PROFILE, this.profile);
    this.twin = this.computeTwin();
    return this.twin;
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  TDEE CALCULATION (Mifflin-St Jeor + PAL)                               */
  /* ──────────────────────────────────────────────────────────────────────── */

  computeTDEE(profile) {
    const { age, weight, height, sex, trainingDays } = profile;

    // BMR (Mifflin-St Jeor)
    let bmr = sex === 'female'
      ? (10 * weight) + (6.25 * height) - (5 * age) - 161
      : (10 * weight) + (6.25 * height) - (5 * age) + 5;

    // Physical Activity Level
    const pal = trainingDays >= 6 ? 1.725
              : trainingDays >= 5 ? 1.55
              : trainingDays >= 3 ? 1.375
              : 1.2;

    return Math.round(bmr * pal);
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  LOG OPERATIONS                                                           */
  /* ──────────────────────────────────────────────────────────────────────── */

  logWorkout({ rpe, sets, type = 'strength', notes = '' }) {
    const entry = {
      date:   new Date().toISOString(),
      rpe:    Math.min(10, Math.max(1, rpe)),
      sets:   sets || 0,
      load:   (sets || 0) * rpe * 10, // simplified volume-load
      type,
      notes,
    };
    this.workouts.push(entry);
    if (this.workouts.length > 90) this.workouts = this.workouts.slice(-90); // keep 90 days
    this._save(this.STORAGE.WORKOUTS, this.workouts);
    this.twin = this.computeTwin();
    return this.twin;
  }

  logWeight(kg) {
    this.weights.push({ date: new Date().toISOString(), kg: parseFloat(kg) });
    if (this.weights.length > 90) this.weights = this.weights.slice(-90);
    this._save(this.STORAGE.WEIGHTS, this.weights);
    this.twin = this.computeTwin();
    return this.twin;
  }

  logLift(exercise, weight, reps) {
    const e1rm = PredictionModel.estimate1RM(parseFloat(weight), parseInt(reps));
    const key  = exercise.toLowerCase().replace(/\s/g, '_');
    if (!this.lifts[key]) this.lifts[key] = [];
    this.lifts[key].push({ date: new Date().toISOString(), weight: parseFloat(weight), reps: parseInt(reps), e1rm });
    if (this.lifts[key].length > 30) this.lifts[key] = this.lifts[key].slice(-30);
    this._save(this.STORAGE.LIFTS, this.lifts);
    this.twin = this.computeTwin();
    return this.twin;
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  COMPUTE DIGITAL TWIN                                                     */
  /* ──────────────────────────────────────────────────────────────────────── */

  computeTwin() {
    const p  = this.profile || this._defaultProfile();
    const PM = window.PredictionModel;

    /* ── 1. TDEE ────────────────────────────────────────────────────────── */
    const tdee = this.computeTDEE(p);

    /* ── 2. Weekly Loads for ACWR ───────────────────────────────────────── */
    const weeklyLoads = this._getWeeklyLoads(4);
    const acwr        = PM.computeACWR(weeklyLoads);

    /* ── 3. Recent RPE avg ──────────────────────────────────────────────── */
    const recentWorkouts = this.workouts.slice(-5);
    const recentRPEAvg   = recentWorkouts.length
      ? Math.round(recentWorkouts.reduce((s, w) => s + w.rpe, 0) / recentWorkouts.length * 10) / 10
      : 6;

    /* ── 4. Fatigue Risk ────────────────────────────────────────────────── */
    const fatigueResult = PM.classifyFatigue(acwr, recentRPEAvg, p.sleepHours, p.stressLevel);

    /* ── 5. Readiness Score ─────────────────────────────────────────────── */
    const readinessScore = PM.computeReadiness(p.sleepHours, p.stressLevel, fatigueResult.score);

    /* ── 6. Recovery Hours ──────────────────────────────────────────────── */
    const lastWorkout     = this.workouts.slice(-1)[0];
    const lastRPE         = lastWorkout?.rpe || 7;
    const lastSets        = lastWorkout?.sets || 12;
    const recoveryHours   = PM.estimateRecoveryHours(lastRPE, lastSets, p.experience, p.sleepHours);

    /* ── 7. Strength Predictions ────────────────────────────────────────── */
    const squatData    = this.lifts.squat    || [];
    const benchData    = this.lifts.bench    || [];
    const deadliftData = this.lifts.deadlift || [];

    const current1RM = {
      squat:    squatData.slice(-1)[0]?.e1rm    || this._estimate1RMFromWeight(p.weight, 'squat'),
      bench:    benchData.slice(-1)[0]?.e1rm    || this._estimate1RMFromWeight(p.weight, 'bench'),
      deadlift: deadliftData.slice(-1)[0]?.e1rm || this._estimate1RMFromWeight(p.weight, 'deadlift'),
    };

    const weeksSincePlateau = this._computeWeeksSincePlateau('squat');

    const strengthPrediction = {
      squat:    PM.predictStrength(current1RM.squat,    p.experience, readinessScore, weeksSincePlateau),
      bench:    PM.predictStrength(current1RM.bench,    p.experience, readinessScore, weeksSincePlateau),
      deadlift: PM.predictStrength(current1RM.deadlift, p.experience, readinessScore, weeksSincePlateau),
    };

    /* ── 8. PR Prediction ───────────────────────────────────────────────── */
    const prPrediction = PM.predictPR(
      current1RM.squat,
      this._getLastPR('squat'),
      p.experience,
      readinessScore
    );

    /* ── 9. Weight Change Prediction ────────────────────────────────────── */
    const currentWeight = this.weights.slice(-1)[0]?.kg || p.weight;
    const weightPred    = PM.predictWeightChange(
      currentWeight, p.dailyCalories, tdee, p.goal
    );

    /* ── 10. Weight deviation (for adaptive rules) ───────────────────────── */
    const weightDeviation = this.weights.length >= 2
      ? this.weights.slice(-1)[0].kg - this.weights.slice(-2)[0].kg
      : 0;

    /* ── 11. Adaptive Recommendations ──────────────────────────────────────*/
    const recommendations = PM.getAdaptiveRecommendations({
      fatigueRisk:        fatigueResult.level,
      readinessScore,
      acwr,
      weeksSincePlateau,
      weightDeviation,
      goal:               p.goal,
      sleepHours:         p.sleepHours,
      stressLevel:        p.stressLevel,
      nutritionStatus:    'on_track',
    });

    /* ── 12. Chart Forecasts ─────────────────────────────────────────────── */
    const strengthForecast = PM.strengthen4WeekForecast(current1RM.squat, p.experience, readinessScore);
    const weightForecast   = PM.weight8WeekForecast(currentWeight, p.dailyCalories, tdee);

    /* ── 13. Overtraining Risk ──────────────────────────────────────────── */
    const overtrain = this._assessOvertrainingRisk(acwr, fatigueResult.score, weeksSincePlateau);

    this.twin = {
      // Profile
      profile: p,
      tdee,
      currentWeight,

      // Readiness
      readinessScore,
      readinessLabel: readinessScore >= 85 ? 'Primed' : readinessScore >= 70 ? 'Ready' : readinessScore >= 50 ? 'Moderate' : 'Fatigued',
      readinessColor: readinessScore >= 85 ? '#00ff80' : readinessScore >= 70 ? '#00c3ff' : readinessScore >= 50 ? '#ffd700' : '#ff3366',

      // Fatigue
      fatigueRisk:  fatigueResult.level,
      fatigueColor: fatigueResult.color,
      fatigueAdv:   fatigueResult.advice,
      fatigueScore: fatigueResult.score,
      acwr,
      recentRPEAvg,

      // Recovery
      recoveryHours,
      recoveryReadyAt: new Date(Date.now() + recoveryHours * 3600000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),

      // Strength
      current1RM,
      strengthPrediction,
      prPrediction,
      weeksSincePlateau,

      // Weight
      weightPrediction: weightPred,

      // Overtraining
      overtrain,

      // Adaptive AI
      recommendations,

      // Chart data
      strengthForecast,
      weightForecast,

      computedAt: new Date().toISOString(),
    };

    return this.twin;
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  HELPERS                                                                  */
  /* ──────────────────────────────────────────────────────────────────────── */

  _getWeeklyLoads(weeks) {
    const loads = [];
    const now   = Date.now();
    for (let w = weeks - 1; w >= 0; w--) {
      const start = now - (w + 1) * 7 * 86400000;
      const end   = now - w * 7 * 86400000;
      const wkLoad = this.workouts
        .filter(wo => {
          const t = new Date(wo.date).getTime();
          return t >= start && t < end;
        })
        .reduce((s, wo) => s + (wo.load || 0), 0);
      loads.push(wkLoad);
    }
    return loads;
  }

  _computeWeeksSincePlateau(exercise) {
    const data = this.lifts[exercise] || [];
    if (data.length < 3) return 0;
    const last = data.slice(-2);
    const delta = Math.abs(last[1].e1rm - last[0].e1rm);
    if (delta < 1) {
      // Count backwards how many consecutive weeks with < 1kg improvement
      let count = 0;
      for (let i = data.length - 1; i > 0; i--) {
        if (Math.abs(data[i].e1rm - data[i-1].e1rm) < 1) count++;
        else break;
      }
      return count;
    }
    return 0;
  }

  _getLastPR(exercise) {
    const data = this.lifts[exercise] || [];
    if (!data.length) return null;
    return Math.max(...data.map(d => d.e1rm));
  }

  _estimate1RMFromWeight(bodyweight, lift) {
    // Strength standards based on bodyweight ratios (intermediate male)
    const ratios = { squat: 1.25, bench: 0.85, deadlift: 1.5, ohp: 0.55 };
    return Math.round(bodyweight * (ratios[lift] || 1.0));
  }

  _assessOvertrainingRisk(acwr, fatigueScore, weeksSincePlateau) {
    let risk = 0;
    if (acwr > 1.5)        risk += 40;
    if (fatigueScore > 60) risk += 30;
    if (weeksSincePlateau > 6) risk += 30;
    risk = Math.min(risk, 100);

    if (risk >= 70) return { level: 'High',    color: '#ff3366', pct: risk };
    if (risk >= 40) return { level: 'Moderate', color: '#ffd700', pct: risk };
    return               { level: 'Low',      color: '#00ff80', pct: risk };
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  CHART DATA BUILDERS                                                       */
  /* ──────────────────────────────────────────────────────────────────────── */

  getStrengthHistoryChartData(exercise) {
    const data = this.lifts[exercise] || [];
    return {
      labels: data.map(d => new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
      values: data.map(d => d.e1rm),
    };
  }

  getWeightHistoryChartData() {
    return {
      labels: this.weights.map(d => new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
      values: this.weights.map(d => d.kg),
    };
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  STORAGE                                                                  */
  /* ──────────────────────────────────────────────────────────────────────── */

  _save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
  }
  _load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  /*  SEED WITH SAMPLE DATA (first-run experience)                            */
  /* ──────────────────────────────────────────────────────────────────────── */

  seedSampleData() {
    const now = Date.now();
    const day = 86400000;

    // Workouts (last 4 weeks)
    const sampleWorkouts = [
      { rpe: 8, sets: 16, type: 'strength' },
      { rpe: 7, sets: 14, type: 'strength' },
      { rpe: 9, sets: 18, type: 'strength' },
      { rpe: 6, sets: 12, type: 'cardio'   },
      { rpe: 8, sets: 15, type: 'strength' },
      { rpe: 7, sets: 16, type: 'strength' },
      { rpe: 8, sets: 14, type: 'strength' },
      { rpe: 7, sets: 13, type: 'strength' },
    ];
    this.workouts = sampleWorkouts.map((w, i) => ({
      ...w, load: w.sets * w.rpe * 10,
      date: new Date(now - (sampleWorkouts.length - i) * 3.5 * day).toISOString(),
    }));

    // Weights (last 8 weeks)
    let wt = 76.5;
    this.weights = Array.from({ length: 16 }, (_, i) => {
      wt += (Math.random() * 0.6) - 0.3;
      return { date: new Date(now - (16 - i) * 3.5 * day).toISOString(), kg: Math.round(wt * 10) / 10 };
    });

    // Lifts
    let squat = 95, bench = 72, dl = 120;
    this.lifts = {
      squat:    Array.from({ length: 8 }, (_, i) => { squat += Math.random() * 3; return { date: new Date(now - (8-i)*7*day).toISOString(), weight: Math.round(squat*10)/10, reps: 5, e1rm: PredictionModel.estimate1RM(Math.round(squat), 5) }; }),
      bench:    Array.from({ length: 8 }, (_, i) => { bench += Math.random() * 2; return { date: new Date(now - (8-i)*7*day).toISOString(), weight: Math.round(bench*10)/10, reps: 5, e1rm: PredictionModel.estimate1RM(Math.round(bench), 5) }; }),
      deadlift: Array.from({ length: 8 }, (_, i) => { dl   += Math.random() * 4; return { date: new Date(now - (8-i)*7*day).toISOString(), weight: Math.round(dl*10)/10,    reps: 3, e1rm: PredictionModel.estimate1RM(Math.round(dl), 3) }; }),
      ohp:      [],
    };

    this._save(this.STORAGE.WORKOUTS, this.workouts);
    this._save(this.STORAGE.WEIGHTS,  this.weights);
    this._save(this.STORAGE.LIFTS,    this.lifts);

    this.twin = this.computeTwin();
    return this.twin;
  }

  resetAll() {
    Object.values(this.STORAGE).forEach(k => localStorage.removeItem(k));
    this.workouts = []; this.weights = []; this.lifts = { squat:[], bench:[], deadlift:[], ohp:[] };
    this.profile  = this._defaultProfile();
    this._save(this.STORAGE.PROFILE, this.profile);
    this.twin = this.computeTwin();
  }
}

window.PerformanceEngine = PerformanceEngine;
