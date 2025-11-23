/**
 * Step 5: Authentication/License modal
 * 
 * Requirements:
 * - This screen must use the ORIGINAL Solana color palette (#14F195 green, #9945FF purple, black glassmorphism)
 * - NOT the washed-out gray/blue theme currently showing
 * - Users must be able to click "Continue as Free Tier (Paper Trading)" and enter the full dashboard WITHOUT any license key
 * - The "Purchase License → visit quantumfalcon.ai" toast/link must open https://quantumfalcon.ai in a new tab and NOT block progression
 * - Remove the ugly light-blue login page that sometimes appears
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth';
import { toast } from 'sonner';

interface AuthenticationStepProps {
  onComplete: () => void;
}

export default function AuthenticationStep({ onComplete }: AuthenticationStepProps) {
  const { login, isLoading } = usePersistentAuth();
  const [licenseKey, setLicenseKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFreeTier = async () => {
    // Create a free tier license
    const freeLicenseKey = 'FREE-TIER-DEMO-' + Date.now();
    
    try {
      setIsVerifying(true);
      const result = await login('demo', 'demo', freeLicenseKey, 'demo@quantumfalcon.ai');
      
      if (result.success) {
        toast.success('Welcome to Free Tier!', {
          description: 'Paper trading mode is active. Start exploring!',
        });
        onComplete();
      } else {
        // Even if login fails, allow free tier access
        toast.info('Free Tier Activated', {
          description: 'Paper trading mode enabled',
        });
        onComplete();
      }
    } catch (error) {
      // Always allow free tier access
      toast.info('Free Tier Activated', {
        description: 'Paper trading mode enabled',
      });
      onComplete();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLicenseSubmit = async () => {
    if (!licenseKey.trim()) {
      toast.error('License Key Required', {
        description: 'Please enter a license key or continue with Free Tier',
      });
      return;
    }

    setIsVerifying(true);
    const result = await login('user', 'password', licenseKey.trim());
    
    if (result.success) {
      toast.success('License Verified!', {
        description: 'Welcome to Quantum Falcon',
      });
      onComplete();
    } else {
      toast.error('Invalid License', {
        description: result.error || 'Please check your license key or continue with Free Tier',
      });
    }
    
    setIsVerifying(false);
  };

  const handlePurchaseLicense = () => {
    window.open('https://quantumfalcon.ai', '_blank', 'noopener,noreferrer');
    toast.info('Opening License Purchase', {
      description: 'You can continue with Free Tier anytime',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{
        zIndex: 99999,
        background: 'linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%)',
      }}
    >
      {/* 70% black overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Solana-themed modal */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-black/90 border-2 rounded-xl p-8 backdrop-blur-xl"
        style={{
          borderColor: '#14F195',
          boxShadow: '0 0 40px rgba(20, 241, 149, 0.3), 0 0 80px rgba(153, 69, 255, 0.2)',
        }}
      >
        {/* Solana gradient header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-4 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
              boxShadow: '0 0 30px rgba(20, 241, 149, 0.5)',
            }}
          >
            <Sparkle size={40} weight="fill" className="text-black m-5" />
          </motion.div>
          
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2" style={{ color: '#14F195' }}>
            QUANTUM FALCON
          </h1>
          <p className="text-sm uppercase tracking-widest" style={{ color: '#9945FF' }}>
            Authentication Required
          </p>
        </div>

        {/* License key input */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="license-key" className="text-sm uppercase tracking-wide" style={{ color: '#14F195' }}>
              License Key (Optional)
            </Label>
            <Input
              id="license-key"
              type="text"
              placeholder="Enter your license key..."
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="mt-2 bg-black/50 border-2"
              style={{
                borderColor: '#14F195',
                color: '#14F195',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLicenseSubmit();
                }
              }}
            />
          </div>

          {licenseKey && (
            <Button
              onClick={handleLicenseSubmit}
              disabled={isVerifying || isLoading}
              className="w-full uppercase tracking-wider font-bold"
              style={{
                background: 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
                color: '#000',
                boxShadow: '0 0 20px rgba(20, 241, 149, 0.5)',
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify License'}
              <Key size={20} className="ml-2" />
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #14F195, transparent)' }} />
          <span className="text-xs uppercase tracking-widest" style={{ color: '#9945FF' }}>OR</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #14F195, transparent)' }} />
        </div>

        {/* Free tier button */}
        <Button
          onClick={handleFreeTier}
          disabled={isVerifying || isLoading}
          className="w-full uppercase tracking-wider font-bold mb-4 border-2"
          style={{
            background: 'rgba(20, 241, 149, 0.1)',
            borderColor: '#14F195',
            color: '#14F195',
            boxShadow: '0 0 20px rgba(20, 241, 149, 0.3)',
          }}
        >
          Continue as Free Tier (Paper Trading)
          <ArrowRight size={20} className="ml-2" />
        </Button>

        {/* Purchase license link */}
        <button
          onClick={handlePurchaseLicense}
          className="w-full text-center text-sm uppercase tracking-wider hover:underline transition-opacity"
          style={{ color: '#9945FF' }}
        >
          Purchase License → visit quantumfalcon.ai
        </button>
      </motion.div>
    </motion.div>
  );
}

