
-- Eliminar políticas existentes que pueden estar causando conflictos
DROP POLICY IF EXISTS "Anyone can view briefs for now" ON public.briefs;
DROP POLICY IF EXISTS "Anyone can insert briefs" ON public.briefs;

-- Crear política que permite a cualquiera insertar briefs (formulario público)
CREATE POLICY "Anyone can insert briefs" 
  ON public.briefs 
  FOR INSERT 
  WITH CHECK (true);

-- Crear política que permite a los administradores ver todos los briefs
CREATE POLICY "Admins can view all briefs" 
  ON public.briefs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
      AND role = 'admin'
    )
    OR 
    public.has_role_by_email(auth.jwt() ->> 'email', 'admin')
  );

-- Crear política que permite a los administradores actualizar todos los briefs
CREATE POLICY "Admins can update all briefs" 
  ON public.briefs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
      AND role = 'admin'
    )
    OR 
    public.has_role_by_email(auth.jwt() ->> 'email', 'admin')
  );

-- Verificar que el usuario administrador existe
INSERT INTO public.user_roles (user_id, role) 
VALUES ('dmaurelc@gmail.com', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
