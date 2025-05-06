
import { useState } from "react";
import { format } from "date-fns";
import { Award, Heart, Calendar, Clock, Edit, Trash, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import EditMilestoneForm from "./EditMilestoneForm";

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string | null;
  milestone_type: string;
  is_favorite: boolean;
  created_at: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

const getMilestoneIcon = (type: string) => {
  switch (type) {
    case "anniversary":
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case "first":
      return <Star className="h-5 w-5 text-yellow-500" />;
    case "special":
      return <Heart className="h-5 w-5 text-pink-500" />;
    default:
      return <Award className="h-5 w-5 text-purple-500" />;
  }
};

const MilestoneCard = ({ milestone, onUpdate, onDelete }: MilestoneCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavoriteToggling, setIsFavoriteToggling] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("relationship_milestones")
        .delete()
        .eq("id", milestone.id);

      if (error) throw error;
      
      onDelete(milestone.id);
      toast({
        title: "Marco removido",
        description: "O marco foi removido com sucesso.",
        className: "bg-pink-50 border-pink-200",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o marco. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      setIsFavoriteToggling(true);
      const { error } = await supabase
        .from("relationship_milestones")
        .update({ is_favorite: !milestone.is_favorite })
        .eq("id", milestone.id);

      if (error) throw error;
      
      onUpdate();
      toast({
        title: milestone.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: milestone.is_favorite 
          ? "O marco foi removido dos favoritos." 
          : "O marco foi adicionado aos favoritos.",
        className: "bg-pink-50 border-pink-200",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de favorito. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsFavoriteToggling(false);
    }
  };

  const viewDetails = () => {
    navigate(`/milestones/${milestone.id}`);
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100 transition-all duration-300 hover:shadow-lg cursor-pointer"
        onClick={viewDetails}
      >
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              {getMilestoneIcon(milestone.milestone_type)}
              <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[200px]">{milestone.title}</h3>
            </div>
            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`h-8 w-8 p-0 ${milestone.is_favorite ? 'text-yellow-500' : 'text-gray-400'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite();
                    }}
                    disabled={isFavoriteToggling}
                  >
                    <Star className={`h-4 w-4 ${milestone.is_favorite ? 'fill-yellow-400' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {milestone.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditDialog(true);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(milestone.date), "dd/MM/yyyy")}
            </div>
            
            {milestone.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mt-2">{milestone.description}</p>
            )}
          </div>
          
          <div className="flex items-center mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" /> 
            Criado em {format(new Date(milestone.created_at), "dd/MM/yyyy")}
          </div>
        </div>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Marco</DialogTitle>
          </DialogHeader>
          <EditMilestoneForm 
            milestone={milestone}
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

export default MilestoneCard;
