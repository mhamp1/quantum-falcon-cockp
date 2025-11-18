export const LEGAL_DOCUMENT_VERSIONS = {
  RISK_DISCLOSURE: '2025-11-18',
  TERMS_OF_SERVICE: '2025-11-18',
  PRIVACY_POLICY: '2025-11-18'
} as const

export interface LegalAcknowledgment {
  version: string
  acknowledgedAt: number
  userAgent: string
  sessionId: string
  documentType: 'risk' | 'terms' | 'privacy'
}

export function shouldShowRiskBanner(): boolean {
  const storageKey = `risk_accepted_${LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE}`
  const hasAccepted = localStorage.getItem(storageKey) === 'true'
  
  if (!hasAccepted) {
    console.log('[Legal Version] Risk disclosure NOT accepted for version:', LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE)
    return true
  }
  
  console.log('[Legal Version] Risk disclosure already accepted for version:', LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE)
  return false
}

export function clearOldVersions(): void {
  const currentVersion = LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE
  const prefix = 'risk_accepted_'
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix) && key !== `${prefix}${currentVersion}`) {
      console.log('[Legal Version] Clearing old version:', key)
      localStorage.removeItem(key)
    }
  }
}

export function getCurrentRiskVersion(): string {
  return LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE
}

export function isVersionOutdated(acceptedVersion: string): boolean {
  return acceptedVersion !== LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE
}

export function getDocumentUpdateDate(type: 'risk' | 'terms' | 'privacy'): string {
  switch (type) {
    case 'risk':
      return LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE
    case 'terms':
      return LEGAL_DOCUMENT_VERSIONS.TERMS_OF_SERVICE
    case 'privacy':
      return LEGAL_DOCUMENT_VERSIONS.PRIVACY_POLICY
  }
}

export function needsReacceptance(lastAcceptedVersion: string, documentType: 'risk' | 'terms' | 'privacy'): boolean {
  const currentVersion = getDocumentUpdateDate(documentType)
  
  if (!lastAcceptedVersion) {
    console.log(`[Legal Version] No previous acceptance found for ${documentType.toUpperCase()}`)
    return true
  }
  
  const isOutdated = lastAcceptedVersion !== currentVersion
  
  if (isOutdated) {
    console.log(`[Legal Version] ${documentType.toUpperCase()} document updated!`)
    console.log(`[Legal Version] User accepted: ${lastAcceptedVersion}, Current: ${currentVersion}`)
    console.log('[Legal Version] User must re-accept the updated document')
    
    const storageKey = `${documentType}_accepted_${lastAcceptedVersion}`
    if (localStorage.getItem(storageKey)) {
      console.log(`[Legal Version] Clearing outdated localStorage key: ${storageKey}`)
      localStorage.removeItem(storageKey)
    }
  }
  
  return isOutdated
}

export function checkVersionExpiration(): { expired: boolean; documentType: string | null } {
  const riskStorageKey = `risk_accepted_${LEGAL_DOCUMENT_VERSIONS.RISK_DISCLOSURE}`
  const termsStorageKey = `terms_accepted_${LEGAL_DOCUMENT_VERSIONS.TERMS_OF_SERVICE}`
  const privacyStorageKey = `privacy_accepted_${LEGAL_DOCUMENT_VERSIONS.PRIVACY_POLICY}`
  
  const hasRiskAccepted = localStorage.getItem(riskStorageKey) === 'true'
  const hasTermsAccepted = localStorage.getItem(termsStorageKey) === 'true'
  const hasPrivacyAccepted = localStorage.getItem(privacyStorageKey) === 'true'
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    
    if (key.startsWith('risk_accepted_') && key !== riskStorageKey) {
      console.log('[Legal Version] Found expired risk acceptance:', key)
      return { expired: true, documentType: 'risk' }
    }
    
    if (key.startsWith('terms_accepted_') && key !== termsStorageKey) {
      console.log('[Legal Version] Found expired terms acceptance:', key)
      return { expired: true, documentType: 'terms' }
    }
    
    if (key.startsWith('privacy_accepted_') && key !== privacyStorageKey) {
      console.log('[Legal Version] Found expired privacy acceptance:', key)
      return { expired: true, documentType: 'privacy' }
    }
  }
  
  if (!hasRiskAccepted) {
    return { expired: true, documentType: 'risk' }
  }
  
  return { expired: false, documentType: null }
}
