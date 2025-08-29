import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_curve
from sklearn.utils import class_weight
from collections import Counter
import joblib
import os

# Install: pip install imbalanced-learn
try:
    from imblearn.over_sampling import SMOTE
    SMOTE_AVAILABLE = True
except ImportError:
    print("⚠️  SMOTE not available. Install with: pip install imbalanced-learn")
    SMOTE_AVAILABLE = False

def create_enhanced_features(X, feature_names):
    """Create additional risk-based features for better prediction variety"""
    print("🔧 Creating enhanced features...")
    
    X_enhanced = X.copy()
    new_features = []
    
    # BMI-based features
    bmi_indices = [i for i, name in enumerate(feature_names) if 'BMI' in name.upper()]
    if bmi_indices:
        bmi_col = bmi_indices[0]
        bmi_values = X[:, bmi_col]
        
        # BMI categories
        overweight = (bmi_values > 25).astype(int)
        obese = (bmi_values > 30).astype(int)
        underweight = (bmi_values < 18.5).astype(int)
        
        X_enhanced = np.column_stack([X_enhanced, overweight, obese, underweight])
        new_features.extend(['BMI_overweight', 'BMI_obese', 'BMI_underweight'])
    
    # Age-based risk features
    age_indices = [i for i, name in enumerate(feature_names) if 'Age' in name]
    if age_indices:
        age_col = age_indices[0]
        age_values = X[:, age_col]
        
        # Age risk categories
        high_risk_age = (age_values > 30).astype(int)
        young_age = (age_values < 20).astype(int)
        peak_repro_age = ((age_values >= 20) & (age_values <= 30)).astype(int)
        
        X_enhanced = np.column_stack([X_enhanced, high_risk_age, young_age, peak_repro_age])
        new_features.extend(['Age_high_risk', 'Age_young', 'Age_peak_reproductive'])
    
    # Symptom count feature
    symptom_keywords = ['weight gain', 'hair growth', 'pimples', 'hair loss', 'skin darkening']
    symptom_indices = []
    
    for i, name in enumerate(feature_names):
        for keyword in symptom_keywords:
            if keyword.lower() in name.lower():
                symptom_indices.append(i)
                break
    
    if symptom_indices:
        symptom_sum = X[:, symptom_indices].sum(axis=1)
        multiple_symptoms = (symptom_sum >= 3).astype(int)
        
        X_enhanced = np.column_stack([X_enhanced, symptom_sum, multiple_symptoms])
        new_features.extend(['Total_symptoms', 'Multiple_symptoms'])
    
    # Hormone ratio features (if available)
    fsh_indices = [i for i, name in enumerate(feature_names) if 'FSH' in name.upper()]
    lh_indices = [i for i, name in enumerate(feature_names) if 'LH' in name.upper()]
    
    if fsh_indices and lh_indices:
        fsh_col, lh_col = fsh_indices[0], lh_indices[0]
        
        # LH/FSH ratio categories
        lh_fsh_ratio = np.divide(X[:, lh_col], X[:, fsh_col], 
                                out=np.zeros_like(X[:, lh_col]), where=X[:, fsh_col]!=0)
        high_lh_fsh = (lh_fsh_ratio > 2).astype(int)
        
        X_enhanced = np.column_stack([X_enhanced, lh_fsh_ratio, high_lh_fsh])
        new_features.extend(['LH_FSH_ratio_calc', 'High_LH_FSH_ratio'])
    
    # Lifestyle risk score
    lifestyle_keywords = ['exercise', 'fast food']
    lifestyle_indices = []
    
    for i, name in enumerate(feature_names):
        for keyword in lifestyle_keywords:
            if keyword.lower() in name.lower():
                lifestyle_indices.append(i)
    
    if lifestyle_indices:
        # Assume exercise=1 is good, fast_food=1 is bad
        lifestyle_score = 0
        for idx in lifestyle_indices:
            if 'exercise' in feature_names[idx].lower():
                lifestyle_score += X[:, idx]  # Good lifestyle
            elif 'fast food' in feature_names[idx].lower():
                lifestyle_score -= X[:, idx]  # Bad lifestyle
        
        poor_lifestyle = (lifestyle_score < 0).astype(int)
        X_enhanced = np.column_stack([X_enhanced, poor_lifestyle])
        new_features.append('Poor_lifestyle')
    
    updated_feature_names = feature_names + new_features
    print(f"✅ Added {len(new_features)} enhanced features")
    
    return X_enhanced, updated_feature_names

def preprocess_pcos_data(df):
    """Preprocess PCOS dataset with enhanced features"""
    print("🔧 Starting data preprocessing...")
    
    # Find target column
    target_columns = [col for col in df.columns if 'PCOS' in col.upper()]
    if not target_columns:
        raise ValueError("No PCOS target column found!")
    
    target_col = target_columns[0]
    print(f"🎯 Target column: {target_col}")
    
    # Select features - use numeric columns and important categorical ones
    important_features = [
        'Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI',
        'Cycle length(days)', 'FSH(mIU/mL)', 'LH(mIU/mL)', 
        'FSH/LH', 'Waist:Hip Ratio', 'Weight gain(Y/N)',
        'hair growth(Y/N)', 'Skin darkening (Y/N)',
        'Hair loss(Y/N)', 'Pimples(Y/N)', 'Fast food (Y/N)',
        'Reg.Exercise(Y/N)', 'BP _Systolic (mmHg)', 'BP _Diastolic (mmHg)',
        'Hb(g/dl)', 'Cycle(R/I)', 'AMH(ng/mL)', 'PRL(ng/mL)',
        'TSH (mIU/L)', 'Vit D3 (ng/mL)', 'PRG(ng/mL)', 'RBS(mg/dl)'
    ]
    
    # Find available features
    available_features = []
    for feature in important_features:
        if feature in df.columns:
            available_features.append(feature)
        else:
            # Try to find similar named columns
            for col in df.columns:
                if feature.lower().replace(' ', '').replace('(', '').replace(')', '') in col.lower().replace(' ', '').replace('(', '').replace(')', ''):
                    if col != target_col and col not in available_features:
                        available_features.append(col)
                        break
    
    # Remove target from features
    if target_col in available_features:
        available_features.remove(target_col)
    
    print(f"📋 Using {len(available_features)} features:")
    for i, feature in enumerate(available_features, 1):
        print(f"  {i:2d}. {feature}")
    
    # Prepare features and target
    X = df[available_features].copy()
    y = df[target_col].copy()
    
    # Handle missing values intelligently
    print("🔧 Handling missing values...")
    numeric_cols = X.select_dtypes(include=[np.number]).columns
    
    # For key features, use median; for others, use mean
    key_features = ['Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI']
    for col in numeric_cols:
        if any(key in col for key in key_features):
            X[col] = X[col].fillna(X[col].median())
        else:
            X[col] = X[col].fillna(X[col].mean())
    
    categorical_cols = X.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        X[col] = X[col].fillna(X[col].mode()[0] if len(X[col].mode()) > 0 else 'Unknown')
    
    # Encode categorical variables
    print("🔧 Encoding categorical variables...")
    le_dict = {}
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        le_dict[col] = le
    
    # Ensure target is binary
    if y.dtype == 'object' or set(y.unique()) != {0, 1}:
        y = LabelEncoder().fit_transform(y)
    
    # Convert to numpy for feature engineering
    X_array = X.values
    
    # Create enhanced features
    X_enhanced, enhanced_feature_names = create_enhanced_features(X_array, available_features)
    
    print(f"✅ Preprocessing complete!")
    print(f"   Original features: {len(available_features)}")
    print(f"   Enhanced features: {len(enhanced_feature_names)}")
    print(f"   Final shape: {X_enhanced.shape}")
    print(f"   Target distribution: {Counter(y)}")
    
    return X_enhanced, y, enhanced_feature_names, le_dict

def find_optimal_threshold(model, X_test, y_test):
    """Find optimal classification threshold"""
    y_proba = model.predict_proba(X_test)[:, 1]
    fpr, tpr, thresholds = roc_curve(y_test, y_proba)
    
    # Find threshold that maximizes J statistic (Youden's J)
    j_scores = tpr - fpr
    optimal_idx = np.argmax(j_scores)
    optimal_threshold = thresholds[optimal_idx]
    
    print(f"🎯 Optimal threshold: {optimal_threshold:.3f} (default: 0.5)")
    return optimal_threshold

def train_pcos_model():
    """Train enhanced PCOS prediction model"""
    
    # ABSOLUTE PATHS - FIXED!
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, '..', 'data', 'processed')
    model_dir = os.path.join(current_dir, '..', 'models')
    
    print(f"🔍 Script location: {current_dir}")
    print(f"📁 Data directory: {data_dir}")
    print(f"💾 Models will be saved to: {model_dir}")
    
    # Create models directory
    os.makedirs(model_dir, exist_ok=True)
    
    # Load data
    data_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    if not data_files:
        raise FileNotFoundError(f"No CSV files found in {data_dir}")
    
    main_file = data_files[0]
    data_path = os.path.join(data_dir, main_file)
    print(f"📊 Loading data from: {data_path}")
    
    df = pd.read_csv(data_path)
    print(f"✅ Data loaded: {df.shape}")
    
    # Preprocess data with enhanced features
    X, y, feature_names, label_encoders = preprocess_pcos_data(df)
    
    # Check class distribution
    print(f"📊 Original class distribution: {Counter(y)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"📊 Data split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Testing: {len(X_test)} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Handle class imbalance
    if SMOTE_AVAILABLE:
        print("🔧 Applying SMOTE for class balancing...")
        smote = SMOTE(random_state=42, k_neighbors=min(5, Counter(y_train)[1]-1))
        try:
            X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)
            print(f"📊 After SMOTE: {Counter(y_train_balanced)}")
        except ValueError as e:
            print(f"⚠️ SMOTE failed: {e}. Using original data.")
            X_train_balanced, y_train_balanced = X_train_scaled, y_train
    else:
        X_train_balanced, y_train_balanced = X_train_scaled, y_train
    
    # Calculate class weights
    class_weights = class_weight.compute_class_weight(
        'balanced',
        classes=np.unique(y),
        y=y
    )
    class_weight_dict = {0: class_weights[0], 1: class_weights[1]}
    print(f"🔧 Class weights: {class_weight_dict}")
    
    # Train enhanced model
    print("🚀 Training Enhanced Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=200,        # Increased trees
        max_depth=15,            # Increased depth
        min_samples_split=2,     # More sensitive to patterns
        min_samples_leaf=1,      # More sensitive splits
        class_weight=class_weight_dict,  # Handle imbalance
        random_state=42,
        bootstrap=True,          # Ensure variance
        max_features='sqrt',     # Feature randomness
        oob_score=True          # Out-of-bag score
    )
    
    model.fit(X_train_balanced, y_train_balanced)
    
    # Find optimal threshold
    optimal_threshold = find_optimal_threshold(model, X_test_scaled, y_test)
    
    # Evaluate model with default threshold
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    # Evaluate with optimal threshold
    y_pred_optimal = (y_proba > optimal_threshold).astype(int)
    
    accuracy_default = accuracy_score(y_test, y_pred)
    accuracy_optimal = accuracy_score(y_test, y_pred_optimal)
    
    print(f"\n🎯 Model Performance:")
    print(f"   Accuracy (default 0.5): {accuracy_default:.3f} ({accuracy_default*100:.1f}%)")
    print(f"   Accuracy (optimal {optimal_threshold:.3f}): {accuracy_optimal:.3f} ({accuracy_optimal*100:.1f}%)")
    
    if hasattr(model, 'oob_score_'):
        print(f"   Out-of-bag score: {model.oob_score_:.3f}")
    
    print(f"\n📊 Classification Report (Optimal Threshold):")
    print(classification_report(y_test, y_pred_optimal, target_names=['No PCOS', 'PCOS']))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\n🔍 Top 15 Most Important Features:")
    print(feature_importance.head(15))
    
    # Save all model components with ABSOLUTE PATHS
    print(f"\n💾 Saving enhanced model components to {model_dir}...")
    
    joblib.dump(model, os.path.join(model_dir, 'pcos_model.joblib'))
    joblib.dump(scaler, os.path.join(model_dir, 'pcos_scaler.joblib'))
    joblib.dump(feature_names, os.path.join(model_dir, 'feature_names.joblib'))
    joblib.dump(label_encoders, os.path.join(model_dir, 'label_encoders.joblib'))
    
    model_info = {
        'accuracy': accuracy_optimal,
        'accuracy_default': accuracy_default,
        'optimal_threshold': optimal_threshold,
        'features': feature_names,
        'feature_count': len(feature_names),
        'training_samples': len(X_train_balanced),
        'test_samples': len(X_test),
        'class_weights': class_weight_dict,
        'feature_importance': feature_importance.to_dict('records'),
        'oob_score': getattr(model, 'oob_score_', None)
    }
    
    joblib.dump(model_info, os.path.join(model_dir, 'model_info.joblib'))
    
    # Verify files were saved
    print(f"\n✅ Enhanced model files saved:")
    for filename in ['pcos_model.joblib', 'pcos_scaler.joblib', 'feature_names.joblib', 'model_info.joblib']:
        filepath = os.path.join(model_dir, filename)
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f"   ✅ {filename}: {size} bytes")
        else:
            print(f"   ❌ {filename}: NOT FOUND")
    
    return model, scaler, feature_names, accuracy_optimal

if __name__ == "__main__":
    try:
        model, scaler, features, accuracy = train_pcos_model()
        print(f"\n🎉 Enhanced training complete! Model accuracy: {accuracy:.1%}")
        print("🚀 Now you can start your API with: python src/api_fixed.py")
        print("🧪 Test with different risk profiles using: python src/demo.py")
    except Exception as e:
        print(f"❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
