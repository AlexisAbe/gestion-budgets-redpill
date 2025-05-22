
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { BackupManager } from '@/components/backup/BackupManager';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Archive } from "lucide-react";
import { Link } from "react-router-dom";

export function UserNav() {
  const { user, signOut } = useAuth();
  const [showBackups, setShowBackups] = useState(false);

  // Extract user's initials for the avatar
  const getInitials = () => {
    if (!user?.full_name) return "U";
    return user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user?.full_name || "User"} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowBackups(true)}>
              <Archive className="h-4 w-4 mr-2" />
              Sauvegardes
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={showBackups} onOpenChange={setShowBackups}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Gestionnaire de sauvegardes</DialogTitle>
          <BackupManager />
        </DialogContent>
      </Dialog>
    </>
  );
}
