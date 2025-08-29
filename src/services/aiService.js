// src/services/aiService.js
const AI_API_BASE = 'http://localhost:5000'  // Your working ML API

export const predictPCOSRisk = async (userData) => {
  try {
    const response = await fetch(`${AI_API_BASE}/predict-pcos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'Age (yrs)': userData.age || 25,
        'Weight (Kg)': userData.weight || 60,
        'Height(Cm)': userData.height || 165,
        'BMI': userData.bmi || (userData.weight / ((userData.height/100) ** 2)),
        'cycle_regular': userData.cycleRegular ? 1 : 0,
        'weight_gain': userData.weightGain ? 1 : 0,
        'hair_growth': userData.hairGrowth ? 1 : 0,
        'pimples': userData.acne ? 1 : 0,
        'fast_food': userData.fastFood ? 1 : 0,
        'regular_exercise': userData.exercise ? 1 : 0
      })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('AI Prediction Error:', error)
    return { success: false, error: error.message }
  }
}

export const getModelInfo = async () => {
  try {
    const response = await fetch(`${AI_API_BASE}/model-info`)
    return await response.json()
  } catch (error) {
    return { success: false, error: error.message }
  }
}
