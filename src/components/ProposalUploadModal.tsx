
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';

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
  const { isAdmin, loading: adminLoading, user } = useAdminRole();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  if (adminLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Verificando permisos...
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isAdmin) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Acceso Denegado</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Solo los administradores pueden subir propuestas.
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const sanitizeFileName = (fileName: string): string => {
    const sanitized = fileName
      .replace(/[^\w\s.-]/g, '') 
      .replace(/\s+/g, '_') 
      .replace(/_{2,}/g, '_') 
      .toLowerCase();
    
    console.log('🔧 Sanitizing filename:', fileName, '->', sanitized);
    return sanitized;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      
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

    if (!isAdmin) {
      toast({
        title: 'Error de permisos',
        description: 'Solo los administradores pueden subir propuestas',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    console.log('🚀 Starting proposal upload process...');
    console.log('👤 Admin user:', user.emailAddresses[0].emailAddress);

    try {
      // 1. Create unique filename
      const sanitizedOriginalName = sanitizeFileName(selectedFile.name);
      const fileName = `${briefId}_${Date.now()}_${sanitizedOriginalName}`;
      
      console.log('📤 Uploading file:', fileName);

      // 2. Upload to Supabase Storage (crear bucket si no existe)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        
        // Si el bucket no existe, intentar crearlo
        if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
          console.log('🪣 Creating proposals bucket...');
          const { error: bucketError } = await supabase.storage.createBucket('proposals', {
            public: false,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (bucketError) {
            console.error('❌ Bucket creation error:', bucketError);
          } else {
            console.log('✅ Bucket created, retrying upload...');
            // Retry upload
            const { data: retryUploadData, error: retryUploadError } = await supabase.storage
              .from('proposals')
              .upload(fileName, selectedFile, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (retryUploadError) {
              throw new Error(`Error subiendo archivo después de crear bucket: ${retryUploadError.message}`);
            }
            console.log('✅ File uploaded successfully after bucket creation');
          }
        } else {
          throw new Error(`Error subiendo archivo: ${uploadError.message}`);
        }
      } else {
        console.log('✅ File uploaded successfully:', uploadData);
      }

      // 3. Create proposal record with simplified approach
      console.log('💾 Creating proposal record...');
      const proposalData = {
        brief_id: briefId,
        file_path: fileName,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        uploaded_by: user.emailAddresses[0].emailAddress,
        client_message: adminNotes || null,
        email_sent_at: new Date().toISOString()
      };

      console.log('📝 Proposal data:', proposalData);

      const { data: createdProposal, error: proposalError } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();

      if (proposalError) {
        console.error('❌ Proposal creation error:', proposalError);
        throw new Error(`Error creando propuesta: ${proposalError.message}`);
      }

      console.log('✅ Proposal created successfully:', createdProposal);

      // 4. Update brief status
      console.log('🔄 Updating brief status...');
      const { error: briefUpdateError } = await supabase
        .from('briefs')
        .update({ 
          proposal_id: createdProposal.id,
          status: 'quote_sent' as const
        })
        .eq('id', briefId);

      if (briefUpdateError) {
        console.error('❌ Brief update error:', briefUpdateError);
        throw new Error(`Error actualizando brief: ${briefUpdateError.message}`);
      }

      console.log('✅ Brief updated successfully');

      // 5. Send email notification
      console.log('📧 Sending email notification...');
      try {
        const { error: emailError } = await supabase.functions.invoke('send-proposal-notification', {
          body: {
            clientEmail,
            companyName,
            adminNotes,
            fileName: selectedFile.name
          }
        });

        if (emailError) {
          console.warn('⚠️ Email error:', emailError);
          toast({
            title: 'Propuesta enviada con advertencia',
            description: 'La propuesta se subió correctamente pero hubo un problema enviando el email',
            variant: 'default',
          });
        } else {
          console.log('✅ Email sent successfully');
          toast({
            title: 'Propuesta enviada exitosamente',
            description: `Se ha enviado la propuesta a ${clientEmail}`,
          });
        }
      } catch (emailError) {
        console.warn('⚠️ Email function error:', emailError);
        toast({
          title: 'Propuesta enviada con advertencia',
          description: 'La propuesta se subió correctamente pero hubo un problema enviando el email',
          variant: 'default',
        });
      }

      onProposalUploaded();
      onClose();
      
    } catch (error: any) {
      console.error('💥 Complete process error:', error);
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
