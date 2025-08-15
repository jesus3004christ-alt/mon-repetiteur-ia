import type { Subject } from "@/lib/subjects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const Icon = subject.icon;
  return (
    <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle>{subject.name}</CardTitle>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </CardHeader>
      <CardContent>
        <CardDescription>{subject.description}</CardDescription>
      </CardContent>
    </Card>
  );
}
