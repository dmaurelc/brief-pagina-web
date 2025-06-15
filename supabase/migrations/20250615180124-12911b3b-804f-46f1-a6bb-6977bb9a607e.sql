
-- Crear función para manejar nuevos usuarios de Clerk
CREATE OR REPLACE FUNCTION public.handle_clerk_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar rol de usuario por defecto cuando se crea un brief
  -- y el usuario no existe en user_roles
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (NEW.email, 'user')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger en la tabla briefs para auto-crear usuarios
CREATE OR REPLACE TRIGGER auto_create_user_role
  BEFORE INSERT ON public.briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_clerk_user();

-- Alternativamente, también podemos crear una función que se pueda llamar manualmente
-- para usuarios existentes que no tienen rol asignado
CREATE OR REPLACE FUNCTION public.ensure_user_role(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (_email, 'user')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;
