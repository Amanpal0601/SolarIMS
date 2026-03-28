import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
      {...props}
    />
  )
}

export default function Loading() {
  return (
    <div className="px-5 pb-10 max-w-7xl mx-auto mt-6">
      <Skeleton className="h-12 w-3/4 mb-3" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-lg rounded-2xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/3 mt-2" />
              <Skeleton className="h-5 w-1/4 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="rounded-3xl shadow-xl border-2">
        <CardHeader className="mb-6 pb-6">
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
               <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
