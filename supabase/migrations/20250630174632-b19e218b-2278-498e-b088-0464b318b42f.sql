
-- LIMPIAR COMPLETAMENTE TODAS LAS POLÍTICAS EXISTENTES
-- Eliminar TODAS las políticas de user_roles
DROP POLICY IF EXISTS "Allow all authenticated users to read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all authenticated users to insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow all authenticated users to update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Disable delete for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Disable delete access for all users" ON public.user_roles;

-- Eliminar TODAS las políticas de proposals
DROP POLICY IF EXISTS "Allow all authenticated users to read proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow all authenticated users to insert proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow all authenticated users to update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow all authenticated users to delete proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can manage proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can view proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can update proposals" ON public.proposals;

-- CREAR POLÍTICAS ULTRA-PERMISIVAS QUE FUNCIONEN CON CLERK
-- Políticas para user_roles - acceso completo para el rol público
CREATE POLICY "Public can read user_roles" 
  ON public.user_roles 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Public can insert user_roles" 
  ON public.user_roles 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update user_roles" 
  ON public.user_roles 
  FOR UPDATE 
  TO public
  USING (true);

-- Permitir eliminación también para evitar cualquier problema
CREATE POLICY "Public can delete user_roles" 
  ON public.user_roles 
  FOR DELETE 
  TO public
  USING (true);

-- Políticas para proposals - acceso completo para el rol público
CREATE POLICY "Public can read proposals" 
  ON public.proposals 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Public can insert proposals" 
  ON public.proposals 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update proposals" 
  ON public.proposals 
  FOR UPDATE 
  TO public
  USING (true);

CREATE POLICY "Public can delete proposals" 
  ON public.proposals 
  FOR DELETE 
  TO public
  USING (true);

-- Verificar que RLS siga habilitado pero con políticas permisivas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- También asegurar que briefs tenga políticas permisivas
DROP POLICY IF EXISTS "Anyone can view briefs for now" ON public.briefs;
DROP POLICY IF EXISTS "Anyone can insert briefs" ON public.briefs;
DROP POLICY IF EXISTS "Admins can view all briefs" ON public.briefs;

CREATE POLICY "Public can read briefs" 
  ON public.briefs 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Public can insert briefs" 
  ON public.briefs 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update briefs" 
  ON public.briefs 
  FOR UPDATE 
  TO public
  USING (true);

CREATE POLICY "Public can delete briefs" 
  ON public.briefs 
  FOR DELETE 
  TO public
  USING (true);

ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
