"use client";
import React from "react";
import { Activity, BrainCircuit } from "lucide-react";

export default function LoadingPrediction() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6">
      <div className="relative flex items-center justify-center w-28 h-28">
        <div className="absolute inset-0 border-4 border-t-cyan-500 border-cyan-200 dark:border-cyan-900 rounded-full animate-spin"></div>
        <BrainCircuit className="h-12 w-12 text-cyan-500 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold gradient-title">Initializing AI Engine...</h2>
        <p className="text-muted-foreground flex items-center justify-center gap-2 mt-2">
          <Activity className="h-5 w-5 animate-bounce text-cyan-400" />
          Running Random Forest Regression against historical Weather API...
        </p>
      </div>
    </div>
  );
}
