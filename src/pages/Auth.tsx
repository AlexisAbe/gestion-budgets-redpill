
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Auth = () => {
  const { user, users, selectUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleUserSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (!selectedUserId) {
        setError("Veuillez sélectionner un utilisateur");
        return;
      }
      
      await selectUser(selectedUserId);
    } catch (err) {
      setError("Une erreur est survenue lors de la sélection de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Gestion Budgets</CardTitle>
          <CardDescription>
            Sélectionnez votre profil pour accéder à l'application
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUserSelection}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Sélectionner un utilisateur</Label>
              <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Choisir un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-sm text-muted-foreground">
              Vous serez connecté directement après avoir sélectionné votre profil
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Connexion"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
