
-- Crear el bucket para almacenar los PDFs de los briefs
INSERT INTO storage.buckets (id, name, public)
VALUES ('brief-pdfs', 'brief-pdfs', true);

-- Crear política para permitir que cualquiera pueda ver los PDFs (necesario para los enlaces en emails)
CREATE POLICY "Anyone can view brief PDFs" ON storage.objects
FOR SELECT USING (bucket_id = 'brief-pdfs');

-- Crear política para permitir que el sistema inserte PDFs (para la edge function)
CREATE POLICY "System can insert brief PDFs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'brief-pdfs');

-- Crear política para permitir actualizar PDFs (para sobrescribir si es necesario)
CREATE POLICY "System can update brief PDFs" ON storage.objects
FOR UPDATE USING (bucket_id = 'brief-pdfs');
