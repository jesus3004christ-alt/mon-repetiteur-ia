
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RevisionCard } from "@/components/app/RevisionCard";
import { PlusCircle } from "lucide-react";

type CardData = {
  id: string;
  term: string;
  definition: string;
};

export default function RevisionPage() {
  const [cards, setCards] = useState<CardData[]>([
    { id: "1", term: "Bilan comptable", definition: "Un document qui représente l'état du patrimoine de l'entreprise à une date donnée, divisé en actif et passif." },
    { id: "2", term: "Actif", definition: "Ce que l'entreprise possède (ex: bâtiments, machines, stocks)." },
    { id: "3", term: "Passif", definition: "Ce que l'entreprise doit (ex: dettes, capital social)." }
  ]);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleAddCard = () => {
    if (newTerm && newDefinition) {
      const newCard: CardData = {
        id: crypto.randomUUID(),
        term: newTerm,
        definition: newDefinition,
      };
      setCards((prevCards) => [...prevCards, newCard]);
      setNewTerm("");
      setNewDefinition("");
      setDialogOpen(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Fiches de révision</h1>
            <p className="text-muted-foreground">Crée et révise tes fiches pour mémoriser les concepts clés.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Ajouter une fiche
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvelle fiche de révision</DialogTitle>
              <DialogDescription>
                Ajoute un terme et sa définition.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="term" className="text-right">
                  Terme
                </Label>
                <Input
                  id="term"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="definition" className="text-right">
                  Définition
                </Label>
                <Textarea
                  id="definition"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddCard}>Sauvegarder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <RevisionCard key={card.id} term={card.term} definition={card.definition} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">Aucune fiche de révision</h2>
            <p className="text-muted-foreground mt-2">Clique sur "Ajouter une fiche" pour commencer.</p>
        </div>
      )}
    </div>
  );
}
