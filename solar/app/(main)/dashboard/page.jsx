import React from 'react'
import EnergyStats from './_components/energy-stats';
import SolarGraphs from './_components/graphs';
import PredictButton from './_components/predict-button';
import FaultButton from './_components/fault-button';
import { getDashboardData } from '@/actions/dashboard';


export default async function DashboardPage ()  {
  const data = await getDashboardData();

  return (
    <div className='px-5'>
      {/* Cards */}
      <EnergyStats stats={data.energyStats} />

      {/* Graphs */}
      <SolarGraphs 
        hourlyData={data.hourlyData} 
        dailyEnergy={data.dailyEnergy} 
      />

      {/* AI Prediction Trigger */}
      <PredictButton />

      {/* Fault Detection Trigger */}
      <FaultButton />
    </div>
  )
}
