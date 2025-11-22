// Enhanced useLicense Hook — Unified License Management
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Merged from license-authority integration

import { useState, useEffect } from 'react'
import { enhancedLicenseService, type LicenseData } from '@/lib/license/enhancedLicenseService'

/**
 * Hook for accessing license features in components
 * Provides reactive license state and feature checking
 */
export function useLicense() {
  const [tier, setTier] = useState(enhancedLicenseService.getTier())
  const [licenseData, setLicenseData] = useState<LicenseData | null>(enhancedLicenseService.getLicenseData())

  useEffect(() => {
    // Listen for license changes
    const interval = setInterval(() => {
      const currentTier = enhancedLicenseService.getTier()
      const currentLicense = enhancedLicenseService.getLicenseData()
      
      if (currentTier !== tier) {
        setTier(currentTier)
      }
      if (currentLicense !== licenseData) {
        setLicenseData(currentLicense)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tier, licenseData])

  return {
    tier,
    licenseData,
    hasFeature: (feature: string) => enhancedLicenseService.hasFeature(feature),
    hasStrategy: (strategy: string) => enhancedLicenseService.hasStrategy(strategy),
    getMaxAgents: () => enhancedLicenseService.getMaxAgents(),
    isExpired: () => enhancedLicenseService.isExpired(),
    shouldShowRenewalReminder: () => enhancedLicenseService.shouldShowRenewalReminder(),
    getDaysUntilExpiry: () => enhancedLicenseService.getDaysUntilExpiry(),
    validate: (licenseKey: string) => enhancedLicenseService.validate(licenseKey),
    clearLicense: () => enhancedLicenseService.clearLicense(),
  }
}

