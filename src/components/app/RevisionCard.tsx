"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RevisionCardProps {
  term: string;
  definition: string;
}

export function RevisionCard({ term, definition }: RevisionCardProps) {
  return (
    <Card className="h-56 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{term}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{definition}</CardDescription>
      </CardContent>
    </Card>
  );
}
