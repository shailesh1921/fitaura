/**
 * activityEngine.js
 * The real-time sensor processing core for Fitaura Pulse.
 * Tracks steps via DeviceMotionEvent and speed via Geolocation.
 */

class ActivityEngine {
    constructor() {
        this.data = {
            steps: 0,
            distance: 0, // km
            currentSpeed: 0, // km/h
            activeCalories: 0,
            isTracking: false,
            lastSync: Date.now()
        };

        this.accelThreshold = 12.0; // Magnitude threshold for step detection
        this.lastStepTime = 0;
        this.stepDelay = 250; // ms between valid steps

        this.init();
    }

    init() {
        // Load from LocalStorage
        const saved = localStorage.getItem('fitaura_daily_activity');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Check if it's a new day
            const lastDate = new Date(parsed.lastSync).toLocaleDateString();
            const today = new Date().toLocaleDateString();
            if (lastDate === today) {
                this.data = { ...this.data, ...parsed };
            }
        }
    }

    async requestPermission() {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const response = await DeviceMotionEvent.requestPermission();
                if (response === 'granted') {
                    this.startTracking();
                    return true;
                }
            } catch (e) {
                console.error("Sensor permission error:", e);
            }
        } else {
            // Non-iOS or older environment
            this.startTracking();
            return true;
        }
        return false;
    }

    startTracking() {
        if (this.data.isTracking) return;
        this.data.isTracking = true;

        // 1. Accelerometer for Steps
        window.addEventListener('devicemotion', (event) => this.handleMotion(event));

        // 2. Geolocation for Speed/Distance
        if ("geolocation" in navigator) {
            this.geoWatchId = navigator.geolocation.watchPosition(
                (pos) => this.handleLocation(pos),
                (err) => console.warn("Geo error:", err),
                { enableHighAccuracy: true }
            );
        }
        
        this.save();
    }

    stopTracking() {
        this.data.isTracking = false;
        window.removeEventListener('devicemotion', this.handleMotion);
        if (this.geoWatchId) navigator.geolocation.clearWatch(this.geoWatchId);
        this.save();
    }

    handleMotion(event) {
        const { x, y, z } = event.accelerationIncludingGravity || { x:0, y:0, z:0 };
        const magnitude = Math.sqrt(x*x + y*y + z*z);

        const now = Date.now();
        if (magnitude > this.accelThreshold && (now - this.lastStepTime) > this.stepDelay) {
            this.data.steps++;
            this.lastStepTime = now;
            this.calculateExpenditure();
            this.save();
            
            // Dispatch event for UI updates
            window.dispatchEvent(new CustomEvent('fitaura_activity_update', { detail: this.data }));
        }
    }

    handleLocation(position) {
        const speed = position.coords.speed; // m/s
        if (speed !== null) {
            this.data.currentSpeed = speed * 3.6; // convert to km/h
        }
        
        // Simple distance estimation would require tracking coordinates between updates
        // For now, we'll estimate distance via steps for stability
        this.data.distance = (this.data.steps * 0.0007); // ~0.7 meters per step
        this.calculateExpenditure();
        this.save();
        
        window.dispatchEvent(new CustomEvent('fitaura_activity_update', { detail: this.data }));
    }

    calculateExpenditure() {
        // Average 0.04 calories per step for a 75kg athlete
        this.data.activeCalories = Math.round(this.data.steps * 0.045);
    }

    save() {
        this.data.lastSync = Date.now();
        localStorage.setItem('fitaura_daily_activity', JSON.stringify(this.data));
    }

    getDailyStats() {
        return this.data;
    }
}

// Global Singleton
window.activityEngine = new ActivityEngine();
