import { useState, useEffect } from 'react'
import { X, BookOpen, Download } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface DocumentationViewerProps {
  isOpen: boolean
  onClose: () => void
}

export default function DocumentationViewer({ isOpen, onClose }: DocumentationViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      // Load documentation from the docs folder
      fetch('/docs/QUANTUM_FALCON_DOCUMENTATION.md')
        .then(res => res.text())
        .then(text => {
          setContent(text)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load documentation:', err)
          setContent('# Documentation\n\nFailed to load documentation. Please check your connection or contact support.')
          setLoading(false)
        })
    }
  }, [isOpen])

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Quantum_Falcon_Documentation.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-6xl max-h-[95vh] bg-background border-4 border-primary/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col ml-0 md:ml-64"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <BookOpen size={32} className="text-primary" weight="duotone" />
                <h2 className="text-2xl font-bold uppercase tracking-wider text-primary">
                  Quantum Falcon Documentation
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">
                      Loading Documentation...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none mx-auto">
                  <div className="bg-background/50 p-6 rounded-lg border border-primary/20">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed overflow-x-auto">
                      {content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

