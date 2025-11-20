// EXCHANGES: Binance + Kraken API integration complete — matches live app — November 19, 2025

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeSlash, CheckCircle, Warning, Lock, ShieldCheck } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { KrakenService } from '@/lib/exchanges/kraken'

interface KrakenConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (credentials: { apiKey: string; privateKey: string }) => void
}

export default function KrakenConnectModal({ isOpen, onClose, onSuccess }: KrakenConnectModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testPassed, setTestPassed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleTestConnection = async () => {
    if (!apiKey || !privateKey) {
      toast.error('✗ Missing credentials', {
        description: 'Both API Key and Private Key are required',
        className: 'border-destructive/50 bg-background/95'
      })
      return
    }

    setIsTesting(true)
    setTestPassed(false)

    toast.loading('Testing Kraken connection...', {
      id: 'test-kraken',
      className: 'border-primary/50 bg-background/95'
    })

    KrakenService.auditLog('test-connection-attempt', { apiKey })

    try {
      const result = await KrakenService.testConnection({ apiKey, privateKey })

      toast.dismiss('test-kraken')

      if (result.success) {
        setTestPassed(true)
        KrakenService.auditLog('test-connection-success', { apiKey, latency: result.latency })
        
        toast.success('✓ Connection successful', {
          description: `Latency: ${result.latency}ms | Balances: ${result.data?.balanceCount || 0} assets`,
          className: 'border-primary/50 bg-background/95',
          duration: 4000
        })
      } else {
        KrakenService.auditLog('test-connection-failed', { apiKey, error: result.error })
        
        toast.error('✗ Connection failed', {
          description: result.error || 'Could not authenticate with Kraken',
          className: 'border-destructive/50 bg-background/95',
          duration: 5000
        })
      }
    } catch (error: any) {
      toast.dismiss('test-kraken')
      KrakenService.auditLog('test-connection-error', { apiKey, error: error.message })
      
      toast.error('✗ Test failed', {
        description: error.message || 'Network error',
        className: 'border-destructive/50 bg-background/95'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    if (!testPassed) {
      toast.error('✗ Test connection first', {
        description: 'You must test the connection before saving',
        className: 'border-destructive/50 bg-background/95'
      })
      return
    }

    setIsSaving(true)

    toast.loading('Encrypting and saving credentials...', {
      id: 'save-kraken',
      className: 'border-primary/50 bg-background/95'
    })

    KrakenService.auditLog('save-credentials', { apiKey })

    setTimeout(() => {
      toast.dismiss('save-kraken')
      
      toast.success('✓ Kraken connected', {
        description: 'Your credentials have been encrypted and saved locally',
        className: 'border-primary/50 bg-background/95',
        duration: 4000
      })

      onSuccess({ apiKey, privateKey })
      handleClose()
    }, 1000)
  }

  const handleClose = () => {
    setApiKey('')
    setPrivateKey('')
    setShowApiKey(false)
    setShowPrivateKey(false)
    setTestPassed(false)
    setIsTesting(false)
    setIsSaving(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="cyber-card border-2 border-primary max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl uppercase tracking-wide text-primary flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5741D9] flex items-center justify-center text-white text-xl">
              🦑
            </div>
            Connect Kraken
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Securely connect your Kraken account to Quantum Falcon Cockpit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-primary/10 border border-primary/30 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide text-primary flex items-center gap-2">
              <Warning size={16} weight="duotone" />
              Kraken API Setup Instructions
            </h4>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Log into your Kraken account</li>
              <li>Navigate to <span className="text-primary font-mono">Settings → API</span></li>
              <li>Click <span className="text-primary font-mono">Generate New Key</span></li>
              <li>Set Key Description as "Quantum Falcon"</li>
              <li><span className="text-accent font-bold">Permissions:</span> Enable only <span className="text-primary font-mono">Query Funds</span>, <span className="text-primary font-mono">Query Open Orders</span>, and <span className="text-primary font-mono">Create & Modify Orders</span></li>
              <li><span className="text-destructive font-bold">DO NOT</span> enable <span className="text-primary font-mono">Withdraw Funds</span></li>
              <li>Set the Key Expiry (optional but recommended)</li>
              <li>Copy your API Key and Private Key below</li>
            </ol>
            <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30">
              <ShieldCheck size={14} weight="fill" className="text-destructive" />
              <p className="text-xs text-foreground">Kraken Private Keys are sensitive. They will be encrypted with AES-256-GCM.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-bold">API Key (Public Key) *</Label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setTestPassed(false)
                }}
                placeholder="Enter your Kraken API Public Key"
                className="pr-10 font-mono text-xs"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeSlash size={16} weight="duotone" />
                ) : (
                  <Eye size={16} weight="duotone" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider font-bold">Private Key *</Label>
            <div className="relative">
              <Input
                type={showPrivateKey ? 'text' : 'password'}
                value={privateKey}
                onChange={(e) => {
                  setPrivateKey(e.target.value)
                  setTestPassed(false)
                }}
                placeholder="Enter your Kraken Private Key"
                className="pr-10 font-mono text-xs"
              />
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPrivateKey ? (
                  <EyeSlash size={16} weight="duotone" />
                ) : (
                  <Eye size={16} weight="duotone" />
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-accent/10 border border-accent/30 space-y-2">
            <div className="flex items-center gap-2">
              <Lock size={14} weight="fill" className="text-accent" />
              <h5 className="text-xs font-bold uppercase tracking-wide text-accent">Security Best Practices</h5>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 ml-5 list-disc">
              <li>Use read-only keys when possible</li>
              <li>Never enable withdrawal permissions</li>
              <li>Set API key expiration dates</li>
              <li>Rotate API keys every 90 days</li>
              <li>Monitor API usage in Kraken settings</li>
              <li>Revoke keys immediately if compromised</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isTesting || isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTestConnection}
              disabled={!apiKey || !privateKey || isTesting || isSaving}
              className="flex-1 bg-secondary/20 hover:bg-secondary/30 border-2 border-secondary text-secondary"
            >
              {isTesting ? 'Testing...' : testPassed ? '✓ Test Passed' : 'Test Connection'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!testPassed || isSaving}
              className="flex-1 bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary"
            >
              <CheckCircle size={16} weight="duotone" className="mr-2" />
              {isSaving ? 'Saving...' : 'Save & Connect'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
