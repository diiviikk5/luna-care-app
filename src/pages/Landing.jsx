// src/pages/Landing.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ✅ FIX: Import default Card + named exports in one line
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'

import { 
  Heart, 
  Calendar, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Shield, 
  Moon, 
  Sun, 
  AlertCircle 
} from 'lucide-react'
import { signInWithGooglePopup, signUpWithEmail, signInWithEmail } from '../lib/firebase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'


const Landing = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const getErrorMessage = (error) => {
    switch (error?.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed.'
      case 'auth/cancelled-popup-request':
        return 'A sign-in popup is already open. Please try again.'
      case 'auth/network-request-failed':
        return 'Network issue. Please check your connection.'
      default:
        return error?.message || 'An error occurred. Please try again.'
    }
  }

  const goDashboard = () => navigate('/dashboard', { replace: true })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await signInWithEmail(formData.email.trim(), formData.password)
        console.log('✅ User signed in successfully')
        goDashboard()
      } else {
        if (!formData.name.trim()) {
          throw new Error('Please enter your name')
        }
        await signUpWithEmail(formData.email.trim(), formData.password, formData.name.trim())
        console.log('✅ User account created successfully')
        goDashboard()
      }
    } catch (err) {
      console.error('❌ Authentication error:', err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      await signInWithGooglePopup() // Fixed function name
      console.log('✅ Google sign-in successful')
      goDashboard()
    } catch (err) {
      console.error('❌ Google sign-in error:', err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Calendar,
      title: "Smart Cycle Tracking",
      description: "AI-powered predictions with 95% accuracy",
      color: "from-luna-400 to-luna-600"
    },
    {
      icon: TrendingUp,
      title: "PCOS Risk Assessment",
      description: "Early detection through symptom analysis",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: Heart,
      title: "Personalized Wellness",
      description: "Custom diet, exercise & lifestyle tips",
      color: "from-pink-400 to-rose-600"
    },
    {
      icon: Users,
      title: "Safe Community",
      description: "Anonymous support from women worldwide",
      color: "from-emerald-400 to-emerald-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-soft-pink to-blush bg-dots">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          
          {/* Left Side - Hero Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Logo */}
            <motion.div 
              className="flex items-center justify-center lg:justify-start mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Heart className="h-12 w-12 text-luna-500 floating-element" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4 text-luna-400" />
                </motion.div>
              </div>
              <h1 className="text-4xl font-bold luna-gradient-text ml-4">
                Luna Care
              </h1>
            </motion.div>
            
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                Your Personal
                <span className="luna-gradient-text block">
                  Wellness Companion
                </span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                Track your menstrual health with AI-powered insights, get personalized recommendations, and connect with a supportive community. Because your health deserves the best care. 🌸
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="glass-card p-4 group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${feature.color} p-3 mb-3 group-hover:shadow-glow transition-all duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500"
            >
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2 text-luna-500 heartbeat" />
                <span>10k+ Happy Users</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md glass border-white/30">
              <CardHeader className="text-center">
                <motion.div
                  animate={{ rotateY: isLogin ? 0 : 180 }}
                  transition={{ duration: 0.6 }}
                >
                  {isLogin ? (
                    <Sun className="h-8 w-8 text-luna-500 mx-auto mb-2" />
                  ) : (
                    <Moon className="h-8 w-8 text-luna-500 mx-auto mb-2" />
                  )}
                </motion.div>
                <CardTitle className="text-2xl">
                  {isLogin ? 'Welcome Back! 💕' : 'Join Luna Care ✨'}
                </CardTitle>
                <CardDescription>
                  {isLogin ? 
                    'Continue your wellness journey' : 
                    'Start your personalized health tracking'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <Input
                      floating
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required={!isLogin}
                    />
                  )}
                  
                  <Input
                    floating
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  
                  <Input
                    floating
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    loading={loading}
                  >
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">or continue with</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  loading={loading}
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  }
                >
                  Google
                </Button>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setError('')
                        setFormData({ name: '', email: '', password: '' })
                      }}
                      className="text-luna-600 hover:text-luna-700 font-medium hover:underline transition-colors"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Landing
