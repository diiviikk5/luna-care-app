import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { logCycleData, getUserCyclesRealtime } from '../lib/firebase'
import { Calendar, Plus, Droplets } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'

const LogCycle = () => {
  const { currentUser } = useAuth()
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    flow: 'medium',
    symptoms: [],
    mood: 5,
    notes: ''
  })

  const symptoms = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood swings', 'Breast tenderness']
  const flowTypes = [
    { value: 'light', label: 'Light', color: 'bg-pink-300' },
    { value: 'medium', label: 'Medium', color: 'bg-red-400' },
    { value: 'heavy', label: 'Heavy', color: 'bg-red-600' }
  ]

  // Real-time listener for cycles
  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = getUserCyclesRealtime(currentUser.uid, (snapshot) => {
      const cycleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCycles(cycleData)
    })

    return () => unsubscribe()
  }, [currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await logCycleData(currentUser.uid, formData)
      setShowForm(false)
      setFormData({
        startDate: '',
        flow: 'medium',
        symptoms: [],
        mood: 5,
        notes: ''
      })
    } catch (error) {
      console.error('Error logging cycle:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-gradient-to-br from-warm-white via-soft-pink to-blush">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold luna-gradient-text mb-2">Cycle Tracking</h1>
            <p className="text-gray-600">Monitor your menstrual health patterns</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Log Cycle
          </Button>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card p-6 text-center">
            <Calendar className="h-8 w-8 text-luna-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Last Period</h3>
            <p className="text-2xl font-bold text-luna-600">
              {cycles.length > 0 ? `${Math.ceil((new Date() - new Date(cycles[0].startDate)) / (1000 * 60 * 60 * 24))} days ago` : 'No data'}
            </p>
          </Card>
          
          <Card className="glass-card p-6 text-center">
            <Droplets className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Average Cycle</h3>
            <p className="text-2xl font-bold text-red-600">28 days</p>
          </Card>
          
          <Card className="glass-card p-6 text-center">
            <Calendar className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Total Cycles</h3>
            <p className="text-2xl font-bold text-pink-600">{cycles.length}</p>
          </Card>
        </div>

        {/* Recent Cycles */}
        <Card className="glass-card">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Cycles</h2>
            
            {cycles.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No cycle data yet. Start tracking today!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cycles.map(cycle => (
                  <div key={cycle.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {new Date(cycle.startDate).toLocaleDateString()}
                        </h4>
                        <div className="flex items-center mt-1">
                          <div className={`w-3 h-3 rounded-full mr-2 ${flowTypes.find(f => f.value === cycle.flow)?.color || 'bg-gray-300'}`}></div>
                          <span className="text-sm text-gray-600 capitalize">{cycle.flow} flow</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Mood: {cycle.mood}/10
                        </p>
                      </div>
                    </div>
                    
                    {cycle.symptoms && cycle.symptoms.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cycle.symptoms.map(symptom => (
                            <span key={symptom} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {cycle.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{cycle.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add Cycle Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Log New Cycle</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Flow</label>
                    <div className="flex gap-2">
                      {flowTypes.map(flow => (
                        <button
                          key={flow.value}
                          type="button"
                          onClick={() => setFormData(prev => ({...prev, flow: flow.value}))}
                          className={`px-3 py-2 rounded text-sm font-medium ${
                            formData.flow === flow.value 
                              ? flow.color + ' text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {flow.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mood (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.mood}
                      onChange={(e) => setFormData(prev => ({...prev, mood: parseInt(e.target.value)}))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>😢 Poor</span>
                      <span>😊 Great</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {symptoms.map(symptom => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-2 py-1 rounded text-sm ${
                            formData.symptoms.includes(symptom)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Notes (optional)"
                    type="text"
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={loading} className="flex-1">
                      Save Cycle
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogCycle
