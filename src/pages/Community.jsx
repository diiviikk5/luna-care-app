import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Heart, 
  Reply,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Send,
  Image,
  Smile
} from 'lucide-react'
import Button from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import Input from '../components/ui/Input'

const Community = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' })
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Posts', color: 'luna' },
    { id: 'pcos', name: 'PCOS Support', color: 'purple' },
    { id: 'periods', name: 'Period Talk', color: 'red' },
    { id: 'fitness', name: 'Fitness & Movement', color: 'blue' },
    { id: 'nutrition', name: 'Nutrition', color: 'green' },
    { id: 'mental-health', name: 'Mental Health', color: 'pink' },
    { id: 'success-stories', name: 'Success Stories', color: 'yellow' }
  ]

  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Finally found relief for my PCOS symptoms! 🙌',
      content: 'After 3 months of following the Luna Care recommendations, my cycles are more regular and my acne is clearing up. The inositol supplement and seed cycling really made a difference. Don\'t lose hope, ladies! 💕',
      author: 'Anonymous Warrior',
      avatar: '🌸',
      category: 'success-stories',
      timestamp: '2 hours ago',
      hearts: 34,
      replies: 12,
      trending: true,
      tags: ['pcos', 'success', 'supplements', 'natural-remedies']
    },
    {
      id: 2,
      title: 'Period pain making work impossible - need advice 😣',
      content: 'My cramps are so severe I can barely function at work. I\'ve tried heat pads, pain meds, yoga... what else has worked for you? Especially looking for natural solutions that won\'t interfere with my cycle tracking.',
      author: 'CrampStruggler',
      avatar: '🤕',
      category: 'periods',
      timestamp: '4 hours ago',
      hearts: 18,
      replies: 23,
      trending: false,
      tags: ['cramps', 'pain-relief', 'work', 'natural-remedies']
    },
    {
      id: 3,
      title: 'Yoga routine that actually helps with PMS mood swings',
      content: 'I used to be skeptical about yoga for hormonal issues, but this 20-minute evening routine has been a game-changer for my mood during PMS. Happy to share the sequence if anyone\'s interested!',
      author: 'YogaLover',
      avatar: '🧘‍♀️',
      category: 'fitness',
      timestamp: '6 hours ago',
      hearts: 45,
      replies: 18,
      trending: true,
      tags: ['yoga', 'pms', 'mood', 'exercise']
    },
    {
      id: 4,
      title: 'Question about spearmint tea frequency?',
      content: 'Luna Care recommended spearmint tea for my high androgens. How many cups per day do you drink? I\'ve been having 2 but wondering if I should increase. Also, does the brand matter?',
      author: 'TeaQuestions',
      avatar: '🍃',
      category: 'pcos',
      timestamp: '8 hours ago',
      hearts: 12,
      replies: 9,
      trending: false,
      tags: ['spearmint-tea', 'androgens', 'dosage', 'recommendations']
    },
    {
      id: 5,
      title: 'Iron-rich meal prep ideas for heavy periods?',
      content: 'My periods are getting heavier and I\'m always exhausted. Need some tasty iron-rich meal prep ideas that aren\'t just red meat. Bonus points if they\'re anti-inflammatory too!',
      author: 'IronDeficient',
      avatar: '🥗',
      category: 'nutrition',
      timestamp: '10 hours ago',
      hearts: 28,
      replies: 15,
      trending: false,
      tags: ['iron', 'heavy-periods', 'meal-prep', 'anti-inflammatory']
    },
    {
      id: 6,
      title: 'Dealing with PCOS and feeling overwhelmed',
      content: 'Just got diagnosed with PCOS at 24 and I\'m feeling so overwhelmed by all the information. The weight gain, irregular periods, mood swings... how do you cope mentally with all of this?',
      author: 'NewlyDiagnosed',
      avatar: '💔',
      category: 'mental-health',
      timestamp: '1 day ago',
      hearts: 56,
      replies: 31,
      trending: true,
      tags: ['pcos-diagnosis', 'overwhelmed', 'mental-health', 'support']
    }
  ])

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const trendingPosts = posts.filter(post => post.trending).slice(0, 3)

  const toggleHeart = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, hearts: post.hearts + (post.hearted ? -1 : 1), hearted: !post.hearted }
        : post
    ))
  }

  const createPost = () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      const post = {
        id: Date.now(),
        title: newPost.title,
        content: newPost.content,
        author: 'You',
        avatar: '💕',
        category: newPost.category,
        timestamp: 'Just now',
        hearts: 0,
        replies: 0,
        trending: false,
        tags: []
      }
      setPosts([post, ...posts])
      setNewPost({ title: '', content: '', category: 'general' })
      setShowCreatePost(false)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'pcos': 'bg-purple-100 text-purple-700 border-purple-200',
      'periods': 'bg-red-100 text-red-700 border-red-200',
      'fitness': 'bg-blue-100 text-blue-700 border-blue-200',
      'nutrition': 'bg-green-100 text-green-700 border-green-200',
      'mental-health': 'bg-pink-100 text-pink-700 border-pink-200',
      'success-stories': 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Support</h1>
          <p className="text-gray-600">Connect, share, and support each other on your wellness journey</p>
        </div>
        <Button onClick={() => setShowCreatePost(true)} icon={<Plus className="h-4 w-4" />}>
          Share Your Story
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ x: 4 }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'luna-gradient text-white'
                        : 'text-gray-600 hover:bg-luna-50'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-luna-500" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-luna-50 rounded-lg cursor-pointer border border-luna-100"
                  >
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{post.author}</span>
                      <div className="flex items-center space-x-2">
                        <Heart className="h-3 w-3" />
                        <span>{post.hearts}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Create Post Modal */}
          <AnimatePresence>
            {showCreatePost && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={() => setShowCreatePost(false)}
              >
                <Card 
                  className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardHeader>
                    <CardTitle>Share Your Story</CardTitle>
                    <CardDescription>
                      Your experience could help another woman on her journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Give your post a title..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    />
                    
                    <select
                      className="luna-input w-full"
                      value={newPost.category}
                      onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    >
                      <option value="general">General</option>
                      <option value="pcos">PCOS Support</option>
                      <option value="periods">Period Talk</option>
                      <option value="fitness">Fitness & Movement</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="mental-health">Mental Health</option>
                      <option value="success-stories">Success Stories</option>
                    </select>
                    
                    <textarea
                      className="luna-input w-full h-32 resize-none"
                      placeholder="Share your thoughts, experiences, or questions..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    />
                    
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createPost} disabled={!newPost.title.trim() || !newPost.content.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts Feed */}
          <div className="space-y-6">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-luna-100 rounded-full flex items-center justify-center text-lg">
                            {post.avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{post.author}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{post.timestamp}</span>
                              <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(post.category)}`}>
                                {categories.find(c => c.id === post.category)?.name || post.category}
                              </span>
                              {post.trending && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full border border-orange-200 flex items-center">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Trending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Title */}
                      <h2 className="text-xl font-semibold text-gray-800 mb-3">{post.title}</h2>

                      {/* Post Content */}
                      <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full cursor-pointer hover:bg-luna-100 hover:text-luna-700 transition-colors"
                              onClick={() => setSearchTerm(tag)}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 text-sm transition-colors ${
                              post.hearted ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                            }`}
                            onClick={() => toggleHeart(post.id)}
                          >
                            <Heart className={`h-4 w-4 ${post.hearted ? 'fill-current' : ''}`} />
                            <span>{post.hearts}</span>
                          </motion.button>
                          
                          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-luna-600 transition-colors">
                            <Reply className="h-4 w-4" />
                            <span>{post.replies} replies</span>
                          </button>
                        </div>

                        <Button variant="ghost" size="sm">
                          Join Conversation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MessageCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share in this category!'}
              </p>
              <Button onClick={() => setShowCreatePost(true)}>
                Start the Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Community
