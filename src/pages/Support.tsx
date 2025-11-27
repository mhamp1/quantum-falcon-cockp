// Support Center — Comprehensive Help & Documentation
// November 26, 2025 — Quantum Falcon Cockpit v2025.1.0

import { useState } from 'react'
import { 
  Lifebuoy, 
  Envelope, 
  ChatCircleDots, 
  BookOpen, 
  Question, 
  Gear, 
  CreditCard,
  Shield,
  Rocket,
  Code,
  Lock,
  FileText,
  MagnifyingGlass,
  X,
  CheckCircle,
  ArrowRight
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import DocumentationViewer from '@/components/shared/DocumentationViewer'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'

const DISCORD_URL = 'https://discord.gg/quantumfalcon'
const SUPPORT_EMAIL = 'support@quantumfalcon.com'
const DOCS_URL = 'https://docs.quantumfalcon.app'

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'How do I get started with Quantum Falcon?',
        answer: 'Create an account, choose a subscription tier that fits your needs, and start exploring the dashboard. Our interactive tour will guide you through all features.'
      },
      {
        question: 'What subscription tiers are available?',
        answer: 'We offer Free, Starter, Trader, Pro, Elite, and Lifetime tiers. Each tier unlocks different agents, strategies, and features. Check the Settings page for detailed tier comparisons.'
      },
      {
        question: 'Can I try before I buy?',
        answer: 'Yes! The Free tier gives you access to basic features including 1 agent and select strategies. Upgrade anytime to unlock more power.'
      }
    ]
  },
  {
    category: 'License & Subscriptions',
    items: [
      {
        question: 'How do I activate my license key?',
        answer: 'Enter your license key during login. License keys are emailed after purchase and can be activated immediately. Monthly subscriptions auto-renew, while lifetime licenses never expire.'
      },
      {
        question: 'My license shows as "Free tier" but I purchased a subscription. What should I do?',
        answer: 'Please contact support with your license key and purchase receipt. We\'ll verify and restore your subscription immediately.'
      },
      {
        question: 'Can I transfer my license to another account?',
        answer: 'Licenses are tied to your account and device. Contact support if you need to transfer a license due to account changes.'
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'Go to Settings → Subscription → Manage Subscription. You can cancel anytime; access continues until the current billing period ends.'
      }
    ]
  },
  {
    category: 'Trading & Strategies',
    items: [
      {
        question: 'How do agents make trading decisions?',
        answer: 'Agents use AI to analyze market data, mempool activity, whale movements, and technical indicators. Each agent has unique decision-making algorithms optimized for different strategies.'
      },
      {
        question: 'What is paper trading mode?',
        answer: 'Paper trading lets you test strategies with virtual funds. All trades are simulated using real market data, so you can perfect your approach risk-free.'
      },
      {
        question: 'Can I create custom trading strategies?',
        answer: 'Yes! Use the Strategy Builder to code custom strategies. Pro and Elite tiers get advanced strategy features and AI optimization.'
      },
      {
        question: 'How does auto-snipe work?',
        answer: 'Auto-snipe monitors the mempool for profitable opportunities and executes trades automatically when your profit targets and stop-loss criteria are met.'
      }
    ]
  },
  {
    category: 'Technical & API',
    items: [
      {
        question: 'Do you have an API?',
        answer: 'Yes! API documentation is available in the Documentation section. API access is included with Pro, Elite, and Lifetime tiers.'
      },
      {
        question: 'How do I integrate with Binance or Kraken?',
        answer: 'Go to Settings → API Integrations to add your exchange API keys. Keys are encrypted and stored securely. Always use read-only keys when possible.'
      },
      {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use industry-standard encryption, secure storage, and never store your exchange passwords. API keys are encrypted and can be revoked anytime.'
      },
      {
        question: 'Can I use Quantum Falcon on mobile?',
        answer: 'Yes! Quantum Falcon is a Progressive Web App (PWA). Install it on your phone for a native app experience. Desktop app is also available via Tauri.'
      }
    ]
  }
]

const DOCS_SECTIONS = [
  {
    title: 'Quick Start Guide',
    icon: Rocket,
    description: 'Get up and running in minutes',
    link: '/docs/quickstart'
  },
  {
    title: 'API Reference',
    icon: Code,
    description: 'Complete API documentation',
    link: '/docs/api'
  },
  {
    title: 'License Guide',
    icon: Lock,
    description: 'Understanding licenses and subscriptions',
    link: '/docs/license'
  },
  {
    title: 'Trading Strategies',
    icon: FileText,
    description: 'Strategy library and best practices',
    link: '/docs/strategies'
  },
  {
    title: 'Security',
    icon: Shield,
    description: 'Security best practices',
    link: '/docs/security'
  },
  {
    title: 'Troubleshooting',
    icon: Gear,
    description: 'Common issues and solutions',
    link: '/docs/troubleshooting'
  }
]

export default function Support() {
  const [showDocs, setShowDocs] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const auth = usePersistentAuth()

  const handleDiscord = () => {
    window.open(DISCORD_URL, '_blank', 'noopener,noreferrer')
  }

  const handleEmail = () => {
    window.open(`mailto:${SUPPORT_EMAIL}?subject=Quantum%20Falcon%20Support`, '_self')
  }

  const filteredFAQ = FAQ_ITEMS.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="cyber-card p-6 md:p-8 text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative">
            <Lifebuoy size={64} className="text-primary" weight="duotone" />
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider text-primary">
          Support Center
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get help, find answers, and connect with our team. We're here to help you succeed.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="cyber-card border-primary/20 hover:border-primary/40 transition-all cursor-pointer" onClick={handleDiscord}>
          <CardHeader>
            <ChatCircleDots size={32} className="text-primary mb-2" weight="duotone" />
            <CardTitle className="text-lg uppercase">Community</CardTitle>
            <CardDescription>
              Join our Discord for real-time support and elite alpha drops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Join Discord <ArrowRight className="ml-2" size={16} />
            </Button>
          </CardContent>
        </Card>

        <Card className="cyber-card border-primary/20 hover:border-primary/40 transition-all cursor-pointer" onClick={handleEmail}>
          <CardHeader>
            <Envelope size={32} className="text-primary mb-2" weight="duotone" />
            <CardTitle className="text-lg uppercase">Contact Us</CardTitle>
            <CardDescription>
              Reach out directly via email for technical support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Send Email <ArrowRight className="ml-2" size={16} />
            </Button>
          </CardContent>
        </Card>

        <Card className="cyber-card border-primary/20 hover:border-primary/40 transition-all cursor-pointer" onClick={() => setShowDocs(true)}>
          <CardHeader>
            <BookOpen size={32} className="text-primary mb-2" weight="duotone" />
            <CardTitle className="text-lg uppercase">Documentation</CardTitle>
            <CardDescription>
              Browse comprehensive guides and tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Docs <ArrowRight className="ml-2" size={16} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="license">License Help</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* FAQ Accordion */}
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((category) => (
              <Card key={category.category} className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-xl uppercase">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`}>
                        <AccordionTrigger className="text-left font-semibold">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="cyber-card p-8 text-center">
              <Question size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No FAQs found matching "{searchQuery}"</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOCS_SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <Card
                  key={section.title}
                  className="cyber-card border-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                  onClick={() => setShowDocs(true)}
                >
                  <CardHeader>
                    <Icon size={32} className="text-primary mb-2" weight="duotone" />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full">
                      Read More <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* License Help Tab */}
        <TabsContent value="license" className="space-y-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-xl uppercase flex items-center gap-2">
                <CreditCard size={24} className="text-primary" />
                License Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {auth?.license ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">Current Tier</p>
                      <p className="text-2xl font-bold text-primary">{auth.license.tier.toUpperCase()}</p>
                    </div>
                    <CheckCircle size={32} className="text-green-400" weight="fill" />
                  </div>

                  {auth.license.expiresAt && (
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">Expires</p>
                        <p className="text-lg font-semibold">
                          {new Date(auth.license.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {auth.license.tier === 'lifetime' && (
                    <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <CheckCircle size={24} className="text-green-400" weight="fill" />
                      <p className="text-green-400 font-semibold">Lifetime License — Never Expires</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-primary/20">
                    <h3 className="font-bold mb-2">Having License Issues?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• License not activating? Check that you entered the key correctly</li>
                      <li>• Showing wrong tier? Log out and log back in to refresh</li>
                      <li>• Still having problems? Contact support with your license key</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <Lock size={48} className="text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No active license found</p>
                  <Button onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))}>
                    Go to Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="text-xl uppercase">License Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="wrong-tier">
                  <AccordionTrigger>My license shows the wrong tier</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Log out completely</li>
                      <li>Clear your browser cache and cookies</li>
                      <li>Log back in with your license key</li>
                      <li>If still incorrect, contact support with your license key and purchase receipt</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="not-activating">
                  <AccordionTrigger>My license key won't activate</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Check for extra spaces before/after the key</li>
                      <li>Ensure you're entering the complete key</li>
                      <li>Verify your internet connection</li>
                      <li>Try a different browser or clear cache</li>
                      <li>Contact support if the issue persists</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="expired">
                  <AccordionTrigger>My subscription expired but I should have access</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>If your subscription shows as expired but you have an active payment:</p>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                      <li>Check your email for payment confirmation</li>
                      <li>Verify the payment went through on your bank/card statement</li>
                      <li>Contact support with your transaction ID and email</li>
                      <li>We'll restore your access immediately</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Viewer Modal */}
      <DocumentationViewer isOpen={showDocs} onClose={() => setShowDocs(false)} />
    </div>
  )
}

