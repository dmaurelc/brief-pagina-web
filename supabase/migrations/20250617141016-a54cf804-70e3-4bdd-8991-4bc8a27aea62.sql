
-- Primero, eliminar todas las políticas existentes que causan recursión
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_roles;

-- Crear políticas RLS simples que no causen recursión
-- Permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read user_roles" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Permitir inserción solo al sistema (para funciones SECURITY DEFINER)
CREATE POLICY "Allow system to insert user_roles" 
  ON public.user_roles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Permitir actualización solo al sistema
CREATE POLICY "Allow system to update user_roles" 
  ON public.user_roles 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- No permitir eliminación directa por usuarios
CREATE POLICY "Prevent user deletion of roles" 
  ON public.user_roles 
  FOR DELETE 
  TO authenticated 
  USING (false);
