import joblib
import numpy as np
import pandas as pd

def test_model():
    """Test the trained PCOS model"""
    
    # Load model components
    try:
        model = joblib.load('models/pcos_model.joblib')
        scaler = joblib.load('models/pcos_scaler.joblib')
        feature_names = joblib.load('models/feature_names.joblib')
        model_info = joblib.load('models/model_info.joblib')
        
        print("✅ Model loaded successfully!")
        print(f"🎯 Model accuracy: {model_info['accuracy']:.1%}")
        print(f"📊 Features used: {len(feature_names)}")
        
    except FileNotFoundError as e:
        print(f"❌ Model file not found: {e}")
        print("Run train_pcos_model.py first!")
        return False
    
    # Show top features
    print(f"\n🔍 Top 5 Most Important Features:")
    top_features = model_info['feature_importance'][:5]
    for i, feat in enumerate(top_features, 1):
        print(f"  {i}. {feat['feature']}: {feat['importance']:.3f}")
    
    # Test with different risk profiles
    test_cases = [
        {
            'name': 'Low Risk Profile',
            'data': {
                'Age (yrs)': 25,
                'Weight (Kg)': 55,
                'Height(Cm)': 165,
                'BMI': 20,
                'Cycle(R/I)': 1,  # Regular
                'Weight gain(Y/N)': 0,
                'hair growth(Y/N)': 0,
                'Pimples(Y/N)': 0,
                'Fast food (Y/N)': 0,
                'Reg.Exercise(Y/N)': 1
            }
        },
        {
            'name': 'High Risk Profile',
            'data': {
                'Age (yrs)': 30,
                'Weight (Kg)': 80,
                'Height(Cm)': 160,
                'BMI': 31,
                'Cycle(R/I)': 0,  # Irregular
                'Weight gain(Y/N)': 1,
                'hair growth(Y/N)': 1,
                'Pimples(Y/N)': 1,
                'Fast food (Y/N)': 1,
                'Reg.Exercise(Y/N)': 0
            }
        }
    ]
    
    print(f"\n🧪 Testing with sample profiles:")
    
    for test_case in test_cases:
        print(f"\n📊 {test_case['name']}:")
        
        # Create feature vector
        features = []
        for feature_name in feature_names:
            # Get value from test case data, default to median
            value = test_case['data'].get(feature_name, 0)
            features.append(float(value))
        
        # Convert to numpy array and scale
        features_array = np.array(features).reshape(1, -1)
        features_scaled = scaler.transform(features_array)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        risk_score = probabilities[1] * 100
        confidence = max(probabilities) * 100
        
        print(f"   Prediction: {'⚠️ PCOS Risk' if prediction == 1 else '✅ Low Risk'}")
        print(f"   Risk Score: {risk_score:.1f}%")
        print(f"   Confidence: {confidence:.1f}%")
    
    return True

def create_prediction_function(user_input):
    """Create a reusable prediction function"""
    
    # Load model components
    model = joblib.load('models/pcos_model.joblib')
    scaler = joblib.load('models/pcos_scaler.joblib')
    feature_names = joblib.load('models/feature_names.joblib')
    
    # Create feature vector
    features = []
    for feature_name in feature_names:
        value = user_input.get(feature_name, 0)
        features.append(float(value))
    
    # Scale and predict
    features_array = np.array(features).reshape(1, -1)
    features_scaled = scaler.transform(features_array)
    
    prediction = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]
    
    return {
        'prediction': int(prediction),
        'risk_score': round(probabilities[1] * 100, 1),
        'confidence': round(max(probabilities) * 100, 1)
    }

if __name__ == "__main__":
    test_model()
