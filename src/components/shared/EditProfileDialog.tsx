import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, At, Envelope, MapPin, LinkSimple, FloppyDisk, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserProfile {
  username: string
  email: string
  bio?: string
  location?: string
  website?: string
  twitter?: string
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
    email: 'trader@quantum.ai',
    level: 15,
    xp: 8450,
    xpToNextLevel: 10000,
    totalTrades: 247,
    winRate: 68.5,
    memberSince: '2024-01-15'
  })

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    twitter: ''
  })

  useEffect(() => {
    if (profile && open) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        twitter: profile.twitter || ''
      })
    }
  }, [profile, open])

  const handleSave = () => {
    if (!formData.username.trim()) {
      toast.error('Username is required')
      return
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Valid email is required')
      return
    }

    setProfile((current) => ({
      ...(current ?? {}),
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      twitter: formData.twitter,
      level: current?.level ?? 1,
      xp: current?.xp ?? 0,
      xpToNextLevel: current?.xpToNextLevel ?? 1000,
      totalTrades: current?.totalTrades ?? 0,
      winRate: current?.winRate ?? 0,
      memberSince: current?.memberSince ?? new Date().toISOString().split('T')[0]
    }))

    toast.success('Profile updated successfully!', {
      description: 'Your changes have been saved'
    })
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[85vh] cyber-card border-2 border-primary/30 p-0 gap-0 overflow-hidden">
        <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        
        <DialogHeader className="p-6 pb-4 border-b border-primary/30 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 jagged-corner-small bg-primary/20 border border-primary/50">
              <User size={24} weight="duotone" className="text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold uppercase tracking-[0.15em] hud-text text-primary">
              Edit Profile
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 relative z-10 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-2">
              <At size={14} weight="duotone" className="text-primary" />
              Username *
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="jagged-corner-small border-primary/30 focus:border-primary bg-background/50"
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-2">
              <Envelope size={14} weight="duotone" className="text-primary" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="jagged-corner-small border-primary/30 focus:border-primary bg-background/50"
              placeholder="Enter email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-2">
              <User size={14} weight="duotone" className="text-accent" />
              Bio
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="jagged-corner-small border-primary/30 focus:border-primary bg-background/50 min-h-[80px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-2">
                <MapPin size={14} weight="duotone" className="text-accent" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="jagged-corner-small border-primary/30 focus:border-primary bg-background/50"
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-2">
                <At size={14} weight="duotone" className="text-accent" />
                Twitter
              </Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="jagged-corner-small border-primary/30 focus:border-primary bg-background/50"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-2">
              <LinkSimple size={14} weight="duotone" className="text-accent" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="jagged-corner-small border-primary/30 focus:border-primary bg-background/50"
              placeholder="https://your-website.com"
            />
          </div>

          <div className="p-4 jagged-corner-small bg-accent/10 border border-accent/30 relative overflow-hidden">
            <div className="absolute inset-0 diagonal-stripes opacity-10" />
            <p className="text-xs text-muted-foreground relative z-10">
              * Required fields. Your profile information will be visible to other community members.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4 border-t border-primary/30 relative z-10">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 border-border/50 hover:border-primary/50 hover:bg-muted/20 jagged-corner-small uppercase tracking-wider font-bold"
          >
            <X size={16} weight="bold" className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary 
                     shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)] hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]
                     transition-all jagged-corner-small uppercase tracking-wider font-bold"
          >
            <FloppyDisk size={16} weight="fill" className="mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
