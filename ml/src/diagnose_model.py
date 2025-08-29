import pandas as pd
import numpy as np
import joblib
import os
from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns

def diagnose_model_issues():
    """Comprehensive model diagnosis"""
    
    # Load data
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, '..', 'data', 'processed')
    model_dir = os.path.join(current_dir, '..', 'models')
    
    data_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    df = pd.read_csv(os.path.join(data_dir, data_files[0]))
    
    print("🔍 COMPREHENSIVE MODEL DIAGNOSIS")
    print("=" * 50)
    
    # 1. Check target distribution
    target_col = [col for col in df.columns if 'PCOS' in col.upper()][0]
    target_dist = Counter(df[target_col])
    print(f"\n📊 Target Distribution ({target_col}):")
    print(f"   Class 0 (No PCOS): {target_dist[0]} ({target_dist[0]/len(df)*100:.1f}%)")
    print(f"   Class 1 (PCOS): {target_dist[1]} ({target_dist[1]/len(df)*100:.1f}%)")
    
    if target_dist[0] / target_dist[1] > 5 or target_dist[1] / target_dist[0] > 5:
        print("   ⚠️  SEVERE CLASS IMBALANCE DETECTED!")
    
    # 2. Check for constant features
    constant_features = []
    for col in df.columns:
        if col != target_col and df[col].nunique() <= 1:
            constant_features.append(col)
    
    if constant_features:
        print(f"\n🚫 Constant Features Found: {constant_features}")
        print("   These features provide no information!")
    
    # 3. Check correlation with target
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    correlations = []
    
    for col in numeric_cols:
        if col != target_col:
            corr = df[col].corr(df[target_col])
            if not np.isnan(corr):
                correlations.append((col, abs(corr)))
    
    correlations.sort(key=lambda x: x[1], reverse=True)
    
    print(f"\n📈 Top 10 Features by Target Correlation:")
    for i, (feature, corr) in enumerate(correlations[:10], 1):
        print(f"   {i:2d}. {feature}: {corr:.4f}")
    
    # Check if all correlations are very low
    max_corr = max([corr for _, corr in correlations]) if correlations else 0
    if max_corr < 0.1:
        print("   ⚠️  ALL CORRELATIONS ARE VERY LOW! Features may be uninformative.")
    
    # 4. Check model performance if exists
    if os.path.exists(os.path.join(model_dir, 'model_info.joblib')):
        model_info = joblib.load(os.path.join(model_dir, 'model_info.joblib'))
        model = joblib.load(os.path.join(model_dir, 'pcos_model.joblib'))
        
        print(f"\n🤖 Model Information:")
        print(f"   Accuracy: {model_info.get('accuracy', 0)*100:.1f}%")
        print(f"   Optimal Threshold: {model_info.get('optimal_threshold', 0.5):.3f}")
        
        # Check if model is just predicting one class
        feature_importance = model_info.get('feature_importance', [])
        if feature_importance:
            top_feature = feature_importance[0]
            print(f"   Most Important Feature: {top_feature['feature']} ({top_feature['importance']:.4f})")
            
            if top_feature['importance'] > 0.8:
                print("   ⚠️  ONE FEATURE DOMINATES! Possible overfitting.")
        
        # Test model with extreme values
        print(f"\n🧪 Testing Model Response to Extreme Inputs:")
        
        feature_names = joblib.load(os.path.join(model_dir, 'feature_names.joblib'))
        scaler = joblib.load(os.path.join(model_dir, 'pcos_scaler.joblib'))
        
        # Create test vectors
        test_cases = {
            'All zeros': np.zeros(len(feature_names)),
            'All ones': np.ones(len(feature_names)),
            'All max values': np.ones(len(feature_names)) * 100,
            'Random values': np.random.rand(len(feature_names)) * 50
        }
        
        results = {}
        for name, test_vector in test_cases.items():
            try:
                test_scaled = scaler.transform(test_vector.reshape(1, -1))
                pred_proba = model.predict_proba(test_scaled)[0]
                results[name] = pred_proba[1] * 100
            except Exception as e:
                results[name] = f"Error: {e}"
        
        for name, result in results.items():
            print(f"   {name}: {result}")
        
        # Check if all results are similar
        if isinstance(list(results.values())[0], (int, float)):
            risk_scores = [r for r in results.values() if isinstance(r, (int, float))]
            if len(set([round(r, 0) for r in risk_scores])) <= 2:
                print("   ⚠️  MODEL GIVES SAME PREDICTIONS FOR DIFFERENT INPUTS!")
    
    # 5. Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    if max_corr < 0.1:
        print("   1. Features have low predictive power - need better feature engineering")
    if target_dist[0] / target_dist[1] > 5:
        print("   2. Use SMOTE, class weights, or threshold adjustment for imbalance")
    if constant_features:
        print("   3. Remove constant features from training")
    print("   4. Try ensemble methods (XGBoost, LightGBM)")
    print("   5. Add more diverse training data")
    print("   6. Use cross-validation to verify model performance")

if __name__ == "__main__":
    diagnose_model_issues()
