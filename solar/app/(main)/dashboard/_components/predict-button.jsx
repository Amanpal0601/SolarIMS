"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Activity } from "lucide-react";

const PredictButton = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handlePredict = () => {
    setLoading(true);
    // Directly route to the new prediction UI overlay
    router.push("/prediction");
  };

  return (
    <div className="mt-12 mb-10 flex flex-col items-center justify-center p-8 border-2 border-dashed border-cyan-200 dark:border-cyan-900 rounded-3xl bg-cyan-50/30 dark:bg-slate-900/30">
      <div className="flex items-center gap-3 mb-2">
        <Activity className="h-6 w-6 text-cyan-500" />
        <h2 className="text-2xl font-extrabold text-foreground">Next Day Energy Prediction</h2>
      </div>
      
      <p className="text-muted-foreground mb-8 text-center max-w-lg">
        Run our advanced Python machine learning model to cross-reference historical generation with tomorrow's weather to generate a highly accurate 24-hour yield forecast.
      </p>
      
      <Button 
        onClick={handlePredict}
        disabled={loading}
        className="gradient hover:opacity-90 text-white font-bold text-lg px-10 py-8 rounded-full shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
      >
        {loading ? "Spinning up AI Engine..." : "Generate AI Prediction"}
        {!loading && <Sparkles className="ml-2 h-6 w-6 animate-pulse" />}
      </Button>
    </div>
  );
};

export default PredictButton;
