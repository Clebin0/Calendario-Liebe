
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Calendar, Target, Award, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout = ({ children, title = "Calendário liebe" }: MainLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Até logo! ❤️",
        description: "Esperamos você em breve!",
        className: "bg-pink-50 border-pink-200",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível sair. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const navigateTo = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#fde1d3] to-[#ffdee2]">
      {/* Header with navigation */}
      <header className="bg-white/70 backdrop-blur-sm shadow-sm border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              <h1 className="ml-3 text-xl font-medium text-gray-800">{title}</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-gray-700 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => navigateTo('/')}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendário</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-gray-700 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => navigateTo('/milestones')}
              >
                <Award className="h-4 w-4" />
                <span>Marcos</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-gray-700 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => navigateTo('/goals')}
              >
                <Target className="h-4 w-4" />
                <span>Metas</span>
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </nav>
            
            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white/90 border-t border-pink-100 shadow-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start flex items-center gap-2 text-gray-700 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => navigateTo('/')}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendário</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start flex items-center gap-2 text-gray-700 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => navigateTo('/milestones')}
              >
                <Award className="h-4 w-4" />
                <span>Marcos</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start flex items-center gap-2 text-gray-700 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => navigateTo('/goals')}
              >
                <Target className="h-4 w-4" />
                <span>Metas</span>
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-pink-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>Calendário Romântico © {new Date().getFullYear()} - Todos os direitos reservados</p>
          <div className="flex justify-center items-center mt-2 space-x-2">
            <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
            <span>Criado com amor</span>
            <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
