// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// JWT authentication and authorization
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { logger } from '../services/Logger.js'

const JWT_SECRET = process.env.JWT_SECRET || 'quantum-falcon-secret-key-change-in-production'

interface JWTPayload {
  userId: string
  email: string
  tier: string
  iat: number
  exp: number
}

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string
      email: string
      tier: string
      role?: string
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Check for API key authentication
      const apiKey = req.headers['x-api-key'] as string
      if (apiKey) {
        return await handleApiKeyAuth(apiKey, req, res, next)
      }
      
      return res.status(401).json({ error: 'No authorization token provided' })
    }

    const token = authHeader.substring(7)

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        tier: true,
        role: true,
        tradingPaused: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      tier: user.tier,
      role: user.role || undefined,
    }

    next()
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    logger.error('[Auth] Middleware error:', error)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * Handle API key authentication
 */
async function handleApiKeyAuth(
  apiKey: string,
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Find user by API key
    const key = await db.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    })

    if (!key || !key.active) {
      return res.status(401).json({ error: 'Invalid API key' })
    }

    // Check rate limit
    // TODO: Implement proper rate limiting per API key

    // Attach user to request
    req.user = {
      id: key.user.id,
      email: key.user.email,
      tier: key.user.tier,
      role: key.user.role || undefined,
    }

    // Update last used
    await db.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    })

    next()
  } catch (error) {
    logger.error('[Auth] API key auth failed:', error)
    return res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * Require specific tier or higher
 */
export function requireTier(minTier: string) {
  const tierOrder = ['free', 'starter', 'trader', 'pro', 'elite', 'lifetime']
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const userTierIndex = tierOrder.indexOf(req.user.tier)
    const minTierIndex = tierOrder.indexOf(minTier)

    if (userTierIndex < minTierIndex) {
      return res.status(403).json({ 
        error: `This feature requires ${minTier} tier or higher` 
      })
    }

    next()
  }
}

/**
 * Require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (req.user.role !== 'admin' && req.user.tier !== 'lifetime') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string, tier: string): string {
  return jwt.sign(
    { userId, email, tier },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Verify and decode token without middleware
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

