
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';

interface ProposalUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefId: string;
  companyName: string;
  clientEmail: string;
  onProposalUploaded: () => void;
}

const ProposalUploadModal = ({ 
  isOpen, 
  onClose, 
  briefId, 
  companyName, 
  clientEmail,
  onProposalUploaded 
}: ProposalUploadModalProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Tipo de archivo inválido',
          description: 'Solo se permiten archivos PDF',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: 'Archivo muy grande',
          description: 'El archivo no puede ser mayor a 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadAndSend = async () => {
    if (!selectedFile || !user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un archivo y estar autenticado',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // 1. Subir archivo a Supabase Storage
      const fileName = `${briefId}_${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      // 2. Crear registro en la tabla proposals
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          brief_id: briefId,
          file_path: fileName,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          uploaded_by: user.emailAddresses[0].emailAddress,
          client_message: adminNotes || null,
          email_sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (proposalError) {
        throw new Error(`Error creando propuesta: ${proposalError.message}`);
      }

      // 3. Actualizar el brief con el ID de la propuesta
      const { error: briefUpdateError } = await supabase
        .from('briefs')
        .update({ 
          proposal_id: proposalData.id,
          status: 'quote_sent'
        })
        .eq('id', briefId);

      if (briefUpdateError) {
        throw new Error(`Error actualizando brief: ${briefUpdateError.message}`);
      }

      // 4. Enviar notificación por email
      const { error: emailError } = await supabase.functions.invoke('send-proposal-notification', {
        body: {
          clientEmail,
          companyName,
          adminNotes,
          fileName: selectedFile.name
        }
      });

      if (emailError) {
        console.warn('Error enviando email:', emailError);
        // No fallar la operación por el email, solo advertir
        toast({
          title: 'Propuesta enviada con advertencia',
          description: 'La propuesta se subió correctamente pero hubo un problema enviando el email',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Propuesta enviada exitosamente',
          description: `Se ha enviado la propuesta a ${clientEmail}`,
        });
      }

      onProposalUploaded();
      onClose();
      
    } catch (error: any) {
      console.error('Error en el proceso:', error);
      toast({
        title: 'Error enviando propuesta',
        description: error.message || 'Hubo un problema procesando la propuesta',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setAdminNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Enviar Propuesta a {companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="proposal-file">Archivo PDF de la Propuesta</Label>
            <Input
              id="proposal-file"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <div className="mt-2 p-2 bg-muted rounded flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">{selectedFile.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="admin-notes">Mensaje para el Cliente (Opcional)</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Mensaje adicional que aparecerá en el email..."
              rows={3}
              disabled={isUploading}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Cliente:</strong> {clientEmail}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Se enviará una notificación automática por email con la propuesta.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUploadAndSend} 
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isUploading ? 'Enviando...' : 'Subir y Enviar Propuesta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalUploadModal;
