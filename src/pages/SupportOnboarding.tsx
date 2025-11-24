// Support Page — Simple placeholder
// November 22, 2025 — Quantum Falcon Cockpit

import { Lifebuoy, Envelope, MessageCircle, BookOpen } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export default function SupportOnboarding() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="cyber-card p-8 text-center space-y-6">
        <Lifebuoy size={64} className="text-primary mx-auto" weight="duotone" />
        <h1 className="text-4xl font-bold uppercase tracking-wider text-primary">
          Support Center
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get help, find answers, and connect with our team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-card p-6 space-y-4">
          <MessageCircle size={32} className="text-primary" weight="duotone" />
          <h3 className="text-xl font-bold uppercase">Community</h3>
          <p className="text-sm text-muted-foreground">
            Join our Discord community for real-time support and discussions
          </p>
          <Button className="w-full">Join Discord</Button>
        </div>

        <div className="cyber-card p-6 space-y-4">
          <Envelope size={32} className="text-primary" weight="duotone" />
          <h3 className="text-xl font-bold uppercase">Contact Us</h3>
          <p className="text-sm text-muted-foreground">
            Reach out directly via email for technical support
          </p>
          <Button className="w-full" variant="outline">Send Email</Button>
        </div>

        <div className="cyber-card p-6 space-y-4">
          <BookOpen size={32} className="text-primary" weight="duotone" />
          <h3 className="text-xl font-bold uppercase">Documentation</h3>
          <p className="text-sm text-muted-foreground">
            Browse our comprehensive guides and tutorials
          </p>
          <Button className="w-full" variant="outline">View Docs</Button>
        </div>
      </div>
    </div>
  )
}

