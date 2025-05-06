
import { useState } from "react";
import { format } from "date-fns";
import { Target, Calendar, Clock, Edit, Trash, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import EditGoalForm from "./EditGoalForm";

export interface Goal {
  id: string;
  title: string;
  target_date: string | null;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

const GoalCard = ({ goal, onUpdate, onDelete }: GoalCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("couple_goals")
        .delete()
        .eq("id", goal.id);

      if (error) throw error;
      
      onDelete(goal.id);
      toast({
        title: "Meta removida",
        description: "A meta foi removida com sucesso.",
        className: "bg-pink-50 border-pink-200",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCompleted = async () => {
    try {
      setIsTogglingComplete(true);
      const { error } = await supabase
        .from("couple_goals")
        .update({ 
          completed: !goal.completed,
          updated_at: new Date().toISOString()
        })
        .eq("id", goal.id);

      if (error) throw error;
      
      onUpdate();
      toast({
        title: goal.completed ? "Meta reaberta" : "Meta concluída ❤️",
        description: goal.completed 
          ? "A meta foi marcada como não concluída." 
          : "Parabéns! A meta foi marcada como concluída.",
        className: "bg-pink-50 border-pink-200",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingComplete(false);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${goal.completed ? 'border-green-100' : 'border-pink-100'} transition-all duration-300 hover:shadow-lg`}>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                className={`h-8 w-8 p-0 ${goal.completed ? 'text-green-500' : 'text-gray-400'}`}
                onClick={toggleCompleted}
                disabled={isTogglingComplete}
              >
                {goal.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </Button>
              <h3 className={`text-lg font-semibold ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-800'} truncate max-w-[200px]`}>
                {goal.title}
              </h3>
            </div>
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-blue-500"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="mt-4 ml-11">
            {goal.target_date && (
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Target className="h-4 w-4 mr-2" />
                Data alvo: {format(new Date(goal.target_date), "dd/MM/yyyy")}
              </div>
            )}
            
            {goal.description && (
              <p className={`text-gray-600 text-sm line-clamp-2 mt-2 ${goal.completed ? 'text-gray-400' : ''}`}>
                {goal.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 justify-between">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" /> 
              Criado em {format(new Date(goal.created_at), "dd/MM/yyyy")}
            </div>
            {goal.completed && (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" /> 
                Concluído em {format(new Date(goal.updated_at), "dd/MM/yyyy")}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          <EditGoalForm 
            goal={goal}
            onSuccess={() => {
              setShowEditDialog(false);
              onUpdate();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalCard;
