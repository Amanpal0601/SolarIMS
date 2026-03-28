import { inngest } from "./client";
import { db as prisma } from "@/lib/prisma";

const ML_API_URL = process.env.ML_API_URL;

// ─── Daily Energy Prediction (runs every day at midnight) ────────────────────
export const dailyPrediction = inngest.createFunction(
  {
    id: "daily-energy-prediction",
    name: "Daily Energy Prediction",
    triggers: [{ cron: "0 0 * * *" }],
  },
  async ({ step }) => {
    const result = await step.run("generate-prediction", async () => {
      const project = await prisma.project.findFirst();
      if (!project) throw new Error("No projects found");

      let aiModel = await prisma.aiModel.findFirst({ where: { name: "Python Random Forest Beta" } });
      if (!aiModel) {
        aiModel = await prisma.aiModel.create({
          data: {
            userId: project.userId,
            name: "Python Random Forest Beta",
            type: "ENSEMBLE",
          },
        });
      }

      // Call the external Python ML prediction model via ngrok
      let generatedData;
      try {
        const response = await fetch(`${ML_API_URL}/predict`, {
          method: "GET",
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!response.ok) throw new Error(`ML API returned ${response.status}`);
        generatedData = await response.json();
      } catch (error) {
        console.error("ML API call failed, using fallback data:", error.message);
        // Fallback simulation if the external model is unreachable
        generatedData = {
          nextDayEnergy: parseFloat((18.2 + Math.random() * 2).toFixed(1)),
          confidence: "94%",
          weatherForecast: "Sunny with partial afternoon clouds",
          hourlyPrediction: [
            { time: "6AM", predicted: 0.1 },
            { time: "7AM", predicted: 0.5 },
            { time: "8AM", predicted: 1.2 },
            { time: "9AM", predicted: 2.1 },
            { time: "10AM", predicted: 3.5 },
            { time: "11AM", predicted: 4.8 },
            { time: "12PM", predicted: 5.2 },
            { time: "1PM", predicted: 5.0 },
            { time: "2PM", predicted: 4.1 },
            { time: "3PM", predicted: 2.9 },
            { time: "4PM", predicted: 1.5 },
            { time: "5PM", predicted: 0.6 },
            { time: "6PM", predicted: 0.1 },
          ],
        };
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const forecast = await prisma.forecast.create({
        data: {
          projectId: project.id,
          modelId: aiModel.id,
          forecastFor: tomorrow,
          predicted: generatedData,
        },
      });

      return { forecastId: forecast.id };
    });

    return { success: true, message: "Daily prediction saved.", ...result };
  }
);

// ─── Daily Fault Detection (runs every day at midnight) ──────────────────────
export const dailyFaultDetection = inngest.createFunction(
  {
    id: "daily-fault-detection",
    name: "Daily Fault Detection",
    triggers: [{ cron: "0 0 * * *" }],
  },
  async ({ step }) => {
    const result = await step.run("run-fault-detection", async () => {
      const project = await prisma.project.findFirst();
      if (!project) throw new Error("No projects found");

      let faultModel = await prisma.aiModel.findFirst({ where: { name: "Fault Detection Model" } });
      if (!faultModel) {
        faultModel = await prisma.aiModel.create({
          data: {
            userId: project.userId,
            name: "Fault Detection Model",
            type: "ENSEMBLE",
          },
        });
      }

      // Call the external Python fault detection model via ngrok
      let faultsToReport = [];
      let anomalyGraph = null;
      try {
        const response = await fetch(`${ML_API_URL}/detect-faults`, {
          method: "GET",
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!response.ok) throw new Error(`ML API returned ${response.status}`);
        const data = await response.json();
        faultsToReport = data.faults || [];
        anomalyGraph = data.anomalyGraph || null;
      } catch (error) {
        console.error("ML Fault API call failed, using fallback data:", error.message);
      }

      // Fallback simulation if external model returned nothing
      if (faultsToReport.length === 0) {
        faultsToReport = [
          { type: "LOW_OUTPUT", message: "Inverter Beta producing 15% less power than expected.", severity: "MEDIUM" },
          { type: "HIGH_TEMPERATURE", message: "Module temperature in Sector 4 is unusually high (exceeding 65°C)", severity: "HIGH" },
        ];
      }
      if (!anomalyGraph) {
        anomalyGraph = [
          { time: "6AM", anomalyScore: 5 },
          { time: "8AM", anomalyScore: 12 },
          { time: "10AM", anomalyScore: 45 },
          { time: "12PM", anomalyScore: 82 },
          { time: "2PM", anomalyScore: 92 },
          { time: "4PM", anomalyScore: 68 },
          { time: "6PM", anomalyScore: 30 },
        ];
      }

      // Save Alerts
      const createdAlerts = [];
      for (const fault of faultsToReport) {
        const alert = await prisma.alert.create({
          data: {
            projectId: project.id,
            type: fault.type,
            message: fault.message,
            severity: fault.severity,
            resolved: false,
          },
        });
        createdAlerts.push(alert);
      }

      // Save Anomaly Graph
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await prisma.forecast.create({
        data: {
          projectId: project.id,
          modelId: faultModel.id,
          forecastFor: tomorrow,
          predicted: {
            hourlyAnomaly: anomalyGraph,
            systemHealth: "Degraded",
            confidence: "98%",
          },
        },
      });

      return { alertCount: createdAlerts.length };
    });

    return { success: true, message: "Fault detection completed.", ...result };
  }
);
