
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { BackupRecord } from '../types';
import { Session } from '@supabase/supabase-js';

export const loadBackups = async (session: Session | null) => {
  if (!session?.access_token) {
    toast({
      variant: "destructive",
      title: "Erreur d'authentification",
      description: "Vous devez être connecté pour accéder aux sauvegardes"
    });
    return { data: [], error: new Error("Unauthenticated") };
  }

  try {
    console.log("Chargement des sauvegardes avec token:", session.access_token);
    // Use RPC to call the get_campaign_backups function instead of direct table access
    const { data, error } = await supabase.rpc('get_campaign_backups');
    
    if (error) {
      throw error;
    }
    
    console.log("Sauvegardes chargées:", data);
    return { data: data as BackupRecord[], error: null };
  } catch (error) {
    console.error('Error loading backups:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Échec du chargement des sauvegardes"
    });
    return { data: [], error };
  }
};

export const createManualBackup = async (session: Session | null) => {
  if (!session?.access_token) {
    toast({
      variant: "destructive",
      title: "Erreur d'authentification",
      description: "Vous devez être connecté pour créer une sauvegarde"
    });
    return { success: false, error: new Error("Unauthenticated") };
  }
  
  try {
    toast({
      title: "Création en cours",
      description: "Création de la sauvegarde en cours...",
    });
    
    console.log("Création d'une sauvegarde manuelle avec token:", session.access_token);
    
    // Call the edge function to create a backup
    const response = await fetch('https://wmclujwtwuzscfqbzfxf.supabase.co/functions/v1/backup-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type: 'manual' })
    });

    console.log("Réponse status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || 'Échec de la création de sauvegarde');
      } catch (e) {
        throw new Error(`Échec de la création de sauvegarde (${response.status}): ${errorText}`);
      }
    }
    
    const responseData = await response.json();
    console.log("Réponse donnée:", responseData);
    
    toast({
      variant: "success",
      title: "Succès",
      description: "Sauvegarde créée avec succès"
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating backup:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: `Échec de la création de sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
    return { success: false, error };
  }
};
