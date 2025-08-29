// src/lib/firebase.js
import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from 'firebase/auth'
import {
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

// IMPORTANT: avoid double init in Vite HMR
const firebaseConfig = {
  apiKey: "AIzaSyC7C9sYcUJ9ylEfr05mBeu-UAawdr2DXUo",
  authDomain: "luna-care-app.firebaseapp.com",
  projectId: "luna-care-app",
  storageBucket: "luna-care-app.appspot.com",
  messagingSenderId: "250000699957",
  appId: "1:250000699957:web:1990b1993d2542202a777c",
  measurementId: "G-S7YZZ0PDS7"
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)

// Ensure reliable persistence (fixes "randomly logged out / can't re-login")
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error)
})

// Firestore: force long polling and ignore undefined props (fixes 400 and noisy writes)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true,
})

// Providers
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// === AUTH HELPERS ===
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider)
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider)
export const getGoogleRedirectResult = () => getRedirectResult(auth)

export const signUpWithEmail = async (email, password, displayName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) await updateProfile(user, { displayName })
  await ensureUserDoc(user, { displayName })
  return user
}

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const signOutUser = () => signOut(auth)

// === USER MANAGEMENT ===
export const ensureUserDoc = async (user, additional = {}) => {
  if (!user) return null
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName || additional.displayName || 'Luna Care User',
      email: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        averageCycleLength: 28,
        preferences: { notifications: true, reminderDays: 3 },
      },
      ...additional,
    })
  }
  return ref
}

export const getUserProfile = async (uid) => {
  if (!uid) return null
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateUserProfile = async (uid, updates) => {
  if (!uid) return null
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date()
  })
  return ref
}

// === CYCLE TRACKING ===
export const addCycleData = async (uid, data) => {
  const ref = collection(db, 'cycles')
  return await addDoc(ref, { 
    userId: uid, 
    ...data, 
    createdAt: new Date(),
    updatedAt: new Date()
  })
}

export const getUserCycles = async (uid, limitCount = 50) => {
  const ref = collection(db, 'cycles')
  const q = query(
    ref, 
    where('userId', '==', uid), 
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const qs = await getDocs(q)
  return qs.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// REAL-TIME CYCLE TRACKING
export const logCycleData = async (userId, cycleData) => {
  return await addDoc(collection(db, 'cycles'), {
    userId,
    startDate: cycleData.startDate,
    endDate: cycleData.endDate || null,
    flow: cycleData.flow,
    symptoms: cycleData.symptoms || [],
    mood: cycleData.mood,
    notes: cycleData.notes || '',
    createdAt: serverTimestamp()
  })
}

export const getUserCyclesRealtime = (userId, callback, limitCount = 12) => {
  const q = query(
    collection(db, 'cycles'),
    where('userId', '==', userId),
    orderBy('startDate', 'desc'),
    limit(limitCount)
  )
  return onSnapshot(q, callback)
}

// === DAILY HEALTH LOGGING ===
export const addDailyHealthData = async (uid, healthData) => {
  const ref = collection(db, 'dailyHealth')
  return await addDoc(ref, {
    userId: uid,
    date: healthData.date || new Date().toISOString().split('T')[0],
    weight: healthData.weight || null,
    temperature: healthData.temperature || null,
    sleepHours: healthData.sleepHours || null,
    stressLevel: healthData.stressLevel || null,
    exerciseMinutes: healthData.exerciseMinutes || 0,
    waterGlasses: healthData.waterGlasses || 0,
    symptoms: healthData.symptoms || [],
    mood: healthData.mood || null,
    notes: healthData.notes || '',
    createdAt: new Date()
  })
}

export const getUserDailyHealth = async (uid, days = 30) => {
  if (!uid) return []
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const ref = collection(db, 'dailyHealth')
  const q = query(
    ref,
    where('userId', '==', uid),
    where('createdAt', '>=', cutoffDate),
    orderBy('createdAt', 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// REAL-TIME HEALTH LOGGING
export const logDailyHealth = async (userId, healthData) => {
  return await addDoc(collection(db, 'dailyHealth'), {
    userId,
    date: healthData.date,
    weight: healthData.weight || null,
    temperature: healthData.temperature || null,
    sleepHours: healthData.sleepHours || null,
    waterIntake: healthData.waterIntake || null,
    exerciseMinutes: healthData.exerciseMinutes || 0,
    symptoms: healthData.symptoms || [],
    mood: healthData.mood || 5,
    energy: healthData.energy || 5,
    stress: healthData.stress || 5,
    notes: healthData.notes || '',
    createdAt: serverTimestamp()
  })
}

export const getUserDailyHealthRealtime = (userId, callback, days = 30) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const q = query(
    collection(db, 'dailyHealth'),
    where('userId', '==', userId),
    where('date', '>=', cutoffDate.toISOString().split('T')[0]),
    orderBy('date', 'desc')
  )
  return onSnapshot(q, callback)
}

// === AI PCOS ASSESSMENTS ===
export const savePCOSAssessment = async (uid, inputData, predictionResult) => {
  if (!uid) throw new Error('User ID required')
  
  const ref = collection(db, 'pcosAssessments')
  return await addDoc(ref, {
    userId: uid,
    inputData,
    predictionResult,
    createdAt: new Date(),
    timestamp: Date.now()
  })
}

export const getUserPCOSAssessments = async (uid, limitCount = 20) => {
  if (!uid) return []
  
  const ref = collection(db, 'pcosAssessments')
  const q = query(
    ref,
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

export const getLatestPCOSAssessment = async (uid) => {
  if (!uid) return null
  
  const assessments = await getUserPCOSAssessments(uid, 1)
  return assessments.length > 0 ? assessments[0] : null
}

// REAL-TIME PCOS ASSESSMENTS
export const savePCOSAssessmentEnhanced = async (userId, inputData, aiResult) => {
  return await addDoc(collection(db, 'pcosAssessments'), {
    userId,
    inputData,
    aiResult,
    riskScore: aiResult.risk_score,
    riskLevel: aiResult.risk_level,
    recommendations: aiResult.recommendations,
    createdAt: serverTimestamp()
  })
}

export const getUserAssessmentsRealtime = (userId, callback) => {
  const q = query(
    collection(db, 'pcosAssessments'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(10)
  )
  return onSnapshot(q, callback)
}

// === MEDICATIONS & SUPPLEMENTS ===
export const logMedication = async (userId, medicationData) => {
  return await addDoc(collection(db, 'medications'), {
    userId,
    name: medicationData.name,
    dosage: medicationData.dosage,
    frequency: medicationData.frequency,
    startDate: medicationData.startDate,
    endDate: medicationData.endDate || null,
    notes: medicationData.notes || '',
    reminders: medicationData.reminders || [],
    createdAt: serverTimestamp()
  })
}

export const getUserMedicationsRealtime = (userId, callback) => {
  const q = query(
    collection(db, 'medications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, callback)
}

// === APPOINTMENTS ===
export const scheduleAppointment = async (userId, appointmentData) => {
  return await addDoc(collection(db, 'appointments'), {
    userId,
    doctorName: appointmentData.doctorName,
    specialty: appointmentData.specialty,
    date: appointmentData.date,
    time: appointmentData.time,
    type: appointmentData.type,
    notes: appointmentData.notes || '',
    status: 'scheduled',
    createdAt: serverTimestamp()
  })
}

export const getUserAppointmentsRealtime = (userId, callback) => {
  const q = query(
    collection(db, 'appointments'),
    where('userId', '==', userId),
    orderBy('date', 'asc')
  )
  return onSnapshot(q, callback)
}

// === AI PREDICTIONS STORAGE ===
export const storePrediction = async (userId, predictionData) => {
  const ref = collection(db, 'predictions')
  return await addDoc(ref, {
    userId,
    type: predictionData.type,
    prediction: predictionData.prediction,
    confidence: predictionData.confidence,
    factors: predictionData.factors || [],
    modelAccuracy: predictionData.modelAccuracy,
    createdAt: new Date(),
    validUntil: predictionData.validUntil
  })
}

export const getUserPredictions = async (uid, type = null, limitCount = 10) => {
  if (!uid) return []
  
  const ref = collection(db, 'predictions')
  let q = query(
    ref,
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  if (type) {
    q = query(
      ref,
      where('userId', '==', uid),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
  }
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// === ANALYTICS & INSIGHTS ===
export const getUserAnalytics = async (uid) => {
  if (!uid) return null
  
  try {
    const [assessments, cycles, dailyHealth] = await Promise.all([
      getUserPCOSAssessments(uid, 5),
      getUserCycles(uid, 10),
      getUserDailyHealth(uid, 30)
    ])
    
    return {
      totalAssessments: assessments.length,
      latestRiskScore: assessments[0]?.predictionResult?.risk_score || null,
      totalCycles: cycles.length,
      avgCycleLength: cycles.length > 0 
        ? cycles.reduce((sum, cycle) => sum + (cycle.length || 28), 0) / cycles.length 
        : 28,
      healthEntriesCount: dailyHealth.length,
      lastUpdated: Math.max(
        ...assessments.map(a => a.timestamp || 0),
        ...cycles.map(c => c.createdAt?.toMillis?.() || 0),
        ...dailyHealth.map(h => h.createdAt?.toMillis?.() || 0)
      )
    }
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return null
  }
}

// === UTILITY FUNCTIONS ===
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

export const getCurrentUser = () => {
  return auth.currentUser
}

export const formatFirestoreDate = (timestamp) => {
  if (!timestamp) return 'Unknown date'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// === EXPORT DEFAULT ===
export default {
  auth,
  db,
  // Auth functions
  signInWithGooglePopup,
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  // User functions
  ensureUserDoc,
  getUserProfile,
  updateUserProfile,
  // Cycle tracking (original + real-time)
  addCycleData,
  getUserCycles,
  logCycleData,
  getUserCyclesRealtime,
  // Health tracking (original + real-time)
  addDailyHealthData,
  getUserDailyHealth,
  logDailyHealth,
  getUserDailyHealthRealtime,
  // AI functions (original + real-time)
  savePCOSAssessment,
  getUserPCOSAssessments,
  getLatestPCOSAssessment,
  savePCOSAssessmentEnhanced,
  getUserAssessmentsRealtime,
  // New features
  logMedication,
  getUserMedicationsRealtime,
  scheduleAppointment,
  getUserAppointmentsRealtime,
  // Analytics
  getUserAnalytics,
  storePrediction,
  getUserPredictions,
  // Utilities
  onAuthStateChange,
  getCurrentUser,
  formatFirestoreDate
}
