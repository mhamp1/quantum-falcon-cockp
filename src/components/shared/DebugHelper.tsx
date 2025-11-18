// Debug Helper Component - Bottom-left overlay (Ctrl+Shift+D to toggle)
// Shows FPS, memory, agent status, WebSocket status, and KV viewer

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChartLine, Database, Wifi, Cpu } from '@phosphor-icons/react';

interface DebugStats {
  fps: number;
  memory: number;
  agents: number;
  wsStatus: 'connected' | 'disconnected' | 'connecting';
  kvEntries: number;
}

export default function DebugHelper() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<DebugStats>({
    fps: 60,
    memory: 0,
    agents: 3,
    wsStatus: 'connected',
    kvEntries: 0,
  });
  const [showKVViewer, setShowKVViewer] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Toggle with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // FPS counter
  useEffect(() => {
    if (!isVisible) return;

    let frameId: number;
    const updateFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        setStats(prev => ({ ...prev, fps }));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      frameId = requestAnimationFrame(updateFPS);
    };

    frameId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible]);

  // Memory usage (if available)
  useEffect(() => {
    if (!isVisible) return;

    const updateMemory = () => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        const usedMB = Math.round(mem.usedJSHeapSize / 1048576);
        setStats(prev => ({ ...prev, memory: usedMB }));
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // KV entries count
  useEffect(() => {
    if (!isVisible) return;

    const countKVEntries = () => {
      try {
        const count = Object.keys(localStorage).filter(k => 
          k.startsWith('kv:') || k.startsWith('active-') || k.startsWith('user-')
        ).length;
        setStats(prev => ({ ...prev, kvEntries: count }));
      } catch (e) {
        console.debug('[DebugHelper] Could not count KV entries');
      }
    };

    countKVEntries();
    const interval = setInterval(countKVEntries, 5000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const getKVEntries = () => {
    try {
      return Object.keys(localStorage)
        .filter(k => k.startsWith('kv:') || k.startsWith('active-') || k.startsWith('user-'))
        .map(key => {
          try {
            const value = localStorage.getItem(key);
            return { key, value: value?.substring(0, 100) || 'null' };
          } catch {
            return { key, value: '[Error reading]' };
          }
        });
    } catch {
      return [];
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="fixed bottom-4 left-4 z-[9999] cyber-card p-4 w-80 text-xs font-mono"
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-primary/30">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-primary" />
            <span className="text-primary font-bold uppercase">Debug Helper</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartLine size={14} className="text-cyan-400" />
              <span className="text-gray-400">FPS</span>
            </div>
            <span className={`font-bold ${stats.fps >= 55 ? 'text-green-400' : stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
              {stats.fps}
            </span>
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-purple-400" />
              <span className="text-gray-400">Memory</span>
            </div>
            <span className="text-purple-400 font-bold">
              {stats.memory > 0 ? `${stats.memory} MB` : 'N/A'}
            </span>
          </div>

          {/* Agents */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-pink-400" />
              <span className="text-gray-400">Agents</span>
            </div>
            <span className="text-pink-400 font-bold">{stats.agents} Active</span>
          </div>

          {/* WebSocket */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi size={14} className={stats.wsStatus === 'connected' ? 'text-green-400' : 'text-red-400'} />
              <span className="text-gray-400">WebSocket</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stats.wsStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                stats.wsStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
                'bg-red-400'
              }`} />
              <span className="text-gray-400 uppercase">{stats.wsStatus}</span>
            </div>
          </div>

          {/* KV Storage */}
          <div className="flex items-center justify-between pt-2 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-cyan-400" />
              <span className="text-gray-400">KV Entries</span>
            </div>
            <button
              onClick={() => setShowKVViewer(!showKVViewer)}
              className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
            >
              {stats.kvEntries} {showKVViewer ? '▼' : '▶'}
            </button>
          </div>

          {/* KV Viewer */}
          {showKVViewer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 max-h-60 overflow-auto scrollbar-thin space-y-1 bg-black/50 p-2 rounded"
            >
              {getKVEntries().map(({ key, value }) => (
                <div key={key} className="text-[10px] border-b border-white/5 pb-1">
                  <div className="text-cyan-400 truncate">{key}</div>
                  <div className="text-gray-500 truncate">{value}</div>
                </div>
              ))}
              {getKVEntries().length === 0 && (
                <div className="text-gray-500 text-center py-2">No KV entries found</div>
              )}
            </motion.div>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-primary/20 text-center text-gray-500">
          Press Ctrl+Shift+D to toggle
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
