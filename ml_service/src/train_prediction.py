import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor
from sklearn.multioutput import MultiOutputRegressor
import joblib
import matplotlib.pyplot as plt

def create_daylight_sequences(df, feature_cols, target_col, lookback_hours=24):
    """
    Creates sequences where Input (X) is the past 24 hours of data,
    and Target (Y) is the NEXT DAY'S daylight generation (06:00 to 18:00).
    """
    X, y = [], []
    
    # Iterate through every timestamp looking for 'midnight' to serve as our forecast anchor
    for i in range(len(df) - lookback_hours - 24): # Ensure we have tomorrow's full data
        current_time = df.index[i + lookback_hours]
        
        # We only generate a forecast sequence anchored at "Midnight" looking ahead to the next daylight
        # Though the user can query at any time, training on daily anchors prevents extreme data leakage
        if current_time.hour == 0: 
            # X: The 24 hours leading up to midnight
            x_seq = df[feature_cols].iloc[i:(i + lookback_hours)].values.flatten()
            
            # Y: Tomorrow from 06:00 to 18:00 (13 data points)
            # Since current_time is Hour 0 (Midnight), Hour 6 is +6 indices, Hour 18 is +18 indices
            y_seq = df[target_col].iloc[(i + lookback_hours + 6):(i + lookback_hours + 19)].values
            
            if len(y_seq) == 13: # Ensure we got a full daylight slice
                X.append(x_seq)
                y.append(y_seq)
                
    return np.array(X), np.array(y)

def main():
    print("=== PV Power Daylight Forecasting Pipeline ===")
    
    # Define paths
    gen_path = os.path.join('data', 'Plant_1_Generation_Data.csv')
    weather_path = os.path.join('data', 'Plant_1_Weather_Sensor_Data.csv')
    model_dir = 'models'
    
    os.makedirs(model_dir, exist_ok=True)
    
    # 1. Load Data
    if not os.path.exists(gen_path) or not os.path.exists(weather_path):
        print(f"[Error] Datasets not found in 'data/' directory.")
        return
        
    print("Loading datasets...")
    df_gen = pd.read_csv(gen_path)
    df_weather = pd.read_csv(weather_path)
    
    # 2. Preprocess & Merge
    print("Preprocessing data for temporal analysis...")
    df_gen['DATE_TIME'] = pd.to_datetime(df_gen['DATE_TIME'])
    df_weather['DATE_TIME'] = pd.to_datetime(df_weather['DATE_TIME'])
    
    # To handle time-series correctly, we aggregate to plant level and resample to Hourly
    # This prevents overlapping timestamps from different inverters.
    df_gen_agg = df_gen.groupby('DATE_TIME')[['AC_POWER', 'DC_POWER']].sum().reset_index()
    df_weather_agg = df_weather.groupby('DATE_TIME')[['AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE', 'IRRADIATION']].mean().reset_index()
    
    df = pd.merge(df_gen_agg, df_weather_agg, on='DATE_TIME', how='inner')
    df.set_index('DATE_TIME', inplace=True)
    
    # Resample to exactly 1-hour intervals to ensure consistent time steps
    df_hourly = df.resample('1H').mean().interpolate(method='linear')
    df_hourly.dropna(inplace=True)
    
    # --- Advanced Feature Engineering ---
    print("Applying Advanced Feature Engineering (Time & Rolling Stats)...")
    
    # 1. Cyclical Time Features (Hour of day, Month of year)
    # This helps the model understand the daily sunrise/sunset cycle perfectly.
    df_hourly['hour'] = df_hourly.index.hour
    df_hourly['month'] = df_hourly.index.month
    
    df_hourly['sin_hour'] = np.sin(2 * np.pi * df_hourly['hour'] / 24)
    df_hourly['cos_hour'] = np.cos(2 * np.pi * df_hourly['hour'] / 24)
    df_hourly['sin_month'] = np.sin(2 * np.pi * df_hourly['month'] / 12)
    df_hourly['cos_month'] = np.cos(2 * np.pi * df_hourly['month'] / 12)
    
    # 2. Rolling Statistics (Moving Averages)
    # Gives the model context on immediate past trends
    df_hourly['AC_POWER_rolling_3h'] = df_hourly['AC_POWER'].rolling(window=3).mean()
    df_hourly['AC_POWER_rolling_6h'] = df_hourly['AC_POWER'].rolling(window=6).mean()
    df_hourly['IRRADIATION_rolling_3h'] = df_hourly['IRRADIATION'].rolling(window=3).mean()
    
    # Drop NaNs created by rolling windows
    df_hourly.dropna(inplace=True)
    
    features = [
        'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE', 'IRRADIATION', 'AC_POWER',
        'sin_hour', 'cos_hour', 'sin_month', 'cos_month',
        'AC_POWER_rolling_3h', 'AC_POWER_rolling_6h', 'IRRADIATION_rolling_3h'
    ]
    target = 'AC_POWER'
    
    print(f"Total hourly records available after feature engineering: {len(df_hourly)}")
    
    # 3. Create Sequences (24 hours lookback -> 13 hours daylight forecast)
    LOOKBACK_HOURS = 24
    DAYLIGHT_HOURS = 13 # 06:00 to 18:00 inclusive
    
    print(f"Structuring sequences: {LOOKBACK_HOURS}h Input -> {DAYLIGHT_HOURS}h Daylight Output (Tomorrow 6am-6pm)...")
    X, y = create_daylight_sequences(df_hourly, features, target, lookback_hours=LOOKBACK_HOURS)
    
    if len(X) == 0:
        print("[Error] Not enough consecutive data points to create daylight sequences.")
        return
        
    print(f"Generated {len(X)} daily training sequences.")
    print(f"X shape: {X.shape}, y shape: {y.shape}")
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    # 4. Model Training
    print("Training Multi-Output XGBoost Regressor for Daylight window (this may take a moment)...")
    # Wrap XGBRegressor in MultiOutputRegressor to predict 13 steps
    base_model = XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42, n_jobs=-1)
    model = MultiOutputRegressor(base_model)
    
    model.fit(X_train, y_train)
    
    # 5. Evaluation
    print("Evaluating Daylight Forecast Model...")
    predictions = model.predict(X_test)
    
    # Calculate metrics across all 13 horizons collectively
    mse = mean_squared_error(y_test, predictions)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, predictions)
    
    print(f"--- Global Results (Averaged over 13h daylight window) ---")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE:  {mae:.4f}")
    
    # Calculate Normalized metrics (relative to maximum capacity)
    max_capacity = df_hourly['AC_POWER'].max()
    print(f"-- Normalized Metrics (Max Capacity: {max_capacity:.2f} kW) --")
    print(f"Normalized RMSE (nRMSE): {(rmse / max_capacity) * 100:.2f}%")
    print(f"Normalized MAE (nMAE):   {(mae / max_capacity) * 100:.2f}%")

    
    # Plotting error degradation over the 13 hours
    rmse_per_hour = [np.sqrt(mean_squared_error(y_test[:, i], predictions[:, i])) for i in range(DAYLIGHT_HOURS)]
    hours_labels = [f"{h:02d}:00" for h in range(6, 19)]
    
    plt.figure(figsize=(10, 5))
    plt.plot(hours_labels, rmse_per_hour, marker='o', linestyle='-', color='red')
    plt.title('Prediction Error (RMSE) Across Daylight Hours')
    plt.xlabel('Time of Day')
    plt.ylabel('RMSE (AC Power)')
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.savefig(os.path.join(model_dir, "daylight_error_degradation.png"), bbox_inches="tight")
    print(f"Saved error degradation plot to {model_dir}/daylight_error_degradation.png")
    
    # 6. Save Model
    model_path = os.path.join(model_dir, 'pv_power_daylight_model.pkl')
    joblib.dump(model, model_path)
    print(f"\n[Success] Daylight forecasting model successfully saved to {model_path}")

if __name__ == "__main__":
    main()
