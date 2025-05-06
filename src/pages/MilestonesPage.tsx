
import { useState, useEffect } from 'react';
import { Plus, Search, Award, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import MainLayout from '@/components/Layout/MainLayout';
import MilestoneCard, { Milestone } from '@/components/Milestones/MilestoneCard';
import AddMilestoneForm from '@/components/Milestones/AddMilestoneForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const MilestonesPage = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [filteredMilestones, setFilteredMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchMilestones = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('relationship_milestones')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setMilestones(data as Milestone[]);
      setFilteredMilestones(data as Milestone[]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os marcos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  useEffect(() => {
    let result = [...milestones];
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(milestone => 
        milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (milestone.description && milestone.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(milestone => milestone.milestone_type === filterType);
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter(milestone => milestone.is_favorite);
    }
    
    setFilteredMilestones(result);
  }, [searchQuery, filterType, showFavoritesOnly, milestones]);

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    setFilteredMilestones(prev => prev.filter(m => m.id !== id));
  };

  return (
    <MainLayout title="Marcos Especiais">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-6 w-6 text-purple-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">
              Marcos do Relacionamento
            </h1>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600">
                <Plus className="h-4 w-4 mr-1" />
                Novo Marco
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Marco</DialogTitle>
              </DialogHeader>
              <AddMilestoneForm 
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  fetchMilestones();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-pink-100">
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar marcos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="anniversary">Aniversário</SelectItem>
                  <SelectItem value="first">Primeira vez</SelectItem>
                  <SelectItem value="special">Momento especial</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant={showFavoritesOnly ? "default" : "outline"} 
                className={showFavoritesOnly ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500" : "border-yellow-300 text-yellow-500"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={showFavoritesOnly ? "white" : "currentColor"} 
                  className="h-4 w-4 mr-2"
                >
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                {showFavoritesOnly ? "Favoritos" : "Ver favoritos"}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 h-44">
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-4 w-1/3 mt-4" />
                  <Skeleton className="h-20 w-full mt-2" />
                </div>
              ))}
            </div>
          ) : filteredMilestones.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMilestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onUpdate={fetchMilestones}
                  onDelete={handleDeleteMilestone}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhum marco encontrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || filterType !== 'all' || showFavoritesOnly ? 
                  "Nenhum marco corresponde aos seus filtros. Tente outros termos de busca ou limpe os filtros." : 
                  "Você ainda não tem marcos registrados. Adicione seu primeiro marco para começar a registrar momentos especiais."}
              </p>
              {(searchQuery || filterType !== 'all' || showFavoritesOnly) && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setShowFavoritesOnly(false);
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MilestonesPage;
