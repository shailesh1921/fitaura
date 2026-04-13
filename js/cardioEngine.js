/**
 * cardioEngine.js
 * The elite Endurance & Cardiovascular logic core.
 * Features: Zone 1-5 computation, VO2 Max estimation, Adaptive protocol assignment.
 */

class CardioEngine {
    constructor() {
        this.userProfile = null;
        this.fitnessEngineRef = null; 
        this.currentPlan = null;
        this.history = [];
        this.vo2Max = { score: 0, classification: 'Unknown' };
    }

    init(fitnessEngineObj = null) {
        const storedProfile = localStorage.getItem('fitaura_profile');
        if (storedProfile) {
            this.userProfile = JSON.parse(storedProfile);
        } else {
            this.userProfile = { age: 30, gender: 'male', restingHR: 65, goal: 'fat_loss' };
        }

        const storedHistory = localStorage.getItem('fitaura_cardio_history');
        if (storedHistory) this.history = JSON.parse(storedHistory);

        this.fitnessEngineRef = fitnessEngineObj;
        
        this.calculateHRZones();
        this.estimateVO2Max();
        this.generateCardioPlan();
        
        return this;
    }

    // -- 1. ZONES & METRICS --
    calculateHRZones() {
        const age = this.userProfile.age || 30;
        const maxHR = 220 - age;
        const restingHR = this.userProfile.restingHR || 65;
        const hrr = maxHR - restingHR;

        this.metrics = {
            maxHR,
            restingHR,
            zones: {
                zone1: { name: 'Active Recovery', min: Math.round((hrr * 0.5) + restingHR), max: Math.round((hrr * 0.6) + restingHR), color: '#888' },
                zone2: { name: 'Aerobic Base', min: Math.round((hrr * 0.6) + restingHR), max: Math.round((hrr * 0.7) + restingHR), color: '#00c3ff' },
                zone3: { name: 'Tempo', min: Math.round((hrr * 0.7) + restingHR), max: Math.round((hrr * 0.8) + restingHR), color: '#00ff80' },
                zone4: { name: 'Threshold', min: Math.round((hrr * 0.8) + restingHR), max: Math.round((hrr * 0.9) + restingHR), color: '#ffd700' },
                zone5: { name: 'Anaerobic / VO2 Max', min: Math.round((hrr * 0.9) + restingHR), max: maxHR, color: '#ff3366' }
            }
        };
        return this.metrics;
    }

    estimateVO2Max() {
        const age = this.userProfile.age || 30;
        const restingHR = this.userProfile.restingHR || 65;
        const maxHR = 220 - age;
        
        // Uth–Sørensen–Overgaard–Pedersen estimation
        let vo2max = 15.3 * (maxHR / restingHR);
        
        let classification = 'Poor';
        if(vo2max > 55) classification = 'Elite';
        else if(vo2max > 48) classification = 'Excellent';
        else if(vo2max > 42) classification = 'Good';
        else if(vo2max > 35) classification = 'Fair';
        
        this.vo2Max = { score: vo2max.toFixed(1), classification };
        return this.vo2Max;
    }

    // -- 2. ADAPTIVE GENERATOR --
    generateCardioPlan() {
        const goal = this.userProfile.goal || 'fat_loss';
        
        let recoveryScore = 100;
        let liftingDays = 4;
        if(this.fitnessEngineRef) {
             recoveryScore = this.fitnessEngineRef.recoveryStatus.score;
             if(this.fitnessEngineRef.currentPlan) {
                 liftingDays = this.fitnessEngineRef.currentPlan.schedule.filter(s => s.type !== 'Rest').length;
             }
        }

        const metrics = this.metrics;
        let weeklyCardio = [];

        // Dynamic adjustment based on Recovery & Goals
        if (recoveryScore < 40) {
            // High fatigue -> Force Zone 1/2 recovery
            weeklyCardio = [
                { day: 'Day 1', type: 'Active Recovery', duration: 30, hrTarget: `${metrics.zones.zone1.min}-${metrics.zones.zone1.max}`, mode: 'Walking / Cycling' },
                { day: 'Day 2', type: 'Aerobic Base', duration: 45, hrTarget: `${metrics.zones.zone2.min}-${metrics.zones.zone2.max}`, mode: 'Walking Incline' }
            ];
        } else if (goal === 'fat_loss') {
            if (liftingDays >= 5) {
                weeklyCardio = [
                    { day: 'Day 1', type: 'Zone 2 Base', duration: 45, hrTarget: `${metrics.zones.zone2.min}-${metrics.zones.zone2.max}`, mode: 'Walking Incline / Cycling' },
                    { day: 'Day 2', type: 'Zone 2 Base', duration: 45, hrTarget: `${metrics.zones.zone2.min}-${metrics.zones.zone2.max}`, mode: 'Walking Incline / Cycling' },
                    { day: 'Day 3', type: 'Zone 2 Base', duration: 30, hrTarget: `${metrics.zones.zone2.min}-${metrics.zones.zone2.max}`, mode: 'Walking Incline' }
                ];
            } else {
                weeklyCardio = [
                    { day: 'Day 1', type: 'Fat Loss HIIT', duration: 20, hrTarget: `${metrics.zones.zone4.min}+`, mode: 'Sprints (30s on, 90s off)' },
                    { day: 'Day 2', type: 'Zone 2 Base', duration: 60, hrTarget: `${metrics.zones.zone2.min}-${metrics.zones.zone2.max}`, mode: 'Walking Incline' },
                    { day: 'Day 3', type: 'Zone 2 Base', duration: 45, hrTarget: `${metrics.zones.zone2.min}-${metrics.zones.zone2.max}`, mode: 'Cycling' }
                ];
            }
        } else if (goal === 'muscle_gain') {
            weeklyCardio = [
                { day: 'Day 1', type: 'Active Recovery', duration: 20, hrTarget: `${metrics.zones.zone1.min}-${metrics.zones.zone1.max}`, mode: 'Cycling / Swimming' }
            ];
        } else {
            // Recomposition
            weeklyCardio = [
                { day: 'Day 1', type: 'Zone 3 Tempo', duration: 30, hrTarget: `${metrics.zones.zone3.min}-${metrics.zones.zone3.max}`, mode: 'Running' },
                { day: 'Day 2', type: 'Interval Day', duration: 15, hrTarget: 'Max Effort', mode: 'Treadmill Sprints or Rower' }
            ];
        }

        this.currentPlan = { schedule: weeklyCardio };
        return this.currentPlan;
    }

    logCardio(session) {
        session.date = new Date().toISOString();
        this.history.push(session);
        localStorage.setItem('fitaura_cardio_history', JSON.stringify(this.history));
        return { success: true };
    }

    getDailyStrain() {
        const today = new Date();
        const todaysLogs = this.history.filter(h => {
             const d = new Date(h.date);
             return d.toDateString() === today.toDateString();
        });

        let totalStrain = 0;
        todaysLogs.forEach(log => {
            const avgHR = log.avgHR || 130;
            const duration = log.duration || 30;
            
            let zoneMult = 1;
            if(avgHR >= this.metrics.zones.zone5.min) zoneMult = 5;
            else if(avgHR >= this.metrics.zones.zone4.min) zoneMult = 4;
            else if(avgHR >= this.metrics.zones.zone3.min) zoneMult = 3;
            else if(avgHR >= this.metrics.zones.zone2.min) zoneMult = 2;
            
            totalStrain += (duration * zoneMult);
        });

        let label = 'Low';
        let color = '#888';
        if(totalStrain > 300) { label = 'Extreme'; color = '#ff3366'; }
        else if(totalStrain > 200) { label = 'High'; color = '#ffd700'; }
        else if(totalStrain > 100) { label = 'Moderate'; color = '#00ff80'; }

        return { val: totalStrain, label, color };
    }
}

window.CardioEngine = CardioEngine;
