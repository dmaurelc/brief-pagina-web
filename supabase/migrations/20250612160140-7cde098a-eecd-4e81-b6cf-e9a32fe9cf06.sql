
-- Agregar columna pages a la tabla briefs
ALTER TABLE public.briefs ADD COLUMN pages TEXT[] DEFAULT '{}';

-- Agregar comentario para documentar la columna
COMMENT ON COLUMN public.briefs.pages IS 'Array de páginas requeridas para el sitio web';
