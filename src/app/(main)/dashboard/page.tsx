
import { SubjectCard } from "@/components/app/SubjectCard";
import { subjects } from "@/lib/subjects";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { DashboardClient } from "@/components/app/DashboardClient";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Bonjour !</h1>
        <p className="text-muted-foreground">Prêt(e) à progresser et à rattraper tes lacunes aujourd'hui ?</p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Tes matières</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link key={subject.slug} href={`/subjects/${subject.slug}`} className="group">
                <SubjectCard subject={subject} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Suivi de progression</h2>
        <DashboardClient />
      </section>
    </div>
  );
}
