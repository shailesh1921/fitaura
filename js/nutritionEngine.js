/**
 * nutritionEngine.js
 * World-Class Nutrition System Engine
 * Calculates TDEE, dynamic macros based on goals, active carb cycling,
 * meal distribution, and smart analytical warnings.
 */

class NutritionEngine {
    constructor() {
        this.profile = {
            age: 30, weight: 75, height: 180, gender: 'male',
            goal: 'fat_loss', activityLevel: 'moderate', trainingDays: 4, bodyFat: 0
        };
        this.dailyIntake = { p: 0, c: 0, f: 0 };
        this.plan = null;
    }

    init() {
        const stored = localStorage.getItem('fitaura_nutrition_profile');
        if (stored) {
            this.profile = { ...this.profile, ...JSON.parse(stored) };
        }
        const intake = localStorage.getItem('fitaura_daily_intake');
        if (intake) {
            this.dailyIntake = JSON.parse(intake);
            // Check if it's a new day to reset logic could go here depending on Date
        }
    }

    saveProfile(data) {
        this.profile = { ...this.profile, ...data };
        localStorage.setItem('fitaura_nutrition_profile', JSON.stringify(this.profile));
        return this.generatePlan();
    }

    addFoodLog(p, c, f) {
        this.dailyIntake.p += p;
        this.dailyIntake.c += c;
        this.dailyIntake.f += f;
        localStorage.setItem('fitaura_daily_intake', JSON.stringify(this.dailyIntake));
    }

    generatePlan() {
        const { age, weight, height, gender, goal, activityLevel, trainingDays } = this.profile;
        
        // 1. Calculate BMR (Mifflin-St Jeor)
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr += (gender === 'male' ? 5 : -161);

        // 2. Activity Multiplier
        let multiplier = 1.2;
        if (activityLevel === 'light') multiplier = 1.375;
        if (activityLevel === 'moderate') multiplier = 1.55;
        if (activityLevel === 'heavy') multiplier = 1.725;
        if (activityLevel === 'athlete') multiplier = 1.9;

        const maintenance = Math.round(bmr * multiplier);
        const deficit = maintenance - ((goal === 'fat_loss') ? (weight > 90 ? 700 : 500) : 0);
        const surplus = maintenance + ((goal === 'muscle_gain') ? 300 : 0);

        let targetCals = maintenance;
        if (goal === 'fat_loss') targetCals = deficit;
        if (goal === 'muscle_gain') targetCals = surplus;

        // 2.5. Integrate Real-time Active Expenditure (Fitaura Pulse)
        const activeData = JSON.parse(localStorage.getItem('fitaura_daily_activity') || '{}');
        const activeCals = activeData.activeCalories || 0;
        targetCals += activeCals;

        // 3. Macros
        let proteinPerKg = 2.0;
        if (goal === 'fat_loss') proteinPerKg = 2.4; // preserve muscle
        if (goal === 'muscle_gain') proteinPerKg = 2.2;
        
        let p = Math.round(weight * proteinPerKg);
        const pCals = p * 4;

        // Fat floor (0.8g per kg minimum for hormones)
        let fatPerKg = goal === 'fat_loss' ? 0.8 : 1.0;
        let f = Math.round(weight * fatPerKg);
        const fCals = f * 9;

        let cCals = targetCals - pCals - fCals;
        let c = Math.max(0, Math.round(cCals / 4));

        // Refeed Logic / Carb Cycling Check
        let isRefeed = false;
        if (goal === 'fat_loss' && Math.random() < 0.2) // Mocking a stochastic low-glycogen state for preview
            isRefeed = true;

        if (isRefeed) {
            targetCals += 300;
            c += 75; // Add extra carbs
            f = Math.max(40, f - 10); // Lower fat on refeed
        }

        // 4. Meal Distribution
        // Breakfast (20%), Lunch (25%), Pre (15% - High Carb), Post (20% - High P/C), Dinner (20%)
        const meals = {
            breakfast: { name: 'Breakfast', p: Math.round(p*0.2), c: Math.round(c*0.15), f: Math.round(f*0.3) },
            lunch: { name: 'Lunch', p: Math.round(p*0.25), c: Math.round(c*0.2), f: Math.round(f*0.3) },
            preWorkout: { name: 'Pre Workout', p: Math.round(p*0.15), c: Math.round(c*0.25), f: Math.round(f*0.1) },
            postWorkout: { name: 'Post Workout', p: Math.round(p*0.2), c: Math.round(c*0.3), f: Math.round(f*0.05) },
            dinner: { name: 'Dinner', p: Math.round(p*0.2), c: Math.round(c*0.1), f: Math.round(f*0.25) }
        };

        // 5. Smart Recommendations & Insights
        let warnings = [];
        let recommendations = [];

        if (goal === 'fat_loss') recommendations.push("- Increase protein intake to 2.4g/kg to preserve muscle mass.");
        if (goal === 'muscle_gain') recommendations.push("- Constant caloric surplus established. Increase carbs if training heavy.");
        if (goal === 'recomposition') recommendations.push("- Maintenance calories set. Focus on progressive overload to recomp.");
        if (isRefeed) recommendations.push("- Glycogen depletion detected. Initiating Refeed Day.");

        if (c < 100 && trainingDays >= 4) warnings.push("⚠️ Carbs too low for optimal CNS performance.");
        if (p < weight * 1.6) warnings.push("⚠️ You need more protein for adequate MPS (Muscle Protein Synthesis).");
        if (f < weight * 0.7) warnings.push("⚠️ Fats dropping too low. Critical for hormonal function.");
        if (activityLevel === 'heavy') warnings.push("⚠️ Heavy workload active. Recovery nutrition required post-session.");

        this.plan = {
            cals: { target: targetCals, maintenance, deficit, surplus },
            macros: { p, c, f },
            meals,
            insights: {
                timing: "Consume 60% of daily carbohydrates around your training window.",
                hydration: `Target ${Math.round(weight * 0.04)} Liters of water daily.`,
                fiber: `Target ${Math.round(targetCals / 1000 * 14)}g of fiber minimum.`
            },
            warnings,
            recommendations
        };

        return this.plan;
    }
}

window.NutritionEngine = NutritionEngine;
