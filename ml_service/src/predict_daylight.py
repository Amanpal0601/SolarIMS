import os
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt

def generate_forecast_plot(recent_hours, forecast_values, output_path):
    """Generates a professional plot showing the past 24h and the predicted Daylight hours."""
    plt.figure(figsize=(12, 6))
    
    # Plot past 24 hours
    past_x = range(-24, 0)
    plt.plot(past_x, recent_hours, label="Past 24H (Actual)", color="blue", marker="o")
    
    # Plot daylight forecast (6 to 18)
    # We shift the x-axis to represent the relative hours properly
    # If today is ending, tomorrow's 06:00 is technically +6 hours from Midnight
    future_x = range(6, 19)
    plt.plot(future_x, forecast_values, label="Tomorrow's Daylight Forecast (06:00-18:00)", color="orange", marker="x", linestyle="--")
    
    # Formatting
    plt.title("Solar Power Generation: Tomorrow's Daylight Forecast")
    plt.xlabel("Hours (0 = Midnight Tonight)")
    plt.ylabel("AC Power Generation (kW)")
    plt.axvline(x=0, color='gray', linestyle=':', label="Now")
    plt.grid(True, alpha=0.3)
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(output_path)
    print(f"\n[Generated Graph] Forecast visualization saved to: {output_path}")

def main():
    print("\n" + "="*50)
    print(" PV Power Daylight Forecasting System (Enterprise) ")
    print("="*50 + "\n")
    
    model_path = os.path.join('models', 'pv_power_daylight_model.pkl')
    gen_path = os.path.join('data', 'Plant_1_Generation_Data.csv')
    weather_path = os.path.join('data', 'Plant_1_Weather_Sensor_Data.csv')
    
    if not os.path.exists(model_path):
        print(f"[Error] Model not found at {model_path}.")
        print("Please run `python src/train_prediction.py` first to train the daylight model.")
        return
        
    print("Loading AI Forecasting Model...")
    model = joblib.load(model_path)
    
    # --- Simulate Real-Time Company Usage ---
    print("Fetching recent sensor and generation data...")
    # Load and aggregate data same as training to ensure consistency
    df_gen = pd.read_csv(gen_path)
    df_weather = pd.read_csv(weather_path)
    
    df_gen['DATE_TIME'] = pd.to_datetime(df_gen['DATE_TIME'])
    df_weather['DATE_TIME'] = pd.to_datetime(df_weather['DATE_TIME'])
    
    df_gen_agg = df_gen.groupby('DATE_TIME')[['AC_POWER', 'DC_POWER']].sum().reset_index()
    df_weather_agg = df_weather.groupby('DATE_TIME')[['AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE', 'IRRADIATION']].mean().reset_index()
    
    df = pd.merge(df_gen_agg, df_weather_agg, on='DATE_TIME', how='inner')
    df.set_index('DATE_TIME', inplace=True)
    df_hourly = df.resample('1H').mean().interpolate(method='linear')
    df_hourly.dropna(inplace=True)
    
    # --- Advanced Feature Engineering (Must match training EXACTLY) ---
    df_hourly['hour'] = df_hourly.index.hour
    df_hourly['month'] = df_hourly.index.month
    
    df_hourly['sin_hour'] = np.sin(2 * np.pi * df_hourly['hour'] / 24)
    df_hourly['cos_hour'] = np.cos(2 * np.pi * df_hourly['hour'] / 24)
    df_hourly['sin_month'] = np.sin(2 * np.pi * df_hourly['month'] / 12)
    df_hourly['cos_month'] = np.cos(2 * np.pi * df_hourly['month'] / 12)
    
    df_hourly['AC_POWER_rolling_3h'] = df_hourly['AC_POWER'].rolling(window=3).mean()
    df_hourly['AC_POWER_rolling_6h'] = df_hourly['AC_POWER'].rolling(window=6).mean()
    df_hourly['IRRADIATION_rolling_3h'] = df_hourly['IRRADIATION'].rolling(window=3).mean()
    
    # Drop rows that don't have enough history for the rolling windows
    df_hourly.dropna(inplace=True)
    
    features = [
        'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE', 'IRRADIATION', 'AC_POWER',
        'sin_hour', 'cos_hour', 'sin_month', 'cos_month',
        'AC_POWER_rolling_3h', 'AC_POWER_rolling_6h', 'IRRADIATION_rolling_3h'
    ]
    
    # Get the last 24 hours of data (This represents "Today" for the company)
    recent_data = df_hourly.tail(24)[features]
    
    # The input for the model is a flattened 1D array of the past 24 hours of features
    input_features = recent_data.values.flatten().reshape(1, -1)
    
    print("\n--- Initiating Daylight Forecast Horizon ---")
    print("Predicting generation capability for Tomorrow (06:00 to 18:00)...")
    
    # Predict (Returns an array of 13 values)
    forecast_daylight = model.predict(input_features)[0] 
    
    print("\n--- Tomorrow's Daylight Generation Forecast ---")
    print(f"{'Time of Day':<20} | {'Predicted AC Power':<20}")
    print("-" * 45)
    
    total_expected_power = 0
    start_hour = 6 # 06:00
    
    for i, power in enumerate(forecast_daylight):
        # Prevent negative power predictions (physical impossibility)
        safe_power = max(0, power)
        current_hour = start_hour + i
        print(f"{current_hour:02d}:00                | {safe_power:.2f} kW")
        total_expected_power += safe_power
        
    print("-" * 45)
    print(f"Total Expected Daily Generation Output: {total_expected_power:.2f} kW")
    
    # Generate visualization
    output_img = os.path.join('models', 'forecast_daylight_demo.png')
    recent_power = recent_data['AC_POWER'].values
    # Clean forecast for plotting
    safe_forecast_values = [max(0, p) for p in forecast_daylight]
    
    generate_forecast_plot(recent_power, safe_forecast_values, output_img)
    print("="*50)

if __name__ == "__main__":
    main()
