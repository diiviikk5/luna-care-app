import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { predictPCOSRisk, getModelInfo } from '../services/aiService'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Activity, Brain, TrendingUp, AlertTriangle, CheckCircle2, Loader } from 'lucide-react'

const PCOSRiskAssessment = () => {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    cycleRegular: true,
    weightGain: false,
    hairGrowth: false,
    acne: false,
    fastFood: false,
    exercise: true
  })
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modelInfo, setModelInfo] = useState(null)

  React.useEffect(() => {
    // Load model information on component mount
    getModelInfo().then(info => {
      if (info.success) {
        setModelInfo(info)
      }
    })
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Calculate BMI
    const bmi = formData.weight && formData.height 
      ? (formData.weight / ((formData.height/100) ** 2)).toFixed(1)
      : null

    const submissionData = {
      ...formData,
      bmi: parseFloat(bmi)
    }
    
    const prediction = await predictPCOSRisk(submissionData)
    
    if (prediction.success) {
      setResult(prediction)
      
      // Save to Firestore for user history
      if (currentUser) {
        try {
          await addDoc(collection(db, 'pcosAssessments'), {
            userId: currentUser.uid,
            inputData: submissionData,
            predictionResult: prediction,
            createdAt: new Date(),
            timestamp: Date.now()
          })
          console.log('✅ Assessment saved to user history')
        } catch (error) {
          console.error('❌ Failed to save assessment:', error)
        }
      }
    } else {
      alert('Prediction failed: ' + prediction.error)
    }
    
    setLoading(false)
  }

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100 border-green-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-200' 
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'very high': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getRiskIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'low': return <CheckCircle2 className="h-16 w-16 text-green-500" />
      case 'moderate': return <AlertTriangle className="h-16 w-16 text-yellow-500" />
      case 'high': return <AlertTriangle className="h-16 w-16 text-orange-500" />
      case 'very high': return <AlertTriangle className="h-16 w-16 text-red-500" />
      default: return <Activity className="h-16 w-16 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-gradient-to-br from-warm-white via-soft-pink to-blush">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold luna-gradient-text mb-4">
            🤖 AI-Powered PCOS Risk Assessment
          </h1>
          <p className="text-gray-600 mb-2">
            Get personalized risk insights using machine learning trained on real medical data
          </p>
          {modelInfo && (
            <p className="text-sm text-gray-500">
              Model Accuracy: {modelInfo.accuracy}% • Trained on {modelInfo.training_samples} patients
            </p>
          )}
        </motion.div>

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-white/30">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  <Brain className="h-6 w-6 mr-2 text-luna-500" />
                  Health Assessment Form
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      floating
                      label="Age (years)"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="15"
                      max="50"
                    />
                    <Input
                      floating
                      label="Weight (kg)"
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      min="30"
                      max="150"
                    />
                    <Input
                      floating
                      label="Height (cm)"
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      required
                      min="140"
                      max="200"
                    />
                  </div>

                  {/* BMI Display */}
                  {formData.weight && formData.height && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-blue-600">
                        Calculated BMI: {((formData.weight) / ((formData.height/100) ** 2)).toFixed(1)}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="cycleRegular"
                        checked={formData.cycleRegular}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-luna-500"
                      />
                      <span>Regular menstrual cycle</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="exercise"
                        checked={formData.exercise}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-luna-500"
                      />
                      <span>Regular exercise (3+ times/week)</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="weightGain"
                        checked={formData.weightGain}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-luna-500"
                      />
                      <span>Recent unexplained weight gain</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="hairGrowth"
                        checked={formData.hairGrowth}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-luna-500"
                      />
                      <span>Excessive hair growth (face/body)</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="acne"
                        checked={formData.acne}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-luna-500"
                      />
                      <span>Persistent acne or skin issues</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="fastFood"
                        checked={formData.fastFood}
                        onChange={handleChange}
                        className="mr-3 h-4 w-4 text-luna-500"
                      />
                      <span>Frequent fast food consumption</span>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    loading={loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        🔮 AI Analyzing Your Health Data...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        🤖 Get AI Risk Assessment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Risk Score Display */}
            <Card className={`${getRiskColor(result.risk_level)} border-2`}>
              <CardContent className="text-center p-8">
                <div className="flex justify-center mb-4">
                  {getRiskIcon(result.risk_level)}
                </div>
                
                <h2 className="text-3xl font-bold mb-2">
                  🎯 Risk Score: {result.risk_score}%
                </h2>
                <p className="text-xl font-semibold mb-2">
                  {result.risk_level} Risk Level
                </p>
                <div className="flex justify-center items-center space-x-4 text-sm">
                  <span>Confidence: {result.confidence}%</span>
                  <span>•</span>
                  <span>Model Accuracy: {result.model_accuracy}%</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-luna-500" />
                  🤖 AI-Generated Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-4 bg-blue-50 rounded-lg"
                    >
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setResult(null)
                  setFormData({
                    age: '', weight: '', height: '', cycleRegular: true,
                    weightGain: false, hairGrowth: false, acne: false,
                    fastFood: false, exercise: true
                  })
                }}
                className="flex-1"
              >
                Take Assessment Again
              </Button>
              
              <Button 
                onClick={() => window.print()}
                className="flex-1"
              >
                Save Results
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PCOSRiskAssessment
