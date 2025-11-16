import { useState } from 'react'
import { useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChatCircle, ThumbsUp, Eye, Clock, Plus, Fire, Star, 
  TrendUp, MagnifyingGlass, Funnel, PaperPlaneRight, User
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import ProfileUpload from '@/components/shared/ProfileUpload'

interface ForumPost {
  id: string
  author: string
  authorAvatar: string
  title: string
  content: string
  likes: number
  likedBy: string[]
  comments: ForumComment[]
  views: number
  timestamp: number
  tags: string[]
  isPinned?: boolean
}

interface ForumComment {
  id: string
  author: string
  authorAvatar: string
  content: string
  likes: number
  timestamp: number
}

export default function Forum() {
  const [posts, setPosts] = useKV<ForumPost[]>('forum-posts', [
    {
      id: '1',
      author: 'TradeGuru',
      authorAvatar: '🎯',
      title: 'Best settings for RSI strategy in current market?',
      content: 'Has anyone found optimal RSI thresholds for the current volatile market? I\'m testing 30/70 vs 20/80 and would love to hear what\'s working for everyone else. Also considering adding volume confirmation to reduce false signals.',
      likes: 45,
      likedBy: [],
      comments: [
        {
          id: 'c1',
          author: 'CryptoNinja',
          authorAvatar: '🥷',
          content: 'I\'ve been using 25/75 with good results. The key is combining it with trend confirmation.',
          likes: 12,
          timestamp: Date.now() - 3600000
        },
        {
          id: 'c2',
          author: 'SolanaWhale',
          authorAvatar: '🐋',
          content: 'Try adaptive RSI that adjusts thresholds based on volatility. Game changer!',
          likes: 8,
          timestamp: Date.now() - 1800000
        }
      ],
      views: 234,
      timestamp: Date.now() - 3600000 * 2,
      tags: ['Question', 'RSI', 'Settings'],
      isPinned: true
    },
    {
      id: '2',
      author: 'CryptoMaven',
      authorAvatar: '🚀',
      title: 'My $10K to $50K journey using Quantum Falcon',
      content: 'After 3 months of consistent trading with the DCA and momentum strategies, I turned $10K into $50K. Here\'s my complete breakdown of strategies, risk management, and lessons learned along the way. AMA!',
      likes: 178,
      likedBy: [],
      comments: [
        {
          id: 'c3',
          author: 'DiamondHands',
          authorAvatar: '💎',
          content: 'Congrats! What was your biggest lesson?',
          likes: 5,
          timestamp: Date.now() - 7200000
        }
      ],
      views: 892,
      timestamp: Date.now() - 3600000 * 8,
      tags: ['Success Story', 'Tips', 'DCA']
    },
    {
      id: '3',
      author: 'SolanaDev',
      authorAvatar: '⚡',
      title: 'New feature idea: Multi-timeframe analysis',
      content: 'Would love to see analysis across 1m, 5m, 15m, 1h timeframes simultaneously. This would help identify alignment across different time horizons for better entry timing.',
      likes: 92,
      likedBy: [],
      comments: [],
      views: 456,
      timestamp: Date.now() - 3600000 * 16,
      tags: ['Feature Request', 'Analysis']
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent')
  const [showNewPostDialog, setShowNewPostDialog] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTags, setNewPostTags] = useState<string[]>([])
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [newComment, setNewComment] = useState('')

  const allTags = ['All', 'Question', 'Success Story', 'Tips', 'Feature Request', 'RSI', 'DCA', 'Strategy', 'Analysis', 'Help']

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Missing Information', {
        description: 'Please provide both title and content'
      })
      return
    }

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      author: 'You',
      authorAvatar: '👤',
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      likedBy: [],
      comments: [],
      views: 0,
      timestamp: Date.now(),
      tags: newPostTags.length > 0 ? newPostTags : ['General']
    }

    setPosts((current) => [newPost, ...(current || [])])
    setShowNewPostDialog(false)
    setNewPostTitle('')
    setNewPostContent('')
    setNewPostTags([])

    toast.success('Post Created!', {
      description: 'Your post has been published to the community'
    })
  }

  const handleLikePost = (postId: string) => {
    setPosts((current) =>
      (current || []).map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likedBy?.includes('user-1') ? post.likes - 1 : post.likes + 1,
              likedBy: post.likedBy?.includes('user-1')
                ? post.likedBy.filter((id) => id !== 'user-1')
                : [...(post.likedBy || []), 'user-1']
            }
          : post
      )
    )
  }

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return

    const comment: ForumComment = {
      id: `comment-${Date.now()}`,
      author: 'You',
      authorAvatar: '👤',
      content: newComment,
      likes: 0,
      timestamp: Date.now()
    }

    setPosts((current) =>
      (current || []).map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    )

    setNewComment('')
    toast.success('Comment Added!')
  }

  const filteredPosts = (posts || [])
    .filter((post) => {
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTag =
        selectedTag === 'all' || post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      if (sortBy === 'recent') return b.timestamp - a.timestamp
      if (sortBy === 'popular') return b.likes - a.likes
      if (sortBy === 'trending') return b.views - a.views
      return 0
    })

  return (
    <div className="space-y-6">
      <div className="cyber-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-10" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 border-2 border-primary jagged-corner">
                <ChatCircle size={32} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-primary">Trading Forum</h2>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {filteredPosts.length} discussions • Secure & encrypted
                </p>
              </div>
            </div>

            <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
              <DialogTrigger asChild>
                <Button className="jagged-corner-small border-2 border-accent bg-accent/20 hover:bg-accent/30 text-accent">
                  <Plus size={18} weight="bold" className="mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="cyber-card-accent border-2 border-accent max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-accent">
                    Create New Post
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="data-label mb-2 block">POST TITLE</label>
                    <Input
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="What's your topic?"
                      className="bg-background/60"
                    />
                  </div>
                  <div>
                    <label className="data-label mb-2 block">CONTENT</label>
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your thoughts, questions, or insights..."
                      rows={6}
                      className="bg-background/60 resize-none"
                    />
                  </div>
                  <div>
                    <label className="data-label mb-2 block">TAGS (Select up to 3)</label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(1).map((tag) => (
                        <Badge
                          key={tag}
                          variant={newPostTags.includes(tag) ? 'default' : 'outline'}
                          className={`cursor-pointer transition-all ${
                            newPostTags.includes(tag)
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => {
                            if (newPostTags.includes(tag)) {
                              setNewPostTags(newPostTags.filter((t) => t !== tag))
                            } else if (newPostTags.length < 3) {
                              setNewPostTags([...newPostTags, tag])
                            } else {
                              toast.error('Maximum 3 tags allowed')
                            }
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreatePost}
                      className="flex-1 jagged-corner border-2 border-primary bg-primary/20 hover:bg-primary/30 text-primary"
                    >
                      <PaperPlaneRight size={18} weight="bold" className="mr-2" />
                      Publish Post
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewPostDialog(false)}
                      className="border-muted"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="glass-morph-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass size={20} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="pl-10 bg-background/60"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[140px] bg-background/60">
                <Funnel size={16} weight="duotone" className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag.toLowerCase() ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                selectedTag === tag.toLowerCase()
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setSelectedTag(tag.toLowerCase())}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="cyber-card p-12 text-center">
            <ChatCircle size={64} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-muted-foreground mb-2">
              No Posts Found
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or be the first to start a discussion!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`glass-morph-card p-6 space-y-4 hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.3)] transition-all cursor-pointer ${
                post.isPinned ? 'ring-2 ring-accent' : ''
              }`}
              onClick={() => setSelectedPost(post)}
            >
              {post.isPinned && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-accent/20 border border-accent text-accent text-[9px] uppercase tracking-wider">
                    <Star size={12} weight="fill" className="mr-1" />
                    Pinned
                  </Badge>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/20 border-2 border-primary flex items-center justify-center text-2xl">
                    {post.authorAvatar}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold uppercase tracking-wide mb-1 hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{post.author}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={12} weight="duotone" />
                          {formatTimeAgo(post.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] uppercase">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikePost(post.id)
                        }}
                        className={`flex items-center gap-1 hover:text-primary transition-colors ${
                          post.likedBy?.includes('user-1') ? 'text-primary' : ''
                        }`}
                      >
                        <ThumbsUp size={16} weight={post.likedBy?.includes('user-1') ? 'fill' : 'duotone'} />
                        {post.likes}
                      </button>
                      <div className="flex items-center gap-1">
                        <ChatCircle size={16} weight="duotone" />
                        {post.comments.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={16} weight="duotone" />
                        {post.views}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={selectedPost !== null} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="cyber-card border-2 border-primary max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-border/50">
                <div className="w-16 h-16 bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl flex-shrink-0">
                  {selectedPost.authorAvatar}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold uppercase tracking-wide mb-2">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="font-semibold text-foreground">{selectedPost.author}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={14} weight="duotone" />
                      {formatTimeAgo(selectedPost.timestamp)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] uppercase">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed">{selectedPost.content}</p>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-border/50">
                <button
                  onClick={() => handleLikePost(selectedPost.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 transition-all jagged-corner-small ${
                    selectedPost.likedBy?.includes('user-1')
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-muted hover:border-primary hover:bg-primary/10'
                  }`}
                >
                  <ThumbsUp size={18} weight={selectedPost.likedBy?.includes('user-1') ? 'fill' : 'duotone'} />
                  <span className="font-bold">{selectedPost.likes}</span>
                </button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye size={18} weight="duotone" />
                  <span className="font-bold">{selectedPost.views} views</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold uppercase tracking-wider">
                  Comments ({selectedPost.comments.length})
                </h3>

                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-muted/20 border border-muted/30 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/20 border border-primary flex items-center justify-center text-xl flex-shrink-0">
                        {comment.authorAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-background/40 border border-primary/30 space-y-3">
                  <label className="data-label">ADD COMMENT</label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="bg-background/60 resize-none"
                  />
                  <Button
                    onClick={() => handleAddComment(selectedPost.id)}
                    className="w-full jagged-corner border-2 border-primary bg-primary/20 hover:bg-primary/30 text-primary"
                  >
                    <PaperPlaneRight size={18} weight="bold" className="mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
