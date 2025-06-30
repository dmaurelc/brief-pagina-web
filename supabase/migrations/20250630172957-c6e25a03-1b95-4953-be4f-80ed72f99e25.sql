
-- Eliminar las políticas problemáticas de user_roles que causan recursión
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow system to insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow system to update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Prevent user deletion of roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for system functions" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for system functions" ON public.user_roles;
DROP POLICY IF EXISTS "Disable delete for users" ON public.user_roles;

-- Crear políticas simples para user_roles que no causen recursión
CREATE POLICY "Allow all authenticated users to read user_roles" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow all authenticated users to insert user_roles" 
  ON public.user_roles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update user_roles" 
  ON public.user_roles 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- No permitir eliminación directa (mantenemos esta restricción)
CREATE POLICY "Disable delete for all users" 
  ON public.user_roles 
  FOR DELETE 
  TO authenticated 
  USING (false);

-- Eliminar cualquier política existente de proposals que pueda causar problemas
DROP POLICY IF EXISTS "Admins can manage proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can view proposals" ON public.proposals;
DROP POLICY IF EXISTS "Admins can update proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can view their proposals" ON public.proposals;

-- Crear políticas simples para proposals
CREATE POLICY "Allow all authenticated users to read proposals" 
  ON public.proposals 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow all authenticated users to insert proposals" 
  ON public.proposals 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update proposals" 
  ON public.proposals 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow all authenticated users to delete proposals" 
  ON public.proposals 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Asegurar que RLS está habilitado en ambas tablas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
