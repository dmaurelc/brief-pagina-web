
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface StepProps {
  form: any;
}

const TechInfoStep: React.FC<StepProps> = ({ form }) => (
  <TooltipProvider>
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="existing_website"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Sitio web existente (opcional)
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Tienes un sitio web existente?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="https://www.ejemplo.com" 
                {...field} 
                className={fieldState.error ? "border-destructive" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="competitor_websites"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Sitios web de la competencia (opcional)
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Cuáles son los sitios web de tu competencia?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="https://www.competidor1.com, https://www.competidor2.com" 
                {...field} 
                className={fieldState.error ? "border-destructive" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="design_preferences"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Preferencias de diseño (opcional)
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Tienes alguna preferencia de diseño?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Nos gustaría un diseño..."
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
        name="additional_notes"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Notas adicionales (opcional)
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Alguna otra cosa que debamos saber?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Alguna otra cosa que debamos saber..."
                className={`resize-none ${fieldState.error ? "border-destructive" : ""}`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </TooltipProvider>
);

export default TechInfoStep;
