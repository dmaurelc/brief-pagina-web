
import { useState, useCallback } from 'react';
import { Upload, FileText, X, RefreshCw, CheckCircle, AlertCircle, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Tables } from '@/integrations/supabase/types';

type Proposal = Tables<'proposals'>;

interface ProposalUpdateDropzoneProps {
  briefId: string;
  companyName: string;
  clientEmail: string;
  currentProposal: Proposal;
  onProposalUpdated: () => void;
}

const ProposalUpdateDropzone = ({ 
  briefId, 
  companyName, 
  clientEmail, 
  currentProposal,
  onProposalUpdated 
}: ProposalUpdateDropzoneProps) => {
  const { isAdmin, loading, user } = useAdminRole();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleUpdateProposal = async () => {
    if (!selectedFile || !user?.emailAddresses?.[0]?.emailAddress || !isAdmin) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un archivo y tener permisos de administrador',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);

    try {
      // 1. Subir nuevo archivo
      const sanitizedOriginalName = sanitizeFileName(selectedFile.name);
      const fileName = `${briefId}_${Date.now()}_${sanitizedOriginalName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      // 2. Actualizar registro de propuesta
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          file_path: fileName,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          uploaded_by: user.emailAddresses[0].emailAddress,
          client_message: adminNotes || null,
          email_sent_at: new Date().toISOString()
        })
        .eq('id', currentProposal.id);

      if (updateError) {
        throw new Error(`Error actualizando propuesta: ${updateError.message}`);
      }

      // 3. Eliminar archivo anterior del storage
      try {
        const { error: deleteError } = await supabase.storage
          .from('proposals')
          .remove([currentProposal.file_path]);
        
        if (deleteError) {
          console.warn('No se pudo eliminar el archivo anterior:', deleteError);
        }
      } catch (deleteError) {
        console.warn('Error eliminando archivo anterior:', deleteError);
      }

      // 4. Enviar email de notificación
      try {
        await supabase.functions.invoke('send-proposal-notification', {
          body: {
            clientEmail,
            companyName,
            adminNotes: adminNotes || 'Propuesta actualizada',
            fileName: selectedFile.name
          }
        });
      } catch (emailError) {
        console.warn('Email error:', emailError);
      }

      toast({
        title: 'Propuesta actualizada exitosamente',
        description: `Se ha enviado la propuesta actualizada a ${clientEmail}`,
      });

      onProposalUpdated();
      setSelectedFile(null);
      setAdminNotes('');
      
    } catch (error: any) {
      toast({
        title: 'Error actualizando propuesta',
        description: error.message || 'Hubo un problema actualizando la propuesta',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mostrar loading mientras se verifica el rol de administrador
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Verificando permisos...</h3>
        <p className="text-muted-foreground">
          Comprobando si tienes acceso para actualizar propuestas.
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
          Solo los administradores pueden actualizar propuestas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de propuesta actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Propuesta Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{currentProposal.file_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Enviado: {formatDate(currentProposal.email_sent_at || currentProposal.uploaded_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Por: {currentProposal.uploaded_by}</span>
          </div>
          {currentProposal.file_size && (
            <div className="text-sm text-muted-foreground">
              Tamaño: {(currentProposal.file_size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
        </CardContent>
      </Card>

      {/* Área de actualización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <RefreshCw className="w-5 h-5" />
            Actualizar Propuesta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Atención:</strong> Al actualizar la propuesta, el archivo anterior será reemplazado 
              y se enviará una nueva notificación por email al cliente.
            </p>
          </div>

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
                  <h3 className="text-lg font-medium text-green-800">Nuevo archivo seleccionado</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUpdating}
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
                  <h3 className="text-lg font-medium mb-2">Arrastra el nuevo archivo PDF aquí</h3>
                  <p className="text-muted-foreground mb-4">
                    O haz clic para seleccionar un archivo
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-update"
                    disabled={isUpdating}
                  />
                  <label htmlFor="file-update">
                    <Button variant="outline" className="cursor-pointer" disabled={isUpdating}>
                      Seleccionar nuevo PDF
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
            <Label htmlFor="admin-notes-update">Mensaje para el Cliente (Opcional)</Label>
            <Textarea
              id="admin-notes-update"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Mensaje adicional que aparecerá en el email de actualización..."
              rows={3}
              disabled={isUpdating}
              className="mt-2"
            />
          </div>

          {/* Información del cliente */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Cliente:</strong> {clientEmail}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Se enviará una notificación automática por email con la propuesta actualizada.
            </p>
          </div>

          {/* Botón de actualización */}
          <div className="flex justify-center">
            <Button 
              onClick={handleUpdateProposal} 
              disabled={!selectedFile || isUpdating}
              size="lg"
              className="min-w-[200px]"
              variant="default"
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isUpdating ? 'Actualizando...' : 'Actualizar Propuesta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalUpdateDropzone;
