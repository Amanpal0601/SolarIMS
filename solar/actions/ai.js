"use server";

const ML_API_URL = process.env.ML_API_URL;

export async function getLatestPrediction() {
  try {
    const response = await fetch(`${ML_API_URL}/predict-energy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({
        temperature: 25.5,
        irradiance: 850.0,
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`ML API returned ${response.status}`);
    const data = await response.json();
    console.log("RAW ML PREDICTION DATA:", JSON.stringify(data, null, 2));

    // Return the raw data as-is — the page will handle the keys directly
    return { success: true, raw: data };
  } catch (error) {
    console.error("ML Prediction API Error:", error?.message);
    return {
      success: false,
      raw: null,
      error: "Could not reach the prediction model. Make sure the Python server and ngrok tunnel are running.",
    };
  }
}
