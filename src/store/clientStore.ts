
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Client {
  id: string;
  name: string;
  logo?: string;
}

interface ClientState {
  clients: Client[];
  selectedClientId: string | null;
  addClient: (client: Client) => void;
  removeClient: (id: string) => void;
  selectClient: (id: string | null) => void;
  fetchClients: () => void; // Added the missing method
}

// Initial clients
const initialClients: Client[] = [
  { id: '1', name: 'Belambra Resorts' },
  { id: '2', name: 'Mountain Lodges' },
  { id: '3', name: 'Seaside Hotels' }
];

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clients: initialClients,
      selectedClientId: initialClients[0].id,
      
      fetchClients: () => {
        // This would normally fetch clients from an API
        // For now, we'll just ensure the initial clients are loaded
        set((state) => ({
          clients: state.clients.length ? state.clients : initialClients
        }));
      },
      
      addClient: (client) => set((state) => {
        // Check if a client with the same name already exists
        const exists = state.clients.some(
          c => c.name.toLowerCase() === client.name.toLowerCase()
        );
        
        if (exists) {
          console.warn(`A client with the name "${client.name}" already exists`);
          return { clients: state.clients }; // No change
        }
        
        return {
          clients: [...state.clients, client]
        };
      }),
      
      removeClient: (id) => set((state) => ({
        clients: state.clients.filter(client => client.id !== id),
        selectedClientId: state.selectedClientId === id ? 
          (state.clients.length > 1 ? state.clients.filter(c => c.id !== id)[0].id : null) : 
          state.selectedClientId
      })),
      
      selectClient: (id) => set({
        selectedClientId: id
      })
    }),
    {
      name: 'client-storage',
    }
  )
);

// Export a utility function to get the current client
export const getCurrentClient = (): Client | undefined => {
  const { clients, selectedClientId } = useClientStore.getState();
  return clients.find(client => client.id === selectedClientId);
};
