
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Heart, Calendar, Clock, ChevronLeft, Edit, Trash, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import MainLayout from "@/components/Layout/MainLayout";
import EditMilestoneForm from "@/components/Milestones/EditMilestoneForm";
import MilestonePhotoGallery from "@/components/Milestones/MilestonePhotoGallery";
import { Milestone } from "@/components/Milestones/MilestoneCard";
import { Skeleton } from "@/components/ui/skeleton";

const MilestoneDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavoriteToggling, setIsFavoriteToggling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchMilestone(id);
    }
  }, [id]);

  const fetchMilestone = async (milestoneId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("relationship_milestones")
        .select("*")
        .eq("id", milestoneId)
        .single();

      if (error) throw error;
      
      setMilestone(data as Milestone);
    } catch (error) {
      console.error("Error fetching milestone:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes deste marco.",
        variant: "destructive",
      });
      navigate("/milestones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!milestone) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("relationship_milestones")
        .delete()
        .eq("id", milestone.id);

      if (error) throw error;
      
      toast({
        title: "Marco removido",
        description: "O marco foi removido com sucesso.",
        className: "bg-pink-50 border-pink-200",
      });
      navigate("/milestones");
    } catch (error) {
      console.error("Error deleting milestone:", error);
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
    if (!milestone) return;

    try {
      setIsFavoriteToggling(true);
      const { error } = await supabase
        .from("relationship_milestones")
        .update({ is_favorite: !milestone.is_favorite })
        .eq("id", milestone.id);

      if (error) throw error;
      
      setMilestone({
        ...milestone,
        is_favorite: !milestone.is_favorite
      });
      
      toast({
        title: milestone.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: milestone.is_favorite 
          ? "O marco foi removido dos favoritos." 
          : "O marco foi adicionado aos favoritos.",
        className: "bg-pink-50 border-pink-200",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de favorito. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsFavoriteToggling(false);
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "anniversary":
        return <Calendar className="h-6 w-6 text-blue-500" />;
      case "first":
        return <Star className="h-6 w-6 text-yellow-500" />;
      case "special":
        return <Heart className="h-6 w-6 text-pink-500" />;
      default:
        return <Heart className="h-6 w-6 text-purple-500" />;
    }
  };

  const getMilestoneTypeName = (type: string) => {
    switch (type) {
      case "anniversary":
        return "Aniversário";
      case "first":
        return "Primeira vez";
      case "special":
        return "Momento especial";
      default:
        return "Outro";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!milestone) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Marco não encontrado</h2>
          <p className="text-gray-600 mt-2">Este marco não existe ou foi removido.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/milestones")}
          >
            Voltar aos marcos
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/milestones")}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar aos marcos
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className={`${milestone.is_favorite ? 'text-yellow-500 border-yellow-200' : 'text-gray-500'}`}
              onClick={toggleFavorite}
              disabled={isFavoriteToggling}
            >
              <Star className={`h-4 w-4 mr-2 ${milestone.is_favorite ? 'fill-yellow-400' : ''}`} />
              {milestone.is_favorite ? "Favorito" : "Favoritar"}
            </Button>
            
            <Button 
              variant="outline" 
              className="text-blue-500 border-blue-200"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <Button 
              variant="outline" 
              className="text-red-500 border-red-200"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-pink-100">
          <div className="space-y-6">
            {/* Title section */}
            <div className="flex items-center gap-4">
              <div className="bg-pink-50 p-3 rounded-full">
                {getMilestoneIcon(milestone.milestone_type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{milestone.title}</h1>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(milestone.date), "dd/MM/yyyy")}
                  <span className="mx-2">•</span>
                  {getMilestoneTypeName(milestone.milestone_type)}
                </div>
              </div>
            </div>
            
            {/* Description */}
            {milestone.description && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <h3 className="font-medium text-gray-700 mb-2">Descrição</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {milestone.description}
                </p>
              </div>
            )}
            
            {/* Photos section */}
            <div className="mt-8">
              <MilestonePhotoGallery milestoneId={milestone.id} />
            </div>
            
            {/* Created at info */}
            <div className="flex items-center justify-end pt-4 text-xs text-gray-500 border-t border-gray-100">
              <Clock className="h-3 w-3 mr-1" /> 
              Criado em {format(new Date(milestone.created_at), "dd/MM/yyyy")}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Marco</DialogTitle>
          </DialogHeader>
          <EditMilestoneForm 
            milestone={milestone}
            onSuccess={() => {
              setShowEditDialog(false);
              fetchMilestone(milestone.id);
            }}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default MilestoneDetailPage;
