
-- Crear el rol faltante para el usuario joaquinvasme@gmail.com
INSERT INTO public.user_roles (user_id, role) 
VALUES ('joaquinvasme@gmail.com', 'user')
ON CONFLICT (user_id) DO NOTHING;
