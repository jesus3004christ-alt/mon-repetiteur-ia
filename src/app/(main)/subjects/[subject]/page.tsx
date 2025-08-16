import { subjects } from "@/lib/subjects";
import { notFound } from "next/navigation";
import { SubjectPageContent } from "@/components/app/SubjectPageContent";

// Correction finale pour Next.js 15+
export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: subjectSlug } = await params;
  const subject = subjects.find((s) => s.slug === subjectSlug);

  if (!subject) {
    notFound();
  }

  const Icon = subject.icon;

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-4">
            <Icon className="w-10 h-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-foreground">{subject.name}</h1>
                <p className="text-muted-foreground">{subject.description}</p>
            </div>
        </div>
      </header>
      <SubjectPageContent subjectName={subject.name} />
    </div>
  );
}

export async function generateStaticParams() {
    return subjects.map((subject) => ({
        subject: subject.slug,
    }));
}
