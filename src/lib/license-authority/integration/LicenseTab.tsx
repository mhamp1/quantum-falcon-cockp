// LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
// LicenseTab.tsx - Settings → License tab component for Quantum Falcon Cockpit

import React, { useState, useEffect } from 'react';
import { licenseService, LicenseData, TierInfo } from './licenseService';

/**
 * License Tab Component for Settings
 * 
 * Displays:
 * - Current license status
 * - Tier information
 * - Expiration date
 * - Renewal button
 * - Upgrade options
 */
export const LicenseTab: React.FC = () => {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [newLicenseKey, setNewLicenseKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Load current license data
    const currentLicense = licenseService.getLicenseData();
    setLicenseData(currentLicense);

    // Load available tiers
    licenseService.getTiers().then(setTiers);
  }, []);

  const handleValidateLicense = async () => {
    if (!newLicenseKey.trim()) {
      setValidationMessage({ type: 'error', text: 'Please enter a license key' });
      return;
    }

    setValidating(true);
    setValidationMessage(null);

    try {
      const result = await licenseService.validate(newLicenseKey.trim());

      if (result.valid) {
        setValidationMessage({ 
          type: 'success', 
          text: `License activated! You now have ${result.tier.toUpperCase()} tier access.` 
        });
        setLicenseData(licenseService.getLicenseData());
        setNewLicenseKey('');
      } else {
        setValidationMessage({ 
          type: 'error', 
          text: result.error || 'Invalid license key' 
        });
      }
    } catch (error) {
      setValidationMessage({ 
        type: 'error', 
        text: 'Failed to validate license. Please try again.' 
      });
    } finally {
      setValidating(false);
    }
  };

  const handleUpgrade = (tier: string) => {
    const upgradeUrl = licenseService.getUpgradeUrl(tier, licenseData?.licenseKey);
    window.open(upgradeUrl, '_blank');
  };

  const formatExpirationDate = (timestamp?: number): string => {
    if (!timestamp) return 'Never (Lifetime)';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeColor = (): string => {
    if (!licenseData) return 'bg-gray-500';
    
    const daysLeft = licenseService.getDaysUntilExpiry();
    if (daysLeft === null) return 'bg-green-500'; // Lifetime
    if (daysLeft <= 0) return 'bg-red-500'; // Expired
    if (daysLeft <= 7) return 'bg-yellow-500'; // Expiring soon
    return 'bg-green-500'; // Active
  };

  const getTierBadgeColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'free':
        return 'bg-gray-400';
      case 'pro':
        return 'bg-blue-500';
      case 'elite':
        return 'bg-purple-600';
      case 'lifetime':
        return 'bg-yellow-500';
      case 'enterprise':
        return 'bg-indigo-600';
      case 'white_label':
        return 'bg-pink-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="license-tab p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">License Management</h2>

      {/* Current License Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Current License</h3>
        
        {licenseData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusBadgeColor()}`}>
                {licenseService.isExpired() ? 'Expired' : 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tier:</span>
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getTierBadgeColor(licenseData.tier)}`}>
                {licenseData.tier.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">User ID:</span>
              <span className="font-mono text-sm">{licenseData.user_id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Expires:</span>
              <span>{formatExpirationDate(licenseData.expires_at)}</span>
            </div>

            {licenseService.shouldShowRenewalReminder() && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Your license expires in {licenseService.getDaysUntilExpiry()} days!
                </p>
                <button
                  onClick={() => handleUpgrade(licenseData.tier)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium transition"
                >
                  Renew Now
                </button>
              </div>
            )}

            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Features:</p>
              <ul className="space-y-1">
                {licenseData.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="text-sm flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
                {licenseData.features.length > 5 && (
                  <li className="text-sm text-gray-500">+ {licenseData.features.length - 5} more...</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No license activated. Enter a license key below to get started.</p>
        )}
      </div>

      {/* Activate License */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Activate License</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="license-key" className="block text-sm font-medium mb-2">
              License Key
            </label>
            <input
              id="license-key"
              type="text"
              value={newLicenseKey}
              onChange={(e) => setNewLicenseKey(e.target.value)}
              placeholder="Enter your license key"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              disabled={validating}
            />
          </div>

          {validationMessage && (
            <div className={`p-3 rounded-md ${
              validationMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
            }`}>
              {validationMessage.text}
            </div>
          )}

          <button
            onClick={handleValidateLicense}
            disabled={validating}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition"
          >
            {validating ? 'Validating...' : 'Activate License'}
          </button>
        </div>
      </div>

      {/* Available Tiers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-lg">{tier.name}</h4>
                <span className={`px-2 py-1 rounded text-xs text-white ${getTierBadgeColor(tier.tier)}`}>
                  {tier.tier.toUpperCase()}
                </span>
              </div>
              
              <p className="text-2xl font-bold mb-2">
                {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                {typeof tier.price === 'number' && tier.tier !== 'lifetime' && (
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                )}
              </p>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {tier.description}
              </p>
              
              <ul className="space-y-1 mb-4 text-sm">
                {tier.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {tier.tier !== 'free' && (
                <button
                  onClick={() => handleUpgrade(tier.tier)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
                >
                  {licenseData?.tier === tier.tier ? 'Renew' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
