import requests
import json

def test_predictions():
    """Test the API with realistic PCOS risk scenarios"""
    
    api_url = "http://localhost:5000"
    
    test_cases = [
        {
            'name': '👤 Low Risk Profile',
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
                'regular_exercise': 1
            }
        },
        {
            'name': '⚠️ High Risk Profile',
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
                'regular_exercise': 0
            }
        }
    ]
    
    print("🧪 Testing Luna Care PCOS AI Predictions\n")
    
    # Test health check
    print("1. Health Check:")
    try:
        response = requests.get(f"{api_url}/health")
        print(f"✅ Status: {response.status_code}")
        health_data = response.json()
        print(f"Response: Model loaded = {health_data.get('model_loaded', False)}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test model info
    print("\n2. Model Information:")
    try:
        response = requests.get(f"{api_url}/model-info")
        if response.status_code == 200:
            info = response.json()
            print(f"✅ Model Accuracy: {info['accuracy']}%")
            print(f"📊 Features: {info['features_count']}")
        else:
            print(f"❌ Model info failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Model info failed: {e}")
    
    # Test predictions
    print("\n3. Prediction Tests:")
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n{i}. {case['name']}:")
        
        try:
            response = requests.post(
                f"{api_url}/predict-pcos",
                headers={'Content-Type': 'application/json'},
                data=json.dumps(case['data'])
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"   Risk Score: {result['risk_score']}%")
                    print(f"   Risk Level: {result['risk_level']}")
                    print(f"   Confidence: {result['confidence']}%")
                    print(f"   Top Recommendation: {result['recommendations'][0]}")
                else:
                    print(f"   ❌ Prediction failed: {result.get('error', 'Unknown error')}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

if __name__ == "__main__":
    test_predictions()
