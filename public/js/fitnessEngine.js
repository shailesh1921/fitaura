/**
 * fitnessEngine.js
 * The core intelligent brain for Fitaura. 
 * Handles adaptive workout generation, nutrition calculation, and progressive overload tracking.
 */

class FitnessEngine {
    constructor() {
        this.exercises = [
            { id: 'ex_1', name: 'Barbell Bench Press', muscle: 'Chest', category: 'push', mechanics: 'compound', equipment: 'gym', prevents: ['shoulder_pain', 'wrist_pain'] },
            { id: 'ex_2', name: 'Dumbbell Incline Press', muscle: 'Chest', category: 'push', mechanics: 'compound', equipment: 'dumbbells', prevents: ['shoulder_pain'] },
            { id: 'ex_3', name: 'Push-ups', muscle: 'Chest', category: 'push', mechanics: 'compound', equipment: 'home', prevents: ['wrist_pain'] },
            { id: 'ex_4', name: 'Overhead Press', muscle: 'Shoulders', category: 'push', mechanics: 'compound', equipment: 'gym', prevents: ['shoulder_pain', 'lower_back_pain'] },
            { id: 'ex_5', name: 'Dumbbell Lateral Raises', muscle: 'Shoulders', category: 'push', mechanics: 'isolation', equipment: 'dumbbells', prevents: [] },
            { id: 'ex_6', name: 'Tricep Rope Pushdowns', muscle: 'Triceps', category: 'push', mechanics: 'isolation', equipment: 'gym', prevents: ['elbow_pain'] },
            
            { id: 'ex_7', name: 'Barbell Deadlift', muscle: 'Back', category: 'pull', mechanics: 'compound', equipment: 'gym', prevents: ['lower_back_pain', 'knee_pain'] },
            { id: 'ex_8', name: 'Weighted Pull-ups', muscle: 'Back', category: 'pull', mechanics: 'compound', equipment: 'gym', prevents: ['shoulder_pain'] },
            { id: 'ex_9', name: 'Dumbbell Rows', muscle: 'Back', category: 'pull', mechanics: 'compound', equipment: 'dumbbells', prevents: ['lower_back_pain'] },
            { id: 'ex_10', name: 'Lat Pulldown', muscle: 'Back', category: 'pull', mechanics: 'target', equipment: 'gym', prevents: ['shoulder_pain'] },
            { id: 'ex_11', name: 'Barbell Curl', muscle: 'Biceps', category: 'pull', mechanics: 'isolation', equipment: 'gym', prevents: ['wrist_pain', 'elbow_pain'] },
            { id: 'ex_12', name: 'Hammer Curls', muscle: 'Biceps', category: 'pull', mechanics: 'isolation', equipment: 'dumbbells', prevents: ['elbow_pain'] },
            
            { id: 'ex_13', name: 'Barbell Back Squat', muscle: 'Quads', category: 'legs', mechanics: 'compound', equipment: 'gym', prevents: ['knee_pain', 'lower_back_pain'] },
            { id: 'ex_14', name: 'Bulgarian Split Squats', muscle: 'Quads', category: 'legs', mechanics: 'compound', equipment: 'dumbbells', prevents: ['knee_pain'] },
            { id: 'ex_15', name: 'Romanian Deadlift', muscle: 'Hamstrings', category: 'legs', mechanics: 'compound', equipment: 'gym', prevents: ['lower_back_pain'] },
            { id: 'ex_16', name: 'Leg Curls', muscle: 'Hamstrings', category: 'legs', mechanics: 'isolation', equipment: 'gym', prevents: [] },
            { id: 'ex_17', name: 'Leg Press', muscle: 'Quads', category: 'legs', mechanics: 'compound', equipment: 'gym', prevents: [] },
            { id: 'ex_18', name: 'Standing Calf Raises', muscle: 'Calves', category: 'legs', mechanics: 'isolation', equipment: 'gym', prevents: ['ankle_pain'] }
        ];

        this.userProfile = null;
        this.currentPlan = null;
        this.history = [];
        this.recoveryStatus = { score: 100, status: 'Optimal', advice: 'Ready to train.' };
    }

    init() {
        // Load from LocalStorage
        const storedProfile = localStorage.getItem('fitaura_profile');
        if (storedProfile) {
            this.userProfile = JSON.parse(storedProfile);
        } else {
            // Default baseline if not logged in
            this.userProfile = {
                weight: 75,
                goal: 'recomposition',
                experience: 'intermediate',
                daysPerWeek: 4,
                equipment: 'gym',
                injuries: []
            };
        }

        const storedHistory = localStorage.getItem('fitaura_workout_history');
        if (storedHistory) this.history = JSON.parse(storedHistory);

        this.generateWorkoutPlan();
        this.calculateRecovery();
        this.processDecay();
    }

    // -- 0. RECOVERY DECAY --
    processDecay() {
        const volumeLog = JSON.parse(localStorage.getItem('fitaura_volume_log') || '{}');
        const lastUpdate = localStorage.getItem('fitaura_volume_last_sync');
        const now = Date.now();

        if (lastUpdate) {
            const hoursPassed = (now - parseInt(lastUpdate)) / (1000 * 3600);
            if (hoursPassed >= 1) {
                // Decay at 1.5% per hour (approx 50% recovery in 24h, 100% in 72h)
                for (let m in volumeLog) {
                    volumeLog[m] = Math.max(0, volumeLog[m] * Math.pow(0.985, hoursPassed));
                }
                localStorage.setItem('fitaura_volume_log', JSON.stringify(volumeLog));
            }
        }
        localStorage.setItem('fitaura_volume_last_sync', now.toString());
    }

    // -- 1. RECOVERY ENGINE --
    calculateRecovery() {
        // Analyze recency and RPE of last 3 workouts
        const recentWorkouts = this.history.slice(-3);
        let cnsFatigue = 0;
        let highestRecentRPE = 0;

        recentWorkouts.forEach((w, i) => {
            const daysAgo = (Date.now() - new Date(w.date).getTime()) / (1000 * 3600 * 24);
            if (daysAgo < 3) {
                if (w.rpe >= 8) cnsFatigue += (w.rpe - 7) * 8; // RPE 9 = 16 penalty
                if (w.rpe > highestRecentRPE) highestRecentRPE = w.rpe;
            }
        });

        // Sleep penalty (simulated as we don't have wearable integration)
        let simulatedSleepPenalty = Math.random() < 0.2 ? 15 : 0; // 20% chance user had poor sleep baseline

        let score = 100 - cnsFatigue - simulatedSleepPenalty;
        score += (Math.random() * 8) - 4; // biological variance
        score = Math.max(10, Math.min(100, Math.round(score)));

        let status = 'Optimal';
        let advice = 'Prime for heavy compounds and PRs.';
        let color = '#00ff80';

        if (score < 60) {
            status = 'Recovering';
            advice = 'Slight fatigue. Keep reps smooth, avoid failure.';
            color = '#ffd700';
        }
        if (score < 35) {
            status = 'Overreaching';
            advice = 'High CNS suppression. Defer heavy lifting. Zone 2 prescribed.';
            color = '#ff3366';
        }

        this.recoveryStatus = { score, status, advice, color };
        return this.recoveryStatus;
    }

    // -- 2. ADAPTIVE GENERATOR --
    generateWorkoutPlan() {
        const { daysPerWeek, equipment, injuries, experience } = this.userProfile;
        
        let splitType = 'Full Body';
        if (daysPerWeek === 4) splitType = 'Upper/Lower';
        if (daysPerWeek >= 5) splitType = 'Push/Pull/Legs';

        let availableEx = this.exercises.filter(ex => {
            if (equipment === 'home' && ex.equipment !== 'home') return false;
            if (equipment === 'dumbbells' && ex.equipment === 'gym') return false;
            if (injuries && injuries.some(inj => ex.prevents.includes(inj))) return false;
            return true;
        });

        const getEx = (cat, count) => availableEx.filter(e => e.category === cat).slice(0, count);

        const sets = experience === 'advanced' ? 4 : 3;
        const reps = experience === 'advanced' ? '6-8' : '8-12';

        const createDay = (name, type, exList) => {
            return {
                dayName: name,
                type: type,
                exercises: exList.map(e => {
                    // Try to fetch last weight
                    let lastWeight = 0;
                    const prevLog = this.history.slice().reverse().find(w => w.exercises && w.exercises.some(x => x.id === e.id));
                    if(prevLog) {
                        const targetPrev = prevLog.exercises.find(x => x.id === e.id);
                        if(targetPrev) lastWeight = targetPrev.weight;

                        // Progression logic (if previous RPE < 8, add weight)
                        if(prevLog.rpe < 8 && lastWeight > 0) {
                            lastWeight += (e.mechanics === 'compound' ? 2.5 : 1.25);
                        }
                    }

                    return {
                        id: e.id,
                        name: e.name,
                        sets: sets,
                        reps: reps,
                        targetWeight: lastWeight > 0 ? `${lastWeight}kg` : 'Base'
                    }
                })
            };
        };

        let schedule = [];

        if (splitType === 'Push/Pull/Legs') {
            schedule = [
                createDay('Day 1', 'Push', getEx('push', 5)),
                createDay('Day 2', 'Pull', getEx('pull', 5)),
                createDay('Day 3', 'Legs', getEx('legs', 5)),
                createDay('Day 4', 'Rest', []),
                createDay('Day 5', 'Push', getEx('push', 5)),
                createDay('Day 6', 'Pull', getEx('pull', 5)),
                createDay('Day 7', 'Legs', getEx('legs', 5))
            ];
        } else if (splitType === 'Upper/Lower') {
             const upper = [...getEx('push', 3), ...getEx('pull', 3)];
             const lower = getEx('legs', 5);
             schedule = [
                 createDay('Day 1', 'Upper', upper),
                 createDay('Day 2', 'Lower', lower),
                 createDay('Day 3', 'Rest', []),
                 createDay('Day 4', 'Upper', upper),
                 createDay('Day 5', 'Lower', lower),
                 createDay('Day 6', 'Rest', []),
                 createDay('Day 7', 'Rest', [])
             ];
        } else {
             const full = [getEx('legs', 2)[0], getEx('push', 2)[0], getEx('pull', 2)[0]].filter(Boolean);
             schedule = [
                 createDay('Day 1', 'Full Body', full),
                 createDay('Day 2', 'Rest', []),
                 createDay('Day 3', 'Full Body', full),
                 createDay('Day 4', 'Rest', []),
                 createDay('Day 5', 'Full Body', full),
                 createDay('Day 6', 'Rest', []),
                 createDay('Day 7', 'Rest', [])
             ];
        }

        // Apply Deload Logic if Recovery is constantly trashed
        const highFatigueCount = this.history.slice(-5).filter(w => w.rpe >= 9).length;
        if (highFatigueCount >= 3) {
            schedule.forEach(day => {
                day.exercises.forEach(ex => {
                    ex.sets = Math.max(2, ex.sets - 1);
                    ex.reps = '10-15';
                    ex.targetWeight = ex.targetWeight !== 'Base' ? `${parseFloat(ex.targetWeight)*0.8}kg` : 'Base';
                });
            });
            this.recoveryStatus.advice = 'Deload Week Active. Volume and Load reduced by 20%.';
        }

        this.currentPlan = { split: splitType, schedule };
        return this.currentPlan;
    }

    getTodayWorkout() {
        if(!this.currentPlan) return null;
        const dayIndex = new Date().getDay(); // 0 is Sunday
        // Mapped trivially: Monday is Day 1
        const map = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
        return this.currentPlan.schedule[map[dayIndex]];
    }

    logWorkout(workout) {
        workout.date = new Date().toISOString();
        this.history.push(workout);
        localStorage.setItem('fitaura_workout_history', JSON.stringify(this.history));
        
        // --- VOLUME HARVESTING FOR HEATMAP ---
        const volumeLog = JSON.parse(localStorage.getItem('fitaura_volume_log') || '{}');
        
        workout.exercises.forEach(exResult => {
            const masterEx = this.exercises.find(e => e.id === exResult.id);
            if (!masterEx) return;

            const sets = parseInt(exResult.completedSets || 3); 

            // 1. Primary Muscle (100% Volume)
            const primary = masterEx.muscle;
            volumeLog[primary] = (volumeLog[primary] || 0) + sets;

            // 2. Synergist Map (Detailed Anatomical Distribution)
            const synergists = {
                'Barbell Bench Press': { Triceps: 0.4, Shoulders: 0.3 },
                'Dumbbell Incline Press': { Shoulders: 0.5, Triceps: 0.3 },
                'Push-ups': { Triceps: 0.4, Shoulders: 0.2 },
                'Overhead Press': { Triceps: 0.4, Abs: 0.1 },
                'Barbell Deadlift': { Hamstrings: 0.6, Glutes: 0.6, Back: 0.4, Traps: 0.2 },
                'Weighted Pull-ups': { Biceps: 0.5, Shoulders: 0.2 },
                'Dumbbell Rows': { Biceps: 0.4, Shoulders: 0.2 },
                'Barbell Back Squat': { Glutes: 0.5, Hamstrings: 0.4, Back: 0.2 },
                'Bulgarian Split Squats': { Glutes: 0.6, Hamstrings: 0.3 },
                'Leg Press': { Glutes: 0.4, Hamstrings: 0.2 }
            };

            const extra = synergists[masterEx.name] || {};
            for (let m in extra) {
                volumeLog[m] = (volumeLog[m] || 0) + (sets * extra[m]);
            }
        });

        localStorage.setItem('fitaura_volume_log', JSON.stringify(volumeLog));
        localStorage.setItem('fitaura_volume_last_sync', Date.now().toString());
        
        // Recalculate immediately
        this.calculateRecovery();
        this.generateWorkoutPlan();
        
        return { success: true, newRecovery: this.recoveryStatus.score };
    }

    // -- AI COACH LOGIC --
    getAICoachAdvice(query) {
        query = query.toLowerCase();
        const historyLen = this.history.length;

        if(query.includes('train today') || query.includes('workout today')) {
            const today = this.getTodayWorkout();
            if(!today || today.type === 'Rest') return "Today is a programmed rest day. Focus on hydration, low-intensity movement (walking), and recovery!";
            return `Today is **${today.type}**. You have ${today.exercises.length} exercises programmed. Target RPE is 7.5. Let's work.`;
        }

        if(query.includes('plateau') || query.includes('stuck')) {
            return "If your lifts are stalled, we must change variables. The algorithm suggests transitioning from an 8-12 rep range down to 5-8 for your primary compounds over the next 3 weeks to force neurological adaptation.";
        }

        if(query.includes('tired') || query.includes('deload')) {
            let avgRpe = 0;
            if(historyLen) avgRpe = Math.round(this.history.slice(-3).reduce((a,b)=>a+b.rpe,0) / Math.min(3, historyLen));
            return `Your recent log shows an avg RPE of ${avgRpe || 'unknown'}. If your joints ache, I can manually trigger a Deload Phase. Say 'yes' to activate.`;
        }

        if(query.includes('volume') || query.includes('overtraining')) {
            if(this.recoveryStatus.score < 50) {
                return "Your recovery score is deeply suppressed. Yes, you are currently overreaching. The engine recommends swapping your next lift for a 45 min Zone 2 session.";
            }
            return "Volume is currently mapped to your intermediate/advanced status. Your recovery dictates you are adapting well.";
        }

        return "I am the Fitaura core engine. Ask me about your programming, physiological readiness, or workout adjustments.";
    }
}

window.FitnessEngine = FitnessEngine;
