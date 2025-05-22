
import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../ui/sidebar";
import { NavLink } from "react-router-dom";
import { ClientSelector } from "./ClientSelector";
import { UserNav } from "./UserNav";
import { Separator } from "../ui/separator";
import { ModeToggle } from "../ui/mode-toggle";
import { BarChart3, Settings, Home } from "lucide-react";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar>
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold tracking-tight">Marketing Budget</h2>
          <p className="text-sm text-muted-foreground">Gestion des budgets marketing</p>
        </div>
        <Separator />
        <div className="px-4 py-2">
          <ClientSelector />
        </div>
        <Separator />
        <nav className="grid items-start px-2 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`
            }
          >
            <Home className="h-4 w-4" />
            Campagnes
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`
            }
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </NavLink>
        </nav>
        <div className="mt-auto p-4">
          <div className="flex items-center justify-between">
            <UserNav />
            <ModeToggle />
          </div>
        </div>
      </Sidebar>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
