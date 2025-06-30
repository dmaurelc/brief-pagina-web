
-- Eliminar todas las políticas existentes del bucket proposals que causan conflictos
DROP POLICY IF EXISTS "Admins can manage proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete proposals" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload proposal files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view proposal files" ON storage.objects;
DROP POLICY IF EXISTS "Clients can download their proposals" ON storage.objects;

-- Crear políticas más simples y permisivas para el bucket proposals
-- Permitir a cualquiera subir archivos al bucket proposals
CREATE POLICY "Allow proposal uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'proposals');

-- Permitir a cualquiera ver archivos del bucket proposals
CREATE POLICY "Allow proposal viewing" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proposals');

-- Permitir a cualquiera actualizar archivos del bucket proposals
CREATE POLICY "Allow proposal updates" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'proposals');

-- Permitir a cualquiera eliminar archivos del bucket proposals
CREATE POLICY "Allow proposal deletion" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'proposals');

-- Asegurar que el bucket proposals existe y es privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', false)
ON CONFLICT (id) DO UPDATE SET public = false;
