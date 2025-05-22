import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define user interface
interface User {
  id: string;
  email: string;
  full_name: string;
}

// Mock users data
const MOCK_USERS = [
  { id: '1', email: 'alexis@example.com', full_name: 'Alexis Abergel' },
  { id: '2', email: 'john@example.com', full_name: 'John Doe' },
  { id: '3', email: 'jane@example.com', full_name: 'Jane Smith' },
  { id: '4', email: 'robert@example.com', full_name: 'Robert Johnson' },
  { id: '5', email: 'emily@example.com', full_name: 'Emily Davis' },
];

// Mock session interface
interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  session: Session | null;
  selectUser: (userId: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Set a default user to avoid authentication requirements
  const defaultUser = MOCK_USERS[0];
  const [user, setUser] = useState<User | null>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create a mock session for the selected user
  const [session, setSession] = useState<Session | null>({
    access_token: 'mock-token-for-' + defaultUser.id,
    user: defaultUser
  });

  useEffect(() => {
    // Auto-select the default user to bypass authentication
    localStorage.setItem('selectedUser', JSON.stringify(defaultUser));
    setIsLoading(false);
  }, []);

  const selectUser = (userId: string) => {
    try {
      const selectedUser = MOCK_USERS.find(u => u.id === userId);
      
      if (!selectedUser) {
        toast.error("Utilisateur non trouvé");
        return;
      }
      
      localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
      setUser(selectedUser);
      
      // Update the session with the new user
      setSession({
        access_token: 'mock-token-for-' + selectedUser.id,
        user: selectedUser
      });
      
      toast.success("Connexion réussie");
      // Instead of using useNavigate, we'll let the component handle navigation
    } catch (error) {
      console.error('User selection error:', error);
      toast.error("Erreur lors de la sélection de l'utilisateur");
    }
  };

  const signOut = () => {
    // Instead of signing out, keep the default user
    setUser(defaultUser);
    // Update the session with the default user
    setSession({
      access_token: 'mock-token-for-' + defaultUser.id,
      user: defaultUser
    });
    // Let the component handle navigation
  };

  return (
    <AuthContext.Provider value={{ user, users: MOCK_USERS, isLoading, session, selectUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
