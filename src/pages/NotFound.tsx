// 404 Page — Quantum Falcon Cockpit
// November 26, 2025 — Launch Day

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { House, ArrowLeft, Compass } from '@phosphor-icons/react'

export default function NotFound() {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0f3d] to-[#0a0a0f] flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* Falcon Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto w-32 h-32"
        >
          <img 
            src="/falcon-head-official.png" 
            alt="Quantum Falcon" 
            className="w-full h-full object-contain opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </motion.div>

        {/* Error Code */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 
            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 
            className="text-2xl font-bold text-white uppercase tracking-wider"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            Signal Lost
          </h2>
          <p className="text-gray-400 text-lg">
            The coordinates you're looking for don't exist in this dimension.
            The Falcon has scanned all quadrants — nothing found.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold px-8 py-6 text-lg"
          >
            <House size={24} className="mr-2" />
            Return to Cockpit
          </Button>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg"
          >
            <ArrowLeft size={24} className="mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8 flex items-center justify-center gap-2 text-gray-500 text-sm"
        >
          <Compass size={16} className="animate-spin" style={{ animationDuration: '10s' }} />
          <span>Quantum Falcon v2025.1.0</span>
        </motion.div>
      </div>
    </div>
  )
}

