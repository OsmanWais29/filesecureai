
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { withFreshToken } from "@/utils/jwt/tokenManager";

export interface ClientData {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  last_interaction?: string;
  engagement_score?: number;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

// Type guard to ensure proper ClientData type
const ensureClientDataType = (data: unknown): ClientData => {
  const client = data as Record<string, any>;
  return {
    id: String(client.id || ''),
    name: String(client.name || 'Unknown'),
    company: client.company ? String(client.company) : undefined,
    email: client.email ? String(client.email) : undefined,
    phone: client.phone ? String(client.phone) : undefined,
    status: ['active', 'inactive', 'pending'].includes(client.status) ? client.status : 'pending',
    last_interaction: client.last_interaction ? String(client.last_interaction) : undefined,
    engagement_score: typeof client.engagement_score === 'number' ? client.engagement_score : 0,
    created_at: client.created_at ? String(client.created_at) : undefined,
    updated_at: client.updated_at ? String(client.updated_at) : undefined,
    metadata: client.metadata || {}
  };
};

export function useClientManagement() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ClientStats>({ total: 0, active: 0, inactive: 0, pending: 0 });
  const { toast } = useToast();

  const fetchClients = async () => {
    setIsLoading(true);
    
    try {
      // Use withFreshToken to ensure we have a valid token
      await withFreshToken(async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('last_interaction', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const typedClients = data.map(ensureClientDataType);
          setClients(typedClients);
          
          // Calculate stats
          const newStats = {
            total: typedClients.length,
            active: typedClients.filter(client => client.status === 'active').length,
            inactive: typedClients.filter(client => client.status === 'inactive').length,
            pending: typedClients.filter(client => client.status === 'pending').length
          };
          
          setStats(newStats);
        }
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Failed to load clients",
        description: "There was a problem fetching client data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addClient = async (clientData: Omit<ClientData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          last_interaction: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newClient = ensureClientDataType(data[0]);
        setClients(prevClients => [newClient, ...prevClients]);
        fetchClients(); // Refresh all clients to update stats
        
        toast({
          title: "Client added",
          description: `${clientData.name} has been added successfully.`,
        });
        
        return newClient;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Failed to add client",
        description: "There was a problem adding the client.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateClient = async (id: string, clientData: Partial<ClientData>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === id ? { ...client, ...clientData } : client
        )
      );
      
      // If we're updating the status, refresh all clients to update stats
      if ('status' in clientData) {
        fetchClients();
      }
      
      toast({
        title: "Client updated",
        description: "Client information has been updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Failed to update client",
        description: "There was a problem updating the client.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setClients(prevClients => prevClients.filter(client => client.id !== id));
      fetchClients(); // Refresh all clients to update stats
      
      toast({
        title: "Client deleted",
        description: "The client has been removed.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Failed to delete client",
        description: "There was a problem deleting the client.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id) || null;
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    isLoading,
    stats,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    getClientById
  };
}
