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
  const isOutdated = lastAcceptedVersion !== currentVersion
  
  if (isOutdated) {
    console.log(`[Legal Version] ${documentType.toUpperCase()} document updated!`)
    console.log(`[Legal Version] User accepted: ${lastAcceptedVersion}, Current: ${currentVersion}`)
    console.log('[Legal Version] User must re-accept the updated document')
  }
  
  return isOutdated
}
