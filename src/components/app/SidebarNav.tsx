
"use client";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { mainNavLinks, subjects } from "@/lib/subjects";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookText, LogOut } from 'lucide-react';
import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
              <BookText className="text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-sidebar-foreground">Repetiteur de Ruth</h2>
              <p className="text-xs text-sidebar-foreground/70">Première G1</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {mainNavLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href} legacyBehavior={false}>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={{ children: link.name, side: "right" }}
                  asChild
                >
                  <div>
                    <link.icon />
                    <span>{link.name}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Matières</SidebarGroupLabel>
          <SidebarMenu>
            {subjects.map((subject) => (
              <SidebarMenuItem key={subject.slug}>
                <Link href={`/subjects/${subject.slug}`} legacyBehavior={false}>
                  <SidebarMenuButton
                    isActive={pathname === `/subjects/${subject.slug}`}
                    tooltip={{ children: subject.name, side: "right" }}
                    asChild
                  >
                    <div>
                      <subject.icon />
                      <span>{subject.name}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {loading ? (
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
            </div>
        ) : user ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-sidebar-foreground/70 truncate">{user.email}</span>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button>Connexion</Button>
          </Link>
        )}
      </SidebarFooter>
    </>
  );
}
