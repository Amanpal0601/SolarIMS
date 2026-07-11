import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import seaborn as sns
import matplotlib.pyplot as plt
from imblearn.over_sampling import SMOTE

def main():
    print("=== PV Fault Detection Training Pipeline ===")
    
    # Define paths
    data_path = os.path.join('data', 'PV_Fault_Dataset.csv')
    model_dir = 'models'
    
    os.makedirs(model_dir, exist_ok=True)
    
    # 1. Load Data
    if not os.path.exists(data_path):
        print(f"[Error] Dataset not found: {data_path}")
        return
        
    print("Loading dataset...")
    # The dataset uses a semicolon separator
    df = pd.read_csv(data_path, sep=';')
    
    # 2. Preprocess
    print("Preprocessing data...")
    
    # Map the specific Kaggle dataset columns to standard readable names
    df.rename(columns={
        'Vdcmean1': 'Voltage', 
        'Itotal1': 'Current', 
        'IR': 'Irradiance', 
        'T': 'Temperature',
        'class': 'Fault_Type'
    }, inplace=True)
    
    expected_features = ['Voltage', 'Current', 'Irradiance', 'Temperature']
    target = 'Fault_Type' 
    
    if target not in df.columns:
        print("[Error] Could not find the Target column. Available columns:", df.columns)
        return
    
    available_features = [col for col in expected_features if col in df.columns]
    if len(available_features) == 0:
        print(f"[Error] No recognizable features found. Expected some of {expected_features}.")
        return
        
    # --- Advanced Feature Engineering ---
    print("Engineering features: Power and Efficiency...")
    # Power = V * I
    df['Power'] = df['Voltage'] * df['Current']
    # Efficiency = Power / Irradiance (safety avoiding division by zero)
    df['Efficiency'] = df['Power'] / (df['Irradiance'] + 1e-9)
    
    expected_features = ['Voltage', 'Current', 'Irradiance', 'Temperature', 'Power', 'Efficiency']
    
    df.dropna(inplace=True)
    
    X = df[expected_features]
    y = df[target]
    
    # Scale Data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
    
    # 3. Apply SMOTE + Manual Duplication
    # Since we have only 100 rows, SMOTE can't create much new information.
    # We will manually duplicate the training set to give the MLP more "passes" at the same data.
    print(f"Applying Oversampling to expand training data... (Original: {len(X_train)} rows)")
    smote = SMOTE(random_state=42, k_neighbors=3)
    X_res, y_res = smote.fit_resample(X_train, y_train)
    
    # Duplicate 5 times to create a larger 'virtual' dataset for the Neural Network
    X_train_res = np.tile(X_res, (5, 1))
    y_train_res = np.tile(y_res, 5)
    
    print(f"Final training samples: {len(X_train_res)}")
    
    # 4. Model Training - Random Forest with GridSearchCV
    print("Training Random Forest Classifier with GridSearchCV...")
    rf_param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 5, 10, 15]
    }
    rf = RandomForestClassifier(random_state=42, class_weight='balanced')
    grid_search = GridSearchCV(estimator=rf, param_grid=rf_param_grid, cv=3, n_jobs=-1, scoring='accuracy')
    grid_search.fit(X_train_res, y_train_res)
    
    best_rf = grid_search.best_estimator_
    print(f"Best RF Params: {grid_search.best_params_}")
    
    print("Training Neural Network (MLPClassifier)...")
    # Higher complexity for the neural network since we have engineered features now
    mlp = MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=3000, random_state=42, early_stopping=True)
    mlp.fit(X_train_res, y_train_res)
    
    # 5. Evaluation
    print("Evaluating Models...")
    rf_predictions = best_rf.predict(X_test)
    mlp_predictions = mlp.predict(X_test)
    
    rf_acc = accuracy_score(y_test, rf_predictions)
    mlp_acc = accuracy_score(y_test, mlp_predictions)
    
    print(f"--- Random Forest Results ---")
    print(f"Accuracy: {rf_acc:.4f}\n")
    
    print(f"--- Neural Network Results ---")
    print(f"Accuracy: {mlp_acc:.4f}\n")
    
    # Select Best Model
    if mlp_acc > rf_acc:
        print("Neural Network performed better. Selecting MLPClassifier.")
        best_model = mlp
        final_predictions = mlp_predictions
    else:
        print("Random Forest performed better (or equal). Selecting RandomForestClassifier.")
        best_model = best_rf
        final_predictions = rf_predictions
        
    print("Final Classification Report:")
    target_names = ["Normal", "Short Circuit", "Shading", "Open Circuit"]
    print(classification_report(y_test, final_predictions, target_names=target_names, zero_division=0))
    
    # Plot Confusion Matrix for Best Model
    cm = confusion_matrix(y_test, final_predictions)
    plt.figure(figsize=(10,8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=target_names, yticklabels=target_names)
    plt.title('Best Model Fault Detection Confusion Matrix')
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    
    cm_path = os.path.join(model_dir, 'fault_detection_confusion_matrix.png')
    plt.savefig(cm_path, bbox_inches="tight")
    print(f"Saved confusion matrix plot to {cm_path}")
    
    # 5. Save Model
    model_path = os.path.join(model_dir, 'pv_fault_detection_model.pkl')
    scaler_path = os.path.join(model_dir, 'pv_fault_scaler.pkl')
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"Model successfully saved to {model_path} and {scaler_path}")

if __name__ == "__main__":
    main()
