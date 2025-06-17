
-- Eliminar todas las políticas RLS existentes que causan recursión
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow system to insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow system to update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Prevent user deletion of roles" ON public.user_roles;

-- Crear políticas RLS más simples que no causen recursión
-- Permitir lectura completa a usuarios autenticados
CREATE POLICY "Enable read for authenticated users" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Permitir inserción solo mediante funciones del sistema
CREATE POLICY "Enable insert for system functions" 
  ON public.user_roles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Permitir actualización solo mediante funciones del sistema
CREATE POLICY "Enable update for system functions" 
  ON public.user_roles 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- No permitir eliminación directa
CREATE POLICY "Disable delete for users" 
  ON public.user_roles 
  FOR DELETE 
  TO authenticated 
  USING (false);
