
import {
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  Users,
  Archive,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useClientStore } from "@/store/clientStore"
import { ClientSelector } from "@/components/layout/ClientSelector"
import { BackupManager } from '@/components/backup/BackupManager';

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const selectedClientId = useClientStore((state) => state.selectedClientId)

  return (
    <div className={`flex flex-col w-full ${className || ''}`} {...props}>
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <p className="font-semibold">Campagnes</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Ajouter{" "}
                  <Plus className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <DropdownMenuItem>
                  <NavLink to="/campaigns/new">Ajouter une campagne</NavLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Importer</DropdownMenuItem>
                <DropdownMenuItem>Exporter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
        </div>
        <Tabs defaultValue="campaigns" className="flex flex-col h-full">
          <div className="border-b">
            <div className="container">
              <TabsList className="px-2">
                <TabsTrigger value="campaigns" className="relative">
                  <LayoutDashboard className="w-4 h-4 mr-2" aria-hidden="true" />
                  Campagnes
                </TabsTrigger>
                <TabsTrigger value="clients" className="relative">
                  <Users className="w-4 h-4 mr-2" aria-hidden="true" />
                  Clients
                </TabsTrigger>
                <TabsTrigger value="backups" className="relative">
                  <Archive className="w-4 h-4 mr-2" aria-hidden="true" />
                  Backups
                </TabsTrigger>
                <TabsTrigger value="settings" className="relative">
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <div className="container pt-4">
            <ClientSelector />
          </div>
          <TabsContent value="campaigns" className="h-full flex flex-col">
            <div className="container py-6 h-full overflow-auto">
              {selectedClientId ? (
                <NavLink to="/campaigns/new">
                  <Button>Create Campaign</Button>
                </NavLink>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a client to create a campaign.
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="clients" className="h-full flex flex-col">
            <div className="container py-6 h-full overflow-auto">
              <p>Client Management</p>
            </div>
          </TabsContent>
          <TabsContent value="backups" className="h-full flex flex-col">
            <div className="container py-6 h-full overflow-auto">
              <BackupManager />
            </div>
          </TabsContent>
          <TabsContent value="settings" className="h-full flex flex-col">
            <div className="container py-6 h-full overflow-auto">
              <p>Settings</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
