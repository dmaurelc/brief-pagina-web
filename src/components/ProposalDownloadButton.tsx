
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProposalDownloadButtonProps {
  proposalId: string;
  fileName: string;
  filePath: string;
  companyName: string;
}

const ProposalDownloadButton = ({ 
  proposalId, 
  fileName, 
  filePath, 
  companyName 
}: ProposalDownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    console.log('🔽 Iniciando descarga de propuesta:', { proposalId, fileName, filePath });

    try {
      // Descargar el archivo desde Supabase Storage
      const { data, error } = await supabase.storage
        .from('proposals')
        .download(filePath);

      if (error) {
        console.error('❌ Error descargando archivo:', error);
        throw new Error(`Error descargando archivo: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo obtener el archivo');
      }

      console.log('✅ Archivo descargado exitosamente');

      // Crear blob y URL para descarga
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga temporal
      const link = document.createElement('a');
      link.href = url;
      link.download = `Propuesta_${companyName}_${fileName}`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Descarga completada',
        description: 'La propuesta se ha descargado correctamente',
      });

    } catch (error: any) {
      console.error('💥 Error en descarga:', error);
      toast({
        title: 'Error en la descarga',
        description: error.message || 'No se pudo descargar la propuesta',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      size="sm"
      variant="outline"
      className="flex items-center gap-2"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isDownloading ? 'Descargando...' : 'Descargar PDF'}
    </Button>
  );
};

export default ProposalDownloadButton;
