
-- Crear políticas para el bucket de propuestas (solo si no existen)
DO $$ 
BEGIN
  -- Solo administradores pueden subir archivos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can upload proposal files'
  ) THEN
    CREATE POLICY "Admins can upload proposal files"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'proposals' 
      AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.jwt() ->> 'email' 
        AND role = 'admin'
      )
    );
  END IF;

  -- Solo administradores pueden ver archivos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can view proposal files'
  ) THEN
    CREATE POLICY "Admins can view proposal files"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'proposals' 
      AND EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.jwt() ->> 'email' 
        AND role = 'admin'
      )
    );
  END IF;

  -- Los clientes pueden descargar solo sus propuestas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Clients can download their proposals'
  ) THEN
    CREATE POLICY "Clients can download their proposals"
    ON storage.objects
    FOR SELECT
    USING (
      bucket_id = 'proposals' 
      AND EXISTS (
        SELECT 1 FROM public.briefs b
        JOIN public.proposals p ON b.id = p.brief_id
        WHERE b.email = auth.jwt() ->> 'email'
        AND storage.objects.name = p.file_name
      )
    );
  END IF;
END $$;

-- Actualizar tabla proposals para incluir más información
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS client_message TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Función para notificar al cliente cuando se envía una propuesta
CREATE OR REPLACE FUNCTION notify_proposal_sent()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se marca una propuesta como enviada, podemos usar esto para disparar notificaciones
  IF NEW.email_sent_at IS NOT NULL AND OLD.email_sent_at IS NULL THEN
    -- Aquí se podría agregar lógica adicional si es necesario
    RAISE NOTICE 'Proposal sent notification for brief %', NEW.brief_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para la función de notificación
DROP TRIGGER IF EXISTS proposal_sent_trigger ON public.proposals;
CREATE TRIGGER proposal_sent_trigger
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION notify_proposal_sent();
