/**
 * analytics.js
 * Exposes methods to render elite visual charts (Volume, Weight, Recovery)
 */

class AnalyticsEngine {
    constructor() {
        this.fEngine = new window.FitnessEngine();
        this.cEngine = new window.CardioEngine();
        this.fEngine.init();
        this.cEngine.init(this.fEngine);
        
        // Setup default chart styles
        Chart.defaults.color = '#fff';
        Chart.defaults.font.family = "'Outfit', sans-serif";
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0,0,0,0.8)';
        Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';
    }

    renderVolumeGrid(ctx) {
        // Group history by date (last 7 workouts)
        const hist = this.fEngine.history.slice(-7);
        const labels = hist.map(h => new Date(h.date).toLocaleDateString('en-US', {weekday: 'short'}));
        
        const data = hist.map(h => {
            // Volume = Sets * Reps * Weight
            let vol = 0;
            if(h.exercises) {
                h.exercises.forEach(ex => {
                    vol += ((ex.sets || 3) * (ex.reps || 10) * (ex.weight || 1));
                });
            }
            return vol;
        });

        if(!data.length) {
            labels.push('No Data'); data.push(0);
        }

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Session Volume Load (kg)',
                    data: data,
                    backgroundColor: 'rgba(112, 0, 255, 0.6)',
                    borderColor: 'rgba(112, 0, 255, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    renderRecoveryTrend(ctx) {
        // Mock a 7-day trend based on current recovery + variance
        const currentRec = this.fEngine.recoveryStatus.score;
        let data = [Math.min(100, currentRec + 15), currentRec + 5, currentRec - 10, currentRec - 5, currentRec + 10, currentRec - 20, currentRec];
        data = data.map(d => Math.max(10, Math.min(100, d)));
        
        const labels = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CNS Recovery %',
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(0, 255, 128, 0.1)',
                    borderColor: '#00ff80',
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#00ff80',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 100 }
                }
            }
        });
    }

    renderCardioStrain(ctx) {
        // Zone distribution based on most recent log or mock
        const latestCardio = this.cEngine.history.slice(-1)[0] || { duration: 45, avgHR: 135 }; 
        const metrics = this.cEngine.metrics;
        let z = 2; // default
        if (latestCardio.avgHR >= metrics.zones.zone5.min) z=5;
        else if (latestCardio.avgHR >= metrics.zones.zone4.min) z=4;
        else if (latestCardio.avgHR >= metrics.zones.zone3.min) z=3;
        else if (latestCardio.avgHR >= metrics.zones.zone2.min) z=2;
        else z=1;

        // Mock 5 zones distribution for the visual
        let dist = [10, 60, 20, 10, 0];
        if(z===5) dist = [5, 10, 20, 25, 40];
        if(z===4) dist = [5, 20, 30, 40, 5];
        if(z===1) dist = [80, 20, 0, 0, 0];

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
                datasets: [{
                    data: dist,
                    backgroundColor: ['#888', '#00c3ff', '#00ff80', '#ffd700', '#ff3366'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    }

    renderStrengthProgression(ctx) {
        // Track the heaviest lift historically for Barbell Bench Press as a proxy
        let progression = [];
        this.fEngine.history.forEach(h => {
            if(h.exercises) {
                const bench = h.exercises.find(e => e.id === 'ex_1' || e.name.includes('Press'));
                if(bench && bench.weight) {
                    progression.push(bench.weight);
                }
            }
        });

        // If no data, mock a progression line
        if(progression.length < 2) {
            progression = [60, 62.5, 62.5, 65, 67.5, 67.5, 70];
        }

        const labels = progression.map((_, i) => `Wk ${i+1}`);

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calculated 1RM (kg)',
                    data: progression,
                    fill: false,
                    borderColor: '#ff3366',
                    tension: 0.2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ff3366',
                    pointRadius: 4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }

    renderWeightTrend(ctx) {
        let wt = this.fEngine.userProfile ? this.fEngine.userProfile.weight : 75;
        let goal = this.fEngine.userProfile ? this.fEngine.userProfile.goal : 'fat_loss';
        
        // Mocking weight shift based on goal
        let trend = [];
        for(let i=6; i>=0; i--) {
            let shift = (goal === 'fat_loss') ? (i * 0.2) : (goal === 'muscle_gain' ? -(i * 0.1) : 0);
            let variance = (Math.random() * 0.4) - 0.2;
            trend.push(wt + shift + variance);
        }

        const labels = ['-6w', '-5w', '-4w', '-3w', '-2w', '-1w', 'Current'];

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Body Weight (kg)',
                    data: trend,
                    fill: {
                        target: 'origin',
                        above: 'rgba(255, 215, 0, 0.1)'
                    },
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderColor: '#ffd700',
                    tension: 0.4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ffd700',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: wt - 5, max: wt + 5 }
                }
            }
        });
    }
}

window.AnalyticsEngine = AnalyticsEngine;
