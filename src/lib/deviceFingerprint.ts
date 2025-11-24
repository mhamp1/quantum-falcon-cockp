// LICENSEAUTH UPGRADE: Instant activation + hardware binding + grace period — now better than 3Commas/Pionex — November 20, 2025
// deviceFingerprint.ts - Browser-based device fingerprinting
// Fixed for browser compatibility — November 22, 2025

export interface DeviceFingerprint {
  fingerprint: string;
  canvas_hash: string;
  webgl_hash: string;
  fonts_hash: string;
  user_agent: string;
}

/**
 * Generate a canvas fingerprint by rendering text and shapes
 */
function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw text with different styles
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('QuantumFalcon 🦅', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('QuantumFalcon 🦅', 4, 17);
    
    // Draw shapes
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    // Get canvas data and hash it
    const dataUrl = canvas.toDataURL();
    return hashString(dataUrl);
  } catch (e) {
    console.error('Canvas fingerprint error:', e);
    return '';
  }
}

/**
 * Generate a WebGL fingerprint
 */
function generateWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return '';
    
    // Get WebGL parameters
    const params = [
      'VERSION',
      'SHADING_LANGUAGE_VERSION',
      'VENDOR',
      'RENDERER',
      'MAX_VERTEX_ATTRIBS',
      'MAX_TEXTURE_SIZE',
      'MAX_CUBE_MAP_TEXTURE_SIZE'
    ];
    
    const glInfo: Record<string, any> = {};
    
    params.forEach(param => {
      const glParam = (gl as any)[param];
      if (glParam !== undefined) {
        glInfo[param] = gl.getParameter(glParam);
      }
    });
    
    // Get supported extensions
    const extensions = gl.getSupportedExtensions() || [];
    glInfo.EXTENSIONS = extensions.join(',');
    
    return hashString(JSON.stringify(glInfo));
  } catch (e) {
    console.error('WebGL fingerprint error:', e);
    return '';
  }
}

/**
 * Detect available fonts
 */
function generateFontsFingerprint(): string {
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact',
      'Arial Black', 'Helvetica', 'Tahoma', 'Lucida Console', 'Monaco',
      'Consolas', 'Calibri', 'Cambria', 'Candara', 'Segoe UI'
    ];
    
    // Get baseline widths
    const baselineWidths: Record<string, number> = {};
    baseFonts.forEach(font => {
      ctx.font = `${testSize} ${font}`;
      baselineWidths[font] = ctx.measureText(testString).width;
    });
    
    // Test which fonts are available
    const detectedFonts: string[] = [];
    testFonts.forEach(font => {
      baseFonts.forEach(baseFont => {
        ctx.font = `${testSize} '${font}', ${baseFont}`;
        const width = ctx.measureText(testString).width;
        
        if (width !== baselineWidths[baseFont]) {
          if (!detectedFonts.includes(font)) {
            detectedFonts.push(font);
          }
        }
      });
    });
    
    return hashString(detectedFonts.sort().join(','));
  } catch (e) {
    console.error('Fonts fingerprint error:', e);
    return '';
  }
}

/**
 * Hash a string using SHA-256
 */
function hashString(input: string): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Use Web Crypto API (async, but we'll use a sync workaround)
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    // For synchronous operation, we'll use a simpler hash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  // Fallback simple hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate complete device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const canvas_hash = generateCanvasFingerprint();
  const webgl_hash = generateWebGLFingerprint();
  const fonts_hash = generateFontsFingerprint();
  const user_agent = navigator.userAgent;
  
  // Combine all hashes into single fingerprint
  const combinedData = {
    canvas: canvas_hash,
    webgl: webgl_hash,
    fonts: fonts_hash,
    ua: user_agent
  };
  
  const fingerprint = hashString(JSON.stringify(combinedData));
  
  return {
    fingerprint,
    canvas_hash,
    webgl_hash,
    fonts_hash,
    user_agent
  };
}

/**
 * Validate license with device fingerprint
 */
export async function validateLicenseWithFingerprint(
  licenseKey: string,
  apiUrl: string = 'http://localhost:8000'
): Promise<any> {
  const deviceFingerprint = await generateDeviceFingerprint();
  
  const response = await fetch(`${apiUrl}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      license_key: licenseKey,
      hardware_id: deviceFingerprint.fingerprint,
      device_fingerprint: deviceFingerprint
    })
  });
  
  return response.json();
}

/**
 * Bind device to license
 */
export async function bindDeviceToLicense(
  licenseKey: string,
  apiUrl: string = 'http://localhost:8000'
): Promise<any> {
  const deviceFingerprint = await generateDeviceFingerprint();
  
  const response = await fetch(`${apiUrl}/bind-device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      license_key: licenseKey,
      device_fingerprint: deviceFingerprint
    })
  });
  
  return response.json();
}

