/**
 * src/engine/AdaptationEngine.ts
 * The core physiological engine of FitAura.
 * Manages exponential fatigue decay, progression logic, autoregulation, and nutrition analysis.
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: 'push' | 'pull' | 'legs' | 'core';
  mechanics: 'compound' | 'isolation';
  equipment: 'gym' | 'dumbbells' | 'home';
  preventInjuries: string[];
}

export interface ExercisePerformance {
  exerciseId: string;
  completedSets: number;
  completedReps: number;
  weight: number; // in kg
  rpe: number; // 1-10
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO string
  exercises: ExercisePerformance[];
}

export interface RecoveryCheckIn {
  date: string;
  sleepHours: number;
  soreness: number; // 1-5
  stress: number; // 1-5
}

export interface UserProfile {
  goal: 'cut' | 'maintain' | 'bulk';
  equipment: ('gym' | 'dumbbells' | 'home')[];
  timeBudget: number; // in minutes (30, 45, 60, 90)
  injuries: string[];
  weightTrend: number[]; // recent daily weights
}

export interface GeneratedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  targetRpe: number;
  reasoning: string;
}

export interface GeneratedWorkout {
  date: string;
  name: string;
  exercises: GeneratedExercise[];
  recoveryAdjustment: {
    originalVolumeScale: number;
    actualVolumeScale: number;
    reasoning: string;
  };
}

export const EXERCISE_DATABASE: Exercise[] = [
  { id: 'ex_bench', name: 'Barbell Bench Press', muscleGroup: 'Chest', category: 'push', mechanics: 'compound', equipment: 'gym', preventInjuries: ['shoulder'] },
  { id: 'ex_db_bench', name: 'Dumbbell Bench Press', muscleGroup: 'Chest', category: 'push', mechanics: 'compound', equipment: 'dumbbells', preventInjuries: [] },
  { id: 'ex_pushup', name: 'Push-up', muscleGroup: 'Chest', category: 'push', mechanics: 'isolation', equipment: 'home', preventInjuries: ['wrist'] },
  
  { id: 'ex_ohp', name: 'Barbell Overhead Press', muscleGroup: 'Shoulders', category: 'push', mechanics: 'compound', equipment: 'gym', preventInjuries: ['shoulder', 'back'] },
  { id: 'ex_lateral', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', category: 'push', mechanics: 'isolation', equipment: 'dumbbells', preventInjuries: [] },
  
  { id: 'ex_deadlift', name: 'Barbell Deadlift', muscleGroup: 'Back', category: 'pull', mechanics: 'compound', equipment: 'gym', preventInjuries: ['back'] },
  { id: 'ex_pullup', name: 'Weighted Pull-up', muscleGroup: 'Back', category: 'pull', mechanics: 'compound', equipment: 'gym', preventInjuries: ['elbow'] },
  { id: 'ex_db_row', name: 'Dumbbell Row', muscleGroup: 'Back', category: 'pull', mechanics: 'compound', equipment: 'dumbbells', preventInjuries: ['back'] },
  
  { id: 'ex_curl', name: 'Dumbbell Bicep Curl', muscleGroup: 'Biceps', category: 'pull', mechanics: 'isolation', equipment: 'dumbbells', preventInjuries: [] },
  { id: 'ex_pushdown', name: 'Tricep Rope Pushdown', muscleGroup: 'Triceps', category: 'push', mechanics: 'isolation', equipment: 'gym', preventInjuries: ['elbow'] },

  { id: 'ex_squat', name: 'Barbell Back Squat', muscleGroup: 'Quads', category: 'legs', mechanics: 'compound', equipment: 'gym', preventInjuries: ['knee', 'back'] },
  { id: 'ex_bulgarian', name: 'Bulgarian Split Squat', muscleGroup: 'Quads', category: 'legs', mechanics: 'compound', equipment: 'dumbbells', preventInjuries: ['knee'] },
  { id: 'ex_rdl', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', category: 'legs', mechanics: 'compound', equipment: 'gym', preventInjuries: ['back'] },
  { id: 'ex_leg_curl', name: 'Leg Curl Machine', muscleGroup: 'Hamstrings', category: 'legs', mechanics: 'isolation', equipment: 'gym', preventInjuries: [] },
  { id: 'ex_calf', name: 'Standing Calf Raise', muscleGroup: 'Calves', category: 'legs', mechanics: 'isolation', equipment: 'gym', preventInjuries: [] }
];

export class AdaptationEngine {
  private lambda: number; // Decay constant

  constructor(halfLifeHours: number = 36) {
    // F(t) = F(0) * e^(-lambda * t)
    // 0.5 = e^(-lambda * halfLife) -> lambda = ln(2) / halfLife
    this.lambda = Math.log(2) / halfLifeHours;
  }

  /**
   * Calculates per-muscle-group fatigue scores using an exponential decay model.
   * Recent volume + soreness self-reports drive the initial fatigue spike.
   */
  calculateFatigue(
    workoutHistory: WorkoutLog[],
    checkIns: RecoveryCheckIn[],
    targetDate: Date = new Date()
  ): Record<string, number> {
    const fatigue: Record<string, number> = {};
    const muscleGroups = ['Chest', 'Back', 'Quads', 'Hamstrings', 'Shoulders', 'Biceps', 'Triceps', 'Calves'];

    // Initialize fatigue to 0
    muscleGroups.forEach((m) => {
      fatigue[m] = 0;
    });

    // Chronological sort
    const sortedWorkouts = [...workoutHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let lastTime: number | null = null;

    sortedWorkouts.forEach((workout) => {
      const workoutTime = new Date(workout.date).getTime();

      // 1. Apply decay since the last workout event
      if (lastTime !== null) {
        const hoursPassed = (workoutTime - lastTime) / (1000 * 60 * 60);
        muscleGroups.forEach((m) => {
          fatigue[m] = fatigue[m] * Math.exp(-this.lambda * hoursPassed);
        });
      }

      // Find matching check-in on or around this workout date for soreness factor
      const workoutDayStr = new Date(workout.date).toDateString();
      const matchingCheckIn = checkIns.find(
        (c) => new Date(c.date).toDateString() === workoutDayStr
      );
      const soreness = matchingCheckIn ? matchingCheckIn.soreness : 1; // Default 1 (no soreness)
      const sorenessFactor = 1 + 0.25 * (soreness - 1); // Soreness scales fatigue addition

      // 2. Add fatigue based on workout performance
      workout.exercises.forEach((perf) => {
        const exercise = EXERCISE_DATABASE.find((e) => e.id === perf.exerciseId);
        if (!exercise) return;

        // Fatigue added = completedSets * intensityRatio * soreness
        const intensityRatio = perf.rpe / 10;
        const addedFatigue = perf.completedSets * 12 * intensityRatio * sorenessFactor;

        fatigue[exercise.muscleGroup] = (fatigue[exercise.muscleGroup] || 0) + addedFatigue;
        
        // Secondary muscle group spillover
        if (exercise.muscleGroup === 'Chest') {
          fatigue['Triceps'] = (fatigue['Triceps'] || 0) + addedFatigue * 0.4;
          fatigue['Shoulders'] = (fatigue['Shoulders'] || 0) + addedFatigue * 0.2;
        } else if (exercise.muscleGroup === 'Back') {
          fatigue['Biceps'] = (fatigue['Biceps'] || 0) + addedFatigue * 0.4;
        }
      });

      lastTime = workoutTime;
    });

    // 3. Apply decay from the last workout event to the target date
    if (lastTime !== null) {
      const hoursPassed = (targetDate.getTime() - lastTime) / (1000 * 60 * 60);
      muscleGroups.forEach((m) => {
        fatigue[m] = Math.max(0, fatigue[m] * Math.exp(-this.lambda * hoursPassed));
      });
    }

    // Clamp values between 0 and 100 for user presentation
    const roundedFatigue: Record<string, number> = {};
    muscleGroups.forEach((m) => {
      roundedFatigue[m] = Math.min(100, Math.round(fatigue[m]));
    });

    return roundedFatigue;
  }

  /**
   * Computes the daily readiness score and volume scales based on daily check-in metrics.
   */
  autoregulateRecovery(checkIn: RecoveryCheckIn): {
    volumeScale: number;
    intensityScale: number;
    reasoning: string;
    readinessScore: number;
  } {
    let readinessScore = 100;
    let volumeScale = 1.0;
    let intensityScale = 1.0;
    const reasons: string[] = [];

    // Sleep analysis
    if (checkIn.sleepHours < 6) {
      readinessScore -= 25;
      volumeScale *= 0.8;
      intensityScale *= 0.9;
      reasons.push(`sleep was low (${checkIn.sleepHours}h)`);
    } else if (checkIn.sleepHours < 7.5) {
      readinessScore -= 10;
      volumeScale *= 0.9;
      reasons.push(`sleep was slightly restricted (${checkIn.sleepHours}h)`);
    }

    // Soreness analysis
    if (checkIn.soreness >= 4) {
      readinessScore -= 30;
      volumeScale *= 0.7;
      intensityScale *= 0.85;
      reasons.push('soreness is high');
    } else if (checkIn.soreness === 3) {
      readinessScore -= 10;
      volumeScale *= 0.9;
      reasons.push('moderate soreness reported');
    }

    // Stress analysis
    if (checkIn.stress >= 4) {
      readinessScore -= 20;
      volumeScale *= 0.8;
      reasons.push('stress is elevated');
    }

    // Clamp score
    readinessScore = Math.max(10, Math.min(100, readinessScore));

    let reasoning = 'Recovery status optimal — execute full target intensity.';
    if (reasons.length > 0) {
      const volPct = Math.round((1 - volumeScale) * 100);
      reasoning = `Reduced volume by ${volPct}% because ${reasons.join(' and ')}.`;
    }

    return {
      volumeScale,
      intensityScale,
      reasoning,
      readinessScore
    };
  }

  /**
   * Generates a fully personalized, adaptive workout session.
   */
  generateWorkout(
    profile: UserProfile,
    fatigue: Record<string, number>,
    recovery: ReturnType<typeof this.autoregulateRecovery>,
    history: WorkoutLog[],
    targetDate: Date = new Date()
  ): GeneratedWorkout {
    // 1. Sort muscle groups by freshness (100 - fatigue)
    const muscleFreshness = Object.entries(fatigue).map(([muscle, fat]) => ({
      muscle,
      freshness: 100 - fat
    })).sort((a, b) => b.freshness - a.freshness);

    // Pick top muscle groups to target
    const targetMuscles = muscleFreshness.slice(0, 3).map((mf) => mf.muscle);

    // 2. Filter exercise database
    const eligibleExercises = EXERCISE_DATABASE.filter((ex) => {
      // Equipment check
      if (!profile.equipment.includes(ex.equipment)) return false;
      // Injury check
      if (profile.injuries.some((injury) => ex.preventInjuries.includes(injury))) return false;
      return true;
    });

    // 3. Time Budget -> Determines number of exercises
    // 30m = 3 exercises, 45m = 4 exercises, 60m = 5 exercises, 90m = 7 exercises
    let exerciseCount = 5;
    if (profile.timeBudget <= 30) exerciseCount = 3;
    else if (profile.timeBudget <= 45) exerciseCount = 4;
    else if (profile.timeBudget >= 90) exerciseCount = 7;

    // Pick exercises matching the targeted muscle groups first, then fill rest
    const selectedExercises: Exercise[] = [];
    
    // Select compound lifts for target muscles first
    targetMuscles.forEach((muscle) => {
      const match = eligibleExercises.find(
        (ex) => ex.muscleGroup === muscle && ex.mechanics === 'compound' && !selectedExercises.includes(ex)
      );
      if (match) selectedExercises.push(match);
    });

    // Fill the rest with isolation/remaining compound movements
    eligibleExercises.forEach((ex) => {
      if (selectedExercises.length < exerciseCount && !selectedExercises.includes(ex)) {
        selectedExercises.push(ex);
      }
    });

    // 4. Generate specific sets, reps, and progression load
    const generatedExercises: GeneratedExercise[] = selectedExercises.map((ex) => {
      // Find progression history for this specific exercise
      let baseWeight = 20; // Default bar weight
      if (ex.equipment === 'dumbbells') baseWeight = 10;
      if (ex.equipment === 'home') baseWeight = 0;

      let lastWeight = baseWeight;
      let lastRpe = 8;
      let foundHistory = false;

      // Find last performance
      for (let i = history.length - 1; i >= 0; i--) {
        const loggedEx = history[i].exercises.find((p) => p.exerciseId === ex.id);
        if (loggedEx) {
          lastWeight = loggedEx.weight;
          lastRpe = loggedEx.rpe;
          foundHistory = true;
          break;
        }
      }

      // Autoregulation & Progression calculation
      let targetWeight = lastWeight;
      let targetRpe = 8;
      let reps = 8;
      let sets = Math.round(3 * recovery.volumeScale);
      sets = Math.max(1, sets); // Ensure at least 1 set

      let reasoning = '';

      if (foundHistory) {
        // Did user complete target sets/reps comfortably?
        // If last RPE <= 8, we step up weight. If RPE >= 9.5, we step down.
        if (lastRpe <= 8) {
          const increment = ex.mechanics === 'compound' ? 2.5 : 1.25;
          targetWeight = lastWeight + increment;
          reasoning = `Auto-incremented weight by +${increment}kg (last set felt submaximal at RPE ${lastRpe}).`;
        } else if (lastRpe >= 9.5) {
          targetWeight = Math.max(baseWeight, lastWeight - 2.5);
          reasoning = `Reduced weight by -2.5kg to manage high fatigue from last RPE ${lastRpe}.`;
        } else {
          reasoning = `Maintained weight at ${lastWeight}kg to consolidate load (last RPE ${lastRpe}).`;
        }
      } else {
        reasoning = `Empty baseline logic: generated initial progression threshold.`;
      }

      // Apply daily recovery scale to the generated targets
      targetWeight = Math.round((targetWeight * recovery.intensityScale) / 2.5) * 2.5;

      return {
        id: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets,
        reps,
        weight: targetWeight,
        targetRpe,
        reasoning
      };
    });

    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

    return {
      date: targetDate.toISOString(),
      name: `${dayName} - Target Session`,
      exercises: generatedExercises,
      recoveryAdjustment: {
        originalVolumeScale: 1.0,
        actualVolumeScale: recovery.volumeScale,
        reasoning: recovery.reasoning
      }
    };
  }
}
