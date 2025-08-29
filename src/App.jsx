import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './contexts/AuthContext'

import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import LogCycle from './pages/LogCycle'
import PCOSRisk from './pages/PCOSRisk'
import Recommendations from './pages/Recommendations'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'

// Minimal loader
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-white via-soft-pink to-blush">
    <div className="w-10 h-10 rounded-full luna-gradient animate-spin" />
    <span className="ml-3 text-gray-600">Loading Luna Care...</span>
  </div>
)

// Protected Route
const Protected = ({ children }) => {
  const { loading, currentUser } = useAuth()
  if (loading) return <Loading />
  if (!currentUser) return <Navigate to="/" replace />
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-soft-pink to-blush">
      <Navbar />
      {children}
    </div>
  )
}

// Public Route
const Public = ({ children }) => {
  const { loading, currentUser } = useAuth()
  if (loading) return <Loading />
  if (currentUser) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  useEffect(() => {
    // Fix button text visibility globally
    const handleClick = (e) => {
      let target = e.target
      while(target && target.tagName !== 'BUTTON') {
        target = target.parentNode
        if (!target || target === document.body) break
      }
      if(target && target.tagName === 'BUTTON') {
        target.style.color = '#374151'
        target.style.backgroundColor = 'rgba(236, 72, 153, 0.1)'
        setTimeout(() => {
          target.style.color = ''
          target.style.backgroundColor = ''
        }, 200)
      }
    }
    
    document.addEventListener('mousedown', handleClick, true)
    document.addEventListener('touchstart', handleClick, true)

    return () => {
      document.removeEventListener('mousedown', handleClick, true)
      document.removeEventListener('touchstart', handleClick, true)
    }
  }, [])

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Public><Landing /></Public>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/log-cycle" element={<Protected><LogCycle /></Protected>} />
          <Route path="/pcos-risk" element={<Protected><PCOSRisk /></Protected>} />
          <Route path="/recommendations" element={<Protected><Recommendations /></Protected>} />
          <Route path="/community" element={<Protected><Community /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
