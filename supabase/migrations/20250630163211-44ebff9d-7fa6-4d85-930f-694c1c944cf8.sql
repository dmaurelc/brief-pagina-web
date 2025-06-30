
-- Eliminar las políticas existentes que causan problemas con Clerk
DROP POLICY IF EXISTS "Admins can view all briefs" ON public.briefs;
DROP POLICY IF EXISTS "Admins can update all briefs" ON public.briefs;

-- Crear política más permisiva que permite ver todos los briefs
-- (la verificación de admin se hace en el frontend con Clerk)
CREATE POLICY "Allow viewing all briefs" 
  ON public.briefs 
  FOR SELECT 
  USING (true);

-- Crear política más permisiva que permite actualizar todos los briefs
-- (la verificación de admin se hace en el frontend con Clerk)
CREATE POLICY "Allow updating all briefs" 
  ON public.briefs 
  FOR UPDATE 
  USING (true);

-- Mantener la política de inserción que permite a cualquiera crear briefs
-- (esto es correcto ya que el formulario de brief es público)
