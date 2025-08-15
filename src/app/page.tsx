
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              VOTRE REPETITEUR IA
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Obtenez de l'aide pour vos devoirs, des résumés de cours et des problèmes pratiques, le tout en un seul endroit.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button onClick={handleGetStarted}>Commencer</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
