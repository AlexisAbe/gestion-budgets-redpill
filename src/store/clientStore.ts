
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
      
      addClient: (client) => set((state) => ({
        clients: [...state.clients, client]
      })),
      
      removeClient: (id) => set((state) => ({
        clients: state.clients.filter(client => client.id !== id),
        selectedClientId: state.selectedClientId === id ? 
          (state.clients.length > 1 ? state.clients[0].id : null) : 
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
