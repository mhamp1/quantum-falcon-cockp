import { useState, useRef } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Camera, User, Upload } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ProfileUploadProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showUploadButton?: boolean
  editable?: boolean
}

export default function ProfileUpload({ size = 'md', showUploadButton = true, editable = true }: ProfileUploadProps) {
  const [profileImage, setProfileImage] = useKV<string>('user-profile-image', '')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large', {
        description: 'Please select an image under 5MB'
      })
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file'
      })
      return
    }

    setIsUploading(true)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setProfileImage(base64String)
      setIsUploading(false)
      toast.success('Profile image updated', {
        description: 'Your new profile picture has been saved'
      })
    }
    reader.onerror = () => {
      setIsUploading(false)
      toast.error('Upload failed', {
        description: 'Failed to read the image file'
      })
    }
    reader.readAsDataURL(file)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} jagged-corner border-2 border-primary`}>
          <AvatarImage src={profileImage || undefined} alt="Profile" />
          <AvatarFallback className="bg-card text-primary">
            <User size={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 40} weight="duotone" />
          </AvatarFallback>
        </Avatar>
        
        {editable && (
          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center jagged-corner cursor-pointer disabled:cursor-not-allowed"
          >
            <Camera size={size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 28} className="text-primary" weight="duotone" />
          </button>
        )}
      </div>

      {showUploadButton && editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            onClick={triggerFileSelect}
            disabled={isUploading}
            size="sm"
            variant="outline"
            className="jagged-corner-small border-primary/50 hover:border-primary text-xs uppercase tracking-wider"
          >
            <Upload size={14} weight="duotone" className="mr-2" />
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </Button>
        </>
      )}
    </div>
  )
}
