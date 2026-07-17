import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AnimatePresence, motion } from 'motion/react';
import * as THREE from 'three';

// Define the muscle regions
interface MuscleGroup {
  name: string;
  label: string;
  tagline: string;
  description: string;
  position: [number, number, number];
}

const MUSCLE_GROUPS: Record<string, MuscleGroup> = {
  shoulders: { 
    name: 'shoulders', 
    label: 'DELTOIDS', 
    tagline: 'Shoulder stability & overhead force', 
    description: 'Crucial for shoulder mobility, pushing power, and overhead stability. Essential for premium posture control.',
    position: [0.6, 0.7, 0]
  },
  chest: { 
    name: 'chest', 
    label: 'PECTORALIS', 
    tagline: 'Upper body pushing power', 
    description: 'The primary chest musculature driving upper body pressing power and shoulder horizontal adduction.',
    position: [0, 0.4, 0.2]
  },
  core: { 
    name: 'core', 
    label: 'ABS & OBLIQUES', 
    tagline: 'Core stabilization & rotation', 
    description: 'The center of gravity. Governs rotational power, spine stabilization, and intra-abdominal force transfer.',
    position: [0, -0.2, 0.2]
  },
  arms: { 
    name: 'arms', 
    label: 'BICEPS & TRICEPS', 
    tagline: 'Elbow flexion & extension', 
    description: 'Governs arm flexion and extensions, supporting grip strength and upper body load management.',
    position: [0.8, 0, 0]
  },
  legs: { 
    name: 'legs', 
    label: 'QUADRICEPS & GLUTES', 
    tagline: 'Lower body foundation force', 
    description: 'The absolute power core of human motion. Generates explosive force, vertical leap, and deceleration control.',
    position: [0.3, -1.2, 0]
  }
};

// 3D Silhouette component
function HumanSilhouette({ hoveredPart, setHoveredPart }: { 
  hoveredPart: string | null; 
  setHoveredPart: (part: string | null) => void; 
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the model
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  const renderPart = (
    name: string, 
    geometry: THREE.BufferGeometry, 
    position: [number, number, number], 
    rotation: [number, number, number] = [0, 0, 0]
  ) => {
    const isHovered = hoveredPart === name;
    
    return (
      <group position={position} rotation={rotation}>
        {/* Wireframe Mesh for visual skeleton */}
        <mesh 
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(name);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredPart(null);
          }}
        >
          <primitive object={geometry} attach="geometry" />
          <meshBasicMaterial 
            wireframe 
            color={isHovered ? "#C05C46" : "#1A1A1A"} 
            opacity={isHovered ? 0.7 : 0.08} 
            transparent 
            depthWrite={false}
          />
        </mesh>
        
        {/* Point Cloud for particle aesthetic */}
        <points>
          <primitive object={geometry} attach="geometry" />
          <pointsMaterial 
            color={isHovered ? "#C05C46" : "#1A1A1A"} 
            size={0.05} 
            opacity={isHovered ? 0.9 : 0.25} 
            transparent 
            depthWrite={false}
          />
        </points>
      </group>
    );
  };

  // Build basic geometries procedurally
  const headGeo = new THREE.SphereGeometry(0.3, 10, 10);
  const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.2, 8);
  const chestGeo = new THREE.CylinderGeometry(0.42, 0.38, 0.5, 10, 3);
  const coreGeo = new THREE.CylinderGeometry(0.36, 0.33, 0.6, 10, 3);
  const shoulderGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const upperArmGeo = new THREE.CylinderGeometry(0.10, 0.09, 0.55, 8);
  const lowerArmGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.5, 8);
  const thighGeo = new THREE.CylinderGeometry(0.17, 0.13, 0.8, 10);
  const shinGeo = new THREE.CylinderGeometry(0.13, 0.09, 0.7, 8);

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {/* Head */}
      {renderPart('head', headGeo, [0, 1.3, 0])}
      {renderPart('shoulders', neckGeo, [0, 1.05, 0])}

      {/* Chest */}
      {renderPart('chest', chestGeo, [0, 0.7, 0])}

      {/* Core */}
      {renderPart('core', coreGeo, [0, 0.15, 0])}

      {/* Shoulders */}
      {renderPart('shoulders', shoulderGeo, [-0.55, 0.85, 0])}
      {renderPart('shoulders', shoulderGeo, [0.55, 0.85, 0])}

      {/* Arms */}
      {/* Left Arm */}
      {renderPart('arms', upperArmGeo, [-0.68, 0.5, 0], [0, 0, 0.2])}
      {renderPart('arms', lowerArmGeo, [-0.78, 0.0, 0], [0, 0, 0.08])}
      {/* Right Arm */}
      {renderPart('arms', upperArmGeo, [0.68, 0.5, 0], [0, 0, -0.2])}
      {renderPart('arms', lowerArmGeo, [0.78, 0.0, 0], [0, 0, -0.08])}

      {/* Legs */}
      {/* Left Leg */}
      {renderPart('legs', thighGeo, [-0.22, -0.5, 0], [0, 0, 0.05])}
      {renderPart('legs', shinGeo, [-0.24, -1.2, 0], [0, 0, 0.02])}
      {/* Right Leg */}
      {renderPart('legs', thighGeo, [0.22, -0.5, 0], [0, 0, -0.05])}
      {renderPart('legs', shinGeo, [0.24, -1.2, 0], [0, 0, -0.02])}
    </group>
  );
}

export default function AnatomyModel() {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    // 2D Mobile Fallback: Elegant rotating vector silhouette with pulse rings
    return (
      <div className="relative w-full h-[60dvh] flex items-center justify-center select-none overflow-hidden mt-6">
        {/* Rotating outer ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-72 h-72 rounded-full border border-[#1a1a1a]/5 flex items-center justify-center"
        >
          <div className="w-68 h-68 rounded-full border border-dashed border-[#1a1a1a]/10" />
        </motion.div>

        {/* 2D Line-Art Silhouette */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-48 h-96 relative z-10 opacity-75 stroke-[#1a1a1a] fill-none"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Head & Spine */}
          <circle cx="50" cy="15" r="4.5" className="fill-white" />
          <path d="M50 19.5v28.5" />
          
          {/* Torso/Chest */}
          <path 
            d="M44 24h12l1 10H43z" 
            className="hover:stroke-[#C05C46] transition-colors duration-300 cursor-pointer"
            onClick={() => setHoveredPart(hoveredPart === 'chest' ? null : 'chest')}
          />
          {/* Core */}
          <path 
            d="M45 34.5h10l-1 12H46z"
            className="hover:stroke-[#C05C46] transition-colors duration-300 cursor-pointer"
            onClick={() => setHoveredPart(hoveredPart === 'core' ? null : 'core')}
          />

          {/* Shoulders & Arms */}
          <path 
            d="M43.5 24.5l-8 4v10" 
            className="hover:stroke-[#C05C46] transition-colors duration-300 cursor-pointer"
            onClick={() => setHoveredPart(hoveredPart === 'arms' ? null : 'arms')}
          />
          <path 
            d="M56.5 24.5l-8-4" /* Shoulder line */
            className="hover:stroke-[#C05C46] transition-colors duration-300 cursor-pointer"
            onClick={() => setHoveredPart(hoveredPart === 'shoulders' ? null : 'shoulders')}
          />
          <path 
            d="M56.5 24.5l8 4v10"
            className="hover:stroke-[#C05C46] transition-colors duration-300 cursor-pointer"
            onClick={() => setHoveredPart(hoveredPart === 'arms' ? null : 'arms')}
          />

          {/* Legs */}
          <path 
            d="M46.5 48.5l-3 18v18"
            className="hover:stroke-[#C05C46] transition-colors duration-300 cursor-pointer"
            onClick={() => setHoveredPart(hoveredPart === 'legs' ? null : 'legs')}
          />
          <path 
            d="M53.5 48.5l3 18v18"
            className="hover:stroke-[#C05C46] transition-colors duration-300 cursor-pointer"
            onClick={() => setHoveredPart(hoveredPart === 'legs' ? null : 'legs')}
          />
        </svg>

        {/* Small Tap Hint overlay */}
        <div className="absolute bottom-4 text-[10px] uppercase font-mono tracking-widest text-[#1a1a1a]/40 bg-[#F5F1EA]/80 px-3 py-1 rounded-full backdrop-blur-sm z-20">
          Tap areas to inspect muscles
        </div>

        {/* Floating Tooltip card for mobile tap */}
        <AnimatePresence>
          {hoveredPart && MUSCLE_GROUPS[hoveredPart] && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-16 left-6 right-6 p-4 rounded-xl border border-black/5 bg-[#FAF6F0]/95 backdrop-blur-md shadow-xl z-30 text-left"
            >
              <button 
                onClick={() => setHoveredPart(null)}
                className="absolute top-2 right-2 text-zinc-400 hover:text-black w-6 h-6 flex items-center justify-center text-sm"
              >
                ✕
              </button>
              <div className="text-[10px] font-mono tracking-wider text-[#C05C46] uppercase mb-0.5">
                {MUSCLE_GROUPS[hoveredPart].label}
              </div>
              <h4 className="font-display font-medium text-lg leading-tight text-[#1a1a1a] mb-1">
                {MUSCLE_GROUPS[hoveredPart].tagline}
              </h4>
              <p className="text-zinc-600 text-xs leading-relaxed font-sans">
                {MUSCLE_GROUPS[hoveredPart].description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 3D Canvas rendering for Desktop
  return (
    <div className="relative w-full h-[95dvh] select-none flex items-center justify-center">
      {/* 3D Canvas */}
      <div className="w-full h-full absolute inset-0 z-10">
        <Canvas 
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.5} />
          <pointLight position={[5, 5, 5]} intensity={1.2} />
          <HumanSilhouette hoveredPart={hoveredPart} setHoveredPart={setHoveredPart} />
          <OrbitControls 
            enableZoom={false} 
            maxPolarAngle={Math.PI / 1.8} 
            minPolarAngle={Math.PI / 2.5}
            enablePan={false}
          />
        </Canvas>
      </div>

      {/* Floating Editorial Description (Right Side) */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-80 text-left z-20 pointer-events-none hidden lg:block">
        <AnimatePresence mode="wait">
          {hoveredPart && MUSCLE_GROUPS[hoveredPart] ? (
            <motion.div
              key={hoveredPart}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 rounded-2xl border border-black/5 bg-[#FAF6F0]/80 backdrop-blur-md shadow-2xl relative"
            >
              {/* Connector line effect */}
              <div className="absolute -left-20 top-1/2 w-20 h-[1px] bg-[#C05C46]/30 border-dashed border-t pointer-events-none hidden xl:block" />
              
              <div className="text-xs font-mono tracking-widest text-[#C05C46] uppercase mb-1">
                {MUSCLE_GROUPS[hoveredPart].label}
              </div>
              <h4 className="font-display font-medium text-xl leading-tight text-[#1a1a1a] mb-2">
                {MUSCLE_GROUPS[hoveredPart].tagline}
              </h4>
              <p className="text-zinc-600 text-sm leading-relaxed font-sans">
                {MUSCLE_GROUPS[hoveredPart].description}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase leading-loose"
            >
              [ Drag to Rotate ]
              <br />
              [ Hover regions to inspect ]
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
