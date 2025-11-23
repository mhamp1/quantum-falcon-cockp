// Device Fingerprint Generator
// Generates a unique fingerprint for hardware binding and device tracking
// November 23, 2025 — Quantum Falcon Cockpit v2025.1.0

/**
 * Device fingerprint data structure
 */
export interface DeviceFingerprint {
  fingerprint: string
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  timezone: string
  canvas?: string
  webgl?: string
  audio?: string
  timestamp: number
}

/**
 * Generate a unique device fingerprint based on browser characteristics
 * Uses multiple data points to create a stable identifier
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    fingerprint: '',
    userAgent: navigator.userAgent || '',
    platform: navigator.platform || '',
    language: navigator.language || '',
    screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    timestamp: Date.now()
  }

  // Collect canvas fingerprint
  try {
    fingerprint.canvas = await getCanvasFingerprint()
  } catch (e) {
    // Canvas fingerprinting may be blocked
    fingerprint.canvas = 'unavailable'
  }

  // Collect WebGL fingerprint
  try {
    fingerprint.webgl = getWebGLFingerprint()
  } catch (e) {
    // WebGL may be unavailable
    fingerprint.webgl = 'unavailable'
  }

  // Collect audio fingerprint
  try {
    fingerprint.audio = await getAudioFingerprint()
  } catch (e) {
    // Audio fingerprinting may fail
    fingerprint.audio = 'unavailable'
  }

  // Generate combined fingerprint hash
  fingerprint.fingerprint = await hashFingerprint(fingerprint)

  return fingerprint
}

/**
 * Get canvas-based fingerprint
 */
async function getCanvasFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    return 'canvas-unavailable'
  }

  canvas.width = 200
  canvas.height = 50

  // Draw text with various styles
  ctx.textBaseline = 'top'
  ctx.font = '14px "Arial"'
  ctx.fillStyle = '#f60'
  ctx.fillRect(125, 1, 62, 20)
  ctx.fillStyle = '#069'
  ctx.fillText('Quantum Falcon 🚀', 2, 15)
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
  ctx.fillText('Quantum Falcon 🚀', 4, 17)

  // Get data URL and hash it
  const dataURL = canvas.toDataURL()
  return await simpleHash(dataURL)
}

/**
 * Get WebGL-based fingerprint
 */
function getWebGLFingerprint(): string {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
  
  if (!gl) {
    return 'webgl-unavailable'
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown'
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown'
  
  return `${vendor}|${renderer}`
}

/**
 * Get audio-based fingerprint
 */
async function getAudioFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        resolve('audio-unavailable')
        return
      }

      const context = new AudioContext()
      const oscillator = context.createOscillator()
      const analyser = context.createAnalyser()
      const gainNode = context.createGain()
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1)

      gainNode.gain.value = 0 // Mute
      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gainNode)
      gainNode.connect(context.destination)

      scriptProcessor.onaudioprocess = function(event) {
        const output = event.outputBuffer.getChannelData(0)
        const hash = Array.from(output.slice(0, 30))
          .map(v => Math.abs(v))
          .reduce((a, b) => a + b, 0)
          .toString()
        
        scriptProcessor.disconnect()
        oscillator.disconnect()
        analyser.disconnect()
        gainNode.disconnect()
        context.close()
        
        resolve(hash)
      }

      oscillator.start(0)
      
      // Timeout after 100ms
      setTimeout(() => {
        try {
          scriptProcessor.disconnect()
          oscillator.disconnect()
          analyser.disconnect()
          gainNode.disconnect()
          context.close()
        } catch (e) {
          // Already disconnected
        }
        resolve('audio-timeout')
      }, 100)
    } catch (e) {
      resolve('audio-error')
    }
  })
}

/**
 * Hash all fingerprint components into a single string
 */
async function hashFingerprint(fp: DeviceFingerprint): Promise<string> {
  const components = [
    fp.userAgent,
    fp.platform,
    fp.language,
    fp.screenResolution,
    fp.timezone,
    fp.canvas || '',
    fp.webgl || '',
    fp.audio || ''
  ].join('|')

  return await simpleHash(components)
}

/**
 * Simple hash function using SubtleCrypto API
 * Falls back to basic hash if SubtleCrypto is unavailable
 */
async function simpleHash(str: string): Promise<string> {
  try {
    // Use SubtleCrypto if available (HTTPS context)
    if (crypto && crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
  } catch (e) {
    // SubtleCrypto unavailable (HTTP context)
  }

  // Fallback to simple hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

/**
 * Validate if a fingerprint is valid
 */
export function isValidFingerprint(fp: DeviceFingerprint | null): boolean {
  if (!fp) return false
  return !!(fp.fingerprint && fp.fingerprint.length > 0)
}

/**
 * Get a simplified fingerprint (just the hash)
 */
export function getSimplifiedFingerprint(fp: DeviceFingerprint): string {
  return fp.fingerprint
}
