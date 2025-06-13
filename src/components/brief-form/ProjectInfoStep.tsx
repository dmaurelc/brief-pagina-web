
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface StepProps {
  form: any;
}

const ProjectInfoStep: React.FC<StepProps> = ({ form }) => (
  <TooltipProvider>
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="project_type"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Tipo de proyecto
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Qué tipo de proyecto necesitas?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={fieldState.error ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Sitio web nuevo</SelectItem>
                  <SelectItem value="rediseño">Rediseño de sitio web existente</SelectItem>
                  <SelectItem value="e-commerce">Tienda online (E-commerce)</SelectItem>
                  <SelectItem value="landing-page">Landing Page</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="project_description"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Descripción del proyecto
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Describe brevemente tu proyecto</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Necesitamos un sitio web para..."
                className={`resize-none ${fieldState.error ? "border-destructive" : ""}`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pages"
        render={({ field, fieldState }) => (
          <FormItem className="flex flex-col space-y-1.5">
            <FormLabel className="flex items-center gap-2">
              Páginas requeridas
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Qué páginas necesitas en tu sitio web?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <div className={`space-y-1 p-3 rounded-md border ${fieldState.error ? "border-destructive" : "border-input"}`}>
              {[
                { value: "inicio", label: "Inicio" },
                { value: "nosotros", label: "Nosotros / Acerca de" },
                { value: "servicios", label: "Servicios / Productos" },
                { value: "portafolio", label: "Portafolio / Proyectos" },
                { value: "contacto", label: "Contacto" },
                { value: "blog", label: "Blog / Noticias" },
                { value: "tienda", label: "Tienda online" }
              ].map((page) => (
                <div key={page.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value?.includes(page.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value || [], page.value]);
                      } else {
                        field.onChange(field.value?.filter((value) => value !== page.value));
                      }
                    }}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {page.label}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="features"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-1.5">
            <FormLabel className="flex items-center gap-2">
              Funcionalidades deseadas
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Qué funcionalidades deseas incluir en tu sitio web?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <div className="space-y-1 p-3 rounded-md border border-input">
              {[
                { value: "blog", label: "Blog" },
                { value: "galeria", label: "Galería de imágenes" },
                { value: "tienda", label: "Tienda online" },
                { value: "reservas", label: "Sistema de reservas" },
                { value: "login", label: "Login de usuarios" }
              ].map((feature) => (
                <div key={feature.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value?.includes(feature.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value || [], feature.value]);
                      } else {
                        field.onChange(field.value?.filter((value) => value !== feature.value));
                      }
                    }}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {feature.label}
                  </label>
                </div>
              ))}
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="timeline"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Plazos
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Cuándo te gustaría tener el proyecto terminado?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={fieldState.error ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecciona un plazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente">Urgente (1-2 semanas)</SelectItem>
                  <SelectItem value="moderado">Moderado (2-4 semanas)</SelectItem>
                  <SelectItem value="flexible">Flexible (1-2 meses)</SelectItem>
                  <SelectItem value="sin-prisa">Sin prisa (+2 meses)</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </TooltipProvider>
);

export default ProjectInfoStep;
