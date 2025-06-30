
import { useState, useCallback } from 'react';
import { Upload, FileText, X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';

interface ProposalDropzoneProps {
  briefId: string;
  companyName: string;
  clientEmail: string;
  onProposalUploaded: () => void;
}

const ProposalDropzone = ({ 
  briefId, 
  companyName, 
  clientEmail, 
  onProposalUploaded 
}: ProposalDropzoneProps) => {
  const { isAdmin, loading, user } = useAdminRole();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/[^\w\s.-]/g, '') 
      .replace(/\s+/g, '_') 
      .replace(/_{2,}/g, '_') 
      .toLowerCase();
  };

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Tipo de archivo inválido',
        description: 'Solo se permiten archivos PDF',
        variant: 'destructive',
      });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: 'Archivo muy grande',
        description: 'El archivo no puede ser mayor a 10MB',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUploadAndSend = async () => {
    if (!selectedFile || !user?.emailAddresses?.[0]?.emailAddress || !isAdmin) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un archivo y tener permisos de administrador',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // 1. Subir archivo
      const sanitizedOriginalName = sanitizeFileName(selectedFile.name);
      const fileName = `${briefId}_${Date.now()}_${sanitizedOriginalName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
          const { error: bucketError } = await supabase.storage.createBucket('proposals', {
            public: false,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (!bucketError) {
            const { error: retryUploadError } = await supabase.storage
              .from('proposals')
              .upload(fileName, selectedFile, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (retryUploadError) {
              throw new Error(`Error subiendo archivo: ${retryUploadError.message}`);
            }
          }
        } else {
          throw new Error(`Error subiendo archivo: ${uploadError.message}`);
        }
      }

      // 2. Crear registro de propuesta
      const proposalData = {
        brief_id: briefId,
        file_path: fileName,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        uploaded_by: user.emailAddresses[0].emailAddress,
        client_message: adminNotes || null,
        email_sent_at: new Date().toISOString()
      };

      const { data: createdProposal, error: proposalError } = await supabase
        .from('proposals')
        .insert(proposalData)
        .select()
        .single();

      if (proposalError) {
        throw new Error(`Error creando propuesta: ${proposalError.message}`);
      }

      // 3. Actualizar brief
      const { error: briefUpdateError } = await supabase
        .from('briefs')
        .update({ 
          proposal_id: createdProposal.id,
          status: 'quote_sent' as const
        })
        .eq('id', briefId);

      if (briefUpdateError) {
        throw new Error(`Error actualizando brief: ${briefUpdateError.message}`);
      }

      // 4. Enviar email
      try {
        await supabase.functions.invoke('send-proposal-notification', {
          body: {
            clientEmail,
            companyName,
            adminNotes,
            fileName: selectedFile.name
          }
        });
      } catch (emailError) {
        console.warn('Email error:', emailError);
      }

      toast({
        title: 'Propuesta enviada exitosamente',
        description: `Se ha enviado la propuesta a ${clientEmail}`,
      });

      onProposalUploaded();
      setSelectedFile(null);
      setAdminNotes('');
      
    } catch (error: any) {
      toast({
        title: 'Error enviando propuesta',
        description: error.message || 'Hubo un problema procesando la propuesta',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Mostrar loading mientras se verifica el rol de administrador
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Verificando permisos...</h3>
        <p className="text-muted-foreground">
          Comprobando si tienes acceso para subir propuestas.
        </p>
      </div>
    );
  }

  // Solo mostrar "Acceso Denegado" después de confirmar que no es admin
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-red-600">Acceso Denegado</h3>
        <p className="text-muted-foreground">
          Solo los administradores pueden subir propuestas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <div>
              <h3 className="text-lg font-medium text-green-800">Archivo seleccionado</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">Arrastra tu archivo PDF aquí</h3>
              <p className="text-muted-foreground mb-4">
                O haz clic para seleccionar un archivo
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" disabled={isUploading}>
                  Seleccionar archivo PDF
                </Button>
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                Máximo 10MB • Solo archivos PDF
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje para cliente */}
      <div>
        <Label htmlFor="admin-notes">Mensaje para el Cliente (Opcional)</Label>
        <Textarea
          id="admin-notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Mensaje adicional que aparecerá en el email..."
          rows={3}
          disabled={isUploading}
          className="mt-2"
        />
      </div>

      {/* Información del cliente */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Cliente:</strong> {clientEmail}
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Se enviará una notificación automática por email con la propuesta.
        </p>
      </div>

      {/* Botón de envío */}
      <div className="flex justify-center">
        <Button 
          onClick={handleUploadAndSend} 
          disabled={!selectedFile || isUploading}
          size="lg"
          className="min-w-[200px]"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {isUploading ? 'Enviando...' : 'Subir y Enviar Propuesta'}
        </Button>
      </div>
    </div>
  );
};

export default ProposalDropzone;
