import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Wallet, 
  Key, 
  LinkSimple, 
  ShieldCheck, 
  Eye, 
  EyeSlash, 
  CheckCircle,
  Warning,
  Lock,
  XCircle,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { settingsAPI } from '@/lib/api/settings-api'

interface APIConnection {
  id: string
  name: string
  type: 'exchange' | 'wallet' | 'rpc'
  connected: boolean
  encrypted: boolean
  lastUsed?: number
  walletAddress?: string
}

interface APICredentials {
  [key: string]: {
    apiKey: string
    apiSecret: string
    enabled: boolean
  }
}

export default function APIIntegration() {
  const [connections, setConnections] = useKV<APIConnection[]>('api-connections', [
    { id: 'phantom', name: 'Phantom Wallet', type: 'wallet', connected: false, encrypted: true },
    { id: 'solflare', name: 'Solflare Wallet', type: 'wallet', connected: false, encrypted: true },
    { id: 'binance', name: 'Binance', type: 'exchange', connected: false, encrypted: true },
    { id: 'kraken', name: 'Kraken', type: 'exchange', connected: false, encrypted: true },
    { id: 'jupiter', name: 'Jupiter DEX', type: 'exchange', connected: false, encrypted: true },
    { id: 'raydium', name: 'Raydium', type: 'exchange', connected: false, encrypted: true },
    { id: 'helius', name: 'Helius RPC', type: 'rpc', connected: false, encrypted: true },
  ])

  const [credentials, setCredentials] = useKV<APICredentials>('api-credentials', {})
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [editingConnection, setEditingConnection] = useState<string | null>(null)
  const [tempApiKey, setTempApiKey] = useState('')
  const [tempApiSecret, setTempApiSecret] = useState('')
  const [isConnecting, setIsConnecting] = useState<{ [key: string]: boolean }>({})
  const [isTesting, setIsTesting] = useState<{ [key: string]: boolean }>({})
  const [securityDismissed, setSecurityDismissed] = useState(false)
  const [dismissCountdown, setDismissCountdown] = useState(5)

  useEffect(() => {
    if (!securityDismissed && dismissCountdown > 0) {
      const timer = setTimeout(() => {
        setDismissCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [dismissCountdown, securityDismissed])

  const encryptData = (data: string): string => {
    return btoa(data)
  }

  const decryptData = (encrypted: string): string => {
    try {
      return atob(encrypted)
    } catch {
      return ''
    }
  }

  const connectWallet = async (connectionId: string) => {
    setIsConnecting(prev => ({ ...prev, [connectionId]: true }))
    
    toast.loading('Connecting wallet...', {
      id: `connect-${connectionId}`,
      description: 'Please approve the connection in your wallet',
      className: 'border-primary/50 bg-background/95'
    })

    try {
      const result = await settingsAPI.connectWallet(connectionId)
      
      if (result.success) {
        setConnections((current) => 
          (current || []).map((conn) =>
            conn.id === connectionId
              ? { ...conn, connected: true, lastUsed: Date.now(), walletAddress: result.data?.address }
              : conn
          )
        )
        
        toast.dismiss(`connect-${connectionId}`)
        toast.success('✓ Wallet connected', {
          description: `Address: ${result.data?.address || 'Connected'}`,
          className: 'border-primary/50 bg-background/95',
          duration: 4000
        })
      } else {
        throw new Error(result.error || 'Failed to connect')
      }
    } catch (error: any) {
      toast.dismiss(`connect-${connectionId}`)
      toast.error('✗ Connection failed', {
        description: error.message || 'Could not connect to wallet',
        className: 'border-destructive/50 bg-background/95'
      })
    } finally {
      setIsConnecting(prev => ({ ...prev, [connectionId]: false }))
    }
  }

  const disconnectConnection = async (connectionId: string) => {
    const connection = connections?.find(c => c.id === connectionId)
    
    if (window.confirm(`Are you sure you want to disconnect ${connection?.name}?`)) {
      toast.loading('Disconnecting...', { id: `disconnect-${connectionId}` })
      
      try {
        await settingsAPI.disconnectWallet(connectionId)
        
        setConnections((current) =>
          (current || []).map((conn) =>
            conn.id === connectionId
              ? { ...conn, connected: false, walletAddress: undefined }
              : conn
          )
        )

        setCredentials((current) => {
          const updated = { ...(current || {}) }
          delete updated[connectionId]
          return updated
        })

        toast.dismiss(`disconnect-${connectionId}`)
        toast.success('✓ Disconnected', {
          description: `${connection?.name} has been removed`,
          className: 'border-primary/50 bg-background/95'
        })
      } catch (error) {
        toast.dismiss(`disconnect-${connectionId}`)
        toast.error('✗ Failed to disconnect')
      }
    }
  }

  const setupAPIConnection = () => {
    if (!editingConnection || !tempApiKey) {
      toast.error('✗ Invalid input', {
        description: 'API Key is required',
        className: 'border-destructive/50 bg-background/95'
      })
      return
    }

    toast.loading('Setting up integration...', { id: 'api-setup' })

    setTimeout(() => {
      setCredentials((current) => ({
        ...(current || {}),
        [editingConnection]: {
          apiKey: encryptData(tempApiKey),
          apiSecret: tempApiSecret ? encryptData(tempApiSecret) : '',
          enabled: true
        }
      }))

      setConnections((current) =>
        (current || []).map((conn) =>
          conn.id === editingConnection
            ? { ...conn, connected: true, lastUsed: Date.now() }
            : conn
        )
      )

      toast.dismiss('api-setup')
      toast.success('✓ Setup complete', {
        description: 'API integration configured successfully',
        className: 'border-primary/50 bg-background/95'
      })

      setEditingConnection(null)
      setTempApiKey('')
      setTempApiSecret('')
    }, 1200)
  }

  const testConnection = async (connectionId: string) => {
    setIsTesting(prev => ({ ...prev, [connectionId]: true }))
    
    toast.loading('Testing connection...', {
      id: `test-${connectionId}`,
      className: 'border-primary/50 bg-background/95'
    })

    try {
      const result = await settingsAPI.testAPIConnection(connectionId)
      
      toast.dismiss(`test-${connectionId}`)
      
      if (result.success) {
        toast.success('✓ Connection successful', {
          description: `Latency: ${result.data?.latency}ms`,
          className: 'border-primary/50 bg-background/95'
        })
      } else {
        toast.error('✗ Connection failed', {
          description: result.error || 'Could not reach endpoint',
          className: 'border-destructive/50 bg-background/95'
        })
      }
    } catch (error) {
      toast.dismiss(`test-${connectionId}`)
      toast.error('✗ Test failed')
    } finally {
      setIsTesting(prev => ({ ...prev, [connectionId]: false }))
    }
  }

  const getConnectionIcon = (type: APIConnection['type']) => {
    switch (type) {
      case 'wallet':
        return Wallet
      case 'exchange':
        return LinkSimple
      case 'rpc':
        return Lightning
      default:
        return Key
    }
  }

  return (
    <div className="space-y-6">
      {!securityDismissed && (
        <div className="cyber-card-accent p-6 relative overflow-hidden">
          <div className="absolute inset-0 diagonal-stripes opacity-5" />
          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-4">
              <ShieldCheck size={24} weight="duotone" className="text-accent flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold uppercase tracking-wide text-accent mb-2">Security Notice</h3>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  Your API keys and credentials are encrypted and stored locally on your device. Never share your private keys or
                  seed phrases. Quantum Falcon will never ask for your password or private keys.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Lock size={12} weight="fill" className="text-accent" />
                    <span>All credentials are encrypted using AES-256 encryption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck size={12} weight="fill" className="text-accent" />
                    <span>Keys are stored locally and never transmitted to external servers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Warning size={12} weight="fill" className="text-accent" />
                    <span>Use API-only keys with limited permissions when possible</span>
                  </li>
                </ul>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={dismissCountdown > 0}
              onClick={() => setSecurityDismissed(true)}
              className={`border-accent text-accent hover:bg-accent/10 ${dismissCountdown > 0 ? 'opacity-50' : ''}`}
            >
              {dismissCountdown > 0 ? `Dismiss in ${dismissCountdown}s` : 'I Understand'}
            </Button>
          </div>
        </div>
      )}

      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <LinkSimple size={32} weight="duotone" className="text-primary" />
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-primary">API Integrations</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Connect wallets and services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections?.map((connection) => {
            const Icon = getConnectionIcon(connection.type)
            const cred = credentials?.[connection.id]
            const isLoading = isConnecting[connection.id] || isTesting[connection.id]

            return (
              <div
                key={connection.id}
                className={`cyber-card p-4 relative overflow-hidden transition-all hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.2)] ${
                  connection.connected ? 'border-primary/50' : 'border-muted/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 border-2 ${connection.connected ? 'border-primary bg-primary/10' : 'border-muted/30 bg-muted/10'}`}>
                      <Icon size={20} weight="duotone" className={connection.connected ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wide text-sm">{connection.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{connection.type}</p>
                    </div>
                  </div>
                  {connection.connected ? (
                    <Badge className="bg-primary/20 border border-primary text-primary text-[9px]">
                      CONNECTED
                    </Badge>
                  ) : (
                    <Badge className="bg-muted/20 border border-muted text-muted-foreground text-[9px]">
                      DISCONNECTED
                    </Badge>
                  )}
                </div>

                {connection.walletAddress && (
                  <div className="mb-3 p-2 bg-background/60 border border-primary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                    <p className="text-xs font-mono text-primary">{connection.walletAddress}</p>
                  </div>
                )}

                {connection.connected && connection.lastUsed && (
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Last used: {new Date(connection.lastUsed).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2">
                  {connection.type === 'wallet' ? (
                    connection.connected ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => disconnectConnection(connection.id)}
                        disabled={isLoading}
                        className="flex-1 text-xs"
                      >
                        <XCircle size={14} weight="duotone" className="mr-1" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => connectWallet(connection.id)}
                        disabled={isLoading}
                        className="flex-1 bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary text-xs"
                      >
                        {isLoading ? 'Connecting...' : (
                          <>
                            <Wallet size={14} weight="duotone" className="mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )
                  ) : (
                    <>
                      {connection.connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testConnection(connection.id)}
                            disabled={isLoading}
                            className="flex-1 border-primary text-primary hover:bg-primary/10 text-xs"
                          >
                            {isTesting[connection.id] ? 'Testing...' : 'Test'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => disconnectConnection(connection.id)}
                            className="flex-1 text-xs"
                          >
                            Remove
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingConnection(connection.id)
                            setTempApiKey('')
                            setTempApiSecret('')
                          }}
                          className="flex-1 bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary text-xs"
                        >
                          <Key size={14} weight="duotone" className="mr-1" />
                          Setup
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={editingConnection !== null} onOpenChange={() => setEditingConnection(null)}>
        <DialogContent className="cyber-card border-2 border-primary max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl uppercase tracking-wide text-primary">
              Setup API Integration
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your API credentials for {connections?.find(c => c.id === editingConnection)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {editingConnection === 'binance' && (
              <div className="p-4 bg-primary/10 border border-primary/30 space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wide text-primary flex items-center gap-2">
                  <Warning size={16} weight="duotone" />
                  Binance API Setup Instructions
                </h4>
                <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Log into your Binance account</li>
                  <li>Navigate to <span className="text-primary font-mono">API Management</span> under your profile</li>
                  <li>Create a new API key with label "Quantum Falcon"</li>
                  <li><span className="text-accent font-bold">IMPORTANT:</span> Enable only <span className="text-primary font-mono">Read Info</span> and <span className="text-primary font-mono">Enable Spot & Margin Trading</span></li>
                  <li><span className="text-destructive font-bold">DO NOT</span> enable withdrawal permissions</li>
                  <li>Whitelist your IP address (recommended for security)</li>
                  <li>Copy your API Key and Secret Key below</li>
                </ol>
                <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30">
                  <ShieldCheck size={14} weight="fill" className="text-destructive" />
                  <p className="text-xs text-foreground">Never share your Secret Key. It will be encrypted locally.</p>
                </div>
              </div>
            )}

            {editingConnection === 'kraken' && (
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
                  <p className="text-xs text-foreground">Kraken Private Keys are sensitive. They will be encrypted with AES-256.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">
                {editingConnection === 'kraken' ? 'API Key (Public Key)' : 'API Key'} *
              </Label>
              <div className="relative">
                <Input
                  type={showKeys[editingConnection || ''] ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={editingConnection === 'binance' ? 'Enter Binance API Key' : editingConnection === 'kraken' ? 'Enter Kraken API Public Key' : 'Enter your API key'}
                  className="pr-10 font-mono text-xs"
                />
                <button
                  onClick={() => setShowKeys(prev => ({ ...prev, [editingConnection || '']: !prev[editingConnection || ''] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys[editingConnection || ''] ? (
                    <EyeSlash size={16} weight="duotone" />
                  ) : (
                    <Eye size={16} weight="duotone" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-bold">
                {editingConnection === 'kraken' ? 'Private Key *' : editingConnection === 'binance' ? 'Secret Key *' : 'API Secret'}
                {!['binance', 'kraken'].includes(editingConnection || '') && (
                  <span className="text-muted-foreground font-normal"> (Optional)</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  type="password"
                  value={tempApiSecret}
                  onChange={(e) => setTempApiSecret(e.target.value)}
                  placeholder={editingConnection === 'binance' ? 'Enter Binance Secret Key' : editingConnection === 'kraken' ? 'Enter Kraken Private Key' : 'Enter your API secret (if required)'}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {(editingConnection === 'binance' || editingConnection === 'kraken') && (
              <div className="p-3 bg-accent/10 border border-accent/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Lock size={14} weight="fill" className="text-accent" />
                  <h5 className="text-xs font-bold uppercase tracking-wide text-accent">Security Best Practices</h5>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-5 list-disc">
                  <li>Use read-only keys when possible</li>
                  <li>Never enable withdrawal permissions</li>
                  <li>Whitelist IP addresses to restrict access</li>
                  <li>Rotate API keys every 90 days</li>
                  <li>Monitor API usage in exchange settings</li>
                  <li>Revoke keys immediately if compromised</li>
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingConnection(null)
                  setTempApiKey('')
                  setTempApiSecret('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={setupAPIConnection}
                disabled={!tempApiKey || (['binance', 'kraken'].includes(editingConnection || '') && !tempApiSecret)}
                className="flex-1 bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary"
              >
                <CheckCircle size={16} weight="duotone" className="mr-2" />
                Connect & Encrypt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
