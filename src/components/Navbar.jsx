import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Menu, 
  X, 
  Home, 
  Calendar, 
  Activity,
  BookOpen, 
  Users, 
  User,
  Bell,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { signOutUser } from '../lib/firebase'
import Button from './ui/Button'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { currentUser } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Log Cycle', href: '/log-cycle', icon: Calendar },
    { name: 'PCOS Risk', href: '/pcos-risk', icon: Activity },
    { name: 'Recommendations', href: '/recommendations', icon: BookOpen },
    { name: 'Community', href: '/community', icon: Users },
  ]

  const isActive = (path) => location.pathname === path

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const firstName = currentUser?.displayName?.split(' ')[0] || 'Beautiful'

  return (
    <nav className="luna-card mx-4 mt-4 mb-6 sticky top-4 z-50 backdrop-blur-xl bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Heart className="h-8 w-8 text-luna-500 mr-2 group-hover:text-luna-600 transition-colors" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-luna-400">✨</span>
              </motion.div>
            </motion.div>
            <span className="text-xl font-bold luna-gradient-text">Luna Care</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'luna-gradient text-white shadow-lg'
                      : 'text-gray-600 hover:text-luna-600 hover:bg-luna-50'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </motion.div>
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 luna-gradient rounded-full -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} className="text-right">
              <p className="text-sm font-medium text-gray-800">
                Hi, {firstName}! 👋
              </p>
              <p className="text-xs text-gray-500">Stay healthy & happy</p>
            </motion.div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-luna-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </Button>
              
              <Link to="/profile">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 luna-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer"
                >
                  {firstName.charAt(0)}
                </motion.div>
              </Link>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0, opacity: isMobileMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 border-t border-luna-200">
            <div className="flex items-center space-x-3 py-3 mb-4">
              <div className="w-10 h-10 luna-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {firstName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-800">{currentUser?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'luna-gradient text-white'
                      : 'text-gray-600 hover:bg-luna-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              
              <Link
                to="/profile"
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-luna-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full text-left"
              >
                <Settings className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  )
}

export default Navbar
