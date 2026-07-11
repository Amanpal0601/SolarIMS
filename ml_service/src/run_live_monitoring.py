import pandas as pd
import numpy as np

def main():
    print("\n" + "="*60)
    print(" 📡 LIVE SOLAR MONITORING & ANOMALY DETECTION SYSTEM 📡")
    print("="*60 + "\n")
    
    # Load generation data
    print("Loading live telemetry from all 22 Inverter Arrays...")
    gen_df = pd.read_csv('data/Plant_1_Generation_Data.csv')
    
    # Standardize time
    gen_df['DATE_TIME'] = pd.to_datetime(gen_df['DATE_TIME'])
    
    # Group by Timestamp so we can compare inverters at the EXACT SAME TIME
    timestamp_groups = gen_df.groupby('DATE_TIME')
    
    alerts_found = 0
    
    for time, group_df in timestamp_groups:
        
        # Calculate what a "Normal" inverter is producing right now
        median_power = group_df['AC_POWER'].median()
        
        # Only check for anomalies during actively sunny hours (median power > 500 kW)
        # We don't want false alarms at midnight or 5 AM!
        if median_power > 500:
            
            for index, row in group_df.iterrows():
                inverter_id = row['SOURCE_KEY']
                actual_power = row['AC_POWER']
                
                # RULE 1: Complete Failure (Zero output while everyone else is working)
                if actual_power == 0:
                    print(f"\n🚨 [CRITICAL FAULT DETECTED] 🚨")
                    print(f"⏰ Time:      {time}")
                    print(f"📍 Array ID:  {inverter_id}")
                    print(f"❌ Status:    COMPLETE FAILURE (0.00 kW output)")
                    print(f"✅ Expected:  ~{median_power:.2f} kW (Plant Average)")
                    print(f"🛠️ Diagnosis: Likely Open Circuit, Blown Fuse, or Inverter Trip.")
                    print("-" * 60)
                    alerts_found += 1
                
                # RULE 2: Severe Underperformance (Producing less than 20% of what it should be)
                elif actual_power < (median_power * 0.2):
                    print(f"\n⚠️ [WARNING: SEVERE ANOMALY] ⚠️")
                    print(f"⏰ Time:      {time}")
                    print(f"📍 Array ID:  {inverter_id}")
                    print(f"📉 Status:    UNDERPERFORMING ({actual_power:.2f} kW output)")
                    print(f"✅ Expected:  ~{median_power:.2f} kW (Plant Average)")
                    print(f"🛠️ Diagnosis: Partial Shading, Thick Dust, or Degraded Panel Segment.")
                    print("-" * 60)
                    alerts_found += 1
                    
        # Stop after finding a few examples so we don't spam the console
        if alerts_found >= 5:
            print("\n✔️ System scan paused (Max alerts reached for instantaneous demo).")
            break
            
    if alerts_found == 0:
        print("\n✔️ All 22 strings are healthy. No instantaneous anomalies detected.")
        
    print("\n" + "="*60)
    print(" 🧹 LONG-TERM DEGRADATION & DUST TRACKING 🧹")
    print("="*60 + "\n")
    
    print("Analyzing 34-day Daily Yield efficiency trends...\n")
    
    # Extract just the Date from DATE_TIME
    gen_df['Date'] = gen_df['DATE_TIME'].dt.date
    
    # Get the final DAILY_YIELD for each inverter per day (the max value for that day)
    daily_yield_df = gen_df.groupby(['Date', 'SOURCE_KEY'])['DAILY_YIELD'].max().reset_index()
    
    # We want to compare the first 7 days vs the last 7 days of the dataset
    dates = sorted(daily_yield_df['Date'].unique())
    if len(dates) > 14:
        first_week = dates[:7]
        last_week = dates[-7:]
        
        # Calculate plant average yield for first vs last week to account for weather changes
        plant_baseline = daily_yield_df[daily_yield_df['Date'].isin(first_week)]['DAILY_YIELD'].mean()
        plant_current = daily_yield_df[daily_yield_df['Date'].isin(last_week)]['DAILY_YIELD'].mean()
        plant_efficiency_change = (plant_current - plant_baseline) / plant_baseline
        
        # Now check each specific inverter
        inverters = daily_yield_df['SOURCE_KEY'].unique()
        degradation_alerts = 0
        
        for inv in inverters:
            inv_data = daily_yield_df[daily_yield_df['SOURCE_KEY'] == inv]
            
            inv_baseline = inv_data[inv_data['Date'].isin(first_week)]['DAILY_YIELD'].mean()
            inv_current = inv_data[inv_data['Date'].isin(last_week)]['DAILY_YIELD'].mean()
            
            if inv_baseline > 0:
                inv_efficiency_change = (inv_current - inv_baseline) / inv_baseline
                
                # If this specific inverter dropped by 5% MORE than the rest of the plant
                if inv_efficiency_change < (plant_efficiency_change - 0.05):
                    print(f"🧹 [MAINTENANCE REQUIRED] Array ID: {inv}")
                    print(f"   ► Plant Weather Trend:  {plant_efficiency_change*100:+.1f}%")
                    print(f"   ► Array Final Trend:    {inv_efficiency_change*100:+.1f}%")
                    print(f"   🛠️ Diagnosis: Severe underperformance over 34 days. Likely heavy dust/soiling accumulation.")
                    print(f"   ✅ Action: Dispatch cleaning crew to this specific array.\n")
                    degradation_alerts += 1
                    
        if degradation_alerts == 0:
            print("✔️ All arrays are within expected long-term degradation limits. No severe dust accumulation detected.")

if __name__ == "__main__":
    main()
