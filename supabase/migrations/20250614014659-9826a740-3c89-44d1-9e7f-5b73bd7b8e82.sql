
-- 1. Crear bucket para almacenar PDFs de propuestas
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', false);

-- 2. Crear tabla para tracking de propuestas
CREATE TABLE public.proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id uuid NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  admin_notes text,
  uploaded_by text NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  email_sent_at timestamp with time zone
);

-- 3. Habilitar RLS en proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para proposals - solo admins pueden gestionar
CREATE POLICY "Admins can manage proposals" 
  ON public.proposals 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = uploaded_by 
      AND role = 'admin'
    )
  );

-- 5. Políticas para storage bucket proposals
CREATE POLICY "Admins can upload proposals"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'proposals' AND (storage.foldername(name))[1] = 'proposals');

CREATE POLICY "Admins can view proposals"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'proposals');

CREATE POLICY "Admins can update proposals"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'proposals');

CREATE POLICY "Admins can delete proposals"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'proposals');

-- 6. Agregar campo proposal_id a briefs para referencia opcional
ALTER TABLE public.briefs 
ADD COLUMN proposal_id uuid REFERENCES public.proposals(id);
