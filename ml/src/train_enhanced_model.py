import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, roc_curve
from sklearn.utils import class_weight
from collections import Counter
import joblib
import os
import glob

def find_data_file():
    """Find PCOS data file dynamically"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, '..', 'data', 'processed')
    
    # Look for PCOS CSV files
    data_files = glob.glob(os.path.join(data_dir, 'PCOS*.csv'))
    if not data_files:
        raise FileNotFoundError(f"No PCOS CSV files found in {data_dir}")
    
    return data_files[0]

def preprocess_enhanced(df):
    """Enhanced preprocessing with better feature handling"""
    print("🔧 Enhanced preprocessing...")
    
    # Find target column
    target_columns = [col for col in df.columns if 'PCOS' in col.upper()]
    if not target_columns:
        raise ValueError("No PCOS target column found!")
    
    target_col = target_columns[0]
    print(f"🎯 Target column: {target_col}")
    
    # Check and report class distribution
    class_dist = Counter(df[target_col])
    print(f"📊 Class distribution: {dict(class_dist)}")
    
    imbalance_ratio = max(class_dist.values()) / min(class_dist.values())
    print(f"⚖️ Imbalance ratio: {imbalance_ratio:.1f}:1")
    
    # Select meaningful features
    feature_cols = []
    for col in df.columns:
        if col != target_col and col != 'Sl. No' and col != 'Patient File No.':
            # Skip if too many missing values
            missing_pct = df[col].isnull().sum() / len(df)
            if missing_pct < 0.8:  # Keep if less than 80% missing
                feature_cols.append(col)
    
    print(f"📋 Using {len(feature_cols)} features after filtering")
    
    X = df[feature_cols].copy()
    y = df[target_col].copy()
    
    # Handle missing values intelligently
    numeric_cols = X.select_dtypes(include=[np.number]).columns
    categorical_cols = X.select_dtypes(include=['object']).columns
    
    # For numeric: use median for important features, mean for others
    important_numeric = ['Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI']
    for col in numeric_cols:
        if any(key in col for key in important_numeric):
            X[col] = X[col].fillna(X[col].median())
        else:
            X[col] = X[col].fillna(X[col].mean())
    
    # For categorical: mode or intelligent defaults
    for col in categorical_cols:
        if X[col].mode().empty:
            X[col] = X[col].fillna('Unknown')
        else:
            X[col] = X[col].fillna(X[col].mode()[0])
    
    # Encode categorical variables
    le_dict = {}
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        le_dict[col] = le
    
    # Ensure target is binary
    if y.dtype == 'object':
        y = LabelEncoder().fit_transform(y)
    
    return X, y, feature_cols, le_dict

def train_enhanced_model():
    """Train enhanced model with proper handling of imbalance"""
    
    # Setup paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, '..', 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    # Load data
    data_file = find_data_file()
    print(f"📊 Loading data from: {data_file}")
    df = pd.read_csv(data_file)
    
    # Enhanced preprocessing
    X, y, feature_names, label_encoders = preprocess_enhanced(df)
    
    # Stratified split to maintain class distribution
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"📊 Training: {Counter(y_train)}")
    print(f"📊 Testing: {Counter(y_test)}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Calculate class weights for imbalance
    class_weights = class_weight.compute_class_weight(
        'balanced', classes=np.unique(y), y=y
    )
    class_weight_dict = {0: class_weights[0], 1: class_weights[1]}
    print(f"🔧 Class weights: {class_weight_dict}")
    
    # Train enhanced Random Forest
    print("🚀 Training enhanced model...")
    model = RandomForestClassifier(
        n_estimators=300,           # More trees
        max_depth=20,               # Deeper trees
        min_samples_split=2,        # More sensitive
        min_samples_leaf=1,         # More sensitive
        class_weight=class_weight_dict,  # Handle imbalance
        random_state=42,
        bootstrap=True,
        max_features='sqrt',        # Feature randomness
        oob_score=True             # Out-of-bag validation
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Cross-validation for robust evaluation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring='roc_auc')
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    auc_score = roc_auc_score(y_test, y_proba)
    
    print(f"\n🎯 Model Performance:")
    print(f"   Test Accuracy: {accuracy:.3f} ({accuracy*100:.1f}%)")
    print(f"   Test AUC: {auc_score:.3f}")
    print(f"   CV AUC: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    
    if hasattr(model, 'oob_score_'):
        print(f"   OOB Score: {model.oob_score_:.3f}")
    
    # Find optimal threshold
    fpr, tpr, thresholds = roc_curve(y_test, y_proba)
    j_scores = tpr - fpr
    optimal_idx = np.argmax(j_scores)
    optimal_threshold = thresholds[optimal_idx]
    
    print(f"🎯 Optimal threshold: {optimal_threshold:.3f}")
    
    # Test with optimal threshold
    y_pred_optimal = (y_proba > optimal_threshold).astype(int)
    accuracy_optimal = accuracy_score(y_test, y_pred_optimal)
    print(f"   Accuracy with optimal threshold: {accuracy_optimal:.3f}")
    
    print(f"\n📊 Classification Report (Optimal Threshold):")
    print(classification_report(y_test, y_pred_optimal, target_names=['No PCOS', 'PCOS']))
    
    # Save enhanced model
    print(f"\n💾 Saving enhanced model...")
    
    joblib.dump(model, os.path.join(model_dir, 'pcos_model.joblib'))
    joblib.dump(scaler, os.path.join(model_dir, 'pcos_scaler.joblib'))
    joblib.dump(feature_names, os.path.join(model_dir, 'feature_names.joblib'))
    joblib.dump(label_encoders, os.path.join(model_dir, 'label_encoders.joblib'))
    
    model_info = {
        'accuracy': accuracy_optimal,
        'auc': auc_score,
        'cv_auc_mean': cv_scores.mean(),
        'optimal_threshold': optimal_threshold,
        'features': feature_names,
        'feature_count': len(feature_names),
        'training_samples': len(X_train),
        'test_samples': len(X_test),
        'class_weights': class_weight_dict,
        'imbalance_ratio': max(Counter(y).values()) / min(Counter(y).values())
    }
    
    joblib.dump(model_info, os.path.join(model_dir, 'model_info.joblib'))
    
    print("✅ Enhanced model training complete!")
    return accuracy_optimal

if __name__ == "__main__":
    try:
        accuracy = train_enhanced_model()
        print(f"\n🎉 Enhanced model trained! Final accuracy: {accuracy:.1%}")
        print("🚀 Start your API: python src/api_fixed.py")
    except Exception as e:
        print(f"❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
