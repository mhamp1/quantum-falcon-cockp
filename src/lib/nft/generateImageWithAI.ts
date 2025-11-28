// AI Image Generation via xAI/Grok API
// November 22, 2025 — Quantum Falcon Cockpit
// NOW WITH FALLBACK PLACEHOLDERS — Never crashes!

const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY || ''
const XAI_API_URL = 'https://api.x.ai/v1/images/generations'

// Fallback placeholder images for different rarities
// These are high-quality cyberpunk falcon themed placeholder URLs
const FALLBACK_IMAGES: Record<string, string> = {
  legendary: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1024&q=80', // Golden eagle
  epic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&q=80', // Purple sunset
  rare: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1024&q=80', // Blue falcon
  uncommon: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1024&q=80', // Green nature
  common: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=1024&q=80', // Gray wings
  default: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1024&q=80', // Blue fallback
}

/**
 * Get fallback image based on rarity or keywords in prompt
 */
function getFallbackImage(prompt: string): string {
  const promptLower = prompt.toLowerCase()
  
  if (promptLower.includes('legendary') || promptLower.includes('gold') || promptLower.includes('crown')) {
    return FALLBACK_IMAGES.legendary
  }
  if (promptLower.includes('epic') || promptLower.includes('purple') || promptLower.includes('pink')) {
    return FALLBACK_IMAGES.epic
  }
  if (promptLower.includes('rare') || promptLower.includes('blue') || promptLower.includes('cyan')) {
    return FALLBACK_IMAGES.rare
  }
  if (promptLower.includes('uncommon') || promptLower.includes('green')) {
    return FALLBACK_IMAGES.uncommon
  }
  if (promptLower.includes('common') || promptLower.includes('gray')) {
    return FALLBACK_IMAGES.common
  }
  
  return FALLBACK_IMAGES.default
}

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
 * NEVER THROWS — Always returns an image URL (uses placeholders if all APIs fail)
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

  try {
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

    // Fallback to Flux via Replicate (which also has its own fallback)
    return await generateImageWithFlux(enhancedPrompt, size)
  } catch (error) {
    // Ultimate fallback - should never reach here, but just in case
    console.error('[NFT] All image generation methods failed, using placeholder:', error)
    return getFallbackImage(prompt)
  }
}

/**
 * Fallback: Generate image using Flux via Replicate
 * Falls back to placeholder images if no API key
 */
async function generateImageWithFlux(
  prompt: string,
  size: string = '1024x1024'
): Promise<string> {
  const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY || ''
  const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions'

  if (!REPLICATE_API_KEY) {
    // No API key - use placeholder image based on prompt
    console.warn('[NFT] No image generation API key configured, using placeholder image')
    return getFallbackImage(prompt)
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

    // No output - use fallback
    console.warn('[NFT] No image URL in response, using fallback')
    return getFallbackImage(prompt)
  } catch (error) {
    console.error('[NFT] Flux image generation failed, using fallback:', error)
    return getFallbackImage(prompt)
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

