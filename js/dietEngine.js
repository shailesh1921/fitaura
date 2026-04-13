/**
 * dietEngine.js
 * The elite Metabolic & Macro tracking logic core.
 * Features: TDEE, Carb Cycling, Protein thresholds, Refeed handling.
 */

class DietEngine {
    constructor() {
        this.userProfile = null;
        this.fitnessEngineRef = null;
        this.baseTDEE = 0;
        this.cycledPlan = null;
        this.history = [];
    }

    init(fitnessEngineObj = null) {
        const storedProfile = localStorage.getItem('fitaura_profile');
        if (storedProfile) {
            this.userProfile = JSON.parse(storedProfile);
        } else {
            this.userProfile = { age: 30, gender: 'male', weight: 75, height: 180, goal: 'fat_loss', daysPerWeek: 4 };
        }

        const storedHistory = localStorage.getItem('fitaura_diet_history');
        if (storedHistory) this.history = JSON.parse(storedHistory);

        this.fitnessEngineRef = fitnessEngineObj;
        
        this.calculateTDEE();
        this.generateCycledPlan();
        
        return this;
    }

    calculateTDEE() {
        const { age, gender, weight, height, daysPerWeek } = this.userProfile;
        
        // Mifflin-St Jeor Equation
        // Men: 10 x weight (kg) + 6.25 x height (cm) - 5 x age (y) + 5
        // Women: 10 x weight (kg) + 6.25 x height (cm) - 5 x age (y) - 161
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr += (gender === 'male' || gender === 'Male' ? 5 : -161);

        // Activity Multiplier
        let multiplier = 1.2; // Sedentary base
        if(daysPerWeek >= 6) multiplier = 1.725;
        else if(daysPerWeek >= 4) multiplier = 1.55;
        else if(daysPerWeek >= 2) multiplier = 1.375;

        this.baseTDEE = Math.round(bmr * multiplier);
        return this.baseTDEE;
    }

    generateCycledPlan() {
        const { goal, weight } = this.userProfile;
        
        // Caloric Target Adjustments
        let targetCalories = this.baseTDEE;
        if(goal === 'fat_loss') targetCalories -= 500;
        else if(goal === 'muscle_gain') targetCalories += 300;
        // recomposition = maintenance

        // Base Protein Requirement:
        // Fat loss: 2.2g/kg (High to preserve muscle)
        // Gain/Recomp: 2.0g/kg
        const proteinTarget = Math.round(weight * (goal === 'fat_loss' ? 2.2 : 2.0));
        const proteinCal = proteinTarget * 4;

        // Base Fat Requirement (appx 25% of target cals)
        const fatTarget = Math.round((targetCalories * 0.25) / 9);
        const fatCal = fatTarget * 9;

        // Remaining calories for Carbs
        const baseCarbTarget = Math.round((targetCalories - proteinCal - fatCal) / 4);

        // Carb Cycling Generator
        // High Day (+20% Carbs, -10% Fat)
        const hcCals = targetCalories + 250;
        const hcCarbs = Math.round(baseCarbTarget * 1.3);
        const hcFat = Math.round(fatTarget * 0.9);

        // Low Day (-15% Carbs, +10% Fat)
        const lcCals = targetCalories - 150;
        const lcCarbs = Math.max(50, Math.round(baseCarbTarget * 0.7));
        const lcFat = Math.round(fatTarget * 1.1);

        // Refeed Day (Maintenance Cals, HIGH Carb, Low Fat)
        const rcCals = this.baseTDEE; 
        const rcCarbs = Math.round((rcCals - proteinCal - (40*9))/4);

        this.cycledPlan = {
            base:     { type: 'Standard', cals: targetCalories, p: proteinTarget, c: baseCarbTarget, f: fatTarget, recommendation: 'Base Protocol' },
            HighDay:  { type: 'High Carb', cals: hcCals, p: proteinTarget, c: hcCarbs, f: hcFat, recommendation: 'Fuel heavy lifting. Consume 60% of carbs pre/post workout.' },
            LowDay:   { type: 'Low Carb', cals: lcCals, p: proteinTarget, c: lcCarbs, f: lcFat, recommendation: 'Insulin moderation mode. Focus on fibrous veggies and healthy fats.' },
            RefeedDay:{ type: 'Refeed', cals: rcCals, p: proteinTarget, c: rcCarbs, f: 40, recommendation: 'Metabolic reset. Refill glycogen stores and upregulate leptin.' }
        };

        return this.cycledPlan;
    }

    // Determine what strictly today should be based on engine states
    getTodayMacroProfile() {
        let activeDietMacro = this.cycledPlan.LowDay; // Default to Low
        
        // 1. Check Lifting
        let isLiftingDay = false;
        if(this.fitnessEngineRef && this.fitnessEngineRef.currentPlan) {
            const todayLift = this.fitnessEngineRef.getTodayWorkout();
            if(todayLift && todayLift.type !== 'Rest') isLiftingDay = true;
            
            // 2. Check Recovery/Fatigue for Refeed
            // If user is cutting AND recovery is crushed, trigger a Refeed Day
            if(this.userProfile.goal === 'fat_loss' && this.fitnessEngineRef.recoveryStatus.score < 30) {
                return this.cycledPlan.RefeedDay;
            }
        }

        if(isLiftingDay) return this.cycledPlan.HighDay;
        
        return activeDietMacro;
    }

    logDiet(macros) {
        macros.date = new Date().toISOString();
        this.history.push(macros);
        localStorage.setItem('fitaura_diet_history', JSON.stringify(this.history));
        return { success: true };
    }
}

window.DietEngine = DietEngine;
