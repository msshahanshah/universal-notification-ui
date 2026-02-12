import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, useSphere, useBox } from '@react-three/cannon';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

function Ball({ position, color }) {
  const [ref] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.4],
    restitution: 0.8,
  }));

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={1.5} 
        toneMapped={false} 
      />
    </mesh>
  );
}

function Chamber() {
  // Invisible boundaries to bounce balls
  useBox(() => ({ position: [0, -2, 0], args: [10, 1, 10], type: 'Static' })); // Floor
  useBox(() => ({ position: [-4, 2, 0], args: [1, 10, 10], type: 'Static' })); // Left
  useBox(() => ({ position: [4, 2, 0], args: [1, 10, 10], type: 'Static' }));  // Right
  useBox(() => ({ position: [0, 2, -4], args: [10, 10, 1], type: 'Static' })); // Back
  
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[8, 0.2, 8]} />
      <meshStandardMaterial color="#111" transparent opacity={0.5} />
    </mesh>
  );
}

export default function BingoScene({ balls }) {
  return (
    <div className="h-64 w-full bg-slate-950 rounded-t-3xl overflow-hidden border-b border-cyan-500/30">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 12]} />
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00ffff" />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Chamber />
          {balls.map((ball, i) => (
            <Ball key={i} position={[Math.random() * 2 - 1, 8, Math.random() * 2 - 1]} color={ball.color} />
          ))}
        </Physics>
      </Canvas>
    </div>
  );
}