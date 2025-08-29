import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Heart, 
  Activity,
  Plus,
  Sun,
  Moon,
  Bell,
  Target,
  Smile,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  X,
  Info,
  Brain,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { signOutUser } from '../lib/firebase'
import Button from '../components/ui/Button'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import AssessmentHistory from '../components/AssessmentHistory'

const Dashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [greeting, setGreeting] = useState({ text: '', icon: Sun })
  const [selectedMood, setSelectedMood] = useState(null)
  const [showTipDetail, setShowTipDetail] = useState(null)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'reminder', message: 'Time to log your symptoms for today', time: '2 hours ago' },
    { id: 2, type: 'insight', message: 'Your cycle is 2 days longer than average', time: '1 day ago' }
  ])

  const [cycleData] = useState({
    daysUntilPeriod: 7,
    cycleDay: 21,
    avgCycleLength: 28,
    totalCycles: 12,
    currentPhase: 'Luteal Phase',
    phaseDay: 7,
    phaseDaysTotal: 14,
    periodLength: 5,
    healthScore: 85
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting({ text: 'Good Morning', icon: Sun })
    } else if (hour < 18) {
      setGreeting({ text: 'Good Afternoon', icon: Sun })
    } else {
      setGreeting({ text: 'Good Evening', icon: Moon })
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const firstName = currentUser?.displayName?.split(' ')[0] || 'Beautiful'

  const quickStats = [
    {
      title: 'Next Period',
      value: `${cycleData.daysUntilPeriod}`,
      unit: 'days',
      subtitle: 'Until expected date',
      icon: Calendar,
      color: 'from-luna-400 to-luna-600',
      bgColor: 'bg-gradient-to-br from-luna-50 to-luna-100',
      change: '+2',
      trend: 'up'
    },
    {
      title: 'Cycle Day',
      value: cycleData.cycleDay,
      unit: `of ${cycleData.avgCycleLength}`,
      subtitle: cycleData.currentPhase,
      icon: Activity,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      change: 'On track',
      trend: 'neutral'
    },
    {
      title: 'Health Score',
      value: cycleData.healthScore,
      unit: '%',
      subtitle: 'Excellent!',
      icon: Heart,
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      change: '+5',
      trend: 'up'
    },
    {
      title: 'Streak',
      value: '12',
      unit: 'days',
      subtitle: 'Logged daily',
      icon: Award,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      change: 'New record!',
      trend: 'up'
    }
  ]

  const todaysTips = [
    {
      id: 1,
      icon: '💧',
      title: 'Stay Hydrated',
      description: 'Drink 8 glasses of water to reduce bloating',
      category: 'wellness',
      priority: 'high',
      completed: false,
      details: 'Proper hydration during your luteal phase helps reduce bloating and supports your body\'s natural detoxification process. Aim for 2-3L throughout the day.'
    },
    {
      id: 2,
      icon: '🧘‍♀️',
      title: 'Gentle Yoga',
      description: 'Try 15 minutes of restorative poses',
      category: 'fitness',
      priority: 'medium',
      completed: true,
      details: 'Child\'s pose, cat-cow, and gentle twists can help relieve cramps and tension. Focus on deep breathing to activate your parasympathetic nervous system.'
    },
    {
      id: 3,
      icon: '🥗',
      title: 'Iron-Rich Foods',
      description: 'Include spinach and lean protein today',
      category: 'nutrition',
      priority: 'high',
      completed: false,
      details: 'During your luteal phase, your body needs extra iron to prepare for menstruation. Dark leafy greens, lean meats, and legumes are excellent sources.'
    }
  ]

  const moodOptions = [
    { emoji: '😊', label: 'Energetic', color: 'hover:bg-green-100', value: 'energetic' },
    { emoji: '😌', label: 'Calm', color: 'hover:bg-blue-100', value: 'calm' },
    { emoji: '😐', label: 'Neutral', color: 'hover:bg-gray-100', value: 'neutral' },
    { emoji: '😔', label: 'Low', color: 'hover:bg-yellow-100', value: 'low' },
    { emoji: '😴', label: 'Tired', color: 'hover:bg-purple-100', value: 'tired' }
  ]

  const communityPosts = [
    {
      id: 1,
      message: "Finally found a yoga routine that actually helps with my cramps! 🧘‍♀️",
      author: "Anonymous",
      time: "2 hours ago",
      hearts: 24,
      replies: 8
    },
    {
      id: 2,
      message: "PSA: Magnesium supplements changed my life! Less bloating, better sleep 💤",
      author: "Anonymous",
      time: "4 hours ago",
      hearts: 31,
      replies: 12
    }
  ]

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-soft-pink to-blush">
      
      {/* Enhanced Navigation Bar */}
      <nav className="luna-card mx-4 mt-4 mb-6 sticky top-4 z-50 backdrop-blur-xl bg-white/80">
        <div className="flex items-center justify-between px-6 py-4">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Heart className="h-8 w-8 text-luna-500 mr-2" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 text-luna-400" />
              </motion.div>
            </div>
            <span className="text-xl font-bold luna-gradient-text">Luna Care</span>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-luna-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {notifications.length}
                  </motion.span>
                )}
              </Button>
            </div>
            
            {/* User Avatar */}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="w-10 h-10 luna-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
                {firstName.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </motion.div>
            
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <greeting.icon className="h-6 w-6 text-luna-500 mr-2" />
                <h1 className="text-3xl font-bold text-gray-800">
                  {greeting.text}, {firstName}! 
                </h1>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <span className="ml-2">👋</span>
                </motion.div>
              </div>
              <p className="text-gray-600">
                You're on day <span className="font-semibold text-luna-600">{cycleData.cycleDay}</span> of your cycle
                <span className="mx-2">•</span>
                <span className="text-sm">{cycleData.currentPhase}</span>
              </p>
            </div>
            
            <Button className="gap-2" onClick={() => navigate('/log-cycle')}>
              <Plus className="h-4 w-4" />
              Log Symptoms
            </Button>
          </div>
        </motion.div>

        {/* Notifications Bar */}
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  className="luna-card p-4 mb-2 flex items-center justify-between bg-gradient-to-r from-luna-50 to-purple-50 border-luna-200"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      notification.type === 'reminder' ? 'bg-luna-100 text-luna-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {notification.type === 'reminder' ? <Bell className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`luna-card relative overflow-hidden ${stat.bgColor} border-0`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`}></div>
              
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend === 'up' ? 'text-green-700 bg-green-100' :
                    stat.trend === 'down' ? 'text-red-700 bg-red-100' :
                    'text-gray-700 bg-gray-100'
                  }`}>
                    {stat.trend === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                    {stat.trend === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    <span className="text-sm text-gray-600 ml-1">{stat.unit}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
              </CardContent>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cycle Overview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden bg-gradient-to-br from-white to-luna-50 border-0">
                <CardHeader className="bg-gradient-to-r from-luna-500 to-purple-500 text-white">
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Cycle Overview
                  </CardTitle>
                  <CardDescription className="text-luna-100">
                    Your menstrual health insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  
                  {/* Cycle Progress Circle */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                          animate={{ 
                            strokeDashoffset: 2 * Math.PI * 56 * (1 - (cycleData.cycleDay / cycleData.avgCycleLength))
                          }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-800">{cycleData.cycleDay}</p>
                          <p className="text-sm text-gray-600">Day</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase Information */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-luna-50 rounded-2xl">
                      <div className="text-3xl mb-2">🌙</div>
                      <p className="font-semibold text-gray-800">{cycleData.currentPhase}</p>
                      <p className="text-sm text-gray-600">Day {cycleData.phaseDay} of {cycleData.phaseDaysTotal}</p>
                      <p className="text-xs text-gray-500 mt-1">Prepare for next cycle</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-2xl">
                      <div className="text-3xl mb-2">🔮</div>
                      <p className="font-semibold text-gray-800">Next Period</p>
                      <p className="text-sm text-purple-600">{cycleData.daysUntilPeriod} days away</p>
                      <p className="text-xs text-gray-500 mt-1">Sep 4, 2024</p>
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">{cycleData.avgCycleLength}</p>
                      <p className="text-xs text-gray-600">Avg Cycle</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">{cycleData.periodLength}</p>
                      <p className="text-xs text-gray-600">Period Length</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">{cycleData.totalCycles}</p>
                      <p className="text-xs text-gray-600">Tracked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Today's Tips */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-luna-500" />
                      Today's Wellness Goals
                    </div>
                    <span className="text-sm bg-luna-100 text-luna-700 px-3 py-1 rounded-full">
                      1/3 Complete
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations for your current cycle phase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaysTips.map((tip, index) => (
                      <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                          tip.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-100 hover:border-luna-200 hover:bg-luna-50'
                        }`}
                        onClick={() => setShowTipDetail(showTipDetail === tip.id ? null : tip.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {tip.completed ? (
                              <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{tip.icon}</span>
                                <div>
                                  <h4 className={`font-semibold ${tip.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {tip.title}
                                  </h4>
                                  <p className={`text-sm ${tip.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                    {tip.description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  tip.priority === 'high' 
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {tip.priority}
                                </span>
                                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                                  showTipDetail === tip.id ? 'rotate-90' : ''
                                }`} />
                              </div>
                            </div>
                            
                            <AnimatePresence>
                              {showTipDetail === tip.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 pt-3 border-t border-gray-100"
                                >
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {tip.details}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Mood Tracker */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Smile className="h-5 w-5 mr-2 text-purple-500" />
                    How are you feeling?
                  </CardTitle>
                  <CardDescription>Track your daily mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {moodOptions.map((mood, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-2xl transition-all group relative ${
                          selectedMood === mood.value 
                            ? 'bg-luna-100 ring-2 ring-luna-400' 
                            : mood.color
                        }`}
                        onClick={() => setSelectedMood(mood.value)}
                      >
                        <div className="text-2xl">{mood.emoji}</div>
                        <div className={`text-xs mt-1 transition-opacity ${
                          selectedMood === mood.value || 'opacity-0 group-hover:opacity-100'
                        }`}>
                          {mood.label}
                        </div>
                        {selectedMood === mood.value && (
                          <motion.div
                            layoutId="selectedMood"
                            className="absolute inset-0 bg-luna-200 rounded-2xl -z-10"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                  
                  {selectedMood && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-sm text-gray-600">
                        Feeling {selectedMood} today? That's totally normal for your cycle phase!
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Score */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-emerald-500" />
                      Health Score
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{cycleData.healthScore}%</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cycle Regularity</span>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="w-14 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Symptom Management</span>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="w-12 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lifestyle Habits</span>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div className="w-15 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="w-full mt-4" size="sm">
                    View Detailed Report →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Community */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-white to-pink-50 border-pink-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-pink-500" />
                    Community Highlights
                  </CardTitle>
                  <CardDescription>What women are sharing today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-white/70 rounded-xl border border-white/50 cursor-pointer group"
                      >
                        <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                          {post.message}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{post.author} • {post.time}</span>
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {post.hearts}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {post.replies}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => navigate('/community')}
                  >
                    Join Discussion →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3" 
                      size="lg"
                      onClick={() => navigate('/log-cycle')}
                    >
                      <Calendar className="h-4 w-4" />
                      Log Today's Symptoms
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3" 
                      size="lg"
                      onClick={() => navigate('/recommendations')}
                    >
                      <BookOpen className="h-4 w-4" />
                      View Recommendations
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-3" 
                      size="lg"
                      onClick={() => navigate('/community')}
                    >
                      <Users className="h-4 w-4" />
                      Community Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* AI Health Assessment & Assessment History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-luna-500" />
                AI Health Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Get personalized PCOS risk insights using our AI model trained on real medical data.
              </p>
              <Button 
                onClick={() => navigate('/pcos-risk')}
                className="w-full"
              >
                Take AI Assessment
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-luna-500" />
                Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View your health patterns and progress over time.
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/profile')}
              >
                View Profile & History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History Component */}
        <AssessmentHistory />
      </div>
    </div>
  )
}

export default Dashboard
