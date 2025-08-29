import requests
import json

def test_emergency_api():
    """Test emergency API with different risk profiles"""
    
    api_url = "http://localhost:5000"
    
    test_cases = [
        {
            'name': '✅ Low Risk - Healthy Young Woman',
            'data': {
                'age': 23,
                'weight': 55,
                'height': 165,
                'cycle_regular': 1,
                'weight_gain': 0,
                'hair_growth': 0,
                'pimples': 0,
                'exercise': 1,
                'fast_food': 0
            }
        },
        {
            'name': '🟡 Moderate Risk - Some Symptoms',
            'data': {
                'age': 26,
                'weight': 68,
                'height': 160,
                'cycle_regular': 1,
                'weight_gain': 1,
                'hair_growth': 0,
                'pimples': 1,
                'exercise': 0,
                'fast_food': 1
            }
        },
        {
            'name': '⚠️ High Risk - Multiple Risk Factors',
            'data': {
                'age': 29,
                'weight': 78,
                'height': 158,
                'cycle_regular': 0,  # Irregular cycles
                'weight_gain': 1,
                'hair_growth': 1,
                'pimples': 1,
                'exercise': 0,
                'fast_food': 1
            }
        },
        {
            'name': '🚨 Very High Risk - Severe Case',
            'data': {
                'age': 32,
                'weight': 88,
                'height': 155,
                'cycle_regular': 0,
                'weight_gain': 1,
                'hair_growth': 1,
                'pimples': 1,
                'exercise': 0,
                'fast_food': 1
            }
        }
    ]
    
    print("🚨 Testing Luna Care Emergency AI System\n")
    
    for i, case in enumerate(test_cases, 1):
        print(f"{i}. {case['name']}")
        
        # Calculate BMI for context
        bmi = case['data']['weight'] / ((case['data']['height']/100) ** 2)
        print(f"   BMI: {bmi:.1f}")
        
        try:
            response = requests.post(
                f"{api_url}/predict-pcos",
                headers={'Content-Type': 'application/json'},
                data=json.dumps(case['data'])
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result['success']:
                    risk_emojis = {'Low': '✅', 'Moderate': '🟡', 'High': '⚠️', 'Very High': '🚨'}
                    emoji = risk_emojis.get(result['risk_level'], '❓')
                    
                    print(f"   🤖 AI Prediction:")
                    print(f"     Risk Score: {result['risk_score']}%")
                    print(f"     Risk Level: {emoji} {result['risk_level']}")
                    print(f"     Confidence: {result['confidence']}%")
                    print(f"     Method: {result['method']}")
                    print(f"     Top Recommendation: {result['recommendations'][0]}")
                else:
                    print(f"   ❌ Error: {result['error']}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Connection error: {e}")
        
        print()  # Empty line

if __name__ == "__main__":
    test_emergency_api()
