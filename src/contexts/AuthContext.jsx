import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, ensureUserDoc } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true) // route guards will wait on this
  const [hydrated, setHydrated] = useState(false) // first paint guard

  useEffect(() => {
    let mounted = true
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!mounted) return
        setCurrentUser(user || null)

        if (user) {
          // Ensure user doc exists then load it
          const ref = await ensureUserDoc(user)
          const snap = await getDoc(ref)
          setUserProfile(snap.exists() ? snap.data() : null)
        } else {
          setUserProfile(null)
        }
      } catch (e) {
        console.error('Auth state error:', e)
        setUserProfile(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })

    // Hydration guard to avoid flicker
    const t = setTimeout(() => setHydrated(true), 0)

    return () => {
      mounted = false
      unsub()
      clearTimeout(t)
    }
  }, [])

  const value = useMemo(
    () => ({ currentUser, userProfile, loading }),
    [currentUser, userProfile, loading]
  )

  // Prevents “Loading forever” hydration mismatch
  if (!hydrated) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
