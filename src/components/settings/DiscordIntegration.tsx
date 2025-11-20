// FINAL ELITE FEATURES: Master Search (Cmd+K) + Discord Integration — 100% live app match — November 20, 2025

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DiscordLogo, CheckCircle, XCircle, ArrowSquareOut, SignOut } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DiscordOAuth, DiscordConnection } from '@/lib/discord/oauth';
import { soundEffects } from '@/lib/soundEffects';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DiscordIntegration() {
  const [connection, setConnection] = useState<DiscordConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadConnection();
    handleOAuthCallback();
  }, []);

  const loadConnection = async () => {
    setIsLoading(true);
    try {
      const conn = await DiscordOAuth.getConnection();
      setConnection(conn);
    } catch (error) {
      console.error('[Discord] Failed to load connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      setIsConnecting(true);
      try {
        const conn = await DiscordOAuth.handleCallback();
        if (conn) {
          setConnection(conn);
          toast.success('Discord connected successfully!', {
            description: `Welcome, ${conn.username}#${conn.discriminator}`,
          });
          soundEffects.playSuccess();
        } else {
          toast.error('Failed to connect Discord', {
            description: 'Please try again or check your credentials.',
          });
        }
      } catch (error) {
        console.error('[Discord] OAuth callback error:', error);
        toast.error('Discord connection failed', {
          description: 'An error occurred during authentication.',
        });
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleConnect = () => {
    soundEffects.playClick();
    setIsConnecting(true);
    DiscordOAuth.initiateOAuth();
  };

  const handleDisconnect = async () => {
    soundEffects.playClick();
    
    try {
      await DiscordOAuth.disconnect();
      setConnection(null);
      toast.success('Discord disconnected', {
        description: 'Your Discord account has been unlinked.',
      });
    } catch (error) {
      console.error('[Discord] Failed to disconnect:', error);
      toast.error('Failed to disconnect Discord');
    }
  };

  const handleOpenInvite = () => {
    soundEffects.playClick();
    window.open(DiscordOAuth.getInviteUrl(), '_blank');
  };

  const getAvatarUrl = (connection: DiscordConnection) => {
    if (!connection.avatar) {
      return `https://cdn.discordapp.com/embed/avatars/${parseInt(connection.discriminator) % 5}.png`;
    }
    return `https://cdn.discordapp.com/avatars/${connection.userId}/${connection.avatar}.png?size=128`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="glass-morph-card p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-morph-card p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #5865F2 0%, #7289DA 100%)',
              boxShadow: '0 0 20px rgba(88, 101, 242, 0.3)',
            }}
          >
            <DiscordLogo size={32} weight="fill" className="text-white" />
          </div>
          
          <div>
            <h3 
              className="text-xl font-bold uppercase tracking-wide"
              style={{ 
                textShadow: '0 0 6px rgba(88, 101, 242, 0.3)',
                color: '#e0e0ff'
              }}
            >
              DISCORD
            </h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Community Integration
            </p>
          </div>
        </div>

        {connection && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, oklch(0.12 0.03 280 / 0.5) 0%, oklch(0.15 0.06 280 / 0.3) 100%)',
              border: '1px solid oklch(0.72 0.20 195 / 0.3)',
            }}
          >
            <CheckCircle size={16} weight="fill" className="text-green-400" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
              Connected
            </span>
          </motion.div>
        )}
      </div>

      {!connection ? (
        <div className="space-y-4">
          <div 
            className="p-6 rounded-2xl space-y-3"
            style={{
              background: 'linear-gradient(135deg, oklch(0.12 0.03 280 / 0.5) 0%, oklch(0.15 0.06 280 / 0.3) 100%)',
              border: '1px solid oklch(0.35 0.12 195 / 0.2)',
            }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle size={20} weight="fill" className="text-red-400" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Not Connected
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect your Discord account to access exclusive channels, real-time alerts, 
              and community features. Join elite traders in the Quantum Falcon server.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="lg"
              className="flex-1"
              style={{
                background: 'linear-gradient(135deg, #5865F2 0%, #7289DA 100%)',
                color: 'white',
                boxShadow: '0 0 20px rgba(88, 101, 242, 0.4)',
              }}
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <DiscordLogo size={20} weight="fill" className="mr-2" />
                  Connect Discord
                </>
              )}
            </Button>

            <Button
              onClick={handleOpenInvite}
              variant="outline"
              size="lg"
              className="sm:w-auto"
            >
              <ArrowSquareOut size={20} className="mr-2" />
              Join Server
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: 'linear-gradient(135deg, oklch(0.12 0.03 280 / 0.5) 0%, oklch(0.15 0.06 280 / 0.3) 100%)',
              border: '1px solid oklch(0.72 0.20 195 / 0.3)',
            }}
          >
            <div className="flex items-center gap-4">
              <img
                src={getAvatarUrl(connection)}
                alt={`${connection.username}'s avatar`}
                className="w-16 h-16 rounded-full border-2 border-primary/30"
              />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-foreground">
                  {connection.username}
                  <span className="text-muted-foreground">#{connection.discriminator}</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Connected {formatDate(connection.connectedAt)}
                </p>
              </div>
            </div>

            {connection.serverRole && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.10 0.02 280 / 0.5) 0%, oklch(0.12 0.03 280 / 0.3) 100%)',
                    border: '1px solid oklch(0.68 0.18 330 / 0.2)',
                  }}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Server Role
                  </p>
                  <p 
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ 
                      color: '#DC1FFF',
                      textShadow: '0 0 6px rgba(220, 31, 255, 0.3)'
                    }}
                  >
                    {connection.serverRole}
                  </p>
                </div>

                {connection.serverMemberSince && (
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.10 0.02 280 / 0.5) 0%, oklch(0.12 0.03 280 / 0.3) 100%)',
                      border: '1px solid oklch(0.72 0.20 195 / 0.2)',
                    }}
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Member Since
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(connection.serverMemberSince)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleOpenInvite}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <ArrowSquareOut size={20} className="mr-2" />
              Open Discord Server
            </Button>

            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="lg"
              className="sm:w-auto text-destructive hover:text-destructive"
            >
              <SignOut size={20} className="mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      )}

      <div 
        className="p-4 rounded-xl space-y-2"
        style={{
          background: 'linear-gradient(135deg, oklch(0.10 0.02 280 / 0.3) 0%, oklch(0.12 0.03 280 / 0.2) 100%)',
          border: '1px solid oklch(0.35 0.12 195 / 0.15)',
        }}
      >
        <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Benefits
        </h5>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Exclusive elite trader channels
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Real-time trade alerts and signals
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Rich presence status (shows current activity)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Direct support from the team
          </li>
        </ul>
      </div>
    </div>
  );
}
