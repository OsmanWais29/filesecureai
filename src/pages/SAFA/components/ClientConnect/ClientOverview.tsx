
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { convertClientArray } from '@/utils/typeGuards';
import { Client as ClientType } from '@/types/client';

// Convert client type from /types/client to SAFA client type
interface SAFAClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  last_interaction: Date;
  engagement_score: number;
}

const convertToSAFAClient = (client: ClientType): SAFAClient => ({
  id: client.id,
  name: client.name,
  email: client.email,
  phone: client.phone,
  status: client.status,
  last_interaction: client.last_interaction ? new Date(client.last_interaction) : new Date(),
  engagement_score: client.engagement_score || 0
});

export const ClientOverview = () => {
  const [clients, setClients] = useState<SAFAClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('last_interaction', { ascending: false });

      if (error) throw error;
      
      // Safe conversion from unknown data
      const safeClients = convertClientArray(data || []);
      const safaClients = safeClients.map(convertToSAFAClient);
      setClients(safaClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Client Overview</h2>
      
      {clients.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No clients found.
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map(client => (
            <div key={client.id} className="p-4 border rounded-lg hover:bg-muted/50">
              <h3 className="font-medium">{client.name}</h3>
              <p className="text-sm text-muted-foreground">Status: {client.status}</p>
              {client.email && (
                <p className="text-sm text-muted-foreground">Email: {client.email}</p>
              )}
              {client.phone && (
                <p className="text-sm text-muted-foreground">Phone: {client.phone}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Last interaction: {client.last_interaction.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
