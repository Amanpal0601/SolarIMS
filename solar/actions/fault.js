"use server";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

export async function getLatestFaults() {
  try {
    const response = await fetch(`${ML_API_URL}/detect-fault`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        temperature: 25.5,
        irradiance: 850.0,
        voltage: 32.5,
        current: 8.1,
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`ML API returned ${response.status}`);
    const data = await response.json();
    console.log("RAW ML FAULT DATA:", JSON.stringify(data, null, 2));

    return { success: true, raw: data };
  } catch (error) {
    console.error("ML Fault Detection API Error:", error?.message);
    return {
      success: false,
      raw: null,
      error: "Could not reach the fault detection model. Make sure the Python server is running on port 8000.",
    };
  }
}
