import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion } from 'motion/react';
import { Activity, Info } from 'lucide-react';

const fatigueData = {
  Chest: 72,
  Back: 45,
  Quads: 85,
  Hamstrings: 60,
  Shoulders: 38,
  Biceps: 55,
  Triceps: 68,
  Calves: 20
};

const getColor = (fatigue: number) => {
  if (fatigue <= 30) return '#10B981'; // Green
  if (fatigue <= 60) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
};

interface BodyPartProps {
  position: [number, number, number];
  scale: [number, number, number];
  fatigue: number;
  label: string;
  showLabel?: boolean;
  shape?: 'box' | 'cylinder' | 'sphere';
}

const BodyPart = ({ position, scale, fatigue, label, showLabel = false, shape = 'box' }: BodyPartProps) => {
  const color = getColor(fatigue);
  const emissiveIntensity = fatigue / 100;

  return (
    <mesh position={position} scale={scale}>
      {shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {shape === 'cylinder' && <cylinderGeometry args={[1, 1, 1, 32]} />}
      {shape === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={emissiveIntensity * 1.5} 
        roughness={0.2}
        metalness={0.8}
      />
      {showLabel && (
        <Html distanceFactor={15} center>
          <div className="bg-black/80 text-white font-mono text-xs px-2 py-1 rounded border border-white/20 whitespace-nowrap shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <span style={{ color }}>{label}</span>: {fatigue}%
          </div>
        </Html>
      )}
    </mesh>
  );
};

const Humanoid = ({ data }: { data: Record<string, number> }) => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Head */}
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Chest */}
      <BodyPart position={[0, 1.4, 0.15]} scale={[1.2, 1.2, 0.3]} fatigue={data.Chest} label="Chest" showLabel={true} />
      
      {/* Back */}
      <BodyPart position={[0, 1.4, -0.15]} scale={[1.2, 1.2, 0.3]} fatigue={data.Back} label="Back" showLabel={true} />

      {/* Shoulders */}
      <BodyPart position={[-0.8, 1.8, 0]} scale={[0.4, 0.4, 0.4]} shape="sphere" fatigue={data.Shoulders} label="Shoulders" showLabel={true} />
      <BodyPart position={[0.8, 1.8, 0]} scale={[0.4, 0.4, 0.4]} shape="sphere" fatigue={data.Shoulders} label="Shoulders" />

      {/* Biceps (front of arm) */}
      <BodyPart position={[-0.9, 1.1, 0.1]} scale={[0.25, 0.9, 0.2]} fatigue={data.Biceps} label="Biceps" showLabel={true} />
      <BodyPart position={[0.9, 1.1, 0.1]} scale={[0.25, 0.9, 0.2]} fatigue={data.Biceps} label="Biceps" />

      {/* Triceps (back of arm) */}
      <BodyPart position={[-0.9, 1.1, -0.1]} scale={[0.25, 0.9, 0.2]} fatigue={data.Triceps} label="Triceps" showLabel={true} />
      <BodyPart position={[0.9, 1.1, -0.1]} scale={[0.25, 0.9, 0.2]} fatigue={data.Triceps} label="Triceps" />

      {/* Forearms */}
      <mesh position={[-0.9, 0.1, 0]} scale={[0.2, 0.9, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0.9, 0.1, 0]} scale={[0.2, 0.9, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Pelvis */}
      <mesh position={[0, 0.5, 0]} scale={[1.1, 0.5, 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Quads (front of thigh) */}
      <BodyPart position={[-0.35, -0.5, 0.15]} scale={[0.4, 1.3, 0.3]} fatigue={data.Quads} label="Quads" showLabel={true} />
      <BodyPart position={[0.35, -0.5, 0.15]} scale={[0.4, 1.3, 0.3]} fatigue={data.Quads} label="Quads" />

      {/* Hamstrings (back of thigh) */}
      <BodyPart position={[-0.35, -0.5, -0.15]} scale={[0.4, 1.3, 0.3]} fatigue={data.Hamstrings} label="Hamstrings" showLabel={true} />
      <BodyPart position={[0.35, -0.5, -0.15]} scale={[0.4, 1.3, 0.3]} fatigue={data.Hamstrings} label="Hamstrings" />

      {/* Calves (back of lower leg) */}
      <BodyPart position={[-0.35, -2.0, -0.1]} scale={[0.3, 1.4, 0.2]} fatigue={data.Calves} label="Calves" showLabel={true} />
      <BodyPart position={[0.35, -2.0, -0.1]} scale={[0.3, 1.4, 0.2]} fatigue={data.Calves} label="Calves" />

      {/* Shins (front of lower leg) */}
      <mesh position={[-0.35, -2.0, 0.1]} scale={[0.3, 1.4, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0.35, -2.0, 0.1]} scale={[0.3, 1.4, 0.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
};

export const MuscleHeatmap = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white p-6 pb-24 md:pb-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-[#7000FF] to-[#00F0FF] text-transparent bg-clip-text">
              Muscle Fatigue Analysis
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00F0FF]" />
              Real-time biomechanical load tracking
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex gap-4 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-full px-6 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]"></div> 
              Fresh
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-[0_0_10px_#F59E0B]"></div> 
              Moderate
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-[0_0_10px_#EF4444]"></div> 
              Fatigued
            </div>
          </div>
        </div>

        {/* 3D Canvas Area */}
        <div className="relative w-full h-[500px] md:h-[600px] bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs text-gray-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <Info className="w-3 h-3" />
            Drag to rotate, scroll to zoom
          </div>
          
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <OrbitControls 
              enablePan={false} 
              minPolarAngle={Math.PI / 4} 
              maxPolarAngle={Math.PI / 1.5}
              minDistance={4}
              maxDistance={10}
            />
            <Humanoid data={fatigueData} />
          </Canvas>
          
          {/* Subtle overlay glow */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent opacity-80" />
        </div>

        {/* Muscle Cards List */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(fatigueData).map(([muscle, fatigue]) => (
            <motion.div 
              key={muscle} 
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 font-mono text-sm">{muscle}</span>
                <span 
                  className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                  style={{ color: getColor(fatigue) }}
                >
                  {fatigue <= 30 ? 'Fresh' : fatigue <= 60 ? 'Moderate' : 'High Load'}
                </span>
              </div>
              <div className="text-3xl font-display font-bold text-white flex items-baseline gap-1">
                {fatigue}<span className="text-lg text-gray-500">%</span>
              </div>
              
              {/* Progress bar background */}
              <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${fatigue}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full shadow-[0_0_10px_currentColor]"
                  style={{ backgroundColor: getColor(fatigue), color: getColor(fatigue) }}
                />
              </div>
              
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${getColor(fatigue)} 0%, transparent 70%)` }}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
