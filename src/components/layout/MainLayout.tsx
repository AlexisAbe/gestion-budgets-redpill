import React from 'react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { UserNav } from './UserNav';
import { useAuth } from '@/context/AuthContext';
import { ClientSelector } from './ClientSelector';
interface MainLayoutProps {
  children: React.ReactNode;
}
export const MainLayout = ({
  children
}: MainLayoutProps) => {
  const {
    signOut
  } = useAuth();
  return <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container px-4 flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg mr-6">Suivi des campagnes</h1>
            <ClientSelector />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="container px-4 py-6 sm:py-8 md:py-10 space-y-8">
        {children}
      </main>
      <footer className="border-t py-4">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>Belambra Media Budget Planner — 2025</p>
        </div>
      </footer>
    </div>;
};