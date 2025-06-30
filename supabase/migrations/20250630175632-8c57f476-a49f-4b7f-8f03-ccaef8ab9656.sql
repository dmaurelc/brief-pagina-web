
-- Crear bucket para propuestas si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('proposals', 'proposals', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Eliminar políticas existentes del bucket proposals
DROP POLICY IF EXISTS "Allow proposal uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow proposal viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow proposal updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow proposal deletion" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload proposal files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view proposal files" ON storage.objects;
DROP POLICY IF EXISTS "Clients can download their proposals" ON storage.objects;

-- Crear políticas permisivas para el bucket proposals
-- Permitir a todos subir archivos al bucket proposals
CREATE POLICY "Public can upload to proposals" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'proposals');

-- Permitir a todos ver archivos del bucket proposals
CREATE POLICY "Public can view proposals" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proposals');

-- Permitir a todos actualizar archivos del bucket proposals
CREATE POLICY "Public can update proposals" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'proposals');

-- Permitir a todos eliminar archivos del bucket proposals
CREATE POLICY "Public can delete proposals" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'proposals');
