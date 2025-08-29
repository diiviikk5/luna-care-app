from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import os
import traceback

app = Flask(__name__)
CORS(app)

# Global variables for model components  
model = None
scaler = None
feature_names = None
model_info = None
optimal_threshold = 0.5

def load_model_components():
    """Load all model components with ABSOLUTE PATHS"""
    global model, scaler, feature_names, model_info, optimal_threshold
    
    # ABSOLUTE PATHS - FIXED!
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, '..', 'models')
    
    print("🔧 Starting model loading process...")
    print(f"📁 Script location: {current_dir}")
    print(f"📁 Looking for models in: {model_dir}")
    
    # Check if models directory exists
    if not os.path.exists(model_dir):
        print(f"❌ Models directory not found: {model_dir}")
        return False
    
    # List files in models directory
    try:
        files = os.listdir(model_dir)
        print(f"📁 Files in models directory: {files}")
    except Exception as e:
        print(f"❌ Cannot list models directory: {e}")
        return False
    
    # Define all required files with ABSOLUTE PATHS
    required_files = {
        'model': os.path.join(model_dir, 'pcos_model.joblib'),
        'scaler': os.path.join(model_dir, 'pcos_scaler.joblib'),
        'features': os.path.join(model_dir, 'feature_names.joblib'),
        'info': os.path.join(model_dir, 'model_info.joblib')
    }
    
    # Check if all files exist and have content
    for name, path in required_files.items():
        if not os.path.exists(path):
            print(f"❌ MISSING: {path}")
            return False
        
        size = os.path.getsize(path)
        if size == 0:
            print(f"❌ EMPTY FILE: {path}")
            return False
        
        print(f"✅ Found {name}: {size} bytes")
    
    # Load each component with error handling
    try:
        print("📥 Loading model...")
        model = joblib.load(required_files['model'])
        print(f"✅ Model loaded: {type(model)}")
        
        print("📥 Loading scaler...")
        scaler = joblib.load(required_files['scaler'])
        print(f"✅ Scaler loaded: {type(scaler)}")
        
        print("📥 Loading feature names...")
        feature_names = joblib.load(required_files['features'])
        print(f"✅ Features loaded: {len(feature_names)} features")
        
        print("📥 Loading model info...")
        model_info = joblib.load(required_files['info'])
        print(f"✅ Model info loaded: {model_info.get('accuracy', 'Unknown')} accuracy")
        
        # Load optimal threshold
        optimal_threshold = model_info.get('optimal_threshold', 0.5)
        print(f"🎯 Using optimal threshold: {optimal_threshold:.3f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading model components:")
        print(f"   Exception: {e}")
        print(f"   Traceback: {traceback.format_exc()}")
        return False

def create_feature_vector(data, feature_names):
    """Create feature vector with enhanced features matching training"""
    features = []
    
    # Basic features mapping
    feature_mapping = {
        'Age (yrs)': ['age', 'Age'],
        'Weight (Kg)': ['weight', 'Weight'],
        'Height(Cm)': ['height', 'Height'],
        'BMI': ['bmi'],
        'Cycle(R/I)': ['cycle_regular', 'regular_cycle'],
        'Cycle length(days)': ['cycle_length'],
        'Weight gain(Y/N)': ['weight_gain'],
        'hair growth(Y/N)': ['hair_growth'],
        'Pimples(Y/N)': ['pimples', 'acne'],
        'Fast food (Y/N)': ['fast_food'],
        'Reg.Exercise(Y/N)': ['regular_exercise', 'exercise'],
        'FSH(mIU/mL)': ['fsh'],
        'LH(mIU/mL)': ['lh'],
        'AMH(ng/mL)': ['amh'],
        'PRL(ng/mL)': ['prl']
    }
    
    # Extract basic features
    for feature_name in feature_names:
        value = 0  # Default value
        
        # Direct match
        if feature_name in data:
            value = data[feature_name]
        else:
            # Try alternative names
            for alt_names in feature_mapping.get(feature_name, []):
                if alt_names in data:
                    value = data[alt_names]
                    break
        
        # Handle enhanced features
        if feature_name == 'BMI_overweight':
            bmi = float(data.get('bmi', data.get('BMI', 23)))
            value = 1 if bmi > 25 else 0
        elif feature_name == 'BMI_obese':
            bmi = float(data.get('bmi', data.get('BMI', 23)))
            value = 1 if bmi > 30 else 0
        elif feature_name == 'BMI_underweight':
            bmi = float(data.get('bmi', data.get('BMI', 23)))
            value = 1 if bmi < 18.5 else 0
        elif feature_name == 'Age_high_risk':
            age = float(data.get('age', data.get('Age (yrs)', 25)))
            value = 1 if age > 30 else 0
        elif feature_name == 'Age_young':
            age = float(data.get('age', data.get('Age (yrs)', 25)))
            value = 1 if age < 20 else 0
        elif feature_name == 'Age_peak_reproductive':
            age = float(data.get('age', data.get('Age (yrs)', 25)))
            value = 1 if 20 <= age <= 30 else 0
        elif feature_name == 'Total_symptoms':
            # Count symptoms
            symptoms = [
                data.get('weight_gain', 0),
                data.get('hair_growth', 0),
                data.get('pimples', 0),
                data.get('acne', 0)
            ]
            value = sum(symptoms)
        elif feature_name == 'Multiple_symptoms':
            symptoms = [
                data.get('weight_gain', 0),
                data.get('hair_growth', 0),
                data.get('pimples', 0),
                data.get('acne', 0)
            ]
            value = 1 if sum(symptoms) >= 3 else 0
        elif feature_name == 'Poor_lifestyle':
            exercise = data.get('regular_exercise', data.get('exercise', 1))
            fast_food = data.get('fast_food', 0)
            lifestyle_score = exercise - fast_food
            value = 1 if lifestyle_score < 0 else 0
        elif 'ratio' in feature_name.lower():
            # Handle ratio features
            if 'LH_FSH' in feature_name:
                lh = float(data.get('lh', data.get('LH(mIU/mL)', 8)))
                fsh = float(data.get('fsh', data.get('FSH(mIU/mL)', 6)))
                value = lh / fsh if fsh > 0 else 0
                if feature_name == 'High_LH_FSH_ratio':
                    value = 1 if value > 2 else 0
        
        features.append(float(value))
    
    return np.array(features).reshape(1, -1)

def generate_dynamic_recommendations(input_data, risk_score, risk_level):
    """Generate personalized recommendations based on input data and risk"""
    recommendations = []
    
    # BMI-based recommendations
    bmi = float(input_data.get('bmi', input_data.get('BMI', 23)))
    if bmi > 30:
        recommendations.append("🏥 Consult a healthcare provider for weight management strategies")
        recommendations.append("🥗 Consider a medically supervised nutrition plan")
    elif bmi > 25:
        recommendations.append("🏃‍♀️ Increase physical activity to 150+ minutes per week")
        recommendations.append("🥗 Focus on a balanced, portion-controlled diet")
    elif bmi < 18.5:
        recommendations.append("🍎 Consult a nutritionist for healthy weight gain strategies")
    
    # Age-based recommendations
    age = float(input_data.get('age', input_data.get('Age (yrs)', 25)))
    if age < 20:
        recommendations.append("📚 Focus on establishing healthy lifestyle habits early")
    elif age > 35:
        recommendations.append("🔬 Consider comprehensive hormone panels annually")
    
    # Symptom-specific recommendations
    if input_data.get('weight_gain', 0) == 1:
        recommendations.append("📊 Track weight changes and eating patterns")
    
    if input_data.get('hair_growth', 0) == 1:
        recommendations.append("🔬 Discuss androgen levels with your healthcare provider")
    
    if input_data.get('pimples', 0) == 1 or input_data.get('acne', 0) == 1:
        recommendations.append("🧴 Consider dermatological evaluation for hormonal acne")
    
    # Lifestyle recommendations
    if input_data.get('regular_exercise', input_data.get('exercise', 1)) == 0:
        recommendations.append("💪 Start with 30 minutes of moderate exercise daily")
    
    if input_data.get('fast_food', 0) == 1:
        recommendations.append("🥗 Reduce processed food intake and increase whole foods")
    
    if input_data.get('cycle_regular', input_data.get('regular_cycle', 1)) == 0:
        recommendations.append("📅 Keep a detailed menstrual cycle diary for 3 months")
    
    # Risk-level specific recommendations
    if risk_score > 70:
        recommendations.insert(0, "🏥 Schedule an appointment with a gynecologist soon")
        recommendations.append("🔬 Request comprehensive hormone testing (FSH, LH, testosterone, insulin)")
    elif risk_score > 50:
        recommendations.insert(0, "📊 Monitor symptoms closely and track patterns")
        recommendations.append("🧘‍♀️ Implement stress management techniques")
    elif risk_score > 30:
        recommendations.append("📈 Continue current healthy habits and monitor changes")
    else:
        recommendations.append("✅ Maintain your excellent health habits!")
    
    # Always include general wellness advice
    recommendations.extend([
        "💤 Ensure 7-9 hours of quality sleep nightly",
        "🧘‍♀️ Practice stress reduction techniques like meditation",
        "💧 Stay well-hydrated throughout the day"
    ])
    
    # Return top 5 most relevant recommendations
    return recommendations[:5]

# Load model at startup
print("🚀 Starting Luna Care AI API...")
model_loaded_successfully = load_model_components()

@app.route('/predict-pcos', methods=['POST'])
def predict_pcos():
    """Enhanced PCOS prediction endpoint with dynamic risk assessment"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Run train_pcos_model.py first!',
                'debug_info': {
                    'model_loaded': False,
                    'current_dir': os.getcwd(),
                    'models_exist': os.path.exists('models')
                }
            }), 500
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        print(f"📥 Received prediction request with keys: {list(data.keys())}")
        
        # Create enhanced feature vector
        features_array = create_feature_vector(data, feature_names)
        
        # Scale features
        features_scaled = scaler.transform(features_array)
        
        # Make prediction with optimal threshold
        probabilities = model.predict_proba(features_scaled)[0]
        risk_score = probabilities[1] * 100
        
        # Use optimal threshold for classification
        prediction = 1 if probabilities[1] > optimal_threshold else 0
        
        # Dynamic risk level calculation
        if risk_score >= 80:
            risk_level = 'Very High'
        elif risk_score >= 60:
            risk_level = 'High'
        elif risk_score >= 35:
            risk_level = 'Moderate'
        elif risk_score >= 15:
            risk_level = 'Low'
        else:
            risk_level = 'Very Low'
        
        # Generate personalized recommendations
        recommendations = generate_dynamic_recommendations(data, risk_score, risk_level)
        
        # Calculate confidence
        confidence = max(probabilities) * 100
        
        result = {
            'success': True,
            'prediction': int(prediction),
            'risk_score': round(risk_score, 1),
            'risk_level': risk_level,
            'confidence': round(confidence, 1),
            'recommendations': recommendations,
            'model_accuracy': round(model_info.get('accuracy', 0.61) * 100, 1),
            'features_used': len(feature_names),
            'threshold_used': round(optimal_threshold, 3)
        }
        
        print(f"📤 Prediction: {risk_level} risk ({risk_score:.1f}%) - Threshold: {optimal_threshold:.3f}")
        return jsonify(result)
        
    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        print(f"❌ {error_msg}")
        print(f"Traceback: {traceback.format_exc()}")
        
        return jsonify({
            'success': False,
            'error': error_msg,
            'debug_info': {
                'model_loaded': model is not None,
                'exception_type': type(e).__name__
            }
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info_endpoint():
    """Get enhanced model information"""
    try:
        if model_info is None:
            return jsonify({
                'success': False,
                'error': 'Model info not available',
                'model_loaded': model is not None
            }), 500
        
        return jsonify({
            'success': True,
            'accuracy': round(model_info.get('accuracy', 0) * 100, 1),
            'accuracy_default': round(model_info.get('accuracy_default', 0) * 100, 1),
            'optimal_threshold': model_info.get('optimal_threshold', 0.5),
            'features_count': len(feature_names),
            'training_samples': model_info.get('training_samples', 'Unknown'),
            'test_samples': model_info.get('test_samples', 'Unknown'),
            'model_type': 'Enhanced Random Forest Classifier',
            'oob_score': model_info.get('oob_score'),
            'class_weights': model_info.get('class_weights', {}),
            'top_features': model_info.get('feature_importance', [])[:10]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Model info error: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, '..', 'models')
    
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'features_loaded': feature_names is not None,
        'info_loaded': model_info is not None,
        'all_components_ready': all([model, scaler, feature_names, model_info]),
        'model_directory': model_dir,
        'models_folder_exists': os.path.exists(model_dir),
        'optimal_threshold': optimal_threshold,
        'enhanced_features': True
    })

@app.route('/', methods=['GET'])
def home():
    """API information"""
    return jsonify({
        'message': '🌸 Luna Care Enhanced AI API',
        'version': '2.0',
        'model_status': 'loaded' if model is not None else 'not loaded',
        'model_accuracy': f"{model_info.get('accuracy', 0):.1%}" if model_info else 'Unknown',
        'optimal_threshold': optimal_threshold,
        'features_count': len(feature_names) if feature_names else 0,
        'endpoints': ['/predict-pcos', '/model-info', '/health'],
        'enhancements': [
            'Class imbalance handling',
            'Enhanced feature engineering',
            'Optimal threshold detection',
            'Dynamic risk assessment',
            'Personalized recommendations'
        ],
        'ready': model is not None
    })

if __name__ == '__main__':
    print(f"\n🌸 Luna Care Enhanced AI API Status:")
    print(f"   Model loaded: {'✅ Yes' if model else '❌ No'}")
    print(f"   Ready for predictions: {'✅ Yes' if model else '❌ No'}")
    
    if model_loaded_successfully and model_info:
        print(f"   Model accuracy: {model_info.get('accuracy', 0):.1%}")
        print(f"   Features count: {len(feature_names)}")
        print(f"   Optimal threshold: {optimal_threshold:.3f}")
        print(f"   Enhanced features: ✅ Enabled")
    
    print(f"   API running on: http://localhost:5000")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
