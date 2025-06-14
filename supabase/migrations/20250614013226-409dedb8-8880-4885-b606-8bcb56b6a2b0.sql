
-- Crear política que permite a los administradores ver todos los briefs
CREATE POLICY "Admins can view all briefs" 
  ON public.briefs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Crear política que permite a cualquiera insertar briefs (para el formulario público)
CREATE POLICY "Anyone can insert briefs" 
  ON public.briefs 
  FOR INSERT 
  WITH CHECK (true);

-- Habilitar RLS en la tabla briefs si no está habilitado
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
