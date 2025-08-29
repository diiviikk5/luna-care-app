import requests
import json

def test_predictions():
    """Test the API with realistic PCOS risk scenarios"""
    
    api_url = "http://localhost:5000"
    
    test_cases = [
        {
            'name': '👤 Healthy Young Woman',
            'expected': 'Low Risk',
            'data': {
                'Age (yrs)': 23,
                'Weight (Kg)': 58,
                'Height(Cm)': 165,
                'BMI': 21.3,
                'cycle_regular': 1,
                'weight_gain': 0,
                'hair_growth': 0,
                'pimples': 0,
                'fast_food': 0,
                'regular_exercise': 1,
                'FSH(mIU/mL)': 6.5,
                'LH(mIU/mL)': 8.2
            }
        },
        {
            'name': '⚠️ High Risk Profile',
            'expected': 'High Risk',
            'data': {
                'Age (yrs)': 28,
                'Weight (Kg)': 78,
                'Height(Cm)': 162,
                'BMI': 29.7,
                'cycle_regular': 0,
                'weight_gain': 1,
                'hair_growth': 1,
                'pimples': 1,
                'fast_food': 1,
                'regular_exercise': 0,
                'FSH(mIU/mL)': 4.2,
                'LH(mIU/mL)': 15.8
            }
        },
        {
            'name': '🟡 Moderate Risk',
            'expected': 'Moderate Risk',
            'data': {
                'Age (yrs)': 26,
                'Weight (Kg)': 65,
                'Height(Cm)': 160,
                'BMI': 25.4,
                'cycle_regular': 1,
                'weight_gain': 0,
                'hair_growth': 1,
                'pimples': 1,
                'fast_food': 0,
                'regular_exercise': 1
            }
        }
    ]
    
    print("🧪 Testing Luna Care PCOS AI Predictions\n")
    
    for i, case in enumerate(test_cases, 1):
        print(f"{i}. {case['name']} (Expected: {case['expected']})")
        print("   Input Features:")
        
        # Show key inputs
        key_features = ['Age (yrs)', 'BMI', 'cycle_regular', 'weight_gain']
        for feature in key_features:
            if feature in case['data']:
                value = case['data'][feature]
                if feature == 'cycle_regular':
                    value = "Regular" if value == 1 else "Irregular"
                elif feature == 'weight_gain':
                    value = "Yes" if value == 1 else "No"
                print(f"     {feature}: {value}")
        
        try:
            response = requests.post(
                f"{api_url}/predict-pcos",
                headers={'Content-Type': 'application/json'},
                data=json.dumps(case['data'])
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result['success']:
                    risk_emoji = {
                        'Low': '✅',
                        'Moderate': '🟡', 
                        'High': '⚠️',
                        'Very High': '🚨'
                    }
                    
                    emoji = risk_emoji.get(result['risk_level'], '❓')
                    
                    print(f"   🤖 AI Prediction:")
                    print(f"     Risk Score: {result['risk_score']}%")
                    print(f"     Risk Level: {emoji} {result['risk_level']}")
                    print(f"     Confidence: {result['confidence']}%")
                    print(f"     Top Recommendation: {result['recommendations']}")
                    
                    # Check if prediction matches expectation
                    if result['risk_level'].lower() in case['expected'].lower():
                        print(f"     ✅ Prediction matches expectation!")
                    else:
                        print(f"     ⚠️ Different from expected ({case['expected']})")
                else:
                    print(f"   ❌ API Error: {result.get('error', 'Unknown error')}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
        
        except Exception as e:
            print(f"   ❌ Request failed: {e}")
        
        print()  # Empty line for spacing

if __name__ == "__main__":
    test_predictions()
