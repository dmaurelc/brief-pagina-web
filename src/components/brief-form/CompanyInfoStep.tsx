
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface StepProps {
  form: any;
}

const CompanyInfoStep: React.FC<StepProps> = ({ form }) => (
  <TooltipProvider>
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="company_name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Nombre de la empresa
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Cuál es el nombre de tu empresa?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="DMaurel" 
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
        name="contact_name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Nombre de contacto
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿A quién debemos contactar?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Daniel Maurel" 
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
        name="email"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Email
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Cuál es tu dirección de correo electrónico?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input 
                type="email" 
                placeholder="hola@dmaurel.com" 
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
        name="phone"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Teléfono (opcional)
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Cuál es tu número de teléfono?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="+54 9 11 1234-5678" 
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
        name="industry"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Industria
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿A qué industria pertenece tu empresa?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Tecnología" 
                {...field} 
                className={fieldState.error ? "border-destructive" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </TooltipProvider>
);

export default CompanyInfoStep;
