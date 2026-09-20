import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { BottomTabBar } from './components/BottomTabBar';
import Navbar from './components/Navbar';
import { AnimatePresence, motion } from 'motion/react';
import { BeastModeProvider } from './context/BeastModeContext';

// Existing Pages (PRESERVED)
import { Dashboard } from './pages/Dashboard';
import { AICoach } from './pages/AICoach';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { WorkoutLogger } from './pages/WorkoutLogger';

// NEW Pages
import { MuscleHeatmap } from './pages/MuscleHeatmap';
import { NutritionEngine } from './pages/NutritionEngine';
import { PerformanceDashboard } from './pages/PerformanceDashboard';

// Animated route wrapper for smooth page transitions
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-screen"
      >
        <Routes location={location}>
          {/* Existing Routes (PRESERVED) */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutLogger />} />
          <Route path="/diet" element={<AICoach />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* NEW Routes */}
          <Route path="/heatmap" element={<MuscleHeatmap />} />
          <Route path="/nutrition" element={<NutritionEngine />} />
          <Route path="/analytics-dashboard" element={<PerformanceDashboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });
    }
  }, []);

  return (
    <BeastModeProvider>
      <Router>
        <div className="min-h-screen bg-[#08080A] text-white pb-[75px] md:pb-0">
          <Navbar />
          <AnimatedRoutes />
          <BottomTabBar />
        </div>
      </Router>
    </BeastModeProvider>
  );
}

export default App;
