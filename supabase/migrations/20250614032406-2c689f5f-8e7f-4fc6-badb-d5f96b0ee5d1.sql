
-- Crear el bucket para almacenar los PDFs de los briefs
INSERT INTO storage.buckets (id, name, public)
VALUES ('brief-pdfs', 'brief-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si existen y crear nuevas
DROP POLICY IF EXISTS "Anyone can view brief PDFs" ON storage.objects;
DROP POLICY IF EXISTS "System can insert brief PDFs" ON storage.objects;
DROP POLICY IF EXISTS "System can update brief PDFs" ON storage.objects;
DROP POLICY IF EXISTS "System can delete brief PDFs" ON storage.objects;

-- Crear política para permitir que cualquiera pueda ver los PDFs
CREATE POLICY "Anyone can view brief PDFs" ON storage.objects
FOR SELECT USING (bucket_id = 'brief-pdfs');

-- Crear política para permitir que el sistema inserte PDFs
CREATE POLICY "System can insert brief PDFs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'brief-pdfs');

-- Crear política para permitir actualizar PDFs
CREATE POLICY "System can update brief PDFs" ON storage.objects
FOR UPDATE USING (bucket_id = 'brief-pdfs');

-- Crear política para permitir eliminar PDFs
CREATE POLICY "System can delete brief PDFs" ON storage.objects
FOR DELETE USING (bucket_id = 'brief-pdfs');
