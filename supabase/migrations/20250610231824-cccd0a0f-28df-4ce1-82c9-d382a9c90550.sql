
-- Crear tabla para almacenar los briefs de formularios
CREATE TABLE public.briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Información de la empresa
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  industry TEXT NOT NULL,
  
  -- Sobre el proyecto
  project_type TEXT NOT NULL,
  project_description TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  timeline TEXT NOT NULL,
  
  -- Presupuesto y objetivos
  budget TEXT NOT NULL,
  main_goals TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  
  -- Información técnica
  existing_website TEXT,
  competitor_websites TEXT,
  design_preferences TEXT,
  additional_notes TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar comentarios para documentar la tabla
COMMENT ON TABLE public.briefs IS 'Almacena todos los briefs de solicitudes de presupuesto web';
COMMENT ON COLUMN public.briefs.features IS 'Array de funcionalidades requeridas';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_briefs_email ON public.briefs(email);
CREATE INDEX idx_briefs_created_at ON public.briefs(created_at DESC);
CREATE INDEX idx_briefs_company_name ON public.briefs(company_name);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserción pública (cualquiera puede enviar un brief)
CREATE POLICY "Anyone can insert briefs" 
  ON public.briefs 
  FOR INSERT 
  WITH CHECK (true);

-- Crear política para que solo administradores puedan ver los briefs (por ahora público para pruebas)
CREATE POLICY "Anyone can view briefs" 
  ON public.briefs 
  FOR SELECT 
  USING (true);
