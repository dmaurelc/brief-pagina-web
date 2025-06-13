
-- Crear enum para roles de usuario
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Crear enum para estados de briefs
CREATE TYPE public.brief_status AS ENUM ('pending', 'in_review', 'quote_sent', 'completed', 'cancelled');

-- Crear tabla para roles de usuario
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID es string
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios puedan ver su propio rol
CREATE POLICY "Users can view their own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (true); -- Permitimos lectura general para verificar roles

-- Política para que solo admins puedan insertar/actualizar roles
CREATE POLICY "Only admins can manage roles" 
  ON public.user_roles 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.jwt() ->> 'sub' 
    AND role = 'admin'
  ));

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id TEXT, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Añadir columnas a la tabla briefs
ALTER TABLE public.briefs 
ADD COLUMN user_id TEXT, -- Clerk user ID
ADD COLUMN status brief_status DEFAULT 'pending',
ADD COLUMN status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN admin_notes TEXT;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_briefs_user_id ON public.briefs(user_id);
CREATE INDEX idx_briefs_status ON public.briefs(status);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Actualizar políticas RLS para briefs
DROP POLICY IF EXISTS "Anyone can view briefs" ON public.briefs;
DROP POLICY IF EXISTS "Anyone can insert briefs" ON public.briefs;

-- Nueva política: Usuarios pueden ver sus propios briefs, admins pueden ver todos
CREATE POLICY "Users can view own briefs, admins can view all" 
  ON public.briefs 
  FOR SELECT 
  USING (
    user_id = auth.jwt() ->> 'sub' OR 
    public.has_role(auth.jwt() ->> 'sub', 'admin')
  );

-- Nueva política: Usuarios autenticados pueden insertar briefs
CREATE POLICY "Authenticated users can insert briefs" 
  ON public.briefs 
  FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' IS NOT NULL);

-- Nueva política: Solo admins pueden actualizar briefs
CREATE POLICY "Only admins can update briefs" 
  ON public.briefs 
  FOR UPDATE 
  USING (public.has_role(auth.jwt() ->> 'sub', 'admin'));

-- Función para crear el primer usuario admin
CREATE OR REPLACE FUNCTION public.create_first_admin(_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo crear admin si no existe ningún admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
END;
$$;

-- Trigger para asignar rol 'user' por defecto cuando se crea un brief
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar rol de usuario si no existe
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.user_id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_user_role_trigger
  AFTER INSERT ON public.briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_user_role();
