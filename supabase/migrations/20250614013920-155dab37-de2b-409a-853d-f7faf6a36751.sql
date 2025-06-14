
-- 1. Insertar tu usuario como administrador
INSERT INTO public.user_roles (user_id, role) 
VALUES ('dmaurelc@gmail.com', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 2. Crear función para verificar roles usando email en lugar de auth.uid()
CREATE OR REPLACE FUNCTION public.has_role_by_email(_email text, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _email 
    AND role = _role
  )
$$;

-- 3. Eliminar las políticas actuales que usan auth.uid()
DROP POLICY IF EXISTS "Admins can view all briefs" ON public.briefs;
DROP POLICY IF EXISTS "Anyone can insert briefs" ON public.briefs;

-- 4. Crear nuevas políticas que funcionen con Clerk
CREATE POLICY "Anyone can insert briefs" 
  ON public.briefs 
  FOR INSERT 
  WITH CHECK (true);

-- 5. Por ahora hacer los briefs visibles para todos para debugging
-- Luego ajustaremos esto en el código para verificar roles de Clerk
CREATE POLICY "Anyone can view briefs for now" 
  ON public.briefs 
  FOR SELECT 
  USING (true);
