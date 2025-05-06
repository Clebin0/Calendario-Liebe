
import { useState, useEffect } from 'react';
import { Plus, Search, Target, Filter, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/Layout/MainLayout';
import GoalCard, { Goal } from '@/components/Goals/GoalCard';
import AddGoalForm from '@/components/Goals/AddGoalForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('couple_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data as Goal[]);
      setFilteredGoals(data as Goal[]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    let result = [...goals];
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(goal => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by status
    if (filterStatus === 'completed') {
      result = result.filter(goal => goal.completed);
    } else if (filterStatus === 'active') {
      result = result.filter(goal => !goal.completed);
    }
    
    // Filter by date
    const today = new Date();
    if (filterDate === 'upcoming') {
      result = result.filter(goal => goal.target_date && new Date(goal.target_date) > today);
    } else if (filterDate === 'past') {
      result = result.filter(goal => goal.target_date && new Date(goal.target_date) < today);
    } else if (filterDate === 'no-date') {
      result = result.filter(goal => !goal.target_date);
    }
    
    setFilteredGoals(result);
  }, [searchQuery, filterStatus, filterDate, goals]);

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setFilteredGoals(prev => prev.filter(g => g.id !== id));
  };

  const getCompletionStats = () => {
    const completed = goals.filter(goal => goal.completed).length;
    const total = goals.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      completed,
      total,
      percentage
    };
  };

  const stats = getCompletionStats();

  return (
    <MainLayout title="Metas">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-green-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">
              Metas do Casal
            </h1>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-600">
                <Plus className="h-4 w-4 mr-1" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Meta</DialogTitle>
              </DialogHeader>
              <AddGoalForm 
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  fetchGoals();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Progress card */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 col-span-1 sm:col-span-2 flex flex-col justify-center items-center py-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.percentage}%
              </div>
              <p className="text-gray-500">Metas concluídas</p>
              <div className="w-48 h-2 bg-gray-200 rounded-full mt-3 mb-1">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${stats.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {stats.completed} de {stats.total} metas
              </p>
            </div>
          </div>
          
          {/* Status summary cards */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500">Concluídas</p>
                <p className="text-xl font-medium">{goals.filter(g => g.completed).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500">Pendentes</p>
                <p className="text-xl font-medium">{goals.filter(g => !g.completed).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-4">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="active">Pendentes</TabsTrigger>
                <TabsTrigger value="completed">Concluídas</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Pesquisar metas..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    <SelectItem value="upcoming">Futuras</SelectItem>
                    <SelectItem value="past">Passadas</SelectItem>
                    <SelectItem value="no-date">Sem data definida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {renderGoalList(filteredGoals)}
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              {renderGoalList(filteredGoals.filter(g => !g.completed))}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              {renderGoalList(filteredGoals.filter(g => g.completed))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );

  function renderGoalList(goalList: Goal[]) {
    if (isLoading) {
      return (
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
      );
    }
    
    if (goalList.length === 0) {
      return (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Nenhuma meta encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterStatus !== 'all' || filterDate !== 'all' ? 
              "Nenhuma meta corresponde aos seus filtros. Tente outros termos de busca ou limpe os filtros." : 
              "Você ainda não tem metas registradas. Adicione sua primeira meta para começar a planejar momentos especiais juntos."}
          </p>
          {(searchQuery || filterStatus !== 'all' || filterDate !== 'all') && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterDate('all');
              }}
              variant="outline"
              className="mt-4"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goalList.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdate={fetchGoals}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>
    );
  }
};

export default GoalsPage;
