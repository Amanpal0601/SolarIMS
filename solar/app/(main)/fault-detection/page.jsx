import { getLatestFaults } from '@/actions/fault';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default async function FaultDetectionPage() {
  const result = await getLatestFaults();
  const data = result?.raw || {};

  // Extract keys from the Python ML model response
  // Known key: fault_status ("0" = no fault, "1" = fault detected)
  const faultStatus = data.fault_status ?? data.status ?? "unknown";
  const hasFault = String(faultStatus) === "1";

  // Build all the data fields from the raw response for display
  const allFields = Object.entries(data).filter(([key]) => key !== 'success');

  return (
    <div className="px-5 pb-10 max-w-7xl mx-auto mt-6">
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600 mb-3">System Diagnostic Results</h1>
        <p className="text-muted-foreground text-lg">Live fault detection analysis from the AI diagnostic model.</p>
      </div>

      {!result?.success ? (
        <Card className="rounded-2xl shadow-lg border-t-4 border-t-red-500 p-8 text-center">
          <p className="text-red-500 text-xl font-bold mb-2">Model Offline</p>
          <p className="text-muted-foreground">{result?.error}</p>
        </Card>
      ) : (
        <>
          {/* Main Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className={`shadow-lg rounded-2xl border-t-4 ${hasFault ? "border-t-rose-500" : "border-t-emerald-500"}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Fault Status</CardTitle>
                {hasFault ? (
                  <AlertTriangle className="h-6 w-6 text-rose-500" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                )}
              </CardHeader>
              <CardContent>
                <p className={`text-5xl font-black ${hasFault ? "text-rose-500" : "text-emerald-500"}`}>
                  {hasFault ? "FAULT" : "CLEAR"}
                </p>
                <Badge className={`mt-4 ${hasFault ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"} text-white`}>
                  {hasFault ? "Fault Detected" : "No Faults"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-2xl border-t-4 border-t-sky-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Raw Value</CardTitle>
                <Activity className="h-6 w-6 text-sky-500" />
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-black">{String(faultStatus)}</p>
                <Badge className="mt-4 bg-sky-500 text-white">fault_status</Badge>
              </CardContent>
            </Card>

            <Card className={`shadow-lg rounded-2xl border-none ${hasFault ? "bg-rose-50/50 dark:bg-slate-900" : "bg-emerald-50/50 dark:bg-slate-900"}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">System Health</CardTitle>
                <ShieldCheck className={`h-6 w-6 ${hasFault ? "text-rose-500" : "text-emerald-500"}`} />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${hasFault ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {hasFault ? "Issues Detected" : "All Systems Nominal"}
                </p>
                <Badge className="mt-4 bg-slate-500 text-white">Live Diagnostic</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Raw Model Response */}
          <Card className="rounded-3xl shadow-xl border-2 border-rose-100 dark:border-slate-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 mb-6 pb-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Activity className="h-6 w-6 text-rose-500" />
                Complete Model Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allFields.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No data returned from the model.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allFields.map(([key, value]) => (
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
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
