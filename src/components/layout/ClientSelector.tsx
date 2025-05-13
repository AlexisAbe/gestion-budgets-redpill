
import React from 'react';
import { useClientStore } from '@/store/clientStore';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function ClientSelector() {
  const { clients, selectedClientId, selectClient, addClient } = useClientStore();
  const [open, setOpen] = React.useState(false);
  const [newClientName, setNewClientName] = React.useState('');
  const { toast } = useToast();

  const handleCreateClient = () => {
    if (!newClientName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour le client",
        variant: "destructive",
      });
      return;
    }

    // Generate a unique ID for the new client
    const newClient = {
      id: crypto.randomUUID(),
      name: newClientName.trim()
    };

    addClient(newClient);
    selectClient(newClient.id);
    setNewClientName('');
    setOpen(false);
    
    toast({
      title: "Client créé",
      description: `Le client "${newClient.name}" a été créé avec succès`,
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Building className="h-5 w-5 text-muted-foreground" />
      <Select 
        value={selectedClientId || ''} 
        onValueChange={(value) => selectClient(value)}
      >
        <SelectTrigger className="w-[180px] h-9 border-none bg-transparent">
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du client</Label>
              <Input 
                id="name" 
                value={newClientName} 
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Nom du client"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateClient}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
