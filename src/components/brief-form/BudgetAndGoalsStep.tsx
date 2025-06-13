
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface StepProps {
  form: any;
}

const BudgetAndGoalsStep: React.FC<StepProps> = ({ form }) => (
  <TooltipProvider>
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="budget"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Presupuesto estimado
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Cuál es tu presupuesto estimado para este proyecto?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={fieldState.error ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecciona un presupuesto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bajo">Bajo (menos de $500 USD)</SelectItem>
                  <SelectItem value="medio">Medio ($500 - $2000 USD)</SelectItem>
                  <SelectItem value="alto">Alto ($2000 - $5000 USD)</SelectItem>
                  <SelectItem value="muy-alto">Muy alto (más de $5000 USD)</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="main_goals"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Objetivos principales
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Cuáles son los objetivos principales de este proyecto?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="El objetivo principal es..."
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
        name="target_audience"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Público objetivo
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿A quién está dirigido este proyecto?</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Nuestro público objetivo es..."
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

export default BudgetAndGoalsStep;
