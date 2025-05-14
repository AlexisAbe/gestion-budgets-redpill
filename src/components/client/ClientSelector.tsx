
import { useClientStore } from "@/store/clientStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building } from "lucide-react";

export function ClientSelector() {
  const { clients, selectedClientId, selectClient } = useClientStore();

  return (
    <div className="flex items-center gap-2">
      <Building className="h-4 w-4" />
      <Select
        value={selectedClientId || ""}
        onValueChange={(value) => selectClient(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
