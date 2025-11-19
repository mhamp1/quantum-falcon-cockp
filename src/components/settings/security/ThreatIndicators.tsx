import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldWarning, ShieldCheck, Warning, CheckCircle, Lightning, Clock } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface ThreatIndicatorsProps {
  securityScore: number;
  failedLoginAttempts: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function ThreatIndicators({ securityScore, failedLoginAttempts, threatLevel }: ThreatIndicatorsProps) {
  const getThreatIcon = () => {
    if (threatLevel === 'LOW') return ShieldCheck;
    if (threatLevel === 'MEDIUM') return Warning;
    return ShieldWarning;
  };

  const getThreatColor = () => {
    if (threatLevel === 'LOW') return 'text-green-400';
    if (threatLevel === 'MEDIUM') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getThreatBgColor = () => {
    if (threatLevel === 'LOW') return 'bg-green-500/10';
    if (threatLevel === 'MEDIUM') return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getThreatBorderColor = () => {
    if (threatLevel === 'LOW') return 'border-green-500/30';
    if (threatLevel === 'MEDIUM') return 'border-yellow-500/30';
    return 'border-red-500/30';
  };

  const ThreatIcon = getThreatIcon();

  return (
    <Card className={`cyber-card p-6 ${getThreatBgColor()} border-2 ${getThreatBorderColor()}`}>
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: threatLevel === 'HIGH' ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <ThreatIcon size={48} className={getThreatColor()} weight="fill" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-2xl font-black uppercase tracking-wider mb-1">
            Real-Time Threat Monitor
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered behavioral analysis and anomaly detection
          </p>
        </div>
        <Badge className={`px-4 py-2 text-lg font-bold ${getThreatBgColor()} ${getThreatColor()} ${getThreatBorderColor()}`}>
          {threatLevel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-background/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Brute Force Detection
            </span>
            {failedLoginAttempts > 5 ? (
              <Warning size={20} className="text-red-400" weight="fill" />
            ) : (
              <CheckCircle size={20} className="text-green-400" weight="fill" />
            )}
          </div>
          <p className="text-2xl font-black">
            {failedLoginAttempts} <span className="text-sm text-muted-foreground font-normal">attempts</span>
          </p>
          <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${failedLoginAttempts > 10 ? 'bg-red-500' : failedLoginAttempts > 5 ? 'bg-yellow-500' : 'bg-green-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((failedLoginAttempts / 15) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="p-4 bg-background/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Account Takeover Risk
            </span>
            <CheckCircle size={20} className="text-green-400" weight="fill" />
          </div>
          <p className="text-2xl font-black text-green-400">
            0% <span className="text-sm text-muted-foreground font-normal">detected</span>
          </p>
          <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-green-500" />
          </div>
        </div>

        <div className="p-4 bg-background/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              API Abuse Detection
            </span>
            <CheckCircle size={20} className="text-green-400" weight="fill" />
          </div>
          <p className="text-2xl font-black text-green-400">
            Normal <span className="text-sm text-muted-foreground font-normal">usage</span>
          </p>
          <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full w-[15%] bg-green-500" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightning size={20} className="text-primary" weight="fill" />
            <span className="text-sm font-semibold uppercase tracking-wide">Active Protections</span>
          </div>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              Rate limiting active (100 req/min)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              Device fingerprinting enabled
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              Session anomaly detection live
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              API key rotation enforced
            </li>
          </ul>
        </div>

        <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-accent" weight="fill" />
            <span className="text-sm font-semibold uppercase tracking-wide">Recent Activity</span>
          </div>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              Last successful login: 2 min ago
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              Last API key access: 5 min ago
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              Last security scan: 10 sec ago
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-green-400" weight="fill" />
              Last threat check: 3 sec ago
            </li>
          </ul>
        </div>
      </div>

      {threatLevel === 'HIGH' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-500/20 rounded-lg border-2 border-red-500/50"
        >
          <div className="flex items-start gap-3">
            <ShieldWarning size={24} className="text-red-400 flex-shrink-0 mt-0.5" weight="fill" />
            <div>
              <p className="font-bold text-red-400 mb-2">⚠️ HIGH THREAT LEVEL DETECTED</p>
              <p className="text-sm text-muted-foreground mb-3">
                Multiple failed login attempts detected. Your account may be under attack.
              </p>
              <p className="text-sm font-semibold text-foreground">
                Recommended Actions:
              </p>
              <ul className="text-sm space-y-1 mt-2 list-disc list-inside text-muted-foreground">
                <li>Review active sessions and terminate suspicious ones</li>
                <li>Change your password immediately</li>
                <li>Enable 2FA if not already active</li>
                <li>Check for unauthorized API key usage</li>
                <li>Contact support if unauthorized access occurred</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
