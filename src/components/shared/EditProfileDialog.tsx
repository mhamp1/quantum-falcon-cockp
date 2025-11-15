import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, EnvelopeSimple, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import ProfileUpload from './ProfileUpload'

interface UserProfile {
  username: string
  email: string
  level: number
  xp: number
  xpToNextLevel: number
  totalTrades: number
  winRate: number
  memberSince: string
}

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const [profile, setProfile] = useKV<UserProfile>('user-profile-full', {
    username: 'QuantumTrader',
    email: 'trader@quantumfalcon.ai',
    level: 15,
    xp: 3450,
    xpToNextLevel: 5000,
    totalTrades: 234,
    winRate: 68.5,
    memberSince: 'Jan 2024'
  })

  const [localUsername, setLocalUsername] = useState(profile?.username || '')
  const [localEmail, setLocalEmail] = useState(profile?.email || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    if (!localUsername.trim()) {
      toast.error('Username required', {
        description: 'Please enter a valid username'
      })
      return
    }

    if (!localEmail.trim() || !localEmail.includes('@')) {
      toast.error('Invalid email', {
        description: 'Please enter a valid email address'
      })
      return
    }

    setIsSaving(true)
    
    setTimeout(() => {
      setProfile({
        ...(profile || {
          level: 15,
          xp: 3450,
          xpToNextLevel: 5000,
          totalTrades: 234,
          winRate: 68.5,
          memberSince: 'Jan 2024'
        }),
        username: localUsername,
        email: localEmail
      })
      
      setIsSaving(false)
      toast.success('Profile updated successfully', {
        description: 'Your changes have been saved'
      })
      onOpenChange(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cyber-card border-3 border-primary/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-[0.2em] text-primary hud-text flex items-center gap-2">
            <User size={24} weight="duotone" className="text-primary" />
            EDIT PROFILE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <ProfileUpload size="xl" showUploadButton={true} editable={true} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm uppercase tracking-wide font-bold flex items-center gap-2">
                <User size={16} weight="duotone" className="text-primary" />
                Username
              </Label>
              <Input
                id="username"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-background/60 border-primary/30 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm uppercase tracking-wide font-bold flex items-center gap-2">
                <EnvelopeSimple size={16} weight="duotone" className="text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="Enter email"
                className="bg-background/60 border-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/30 jagged-corner-small">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} weight="fill" className="text-primary mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">
                  Profile Information
                </p>
                <p className="text-xs text-muted-foreground">
                  Your profile image, username, and email will be visible to other community members.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-muted hover:bg-muted/20 jagged-corner-small"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-primary/90 jagged-corner-small"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
