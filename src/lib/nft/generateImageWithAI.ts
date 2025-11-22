// AI Image Generation via xAI/Grok API
// November 22, 2025 — Quantum Falcon Cockpit

const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY || ''
const XAI_API_URL = 'https://api.x.ai/v1/images/generations'

export interface ImageGenerationOptions {
  prompt: string
  size?: '1024x1024' | '512x512' | '256x256'
  n?: number
}

export interface ImageGenerationResponse {
  url: string
  revised_prompt?: string
}

/**
 * Generate AI image using xAI/Grok API
 * Falls back to Flux via Replicate if xAI fails
 */
export async function generateImageWithAI(
  prompt: string,
  options: Partial<ImageGenerationOptions> = {}
): Promise<string> {
  const {
    size = '1024x1024',
    n = 1
  } = options

  // Enhanced prompt for cyberpunk Quantum Falcon style
  const enhancedPrompt = `${prompt}, cyberpunk, neon, ultra detailed, 8k, masterpiece, cinematic lighting, holographic effects, dark background, quantum falcon aesthetic`

  // Try xAI/Grok first
  if (XAI_API_KEY) {
    try {
      const response = await fetch(XAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          n,
          size,
        }),
      })

      if (!response.ok) {
        throw new Error(`xAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.data && data.data[0] && data.data[0].url) {
        return data.data[0].url
      }

      throw new Error('Invalid response from xAI API')
    } catch (error) {
      console.warn('[NFT] xAI image generation failed, trying Flux fallback:', error)
      // Fall through to Flux
    }
  }

  // Fallback to Flux via Replicate
  return await generateImageWithFlux(enhancedPrompt, size)
}

/**
 * Fallback: Generate image using Flux via Replicate
 */
async function generateImageWithFlux(
  prompt: string,
  size: string = '1024x1024'
): Promise<string> {
  const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY || ''
  const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions'

  if (!REPLICATE_API_KEY) {
    throw new Error('No image generation API key configured. Set VITE_XAI_API_KEY or VITE_REPLICATE_API_KEY')
  }

  try {
    // Create prediction
    const createResponse = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-dev',
        input: {
          prompt,
          aspect_ratio: size === '1024x1024' ? '1:1' : '1:1',
          output_format: 'url',
        },
      }),
    })

    if (!createResponse.ok) {
      throw new Error(`Replicate API error: ${createResponse.statusText}`)
    }

    const prediction = await createResponse.json()

    // Poll for completion
    let status = prediction.status
    let result = prediction

    while (status === 'starting' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const statusResponse = await fetch(`${REPLICATE_API_URL}/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
        },
      })

      result = await statusResponse.json()
      status = result.status

      if (status === 'failed' || status === 'canceled') {
        throw new Error(`Image generation failed: ${result.error || 'Unknown error'}`)
      }
    }

    if (result.output && result.output[0]) {
      return result.output[0]
    }

    throw new Error('No image URL in response')
  } catch (error) {
    console.error('[NFT] Flux image generation failed:', error)
    throw error
  }
}

/**
 * Generate multiple images in parallel
 */
export async function generateMultipleImages(
  prompts: string[],
  options: Partial<ImageGenerationOptions> = {}
): Promise<string[]> {
  const promises = prompts.map(prompt => generateImageWithAI(prompt, options))
  return Promise.all(promises)
}

