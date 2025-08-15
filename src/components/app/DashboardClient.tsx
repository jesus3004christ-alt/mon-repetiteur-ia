
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const ProgressChart = dynamic(() => 
  import('@/components/app/ProgressChart').then(mod => mod.ProgressChart), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-[350px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }
);

export function DashboardClient() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance par matière</CardTitle>
                <CardDescription>Évolution de tes scores au cours des derniers mois.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProgressChart />
            </CardContent>
        </Card>
    );
}
