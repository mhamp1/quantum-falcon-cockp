// LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
// AppIntegration.tsx - Integration code for Cockpit App.tsx (first-login flow)

import React, { useState, useEffect } from 'react';
import { licenseService } from './licenseService';

/**
 * Example integration for App.tsx - First-time user flow
 * 
 * This component demonstrates how to:
 * 1. Check license status on app start
 * 2. Handle first-time user flow (splash + onboarding)
 * 3. Show upgrade modal for invalid/expired licenses
 * 4. Validate license and set user tier
 */

// Modal Components
const SplashScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          🦅 Quantum Falcon
        </h1>
        <p className="text-2xl text-gray-300 mb-2">Trading Cockpit v2025.1.0</p>
        <p className="text-gray-400">November 19, 2025</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Quantum Falcon!',
      description: 'Your advanced trading cockpit is ready. Let\'s show you around.',
    },
    {
      title: 'Trading Strategies',
      description: 'Access powerful strategies like DCA, Momentum, RSI, and more based on your tier.',
    },
    {
      title: 'Trading Agents',
      description: 'Deploy multiple autonomous agents to execute your strategies 24/7.',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Monitor performance, track profits, and optimize your strategies in real-time.',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4">{steps[step].title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {steps[step].description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <span className="text-sm text-gray-500">
            {step + 1} / {steps.length}
          </span>
        </div>

        <button
          onClick={handleNext}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
        >
          {step < steps.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

const UpgradeModal: React.FC<{ 
  onClose: () => void;
  reason: string;
}> = ({ onClose, reason }) => {
  const handleUpgrade = (tier: string) => {
    const upgradeUrl = licenseService.getUpgradeUrl(tier);
    window.open(upgradeUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl mx-4">
        <h2 className="text-3xl font-bold mb-4">Upgrade Required</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {reason}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Pro Tier */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">Pro</h3>
            <p className="text-3xl font-bold mb-2">$99<span className="text-sm font-normal">/mo</span></p>
            <ul className="space-y-1 mb-4 text-sm">
              <li>✓ 5 strategies</li>
              <li>✓ 5 agents</li>
              <li>✓ Priority support</li>
            </ul>
            <button
              onClick={() => handleUpgrade('pro')}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
            >
              Get Pro
            </button>
          </div>

          {/* Elite Tier */}
          <div className="border-2 border-purple-600 rounded-lg p-4 relative">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <h3 className="font-bold text-lg mb-2">Elite</h3>
            <p className="text-3xl font-bold mb-2">$299<span className="text-sm font-normal">/mo</span></p>
            <ul className="space-y-1 mb-4 text-sm">
              <li>✓ All 23+ strategies</li>
              <li>✓ Unlimited agents</li>
              <li>✓ Premium support</li>
            </ul>
            <button
              onClick={() => handleUpgrade('elite')}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition"
            >
              Get Elite
            </button>
          </div>

          {/* Lifetime Tier */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">Lifetime</h3>
            <p className="text-3xl font-bold mb-2">$1,999<span className="text-sm font-normal"></span></p>
            <ul className="space-y-1 mb-4 text-sm">
              <li>✓ Everything in Elite</li>
              <li>✓ Lifetime access</li>
              <li>✓ White-label option</li>
            </ul>
            <button
              onClick={() => handleUpgrade('lifetime')}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium transition"
            >
              Get Lifetime
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
        >
          Continue with Free tier
        </button>
      </div>
    </div>
  );
};

/**
 * Main App component with license integration
 * 
 * Add this to your existing App.tsx:
 */
export const AppWithLicenseIntegration: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Check if user has seen splash
    const hasSeenSplash = licenseService.hasSeenSplash();
    
    if (!hasSeenSplash) {
      setShowSplash(true);
    } else {
      // Check license status
      await validateLicenseOnStartup();
    }
    
    setIsInitialized(true);
  };

  const validateLicenseOnStartup = async () => {
    const licenseData = licenseService.getLicenseData();
    
    if (!licenseData) {
      // No license - show upgrade modal
      setUpgradeReason('No active license found. Upgrade to unlock advanced features.');
      setShowUpgrade(true);
      return;
    }

    // Revalidate license with server
    try {
      const result = await licenseService.validate(licenseData.licenseKey);
      
      if (!result.valid) {
        setUpgradeReason(result.error || 'Your license is invalid or expired. Please upgrade to continue.');
        setShowUpgrade(true);
      } else if (result.is_expired) {
        setUpgradeReason('Your license has expired. Upgrade to restore full access.');
        setShowUpgrade(true);
      } else if (licenseService.shouldShowRenewalReminder()) {
        // Optionally show renewal reminder (non-blocking)
        console.log('License expires soon - consider showing a notification');
      }
    } catch (error) {
      console.error('Failed to validate license:', error);
      // Continue with cached license data
    }
  };

  const handleSplashClose = () => {
    setShowSplash(false);
    licenseService.markSplashAsSeen();
    
    // Check if user has valid license
    const licenseData = licenseService.getLicenseData();
    
    if (licenseData && licenseData.tier !== 'free') {
      // Valid license - show onboarding tour
      setShowOnboarding(true);
    } else {
      // No/free license - validate and possibly show upgrade
      validateLicenseOnStartup();
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleUpgradeClose = () => {
    setShowUpgrade(false);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      {showSplash && <SplashScreen onClose={handleSplashClose} />}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
      {showUpgrade && <UpgradeModal onClose={handleUpgradeClose} reason={upgradeReason} />}
    </>
  );
};

/**
 * Hook for accessing license features in components
 */
export const useLicense = () => {
  const [tier, setTier] = useState(licenseService.getTier());
  const [licenseData, setLicenseData] = useState(licenseService.getLicenseData());

  useEffect(() => {
    // Listen for license changes (you might implement an event system)
    const interval = setInterval(() => {
      setTier(licenseService.getTier());
      setLicenseData(licenseService.getLicenseData());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    tier,
    licenseData,
    hasFeature: (feature: string) => licenseService.hasFeature(feature),
    hasStrategy: (strategy: string) => licenseService.hasStrategy(strategy),
    getMaxAgents: () => licenseService.getMaxAgents(),
    isExpired: () => licenseService.isExpired(),
    shouldShowRenewalReminder: () => licenseService.shouldShowRenewalReminder(),
  };
};

/**
 * Paywall component - wrap any premium feature with this
 */
export const Paywall: React.FC<{
  requiredTier: 'pro' | 'elite' | 'lifetime';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ requiredTier, children, fallback }) => {
  const { tier } = useLicense();
  
  const tierHierarchy = ['free', 'pro', 'elite', 'lifetime', 'enterprise', 'white_label'];
  const currentTierIndex = tierHierarchy.indexOf(tier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  
  const hasAccess = currentTierIndex >= requiredTierIndex;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Upgrade to {requiredTier.toUpperCase()} or higher to access this feature
      </p>
      <button
        onClick={() => {
          const upgradeUrl = licenseService.getUpgradeUrl(requiredTier);
          window.open(upgradeUrl, '_blank');
        }}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
      >
        Upgrade Now
      </button>
    </div>
  );
};
