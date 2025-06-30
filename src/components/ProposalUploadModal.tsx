
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

  // Verificar permisos de admin antes de permitir cualquier acción
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

  // Función para sanitizar nombres de archivo
  const sanitizeFileName = (fileName: string): string => {
    const sanitized = fileName
      .replace(/[^\w\s.-]/g, '') 
      .replace(/\s+/g, '_') 
      .replace(/_{2,}/g, '_') 
      .toLowerCase();
    
    console.log('🔧 Nombre original:', fileName);
    console.log('🔧 Nombre sanitizado:', sanitized);
    return sanitized;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 Archivo seleccionado:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
      
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

    // Verificación adicional de admin antes de proceder
    if (!isAdmin) {
      toast({
        title: 'Error de permisos',
        description: 'Solo los administradores pueden subir propuestas',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    console.log('🚀 Iniciando proceso de upload como admin...');
    console.log('👤 Usuario admin:', user.emailAddresses[0].emailAddress);

    try {
      // 1. Sanitizar y crear nombre de archivo único
      const sanitizedOriginalName = sanitizeFileName(selectedFile.name);
      const fileName = `${briefId}_${Date.now()}_${sanitizedOriginalName}`;
      
      console.log('📤 Subiendo archivo:', fileName);
      console.log('🗂️ Al bucket: proposals');
      console.log('📊 Tamaño del archivo:', selectedFile.size);

      // 2. Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error detallado de upload:', uploadError);
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      console.log('✅ Archivo subido exitosamente:', uploadData);

      // 3. Crear registro en la tabla proposals (ahora sin restricciones RLS problemáticas)
      console.log('💾 Creando registro en tabla proposals...');
      const proposalData = {
        brief_id: briefId,
        file_path: fileName,
        file_name: selectedFile.name, // Usar nombre original para mostrar
        file_size: selectedFile.size,
        uploaded_by: user.emailAddresses[0].emailAddress,
        client_message: adminNotes || null,
        email_sent_at: new Date().toISOString()
      };

      console.log('📝 Datos de propuesta a insertar:', proposalData);

      const { data: createdProposal, error: proposalError } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();

      if (proposalError) {
        console.error('❌ Error detallado creando propuesta:', proposalError);
        console.error('❌ Código de error:', proposalError.code);
        console.error('❌ Detalles:', proposalError.details);
        console.error('❌ Hint:', proposalError.hint);
        throw new Error(`Error creando propuesta: ${proposalError.message}`);
      }

      console.log('✅ Propuesta creada exitosamente:', createdProposal);

      // 4. Actualizar el brief con el ID de la propuesta
      console.log('🔄 Actualizando brief...');
      const { error: briefUpdateError } = await supabase
        .from('briefs')
        .update({ 
          proposal_id: createdProposal.id,
          status: 'quote_sent'
        })
        .eq('id', briefId);

      if (briefUpdateError) {
        console.error('❌ Error detallado actualizando brief:', briefUpdateError);
        throw new Error(`Error actualizando brief: ${briefUpdateError.message}`);
      }

      console.log('✅ Brief actualizado exitosamente');

      // 5. Enviar notificación por email
      console.log('📧 Enviando notificación por email...');
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
          console.warn('⚠️ Error enviando email:', emailError);
          toast({
            title: 'Propuesta enviada con advertencia',
            description: 'La propuesta se subió correctamente pero hubo un problema enviando el email',
            variant: 'default',
          });
        } else {
          console.log('✅ Email enviado exitosamente');
          toast({
            title: 'Propuesta enviada exitosamente',
            description: `Se ha enviado la propuesta a ${clientEmail}`,
          });
        }
      } catch (emailError) {
        console.warn('⚠️ Error en función de email:', emailError);
        toast({
          title: 'Propuesta enviada con advertencia',
          description: 'La propuesta se subió correctamente pero hubo un problema enviando el email',
          variant: 'default',
        });
      }

      onProposalUploaded();
      onClose();
      
    } catch (error: any) {
      console.error('💥 Error completo en el proceso:', error);
      console.error('🔍 Stack trace:', error.stack);
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
