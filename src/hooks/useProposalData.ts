
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Proposal = Tables<'proposals'>;

export const useProposalData = (proposalId: string | null) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!proposalId) {
        setProposal(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', proposalId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setProposal(data);
      } catch (err: any) {
        console.error('Error fetching proposal:', err);
        setError(err.message || 'Error al cargar la propuesta');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  return { proposal, loading, error, refetch: () => {
    if (proposalId) {
      setLoading(true);
      // Re-trigger the effect
    }
  }};
};
