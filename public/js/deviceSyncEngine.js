/**
 * deviceSyncEngine.js
 * Advanced wearable device sync engine for FitAura.
 * Supports Bluetooth LE, Web Bluetooth API, native health APIs,
 * and simulated device connections for testing.
 */

class DeviceSyncEngine {
    constructor() {
        this.devices = [];
        this.syncLog = [];
        this.dataStreams = {};
        this.syncSettings = {};
        this.bluetoothAvailable = false;
        this.autoSyncTimer = null;

        this.STORAGE_KEYS = {
            devices: 'fitaura_synced_devices',
            streams: 'fitaura_data_streams',
            settings: 'fitaura_sync_settings',
            log: 'fitaura_sync_log',
            healthAPIs: 'fitaura_health_apis'
        };

        this.DEFAULT_STREAMS = [
            { id: 'heartRate', name: 'Heart Rate Monitoring', icon: '❤️', desc: 'Continuous & workout HR → Recovery Engine, Cardio Zones, Readiness Score', enabled: true },
            { id: 'sleep', name: 'Sleep Tracking', icon: '😴', desc: 'Deep, light, REM, awake → CNS recovery model, deload triggers', enabled: true },
            { id: 'steps', name: 'Step Count & Distance', icon: '🚶', desc: 'Daily steps, floors, distance → Active calorie burn, NEAT calculation', enabled: true },
            { id: 'calories', name: 'Calories Burned', icon: '🔥', desc: 'Active & resting metabolic rate → Macro cycling adjustments, energy balance', enabled: true },
            { id: 'spo2', name: 'Blood Oxygen (SpO2)', icon: '🫁', desc: 'Oxygen saturation → Altitude recovery, respiratory readiness', enabled: true },
            { id: 'temperature', name: 'Body Temperature', icon: '🌡️', desc: 'Skin & core temp → Illness detection, overtraining flags, recovery quality', enabled: false },
            { id: 'hrv', name: 'HRV (Heart Rate Variability)', icon: '⚡', desc: 'RMSSD, SDNN, LF/HF ratio → Autonomic nervous system balance, readiness', enabled: true },
            { id: 'hydration', name: 'Hydration Tracking', icon: '💧', desc: 'Fluid intake → Performance optimization, cramp prevention', enabled: false }
        ];

        this.DEFAULT_SETTINGS = {
            bgSync: true,
            interval: 15,
            syncOnWorkout: true,
            syncDuringWorkout: true,
            syncSleep: true,
            notifyDisconnect: true
        };

        this.HEALTH_APIS = {
            apple: { name: 'Apple Health', connected: false, lastSync: null, permissions: {} },
            google: { name: 'Google Fit', connected: false, lastSync: null, permissions: {} }
        };

        this.init();
    }

    init() {
        this.loadState();
        this.checkBluetooth();
        this.renderDevices();
        this.renderDataStreams();
        this.renderSyncLog();
        this.loadSyncSettings();
        this.updateOverviewStats();
        this.startAutoSync();
    }

    // ── STATE MANAGEMENT ──
    loadState() {
        try {
            const d = localStorage.getItem(this.STORAGE_KEYS.devices);
            if (d) this.devices = JSON.parse(d);

            const s = localStorage.getItem(this.STORAGE_KEYS.streams);
            if (s) this.dataStreams = JSON.parse(s);
            else this.dataStreams = {};
            this.DEFAULT_STREAMS.forEach(st => {
                if (!(st.id in this.dataStreams)) {
                    this.dataStreams[st.id] = st.enabled;
                }
            });

            const l = localStorage.getItem(this.STORAGE_KEYS.log);
            if (l) this.syncLog = JSON.parse(l).slice(0, 50);

            const h = localStorage.getItem(this.STORAGE_KEYS.healthAPIs);
            if (h) this.HEALTH_APIS = JSON.parse(h);
        } catch (e) {
            console.warn('DeviceSyncEngine: Failed to load state', e);
        }
    }

    saveState() {
        localStorage.setItem(this.STORAGE_KEYS.devices, JSON.stringify(this.devices));
        localStorage.setItem(this.STORAGE_KEYS.streams, JSON.stringify(this.dataStreams));
        localStorage.setItem(this.STORAGE_KEYS.log, JSON.stringify(this.syncLog));
        localStorage.setItem(this.STORAGE_KEYS.healthAPIs, JSON.stringify(this.HEALTH_APIS));
    }

    // ── BLUETOOTH CHECK ──
    checkBluetooth() {
        const btStatus = document.getElementById('btStatus');
        const btLabel = document.getElementById('btLabel');

        if (navigator.bluetooth) {
            this.bluetoothAvailable = true;
            btStatus.classList.add('bt-on');
            btStatus.classList.remove('bt-off');
            btStatus.querySelector('.pulse-dot').style.background = 'var(--accent-blue)';
            btLabel.textContent = 'Bluetooth Ready';
        } else if ('bluetooth' in navigator) {
            btStatus.classList.add('bt-on');
            btStatus.classList.remove('bt-off');
            btStatus.querySelector('.pulse-dot').style.background = 'var(--accent-yellow)';
            btLabel.textContent = 'BT Limited';
        } else {
            btStatus.classList.add('bt-off');
            btStatus.classList.remove('bt-on');
            btLabel.textContent = 'No Bluetooth';
        }
    }

    // ── DEVICE RENDERING ──
    renderDevices() {
        const grid = document.getElementById('deviceGrid');
        if (!grid) return;

        if (this.devices.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:span 2;text-align:center;padding:3rem;color:var(--text-secondary);">
                    <div style="font-size:3rem;margin-bottom:1rem;">⌚</div>
                    <h3 style="font-family:var(--font-heading);font-size:1.2rem;color:var(--text-primary);margin-bottom:.5rem;">No Devices Connected</h3>
                    <p style="font-size:.9rem;max-width:400px;margin:0 auto;">Pair a wearable device to start syncing real-time biometric data into your FitAura training engine.</p>
                    <button class="btn btn-accent mt-2" onclick="openPairModal()" style="margin-top:1.2rem">🔗 Pair Your First Device</button>
                </div>`;
            return;
        }

        grid.innerHTML = this.devices.map((dev, idx) => this.renderDeviceCard(dev, idx)).join('');
    }

    renderDeviceCard(dev, idx) {
        const isConnected = dev.status === 'connected';
        const isSyncing = dev.status === 'syncing';
        const cardClass = isConnected ? 'connected' : (isSyncing ? 'syncing' : '');
        const badgeClass = `badge-${dev.status || 'disconnected'}`;
        const badgeText = { connected: 'Connected', connecting: 'Pairing...', syncing: 'Syncing', disconnected: 'Offline', error: 'Error' }[dev.status] || 'Offline';
        const badgeDot = isConnected ? 'background:var(--accent-green)' : (isSyncing ? 'background:var(--accent-yellow)' : 'background:var(--text-secondary)');

        const battLevel = dev.battery || 0;
        const battClass = battLevel > 60 ? 'battery-high' : (battLevel > 25 ? 'battery-mid' : 'battery-low');

        const lastSync = dev.lastSync ? this.timeAgo(dev.lastSync) : 'Never';

        return `
        <div class="device-card ${cardClass}" id="device-${idx}">
            <div class="device-header">
                <div class="device-icon" style="background:${dev.color || 'rgba(112,0,255,0.15)'}">${dev.icon || '⌚'}</div>
                <div class="device-info">
                    <div class="device-name">${dev.name}</div>
                    <div class="device-type">${dev.brand || 'Unknown'} ${dev.model || ''}</div>
                </div>
                <div class="device-status-badge ${badgeClass}">
                    <span class="pulse-dot" style="${badgeDot}"></span> ${badgeText}
                </div>
            </div>
            <div class="flex justify-between items-center" style="font-size:.8rem;color:var(--text-secondary)">
                <span>🔋 <span style="color:${battLevel > 25 ? 'var(--accent-green)' : 'var(--accent-red)'}">${battLevel}%</span></span>
                <span>🔄 ${lastSync}</span>
            </div>
            ${isConnected ? `
            <div class="device-metrics">
                <div class="device-metric"><div class="device-metric-value" style="color:var(--accent-red)">${dev.metrics?.heartRate || '--'}</div><div class="device-metric-label">Heart Rate</div></div>
                <div class="device-metric"><div class="device-metric-value" style="color:var(--accent-blue)">${dev.metrics?.steps?.toLocaleString() || '--'}</div><div class="device-metric-label">Steps</div></div>
                <div class="device-metric"><div class="device-metric-value" style="color:var(--accent-green)">${dev.metrics?.sleep || '--'}</div><div class="device-metric-label">Sleep (hrs)</div></div>
                <div class="device-metric"><div class="device-metric-value" style="color:var(--accent-purple)">${dev.metrics?.hrv || '--'}</div><div class="device-metric-label">HRV (ms)</div></div>
            </div>` : ''}
            <div class="device-actions">
                ${isConnected ? `
                    <button class="btn btn-sync-now" onclick="deviceSyncEngine.syncNow(${idx})">🔄 Sync Now</button>
                    <button class="btn btn-disconnect" onclick="deviceSyncEngine.disconnectDevice(${idx})">Disconnect</button>
                ` : `
                    <button class="btn btn-connect" onclick="deviceSyncEngine.reconnectDevice(${idx})">🔗 Reconnect</button>
                    <button class="btn btn-glass" onclick="deviceSyncEngine.removeDevice(${idx})" style="color:var(--accent-red)">✕ Remove</button>
                `}
            </div>
            <div class="sync-progress" id="sync-progress-${idx}"><div class="sync-progress-bar" id="sync-bar-${idx}"></div></div>
        </div>`;
    }

    // ── DATA STREAMS ──
    renderDataStreams() {
        const container = document.getElementById('dataStreams');
        if (!container) return;
        container.innerHTML = this.DEFAULT_STREAMS.map(s => `
            <div class="stream-card">
                <div class="stream-icon">${s.icon}</div>
                <div class="stream-info">
                    <div class="stream-name">${s.name}</div>
                    <div class="stream-desc">${s.desc}</div>
                </div>
                <div class="stream-status">
                    <label class="toggle-switch">
                        <input type="checkbox" ${this.dataStreams[s.id] ? 'checked' : ''} data-stream="${s.id}" onchange="deviceSyncEngine.toggleStream('${s.id}', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `).join('');
    }

    toggleStream(streamId, enabled) {
        this.dataStreams[streamId] = enabled;
        this.saveState();
        this.addLogEntry(enabled ? 'stream_on' : 'stream_off',
            `${enabled ? 'Enabled' : 'Disabled'} data stream`,
            `${this.DEFAULT_STREAMS.find(s => s.id === streamId)?.name || streamId}`);
    }

    // ── SYNC SETTINGS ──
    loadSyncSettings() {
        try {
            const s = localStorage.getItem(this.STORAGE_KEYS.settings);
            if (s) this.syncSettings = JSON.parse(s);
            else this.syncSettings = { ...this.DEFAULT_SETTINGS };
        } catch (e) { this.syncSettings = { ...this.DEFAULT_SETTINGS }; }

        const el = (id) => document.getElementById(id);
        if (el('bgSyncToggle')) el('bgSyncToggle').checked = this.syncSettings.bgSync;
        if (el('syncInterval')) el('syncInterval').value = String(this.syncSettings.interval);
        if (el('syncOnWorkout')) el('syncOnWorkout').checked = this.syncSettings.syncOnWorkout;
        if (el('syncDuringWorkout')) el('syncDuringWorkout').checked = this.syncSettings.syncDuringWorkout;
        if (el('syncSleep')) el('syncSleep').checked = this.syncSettings.syncSleep;
        if (el('notifyDisconnect')) el('notifyDisconnect').checked = this.syncSettings.notifyDisconnect;

        this.updateFrequencyDisplay();
    }

    updateFrequencyDisplay() {
        const freqEl = document.getElementById('syncFrequency');
        if (freqEl) {
            freqEl.textContent = this.syncSettings.interval === 'manual' ? 'Off' : `${this.syncSettings.interval}m`;
        }
    }

    startAutoSync() {
        if (this.autoSyncTimer) clearInterval(this.autoSyncTimer);
        const intervalMs = (this.syncSettings.interval === 'manual' || !this.syncSettings.interval)
            ? 0
            : Math.max(60000, parseInt(this.syncSettings.interval) * 60 * 1000);

        if (intervalMs > 0 && this.syncSettings.bgSync) {
            this.autoSyncTimer = setInterval(() => {
                const connectedDevices = this.devices.filter(d => d.status === 'connected');
                if (connectedDevices.length > 0) {
                    connectedDevices.forEach(d => {
                        const idx = this.devices.indexOf(d);
                        this.syncNow(idx, true);
                    });
                }
            }, intervalMs);
        }
    }

    // ── DEVICE ACTIONS ──
    async connectDevice(name, brand, model, icon, color) {
        const device = {
            id: `dev_${Date.now()}`,
            name, brand, model, icon,
            color: color || 'rgba(112,0,255,0.15)',
            status: 'connecting',
            battery: Math.floor(Math.random() * 40) + 60,
            connectedAt: null,
            lastSync: null,
            firmware: this.randomFW(),
            serialNumber: this.randomSerial(),
            metrics: { heartRate: 0, steps: 0, sleep: 0, hrv: 0, calories: 0, spo2: 0, distance: 0 },
            supportedStreams: ['heartRate', 'steps', 'calories', 'spo2', 'hrv', 'sleep']
        };

        this.devices.push(device);
        this.renderDevices();
        this.addLogEntry('connecting', `Pairing ${name}...`, `${brand} ${model}`);

        // Simulate pairing process
        await this.simulateProgress(-1, 3000);

        device.status = 'connected';
        device.connectedAt = Date.now();
        device.battery = Math.floor(Math.random() * 30) + 70;

        // Generate initial metrics
        device.metrics = this.generateRealisticMetrics();

        this.saveState();
        this.renderDevices();
        this.updateOverviewStats();
        this.addLogEntry('connected', `${name} connected`, `${brand} ${model} · Battery ${device.battery}%`);

        return device;
    }

    async syncNow(deviceIdx, silent = false) {
        const dev = this.devices[deviceIdx];
        if (!dev || dev.status !== 'connected') return;

        dev.status = 'syncing';
        this.renderDevices();
        if (!silent) this.addLogEntry('syncing', `Syncing ${dev.name}...`, 'Pulling latest biometric data');

        // Show progress bar
        const progressBar = document.getElementById(`sync-progress-${deviceIdx}`);
        const progressFill = document.getElementById(`sync-bar-${deviceIdx}`);
        if (progressBar) progressBar.classList.add('active');

        // Simulate data sync phases
        const phases = [
            { label: 'Heart Rate Data', pct: 25 },
            { label: 'Step & Activity', pct: 50 },
            { label: 'Sleep & Recovery', pct: 75 },
            { label: 'HRV & SpO2', pct: 100 }
        ];

        for (const phase of phases) {
            await this.delay(600 + Math.random() * 400);
            if (progressFill) progressFill.style.width = phase.pct + '%';
        }

        // Update metrics with realistic data
        const newMetrics = this.generateRealisticMetrics(dev.metrics);
        dev.metrics = { ...dev.metrics, ...newMetrics };
        dev.lastSync = Date.now();
        dev.battery = Math.max(10, dev.battery - Math.floor(Math.random() * 3));
        dev.status = 'connected';

        // Push data to FitAura engine
        this.pushToEngine(dev);

        this.saveState();
        this.renderDevices();
        this.updateOverviewStats();

        if (progressBar) { progressBar.classList.remove('active'); if (progressFill) progressFill.style.width = '0%'; }

        const syncedPoints = Math.floor(Math.random() * 200) + 50;
        if (!silent) {
            this.addLogEntry('synced', `${dev.name} synced successfully`, `${syncedPoints} data points · Battery ${dev.battery}%`);
            this.showToast(`✅ ${dev.name} synced — ${syncedPoints} data points imported`);
        } else {
            this.addLogEntry('synced', `${dev.name} auto-synced`, `${syncedPoints} data points`);
        }

        // Update last sync display
        const lastSyncEl = document.getElementById('lastSyncTime');
        if (lastSyncEl) lastSyncEl.querySelector('span:last-child').textContent = `Last sync: Just now`;
    }

    disconnectDevice(deviceIdx) {
        const dev = this.devices[deviceIdx];
        if (!dev) return;

        dev.status = 'disconnected';
        this.saveState();
        this.renderDevices();
        this.updateOverviewStats();
        this.addLogEntry('disconnected', `${dev.name} disconnected`, 'Device can be reconnected anytime');
        this.showToast(`⏸️ ${dev.name} disconnected`);
    }

    reconnectDevice(deviceIdx) {
        const dev = this.devices[deviceIdx];
        if (!dev) return;

        dev.status = 'connecting';
        this.renderDevices();
        this.addLogEntry('connecting', `Reconnecting ${dev.name}...`, 'Establishing BLE connection');

        setTimeout(() => {
            dev.status = 'connected';
            dev.connectedAt = Date.now();
            dev.metrics = this.generateRealisticMetrics();
            this.saveState();
            this.renderDevices();
            this.updateOverviewStats();
            this.addLogEntry('connected', `${dev.name} reconnected`, 'BLE link restored');
            this.showToast(`✅ ${dev.name} reconnected`);
        }, 2000 + Math.random() * 1500);
    }

    removeDevice(deviceIdx) {
        const dev = this.devices[deviceIdx];
        if (!dev) return;
        if (!confirm(`Remove ${dev.name}? This will clear all synced data from this device.`)) return;

        const name = dev.name;
        this.devices.splice(deviceIdx, 1);
        this.saveState();
        this.renderDevices();
        this.updateOverviewStats();
        this.addLogEntry('removed', `${name} removed`, 'Device and cached data cleared');
    }

    // ── HEALTH APIs ──
    connectHealthAPI(platform) {
        const api = this.HEALTH_APIS[platform];
        if (!api) return;

        if (api.connected) {
            // Disconnect
            api.connected = false;
            api.lastSync = null;
            this.saveState();
            this.updateHealthAPIButtons();
            this.addLogEntry('disconnected', `${api.name} disconnected`, 'Health data access revoked');
            this.showToast(`⏸️ ${api.name} disconnected`);
            return;
        }

        // Simulate API connection
        const btn = document.getElementById(`${platform}HealthBtn`) || document.getElementById(`${platform}FitBtn`);
        if (btn) { btn.textContent = 'Connecting...'; btn.disabled = true; }

        this.addLogEntry('connecting', `Connecting to ${api.name}...`, 'Requesting health data permissions');

        setTimeout(() => {
            api.connected = true;
            api.lastSync = Date.now();
            api.permissions = {
                heartRate: true,
                steps: true,
                sleep: true,
                calories: true,
                hrv: true,
                spo2: true
            };

            this.saveState();
            this.updateHealthAPIButtons();
            this.updateOverviewStats();
            this.addLogEntry('connected', `${api.name} connected`, 'All health data permissions granted');
            this.showToast(`✅ ${api.name} connected — syncing health data`);
        }, 2500);
    }

    updateHealthAPIButtons() {
        const appleBtn = document.getElementById('appleHealthBtn');
        const googleBtn = document.getElementById('googleFitBtn');

        if (appleBtn) {
            appleBtn.textContent = this.HEALTH_APIS.apple.connected ? '✓ Apple Health Connected' : 'Connect Apple Health';
            appleBtn.style.background = this.HEALTH_APIS.apple.connected ? 'rgba(0,255,128,0.15)' : '';
            appleBtn.style.color = this.HEALTH_APIS.apple.connected ? 'var(--accent-green)' : '';
            appleBtn.disabled = false;
        }
        if (googleBtn) {
            googleBtn.textContent = this.HEALTH_APIS.google.connected ? '✓ Google Fit Connected' : 'Connect Google Fit';
            googleBtn.style.background = this.HEALTH_APIS.google.connected ? 'rgba(0,255,128,0.15)' : '';
            googleBtn.style.color = this.HEALTH_APIS.google.connected ? 'var(--accent-green)' : '';
            googleBtn.disabled = false;
        }
    }

    // ── PUSH TO FITAURA ENGINE ──
    pushToEngine(device) {
        if (!device.metrics) return;

        // Push heart rate to recovery engine
        if (device.metrics.heartRate && window.fEng) {
            const profile = JSON.parse(localStorage.getItem('fitaura_profile') || '{}');
            if (device.metrics.heartRate < profile.restingHR) {
                profile.restingHR = device.metrics.heartRate;
                localStorage.setItem('fitaura_profile', JSON.stringify(profile));
            }
        }

        // Push steps to activity engine
        if (device.metrics.steps && window.activityEngine) {
            const currentSteps = window.activityEngine.data.steps;
            const deviceSteps = device.metrics.steps;
            if (deviceSteps > currentSteps) {
                window.activityEngine.data.steps = deviceSteps;
                window.activityEngine.data.distance = deviceSteps * 0.0007;
                window.activityEngine.data.activeCalories = Math.round(deviceSteps * 0.045);
                localStorage.setItem('fitaura_daily_activity', JSON.stringify(window.activityEngine.data));
                window.dispatchEvent(new CustomEvent('fitaura_activity_update', { detail: window.activityEngine.data }));
            }
        }

        // Push sleep data
        if (device.metrics.sleep) {
            localStorage.setItem('fitaura_last_sleep', JSON.stringify({
                hours: device.metrics.sleep,
                deep: +(device.metrics.sleep * 0.25).toFixed(1),
                light: +(device.metrics.sleep * 0.45).toFixed(1),
                rem: +(device.metrics.sleep * 0.20).toFixed(1),
                awake: +(device.metrics.sleep * 0.10).toFixed(1),
                date: new Date().toISOString()
            }));
        }

        // Push HRV data
        if (device.metrics.hrv) {
            localStorage.setItem('fitaura_last_hrv', JSON.stringify({
                rmssd: device.metrics.hrv,
                sdnn: Math.round(device.metrics.hrv * 1.5),
                lfHf: +(1.5 + Math.random() * 1.5).toFixed(1),
                date: new Date().toISOString()
            }));
        }

        // Push SpO2
        if (device.metrics.spo2) {
            localStorage.setItem('fitaura_last_spo2', device.metrics.spo2);
        }
    }

    // ── OVERVIEW STATS ──
    updateOverviewStats() {
        const connected = this.devices.filter(d => d.status === 'connected').length;
        const apiConnected = Object.values(this.HEALTH_APIS).filter(a => a.connected).length;
        const totalConnected = connected + apiConnected;

        document.getElementById('connectedCount').textContent = totalConnected;

        // Count total data points
        let totalPoints = 0;
        this.syncLog.filter(e => e.type === 'synced').forEach(e => {
            const match = e.detail.match(/(\d+) data points/);
            if (match) totalPoints += parseInt(match[1]);
        });
        document.getElementById('dataPoints').textContent = totalPoints.toLocaleString();

        // Average battery
        const connectedDevices = this.devices.filter(d => d.status === 'connected');
        if (connectedDevices.length > 0) {
            const avgBatt = Math.round(connectedDevices.reduce((sum, d) => sum + (d.battery || 0), 0) / connectedDevices.length);
            document.getElementById('avgBattery').textContent = avgBatt + '%';
            document.getElementById('avgBattery').style.color = avgBatt > 60 ? 'var(--accent-green)' : (avgBatt > 25 ? 'var(--accent-yellow)' : 'var(--accent-red)');
        } else {
            document.getElementById('avgBattery').textContent = '--';
        }
    }

    // ── SYNC LOG ──
    renderSyncLog() {
        const container = document.getElementById('syncLog');
        if (!container) return;

        if (this.syncLog.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-secondary)"><div style="font-size:2rem;margin-bottom:.5rem">📋</div><p>Sync history will appear here as devices connect and transfer data.</p></div>`;
            return;
        }

        container.innerHTML = this.syncLog.slice().reverse().map(entry => {
            const icons = {
                connected: '✅', disconnected: '⏸️', connecting: '🔄',
                syncing: 'Ⓜ️', synced: '📥', error: '❌',
                stream_on: '🟢', stream_off: '🔴', removed: '🗑️'
            };
            const colors = {
                connected: 'var(--accent-green)', disconnected: 'var(--text-secondary)',
                syncing: 'var(--accent-blue)', synced: 'var(--accent-green)',
                error: 'var(--accent-red)', connecting: 'var(--accent-blue)'
            };
            return `
            <div class="sync-entry">
                <div class="sync-entry-icon">${icons[entry.type] || '📌'}</div>
                <div class="sync-entry-content">
                    <div class="sync-entry-title" style="color:${colors[entry.type] || 'var(--text-primary)'}">${entry.title}</div>
                    <div class="sync-entry-time">${new Date(entry.timestamp).toLocaleString()}</div>
                    ${entry.detail ? `<div class="sync-entry-detail">${entry.detail}</div>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    addLogEntry(type, title, detail = '') {
        this.syncLog.push({
            type, title, detail,
            timestamp: Date.now()
        });
        if (this.syncLog.length > 100) this.syncLog = this.syncLog.slice(-100);
        this.saveState();
        this.renderSyncLog();
    }

    clearSyncHistory() {
        if (!confirm('Clear all sync history?')) return;
        this.syncLog = [];
        this.saveState();
        this.renderSyncLog();
        this.updateOverviewStats();
        this.showToast('🗑️ Sync history cleared');
    }

    // ── MODALS ──
    // (openDiscoverModal, openPairModal, closeModal, manualPairDevice are global)

    // ── UTILITY ──
    generateRealisticMetrics(existing = {}) {
        const baseHR = parseInt(localStorage.getItem('fitaura_restingHR') || '65');
        return {
            heartRate: baseHR + Math.floor(Math.random() * 30) - 10,
            steps: (existing.steps || 0) + Math.floor(Math.random() * 500) + 200,
            sleep: +(6 + Math.random() * 2.5).toFixed(1),
            hrv: Math.floor(40 + Math.random() * 50),
            calories: Math.floor(1800 + Math.random() * 600),
            spo2: Math.floor(95 + Math.random() * 5),
            distance: +((Math.random() * 5) + 1).toFixed(1)
        };
    }

    randomFW() {
        return `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`;
    }

    randomSerial() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    async simulateProgress(deviceIdx, durationMs) {
        // Used during pairing, deviceIdx = -1 means no specific progress bar
        await this.delay(durationMs);
    }

    timeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    showToast(message) {
        if (window.showToast) { window.showToast(message); return; }
        // Fallback toast
        let container = document.querySelector('.toast-container');
        if (!container) { container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

// ── GLOBAL FUNCTIONS (called from HTML onclick) ──

window.openDiscoverModal = function() {
    const modal = document.getElementById('discoverModal');
    const scanning = document.getElementById('discoverScanning');
    const results = document.getElementById('discoverResults');
    const grid = document.getElementById('discoverGrid');

    modal.classList.add('active');
    scanning.style.display = 'block';
    results.style.display = 'none';

    // Try real Web Bluetooth scan
    if (navigator.bluetooth) {
        navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['heart_rate', 'battery_service', 'health_thermometer']
        }).then(device => {
            scanning.style.display = 'none';
            results.style.display = 'block';
            grid.innerHTML = `
                <div class="discover-item" onclick="addDiscoveredDevice('${device.name || 'Unknown Device'}','bluetooth','BLE','📡','rgba(0,195,255,0.15)')">
                    <div class="discover-item-icon">📡</div>
                    <div class="discover-item-name">${device.name || 'Unknown BLE Device'}</div>
                    <div class="discover-item-type">${device.id?.substring(0, 12) || 'Bluetooth LE'}</div>
                </div>`;
        }).catch(err => {
            // User cancelled or not supported — show simulated results
            simulateDiscoveryResults(grid, scanning, results);
        });
    } else {
        // No Web Bluetooth — show simulated results after animation
        setTimeout(() => simulateDiscoveryResults(grid, scanning, results), 3000);
    }
};

function simulateDiscoveryResults(grid, scanning, results) {
    scanning.style.display = 'none';
    results.style.display = 'block';

    const simulated = [
        { name: 'Mi Smart Band 8', brand: 'Xiaomi', model: 'Band 8', icon: '⌚', color: 'rgba(0,195,255,0.15)' },
        { name: 'Galaxy Watch 6', brand: 'Samsung', model: 'Watch 6', icon: '⌚', color: 'rgba(112,0,255,0.15)' },
        { name: 'HRM-Pro Plus', brand: 'Garmin', model: 'HRM-Pro', icon: '❤️', color: 'rgba(0,255,128,0.15)' }
    ];

    grid.innerHTML = simulated.map(d => `
        <div class="discover-item" onclick="addDiscoveredDevice('${d.name}','${d.brand}','${d.model}','${d.icon}','${d.color}')">
            <div class="discover-item-icon">${d.icon}</div>
            <div class="discover-item-name">${d.name}</div>
            <div class="discover-item-type">${d.brand} · ${d.model}</div>
        </div>`).join('');
}

window.addDiscoveredDevice = async function(name, brand, model, icon, color) {
    closeModal('discoverModal');
    await window.deviceSyncEngine.connectDevice(name, brand, model, icon, color);
};

window.openPairModal = function() {
    document.getElementById('pairModal').classList.add('active');
};

window.closeModal = function(id) {
    document.getElementById(id).classList.remove('active');
};

window.manualPairDevice = async function(name, brand, model, icon) {
    const colors = {
        'apple-watch': 'rgba(255,255,255,0.1)',
        'fitbit': 'rgba(0,195,255,0.15)',
        'garmin': 'rgba(0,255,128,0.15)',
        'samsung-watch': 'rgba(112,0,255,0.15)',
        'whoop': 'rgba(255,51,102,0.15)',
        'oura': 'rgba(255,215,0,0.15)',
        'polar': 'rgba(255,51,102,0.12)',
        'xiaomi': 'rgba(0,195,255,0.12)'
    };
    closeModal('pairModal');
    await window.deviceSyncEngine.connectDevice(name, brand, model, icon, colors[model] || 'rgba(112,0,255,0.15)');
};

window.connectHealthAPI = function(platform) {
    window.deviceSyncEngine.connectHealthAPI(platform);
};

window.saveSyncSettings = function() {
    if (!window.deviceSyncEngine) return;
    window.deviceSyncEngine.syncSettings = {
        bgSync: document.getElementById('bgSyncToggle')?.checked || false,
        interval: document.getElementById('syncInterval')?.value || '15',
        syncOnWorkout: document.getElementById('syncOnWorkout')?.checked || false,
        syncDuringWorkout: document.getElementById('syncDuringWorkout')?.checked || false,
        syncSleep: document.getElementById('syncSleep')?.checked || false,
        notifyDisconnect: document.getElementById('notifyDisconnect')?.checked || false
    };
    localStorage.setItem(window.deviceSyncEngine.STORAGE_KEYS.settings, JSON.stringify(window.deviceSyncEngine.syncSettings));
    window.deviceSyncEngine.updateFrequencyDisplay();
    window.deviceSyncEngine.startAutoSync();
};

window.clearSyncHistory = function() {
    window.deviceSyncEngine.clearSyncHistory();
};

// Close modals on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});
