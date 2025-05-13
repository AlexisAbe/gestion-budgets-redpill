
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
import { Building, ChevronDown } from 'lucide-react';

export function ClientSelector() {
  const { clients, selectedClientId, selectClient } = useClientStore();

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
    </div>
  );
}
