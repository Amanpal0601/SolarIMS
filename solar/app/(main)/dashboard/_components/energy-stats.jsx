"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Sun, Gauge } from "lucide-react";

const EnergyStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      


      {/* Total Energy Produced */}
      <Card className="flex-1 shadow-md rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Energy Produced
          </CardTitle>
          <Zap className="h-6 w-6 text-yellow-500" />
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold">{stats.totalEnergyProduced.toLocaleString()} kWh</p>
          <p className="text-sm text-muted-foreground mt-1">
            Total energy generated so far
          </p>

          <Badge className="mt-3 bg-green-600 hover:bg-green-700">
            +12% this month
          </Badge>
        </CardContent>
      </Card>

      {/* Energy Today */}
      <Card className="flex-1 shadow-md rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Energy Today
          </CardTitle>
          <Sun className="h-6 w-6 text-orange-500" />
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold">{stats.energyToday.toLocaleString()} kWh</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generated in last 24 hours
          </p>

          <Badge className="mt-3 bg-blue-600 hover:bg-blue-700">
            Peak: 2.4 kW
          </Badge>
        </CardContent>
      </Card>

      {/* Performance Ratio */}
      <Card className="flex-1 shadow-md rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Performance Ratio
          </CardTitle>
          <Gauge className="h-6 w-6 text-green-500" />
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold">{stats.performanceRatio}</p>
          <p className="text-sm text-muted-foreground mt-1">
            System efficiency ratio
          </p>

          <Badge className="mt-3 bg-purple-600 hover:bg-purple-700">
            Excellent
          </Badge>
        </CardContent>
      </Card>

    </div>
  );
};

export default EnergyStats;
