import { getLatestPrediction } from '@/actions/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PredictionChart } from '@/components/charts';
import { Zap, Brain, Activity, Clock } from 'lucide-react';

// Generate time labels from prediction_window (e.g. "06:00 to 18:00") for the array
function buildChartData(hourlyArray, predictionWindow) {
  if (!Array.isArray(hourlyArray) || hourlyArray.length === 0) return [];

  let startHour = 6;
  let endHour = 18;

  if (predictionWindow && typeof predictionWindow === 'string') {
    const match = predictionWindow.match(/(\d{1,2}):?\d*\s*to\s*(\d{1,2})/i);
    if (match) {
      startHour = parseInt(match[1]);
      endHour = parseInt(match[2]);
    }
  }

  const totalPoints = hourlyArray.length;
  const hoursSpan = endHour - startHour;
  const stepMinutes = totalPoints > 1 ? (hoursSpan * 60) / (totalPoints - 1) : 60;

  return hourlyArray.map((value, index) => {
    const totalMinutes = startHour * 60 + Math.round(index * stepMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const timeLabel = minutes === 0
      ? `${displayHour}${ampm}`
      : `${displayHour}:${String(minutes).padStart(2, '0')}${ampm}`;

    return {
      time: timeLabel,
      predicted: typeof value === 'number' ? value : parseFloat(value) || 0,
    };
  });
}

export default async function PredictionPage() {
  const result = await getLatestPrediction();
  const data = result?.raw || {};

  // Dynamically extract values from whatever keys the ML model returns
  const predictedEnergy = data.predicted_energy ?? data.nextDayEnergy ?? data.prediction ?? "N/A";
  const confidence = data.confidence ?? data.model_confidence ?? data.accuracy ?? "N/A";

  // Auto-detect the prediction window string from the response
  const predictionWindow = Object.values(data).find(
    v => typeof v === 'string' && /\d{1,2}:\d{2}.*to.*\d{1,2}:\d{2}/i.test(v)
  ) || "N/A";

  // Auto-detect: find ANY array of numbers in the response for the chart
  let hourlyArrayKey = null;
  let hourlyArray = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'number') {
      hourlyArray = value;
      hourlyArrayKey = key;
      break;
    }
  }
  const chartData = buildChartData(hourlyArray, predictionWindow);

  // Show all remaining fields that aren't already displayed in cards or chart
  const usedKeys = new Set(['success', hourlyArrayKey].filter(Boolean));
  // Also skip the key whose value matches predictedEnergy, predictionWindow, confidence
  for (const [key, value] of Object.entries(data)) {
    if (value === predictedEnergy || value === predictionWindow || value === confidence) {
      usedKeys.add(key);
    }
  }
  const extraFields = Object.entries(data).filter(([key]) => !usedKeys.has(key));

  return (
    <div className="px-5 pb-10 max-w-7xl mx-auto mt-6">
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold gradient-title mb-3">AI Forecast Analysis</h1>
        <p className="text-muted-foreground text-lg">Live results from the energy prediction model.</p>
      </div>

      {!result?.success ? (
        <Card className="rounded-2xl shadow-lg border-t-4 border-t-red-500 p-8 text-center">
          <p className="text-red-500 text-xl font-bold mb-2">Model Offline</p>
          <p className="text-muted-foreground">{result?.error}</p>
        </Card>
      ) : (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="shadow-lg rounded-2xl border-t-4 border-t-cyan-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Predicted Energy</CardTitle>
                <Zap className="h-6 w-6 text-cyan-500" />
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-black">
                  {typeof predictedEnergy === 'number' ? predictedEnergy.toFixed(2) : predictedEnergy}
                  <span className="text-2xl text-muted-foreground ml-2">kWh</span>
                </p>
                <Badge className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white">ML Model Output</Badge>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Prediction Window</CardTitle>
                <Clock className="h-6 w-6 text-orange-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mt-1 text-foreground leading-tight">{predictionWindow}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl bg-indigo-50/50 dark:bg-slate-900 border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Model Confidence</CardTitle>
                <Brain className="h-6 w-6 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{confidence}</p>
                <Badge className="mt-4 bg-indigo-500 text-white">High Accuracy</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Prediction Graph */}
          <Card className="rounded-3xl shadow-xl border-2 border-cyan-100 dark:border-slate-800 mb-10">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 mb-6 pb-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Activity className="h-6 w-6 text-cyan-500" />
                Hourly Energy Prediction Curve
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[450px]">
              {chartData.length > 0 ? (
                <PredictionChart hourlyData={chartData} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No hourly breakdown data available from the model.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extra fields if any */}
          {extraFields.length > 0 && (
            <Card className="rounded-3xl shadow-xl border-2 border-cyan-100 dark:border-slate-800">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 mb-6 pb-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="h-6 w-6 text-cyan-500" />
                  Additional Model Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extraFields.map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xl font-bold mt-1 break-all">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
