import { AdaptationEngine, type WorkoutLog, type RecoveryCheckIn, type UserProfile } from './AdaptationEngine';

function runTest() {
  console.log("=== FITAURA ADAPTATION ENGINE SIMULATION ===");
  const engine = new AdaptationEngine(36); // 36h half-life

  // 1. Setup profile
  const profile: UserProfile = {
    goal: 'cut',
    equipment: ['gym', 'dumbbells'],
    timeBudget: 45, // 4 exercises
    injuries: [],
    weightTrend: [75, 74.8, 74.5]
  };

  // 2. Setup workout logs (completed 24 hours ago)
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  const history: WorkoutLog[] = [
    {
      id: 'w_1',
      date: yesterday.toISOString(),
      exercises: [
        { exerciseId: 'ex_bench', completedSets: 3, completedReps: 8, weight: 60, rpe: 8 },
        { exerciseId: 'ex_ohp', completedSets: 3, completedReps: 8, weight: 40, rpe: 7 }
      ]
    }
  ];

  // 3. Setup check-ins
  const yesterdayCheckIn: RecoveryCheckIn = {
    date: yesterday.toISOString(),
    sleepHours: 8,
    soreness: 1,
    stress: 2
  };

  const todayCheckIn: RecoveryCheckIn = {
    date: new Date().toISOString(),
    sleepHours: 5.5, // poor sleep!
    soreness: 4,     // highly sore!
    stress: 3
  };

  const checkIns = [yesterdayCheckIn, todayCheckIn];

  // 4. Calculate Fatigue
  console.log("\nCalculating muscle group fatigue today:");
  const fatigue = engine.calculateFatigue(history, checkIns, new Date());
  console.log(JSON.stringify(fatigue, null, 2));

  // 5. Autoregulate based on today's check-in
  console.log("\nAutoregulating check-in readiness:");
  const recoveryResult = engine.autoregulateRecovery(todayCheckIn);
  console.log(JSON.stringify(recoveryResult, null, 2));

  // 6. Generate next session
  console.log("\nGenerating today's adaptive workout:");
  const generated = engine.generateWorkout(profile, fatigue, recoveryResult, history, new Date());
  console.log(JSON.stringify(generated, null, 2));

  console.log("\n=== SIMULATION PASSED ===");
}

runTest();
