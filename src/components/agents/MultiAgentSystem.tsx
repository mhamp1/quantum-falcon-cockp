// Multi-Agent System 3D Visualization Component
// Live command center with data flow lines and real-time stats

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, Text3D, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AgentNode {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
}

interface Stats {
  uptime: number;
  trades: number;
  success: number;
  profit: number;
}

const agents: AgentNode[] = [
  { id: '1', name: 'MARKET ANALYST', position: [-5, 3, 0], color: '#00FFFF' },
  { id: '2', name: 'STRATEGY ENGINE', position: [0, 0, 0], color: '#DC1FFF' },
  { id: '3', name: 'RL OPTIMIZER', position: [5, 3, 0], color: '#FF00FF' },
];

interface DataFlowLineProps {
  from: [number, number, number];
  to: [number, number, number];
}

function DataFlowLine({ from, to }: DataFlowLineProps) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.15, 8, false);

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial 
          color="#DC1FFF" 
          emissive="#DC1FFF" 
          emissiveIntensity={2} 
          opacity={0.8} 
          transparent 
        />
      </mesh>
    </group>
  );
}

interface Agent3DNodeProps {
  agent: AgentNode;
}

function Agent3DNode({ agent }: Agent3DNodeProps) {
  return (
    <Float speed={2} rotationIntensity={0.5}>
      <group position={agent.position}>
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial 
            color={agent.color} 
            emissive={agent.color} 
            emissiveIntensity={3} 
          />
        </mesh>
        <Text3D
          font="/fonts/orbitron.json"
          size={0.8}
          position={[0, 3, 0]}
          height={0.2}
        >
          {agent.name}
          <meshStandardMaterial color={agent.color} emissive={agent.color} />
        </Text3D>
      </group>
    </Float>
  );
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#DC1FFF" intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#00FFFF" intensity={0.5} />
      
      {agents.map(agent => (
        <Agent3DNode key={agent.id} agent={agent} />
      ))}
      
      <DataFlowLine from={agents[0].position} to={agents[1].position} />
      <DataFlowLine from={agents[1].position} to={agents[2].position} />
      <DataFlowLine from={agents[2].position} to={agents[0].position} />
      
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function MultiAgentSystem() {
  const [stats, setStats] = useState<Stats>({
    uptime: 94.1,
    trades: 1247,
    success: 87.3,
    profit: 2835,
  });

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setStats(prev => ({
        uptime: Math.min(99.9, prev.uptime + Math.random() * 0.1),
        trades: prev.trades + Math.floor(Math.random() * 3),
        success: Math.max(75, Math.min(95, prev.success + (Math.random() - 0.5) * 2)),
        profit: prev.profit + Math.random() * 50,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
            <Scene3D />
          </Canvas>
        </Suspense>
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 p-12 text-center pointer-events-none">
        <motion.h1 
          className="neon-leak text-9xl font-black mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          MULTI-AGENT SYSTEM
        </motion.h1>
        
        <motion.p 
          className="text-cyan-300 text-2xl mt-8 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Live Coordination • Real-Time Intelligence
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-7xl mx-auto">
          <motion.div 
            className="p-8 bg-black/70 rounded-3xl border-2 border-cyan-500/50 backdrop-blur-sm pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-cyan-400 text-xl mb-2">UPTIME</p>
            <p className="neon-leak text-6xl font-black text-cyan-400">
              {stats.uptime.toFixed(1)}%
            </p>
          </motion.div>

          <motion.div 
            className="p-8 bg-black/70 rounded-3xl border-2 border-purple-500/50 backdrop-blur-sm pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <p className="text-purple-400 text-xl mb-2">TRADES</p>
            <p className="neon-leak text-6xl font-black text-purple-400">
              {stats.trades}
            </p>
          </motion.div>

          <motion.div 
            className="p-8 bg-black/70 rounded-3xl border-2 border-pink-500/50 backdrop-blur-sm pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-pink-400 text-xl mb-2">SUCCESS</p>
            <p className="neon-leak text-6xl font-black text-pink-400">
              {stats.success.toFixed(1)}%
            </p>
          </motion.div>

          <motion.div 
            className="p-8 bg-black/70 rounded-3xl border-2 border-green-500/50 backdrop-blur-sm pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <p className="text-green-400 text-xl mb-2">PROFIT</p>
            <p className="neon-leak text-6xl font-black text-green-400">
              +${Math.floor(stats.profit)}
            </p>
          </motion.div>
        </div>

        {/* Agent Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              className="p-6 bg-black/70 rounded-2xl border border-white/10 backdrop-blur-sm pointer-events-auto"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6 + index * 0.2, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full animate-pulse" 
                  style={{ backgroundColor: agent.color }}
                />
                <h3 className="font-bold text-lg" style={{ color: agent.color }}>
                  {agent.name}
                </h3>
              </div>
              <p className="text-sm text-gray-400">Status: Active</p>
              <p className="text-sm text-gray-400">Tasks: {Math.floor(Math.random() * 50 + 10)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
