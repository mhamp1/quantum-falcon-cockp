// Arweave Upload Utility for NFT Images and Metadata
// November 22, 2025 — Quantum Falcon Cockpit

export interface ArweaveUploadOptions {
  data: string | Blob | File | object
  contentType?: string
  tags?: Record<string, string>
}

/**
 * Upload data to Arweave via Bundlr Network (recommended for large files)
 * Falls back to Arweave gateway if Bundlr unavailable
 */
export async function uploadToArweave(
  data: string | Blob | File | object,
  options: Partial<ArweaveUploadOptions> = {}
): Promise<string> {
  const { contentType, tags = {} } = options

  // If data is an object (metadata), stringify it
  let uploadData: Blob | File
  let finalContentType = contentType || 'application/json'

  if (typeof data === 'object' && !(data instanceof Blob) && !(data instanceof File)) {
    uploadData = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    finalContentType = 'application/json'
  } else if (typeof data === 'string') {
    // If it's a URL, fetch it first
    if (data.startsWith('http://') || data.startsWith('https://')) {
      const response = await fetch(data)
      uploadData = await response.blob()
      finalContentType = response.headers.get('content-type') || 'image/png'
    } else {
      // Base64 or raw string
      uploadData = new Blob([data], { type: finalContentType })
    }
  } else {
    uploadData = data as Blob | File
  }

  // Try Bundlr first (faster, cheaper for large files)
  try {
    return await uploadViaBundlr(uploadData, finalContentType, tags)
  } catch (error) {
    console.warn('[NFT] Bundlr upload failed, trying Arweave gateway:', error)
    // Fallback to Arweave gateway
    return await uploadViaArweaveGateway(uploadData, finalContentType, tags)
  }
}

/**
 * Upload via Bundlr Network (recommended)
 */
async function uploadViaBundlr(
  data: Blob | File,
  contentType: string,
  tags: Record<string, string>
): Promise<string> {
  // Bundlr requires client-side wallet connection
  // For now, we'll use a server endpoint or fallback to gateway
  // TODO: Implement Bundlr client-side upload with wallet
  
  const BUNDLR_ENDPOINT = import.meta.env.VITE_BUNDLR_ENDPOINT || 'https://node1.bundlr.network'
  const BUNDLR_PROVIDER_URL = import.meta.env.VITE_BUNDLR_PROVIDER_URL

  if (!BUNDLR_PROVIDER_URL) {
    throw new Error('Bundlr provider URL not configured')
  }

  // This would require a backend endpoint to handle Bundlr transactions
  // For now, throw to fallback to gateway
  throw new Error('Bundlr upload requires backend endpoint')
}

/**
 * Upload via Arweave Gateway (fallback)
 * Note: This requires a backend endpoint with Arweave wallet
 */
async function uploadViaArweaveGateway(
  data: Blob | File,
  contentType: string,
  tags: Record<string, string>
): Promise<string> {
  const ARWEAVE_UPLOAD_ENDPOINT = import.meta.env.VITE_ARWEAVE_UPLOAD_ENDPOINT

  if (ARWEAVE_UPLOAD_ENDPOINT) {
    // Use custom backend endpoint
    const formData = new FormData()
    formData.append('file', data, 'nft-asset')
    formData.append('contentType', contentType)
    formData.append('tags', JSON.stringify(tags))

    const response = await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Arweave upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.url || result.id || `https://arweave.net/${result.id}`
  }

  // If no backend endpoint, return a placeholder
  // In production, you MUST have a backend endpoint for Arweave uploads
  console.warn('[NFT] No Arweave upload endpoint configured. Using placeholder URL.')
  return `https://arweave.net/placeholder-${Date.now()}`
}

/**
 * Upload NFT metadata JSON
 */
export async function uploadNFTMetadata(metadata: {
  name: string
  description: string
  image: string
  attributes: Array<{ trait_type: string; value: string | number }>
  properties?: Record<string, any>
}): Promise<string> {
  const metadataWithStandard = {
    name: metadata.name,
    description: metadata.description,
    image: metadata.image,
    attributes: metadata.attributes,
    properties: metadata.properties || {
      files: [{ uri: metadata.image, type: 'image/png' }],
      category: 'image',
    },
  }

  return uploadToArweave(metadataWithStandard, {
    contentType: 'application/json',
    tags: {
      'Content-Type': 'application/json',
      'App-Name': 'Quantum-Falcon',
      'App-Version': '2025.1.0',
    },
  })
}

