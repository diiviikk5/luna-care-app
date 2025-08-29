import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

import { Calendar, TrendingUp } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'

const AssessmentHistory = () => {
  const { currentUser } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!currentUser) return
      
      try {
        const q = query(
          collection(db, 'pcosAssessments'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        const assessmentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setAssessments(assessmentData)
      } catch (error) {
        console.error('Failed to fetch assessments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [currentUser])

  if (loading) return <div>Loading assessment history...</div>

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-luna-500" />
          Assessment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <p className="text-gray-600">No previous assessments found.</p>
        ) : (
          <div className="space-y-4">
            {assessments.slice(0, 5).map((assessment, index) => (
              <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    Assessment #{assessments.length - index}
                  </span>
                  <span className="text-sm text-gray-500">
                    {assessment.createdAt?.toDate?.().toLocaleDateString() || 'Recent'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Risk Score:</span>
                    <span className="font-semibold ml-1">
                      {assessment.predictionResult?.risk_score}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Risk Level:</span>
                    <span className="font-semibold ml-1">
                      {assessment.predictionResult?.risk_level}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <span className="font-semibold ml-1">
                      {assessment.inputData?.age}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">BMI:</span>
                    <span className="font-semibold ml-1">
                      {assessment.inputData?.bmi?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AssessmentHistory
