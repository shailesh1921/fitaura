import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Dumbbell, Check, Trophy, X } from 'lucide-react';
import { trainingEngine } from '../engine/trainingEngine';

interface SetData {
  reps: number;
  weight: number;
  rpe: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: SetData[];
}

const INITIAL_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    sets: Array(4).fill(null).map(() => ({ reps: 10, weight: 60, rpe: 8, completed: false }))
  },
  {
    id: '2',
    name: 'Incline Dumbbell Press',
    sets: Array(3).fill(null).map(() => ({ reps: 10, weight: 24, rpe: 8, completed: false }))
  },
  {
    id: '3',
    name: 'Tricep Rope Pushdown',
    sets: Array(3).fill(null).map(() => ({ reps: 12, weight: 20, rpe: 8, completed: false }))
  }
];

export const WorkoutLogger = () => {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{status: string, suggestion: string | null} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof SetData, value: number | boolean) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const newSets = [...ex.sets];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      return { ...ex, sets: newSets };
    }));
  };

  const handleFinishWorkout = () => {
    const completedSets = exercises.flatMap(ex => ex.sets.filter(s => s.completed));
    const result = trainingEngine.analyzePerformance([], completedSets);
    setAnalysisResult(result);
    setShowModal(true);
  };

  const calculateVolume = (sets: SetData[]) => {
    return sets.filter(s => s.completed).reduce((acc, set) => acc + (set.weight * set.reps), 0);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#7000FF] to-[#00F0FF]">
            Workout Session
          </h1>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md text-[#00F0FF] font-mono">
            <Timer className="w-5 h-5" />
            <span className="text-lg">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6">
          {exercises.map((exercise, exIndex) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: exIndex * 0.1, type: "spring", stiffness: 100 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(112,0,255,0.15)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <Dumbbell className="w-6 h-6 text-[#7000FF]" />
                <h2 className="text-xl font-bold font-display">{exercise.name}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-400 uppercase font-mono border-b border-white/10">
                    <tr>
                      <th className="px-2 py-3">Set</th>
                      <th className="px-2 py-3 text-center">Weight (kg)</th>
                      <th className="px-2 py-3 text-center">Reps</th>
                      <th className="px-2 py-3 text-center">RPE</th>
                      <th className="px-2 py-3 text-center">Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIndex) => (
                      <motion.tr
                        key={setIndex}
                        animate={{
                          backgroundColor: set.completed ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                        }}
                        className="border-b border-white/5 last:border-0 transition-colors"
                      >
                        <td className="px-2 py-3 font-mono text-gray-400">{setIndex + 1}</td>
                        <td className="px-2 py-3 text-center">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => updateSet(exercise.id, setIndex, 'weight', Number(e.target.value))}
                            className="w-16 bg-white/5 border border-white/10 rounded-lg text-white text-center py-1 outline-none focus:border-[#7000FF] focus:ring-1 focus:ring-[#7000FF] transition-all font-mono"
                          />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(exercise.id, setIndex, 'reps', Number(e.target.value))}
                            className="w-16 bg-white/5 border border-white/10 rounded-lg text-white text-center py-1 outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all font-mono"
                          />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <select
                            value={set.rpe}
                            onChange={(e) => updateSet(exercise.id, setIndex, 'rpe', Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-lg text-white py-1.5 px-2 outline-none focus:border-[#7000FF] font-mono cursor-pointer appearance-none"
                          >
                            {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(val => (
                              <option key={val} value={val} className="bg-[#0A0A0F]">
                                {val}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-3 text-center flex justify-center">
                          <button
                            onClick={() => updateSet(exercise.id, setIndex, 'completed', !set.completed)}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                              set.completed
                                ? 'bg-gradient-to-r from-[#7000FF] to-[#9D4EDD] border-transparent shadow-[0_0_15px_rgba(112,0,255,0.6)]'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                          >
                            {set.completed && <Check className="w-5 h-5 text-white" />}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-end font-mono text-sm text-gray-400">
                Volume: <span className="ml-2 text-white font-bold">{calculateVolume(exercise.sets)} kg</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Finish Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFinishWorkout}
          className="w-full py-4 rounded-full bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-white font-bold text-lg shadow-[0_0_30px_rgba(112,0,255,0.4)] hover:shadow-[0_0_40px_rgba(112,0,255,0.6)] transition-all font-display"
        >
          Finish Workout
        </motion.button>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && analysisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111116] border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(112,0,255,0.2)]"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6 mt-4">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                  <Trophy className="w-10 h-10 text-[#00F0FF]" />
                </div>
                
                <h2 className="text-3xl font-display font-bold">Workout Complete</h2>
                
                <div className={`px-4 py-1.5 rounded-full text-sm font-mono font-bold uppercase tracking-wider border ${
                  analysisResult.status === 'progressing' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : analysisResult.status === 'fatigue_high'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  {analysisResult.status.replace('_', ' ')}
                </div>

                {analysisResult.suggestion && (
                  <p className="text-gray-300 leading-relaxed font-sans">
                    {analysisResult.suggestion}
                  </p>
                )}
                
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors font-bold mt-4"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
