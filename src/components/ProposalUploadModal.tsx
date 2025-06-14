
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Send } from 'lucide-react';
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
  onProposalUploaded,
}: ProposalUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Error',
          description: 'Solo se permiten archivos PDF',
          variant: 'destructive',
        });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'Error',
          description: 'El archivo no puede ser mayor a 10MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user?.emailAddresses?.[0]?.emailAddress) {
      toast({
        title: 'Error',
        description: 'Selecciona un archivo PDF',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileName = `proposal_${briefId}_${Date.now()}.pdf`;
      const filePath = `proposals/${briefId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create proposal record
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          brief_id: briefId,
          file_path: filePath,
          file_name: fileName,
          admin_notes: adminNotes,
          uploaded_by: user.emailAddresses[0].emailAddress,
        })
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Update brief status and link proposal
      const { error: updateError } = await supabase
        .from('briefs')
        .update({
          status: 'quote_sent',
          status_updated_at: new Date().toISOString(),
          proposal_id: proposalData.id,
        })
        .eq('id', briefId);

      if (updateError) throw updateError;

      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('send-proposal-notification', {
        body: {
          clientEmail,
          companyName,
          adminNotes,
          fileName,
        },
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't throw here - the upload was successful even if email failed
      }

      toast({
        title: 'Propuesta enviada',
        description: 'La propuesta se ha subido y el cliente ha sido notificado',
      });

      onProposalUploaded();
      onClose();
      
      // Reset form
      setFile(null);
      setAdminNotes('');
    } catch (error: any) {
      console.error('Error uploading proposal:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al subir la propuesta',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Enviar Propuesta Comercial
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-1">Cliente:</h4>
            <p className="text-sm text-muted-foreground">{companyName}</p>
            <p className="text-sm text-muted-foreground">{clientEmail}</p>
          </div>

          <div>
            <Label htmlFor="proposal-file">Archivo PDF de la Propuesta</Label>
            <Input
              id="proposal-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1"
            />
            {file && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="admin-notes">Notas para el cliente (opcional)</Label>
            <Textarea
              id="admin-notes"
              placeholder="Mensaje personalizado para acompañar la propuesta..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Enviando...' : 'Enviar Propuesta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalUploadModal;
