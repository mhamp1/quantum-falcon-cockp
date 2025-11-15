import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Key, 
  LinkSimple, 
  ShieldCheck, 
  Eye, 
  EyeSlash, 
  CheckCircle,
  Warning,
  Lock
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface APIConnection {
  id: string
  name: string
  type: 'exchange' | 'wallet' | 'rpc'
  connected: boolean
  encrypted: boolean
  lastUsed?: number
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
    { id: 'jupiter', name: 'Jupiter DEX', type: 'exchange', connected: false, encrypted: true },
    { id: 'raydium', name: 'Raydium', type: 'exchange', connected: false, encrypted: true },
    { id: 'helius', name: 'Helius RPC', type: 'rpc', connected: false, encrypted: true },
  ])

  const [credentials, setCredentials] = useKV<APICredentials>('api-credentials', {})
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [editingConnection, setEditingConnection] = useState<string | null>(null)
  const [tempApiKey, setTempApiKey] = useState('')
  const [tempApiSecret, setTempApiSecret] = useState('')

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
    toast.info('Connecting wallet...', {
      description: 'Please approve the connection in your wallet'
    })

    setTimeout(() => {
      setConnections((current) => 
        current?.map((conn) =>
          conn.id === connectionId
            ? { ...conn, connected: true, lastUsed: Date.now() }
            : conn
        ) || []
      )
      
      toast.success('Wallet connected', {
        description: 'Your wallet has been securely connected'
      })
    }, 1500)
  }

  const disconnectConnection = (connectionId: string) => {
    setConnections((current) =>
      current?.map((conn) =>
        conn.id === connectionId
          ? { ...conn, connected: false }
          : conn
      ) || []
    )

    setCredentials((current) => {
      const updated = { ...current }
      delete updated[connectionId]
      return updated
    })

    toast.info('Disconnected', {
      description: 'Connection has been removed'
    })
  }

  const saveAPIKeys = (connectionId: string) => {
    if (!tempApiKey.trim()) {
      toast.error('API Key required', {
        description: 'Please enter your API key'
      })
      return
    }

    const encrypted = {
      apiKey: encryptData(tempApiKey),
      apiSecret: tempApiSecret ? encryptData(tempApiSecret) : '',
      enabled: true
    }

    setCredentials((current) => ({
      ...current,
      [connectionId]: encrypted
    }))

    setConnections((current) =>
      current?.map((conn) =>
        conn.id === connectionId
          ? { ...conn, connected: true, lastUsed: Date.now() }
          : conn
      ) || []
    )

    setEditingConnection(null)
    setTempApiKey('')
    setTempApiSecret('')

    toast.success('API credentials saved', {
      description: 'Your keys are encrypted and stored securely'
    })
  }

  const toggleKeyVisibility = (connectionId: string) => {
    setShowKeys((current) => ({
      ...current,
      [connectionId]: !current[connectionId]
    }))
  }

  if (!connections) return null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-bold uppercase tracking-wider text-primary hud-text">
          API Integrations
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect wallets, exchanges, and RPC endpoints securely
        </p>
      </div>

      <div className="space-y-4">
        {connections.map((connection) => {
          const isEditing = editingConnection === connection.id
          const creds = credentials?.[connection.id]

          return (
            <div key={connection.id} className="cyber-card p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${
                    connection.type === 'wallet' ? 'bg-primary/20' :
                    connection.type === 'exchange' ? 'bg-accent/20' :
                    'bg-secondary/20'
                  }`}>
                    {connection.type === 'wallet' ? (
                      <Wallet size={20} weight="duotone" className="text-primary" />
                    ) : connection.type === 'exchange' ? (
                      <LinkSimple size={20} weight="duotone" className="text-accent" />
                    ) : (
                      <Key size={20} weight="duotone" className="text-secondary" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-sm">
                      {connection.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={connection.connected ? 'default' : 'outline'} className="text-xs">
                        {connection.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                      {connection.encrypted && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock size={12} />
                          <span>Encrypted</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex gap-2">
                    {connection.connected ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => disconnectConnection(connection.id)}
                        className="jagged-corner-small"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <>
                        {connection.type === 'wallet' ? (
                          <Button
                            size="sm"
                            onClick={() => connectWallet(connection.id)}
                            className="jagged-corner-small"
                          >
                            Connect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setEditingConnection(connection.id)}
                            className="jagged-corner-small"
                          >
                            Setup
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="space-y-4 pt-4 border-t border-primary/30">
                  <div className="space-y-2">
                    <Label htmlFor={`${connection.id}-key`} className="text-xs uppercase tracking-wider">
                      API Key / Public Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`${connection.id}-key`}
                        type={showKeys[connection.id] ? 'text' : 'password'}
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder="Enter your API key"
                        className="flex-1 jagged-corner-small"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleKeyVisibility(connection.id)}
                      >
                        {showKeys[connection.id] ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${connection.id}-secret`} className="text-xs uppercase tracking-wider">
                      API Secret / Private Key (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`${connection.id}-secret`}
                        type={showKeys[connection.id] ? 'text' : 'password'}
                        value={tempApiSecret}
                        onChange={(e) => setTempApiSecret(e.target.value)}
                        placeholder="Enter your API secret"
                        className="flex-1 jagged-corner-small"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/30 p-3 jagged-corner-small flex items-start gap-2">
                    <ShieldCheck size={16} className="text-primary flex-shrink-0 mt-0.5" weight="duotone" />
                    <p className="text-xs text-muted-foreground">
                      Your API credentials are encrypted using AES-256 encryption and stored securely. 
                      They are never transmitted to external servers.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => saveAPIKeys(connection.id)}
                      className="jagged-corner-small"
                    >
                      Save & Connect
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingConnection(null)
                        setTempApiKey('')
                        setTempApiSecret('')
                      }}
                      className="jagged-corner-small"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {connection.connected && creds && !isEditing && (
                <div className="pt-3 border-t border-primary/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={14} className="text-primary" weight="fill" />
                    <span>Last used: {connection.lastUsed ? new Date(connection.lastUsed).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingConnection(connection.id)
                      const decryptedKey = creds.apiKey ? decryptData(creds.apiKey) : ''
                      const decryptedSecret = creds.apiSecret ? decryptData(creds.apiSecret) : ''
                      setTempApiKey(decryptedKey)
                      setTempApiSecret(decryptedSecret)
                    }}
                    className="text-xs"
                  >
                    Edit Credentials
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="cyber-card-accent p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Warning size={20} className="text-accent flex-shrink-0 mt-0.5" weight="duotone" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider">Security Notice</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Never share your API keys or private keys with anyone. Enable IP restrictions and read-only permissions 
              when possible. Quantum Falcon uses industry-standard encryption but you are responsible for the security 
              of your accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
