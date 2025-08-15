import type { LucideIcon } from 'lucide-react';
import { BookOpen, Calculator, ClipboardEdit, Languages, Landmark, LayoutDashboard, ClipboardList, Presentation, Briefcase, Laptop, FileText, BrainCircuit, WandSparkles, DraftingCompass, BookCopy } from 'lucide-react';

export interface Subject {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
}

// Programme de la Première G1 - Enseignement Technique et Professionnel, Côte d'Ivoire
export const subjects: Subject[] = [
  { name: 'Français', slug: 'francais', icon: BookOpen, description: 'Étude de textes, grammaire et techniques d\'expression.' },
  { name: 'Anglais', slug: 'anglais', icon: Languages, description: 'Commercial English, vocabulary, and grammar.' },
  { name: 'Mathématiques Financières', slug: 'math-financieres', icon: Calculator, description: 'Intérêts simples et composés, escomptes, annuités.' },
  { name: 'Économie Générale', slug: 'economie-generale', icon: Landmark, description: 'Agents économiques, marchés, et circuits économiques.' },
  { name: 'Droit', slug: 'droit', icon: FileText, description: 'Sources du droit, personnes, biens et obligations.' },
  { name: 'Comptabilité et Finance', slug: 'comptabilite-finance', icon: ClipboardEdit, description: 'Comptabilité générale, travaux d\'inventaire, analyse.' },
  { name: 'Organisation des Entreprises', slug: 'organisation-entreprises', icon: Briefcase, description: 'Structures, fonctions et gestion des entreprises.' },
  { name: 'Techniques Quantitatives de Gestion', slug: 'tqg', icon: DraftingCompass, description: 'Statistiques descriptives et analyse de données.' },
  { name: 'Informatique Appliquée', slug: 'informatique-appliquee', icon: Laptop, description: 'Logiciels de bureautique (Word, Excel, PowerPoint) et SAGE.' },
];

export const mainNavLinks = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Générateur de cours', href: '/course-generator', icon: BookCopy },
    { name: 'Aide aux exposés', href: '/presentation-assistance', icon: Presentation },
    { name: 'Fiches de révision', href: '/revision', icon: ClipboardList },
    { name: 'Résoudre un exercice', href: '/solve-exercise', icon: WandSparkles },
];
