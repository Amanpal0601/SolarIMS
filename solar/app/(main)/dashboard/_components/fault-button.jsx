"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ZapOff } from "lucide-react";

const FaultButton = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleDetect = () => {
    setLoading(true);
    // Route to the fault detection UI
    router.push("/fault-detection");
  };

  return (
    <div className="mb-10 flex flex-col items-center justify-center p-8 border-2 border-dashed border-rose-200 dark:border-rose-900 rounded-3xl bg-rose-50/30 dark:bg-rose-950/30">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
        <h2 className="text-2xl font-extrabold text-foreground">System Fault Detection</h2>
      </div>
      
      <p className="text-muted-foreground mb-8 text-center max-w-lg">
        Run our diagnostic AI model to analyze current sensor readings and identify potential underperforming inverters or physical panel damage.
      </p>
      
      <Button 
        onClick={handleDetect}
        disabled={loading}
        className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-lg px-10 py-8 rounded-full shadow-xl hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105"
      >
        {loading ? "Running Diagnostics..." : "Run Fault Detection"}
        {!loading && <ZapOff className="ml-2 h-6 w-6 animate-pulse" />}
      </Button>
    </div>
  );
};

export default FaultButton;
