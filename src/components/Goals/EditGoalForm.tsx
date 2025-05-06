
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Goal } from "./GoalCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface EditGoalFormProps {
  goal: Goal;
  onSuccess: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  target_date: z.date().nullable(),
  description: z.string().optional(),
  completed: z.boolean().default(false)
});

const EditGoalForm = ({ goal, onSuccess }: EditGoalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: goal.title,
      target_date: goal.target_date ? new Date(goal.target_date) : null,
      description: goal.description || "",
      completed: goal.completed
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('couple_goals')
        .update({
          title: data.title,
          target_date: data.target_date ? format(data.target_date, 'dd/MM/yyyy') : null,
          description: data.description || null,
          completed: data.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id);
      
      if (error) throw error;
      
      toast({
        title: "Meta atualizada ❤️",
        description: "As alterações foram salvas com sucesso!",
        className: "bg-pink-50 border-pink-200",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Viagem para Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="target_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data alvo (opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Deixe em branco se não tiver uma data específica
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Adicione detalhes ou notas sobre esta meta"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Marcar como concluída</FormLabel>
                <FormDescription>
                  Marque esta caixa se você já completou esta meta
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white"
            disabled={isSubmitting}
          >
            Salvar alterações
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditGoalForm;
