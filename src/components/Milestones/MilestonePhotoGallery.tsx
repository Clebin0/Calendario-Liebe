
import React, { useState } from "react";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MilestonePhoto {
  id: string;
  milestone_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

interface MilestonePhotoGalleryProps {
  milestoneId: string;
}

const MilestonePhotoGallery = ({ milestoneId }: MilestonePhotoGalleryProps) => {
  const [photos, setPhotos] = useState<MilestonePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPhotoDialogOpen, setIsAddPhotoDialogOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<MilestonePhoto | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchMilestonePhotos();
  }, [milestoneId]);

  const fetchMilestonePhotos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("milestone_photos")
        .select("*")
        .eq("milestone_id", milestoneId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast({
        title: "Erro ao carregar fotos",
        description: "Não foi possível carregar as fotos deste marco.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) return;
    
    try {
      setIsUploading(true);
      
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${milestoneId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `milestone-photos/${fileName}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("milestone-photos")
        .upload(filePath, photoFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("milestone-photos")
        .getPublicUrl(filePath);
      
      const photoUrl = publicUrlData.publicUrl;
      
      // Save to database
      const { error: dbError } = await supabase
        .from("milestone_photos")
        .insert({
          milestone_id: milestoneId,
          photo_url: photoUrl,
          caption: photoCaption || null,
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Foto adicionada",
        description: "A foto foi adicionada com sucesso!",
        className: "bg-pink-50 border-pink-200",
      });
      
      // Reset form and close dialog
      setPhotoFile(null);
      setPhotoCaption("");
      setIsAddPhotoDialogOpen(false);
      
      // Refresh photos
      fetchMilestonePhotos();
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Erro ao adicionar foto",
        description: "Não foi possível adicionar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const viewPhoto = (photo: MilestonePhoto) => {
    setSelectedPhoto(photo);
    setIsPhotoViewerOpen(true);
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from("milestone_photos")
        .delete()
        .eq("id", photoId);
        
      if (error) throw error;
      
      toast({
        title: "Foto removida",
        description: "A foto foi removida com sucesso.",
        className: "bg-pink-50 border-pink-200",
      });
      
      setPhotos(photos.filter(photo => photo.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setIsPhotoViewerOpen(false);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Erro ao remover foto",
        description: "Não foi possível remover a foto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-400">Carregando fotos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium text-gray-800">Fotos</h3>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 text-pink-600 border-pink-200 hover:bg-pink-50"
          onClick={() => setIsAddPhotoDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar foto
        </Button>
      </div>
      
      {photos.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md border-pink-200 bg-pink-50/30">
          <ImageIcon className="h-8 w-8 mx-auto text-pink-300" />
          <p className="text-gray-500 mt-2">Nenhuma foto adicionada</p>
          <Button 
            variant="link"
            className="text-pink-600 mt-2"
            onClick={() => setIsAddPhotoDialogOpen(true)}
          >
            Adicionar sua primeira foto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {photos.map(photo => (
            <div 
              key={photo.id}
              className="relative group aspect-square overflow-hidden rounded-md border border-pink-100 cursor-pointer"
              onClick={() => viewPhoto(photo)}
            >
              <img 
                src={photo.photo_url} 
                alt={photo.caption || "Foto do marco"} 
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <p className="text-white text-xs p-2 truncate w-full">
                  {photo.caption || "Sem legenda"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Photo Dialog */}
      <Dialog open={isAddPhotoDialogOpen} onOpenChange={setIsAddPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="picture" className="text-sm font-medium">
                Selecione uma foto
              </label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="caption" className="text-sm font-medium">
                Legenda (opcional)
              </label>
              <Input
                id="caption"
                placeholder="Adicione uma legenda para a foto"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
              />
            </div>
            
            {photoFile && (
              <div className="border rounded-md overflow-hidden">
                <img
                  src={URL.createObjectURL(photoFile)}
                  alt="Preview"
                  className="w-full h-40 object-contain bg-gray-50"
                />
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                type="button"
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={uploadPhoto}
                disabled={!photoFile || isUploading}
              >
                {isUploading ? "Enviando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Photo Viewer Dialog */}
      <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
        <DialogContent className="sm:max-w-2xl p-1">
          {selectedPhoto && (
            <div className="relative">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || "Foto do marco"}
                className="w-full rounded-md"
              />
              {selectedPhoto.caption && (
                <div className="p-4 text-center">
                  <p className="text-gray-700">{selectedPhoto.caption}</p>
                </div>
              )}
              <Button 
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => deletePhoto(selectedPhoto.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MilestonePhotoGallery;
