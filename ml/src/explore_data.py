import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

def explore_pcos_data():
    """Explore the PCOS dataset"""
    
    # Check what files are in processed folder
    data_dir = 'data/processed'
    files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    
    print(f"📁 Found {len(files)} CSV files:")
    for file in files:
        print(f"  - {file}")
    
    # Load the main dataset (adjust filename if different)
    main_file = 'PCOS.csv'  # or whatever your main file is called
    
    if main_file in files:
        df = pd.read_csv(f'{data_dir}/{main_file}')
    else:
        # If different filename, use the first CSV file
        df = pd.read_csv(f'{data_dir}/{files[0]}')
        print(f"📋 Using file: {files[0]}")
    
    print(f"\n📊 Dataset Overview:")
    print(f"Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    print(f"\n🏷️ Column Names:")
    for i, col in enumerate(df.columns):
        print(f"{i+1:2d}. {col}")
    
    print(f"\n📈 Dataset Info:")
    print(df.info())
    
    print(f"\n📋 First 5 Rows:")
    print(df.head())
    
    # Check for PCOS target variable
    pcos_columns = [col for col in df.columns if 'PCOS' in col.upper()]
    print(f"\n🎯 PCOS-related columns: {pcos_columns}")
    
    if pcos_columns:
        target_col = pcos_columns[0]
        print(f"\n📊 Target Variable Distribution ({target_col}):")
        print(df[target_col].value_counts())
        
        # Calculate PCOS percentage
        if len(df[target_col].unique()) == 2:
            pcos_rate = (df[target_col].sum() / len(df)) * 100
            print(f"PCOS Rate: {pcos_rate:.1f}%")
    
    # Check missing values
    print(f"\n❓ Missing Values:")
    missing = df.isnull().sum()
    missing = missing[missing > 0].sort_values(ascending=False)
    if len(missing) > 0:
        print(missing)
    else:
        print("✅ No missing values!")
    
    # Basic statistics
    print(f"\n📊 Statistical Summary (first 10 numeric columns):")
    numeric_cols = df.select_dtypes(include=[np.number]).columns[:10]
    print(df[numeric_cols].describe())
    
    return df

if __name__ == "__main__":
    df = explore_pcos_data()
    print("\n✅ Data exploration complete!")
