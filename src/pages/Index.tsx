
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MonthCalendar from "@/components/Calendar/MonthCalendar";
import AuthForm from "@/components/Auth/AuthForm";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Calendar, Award, Target, Heart, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSparklePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (!user) {
    return (
      <div 
        className="min-h-screen relative bg-gradient-to-br from-[#fdfcfb] via-[#fde1d3] to-[#ffdee2] py-12 px-4 transition-all duration-300 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(253, 252, 251, 0.9), rgba(253, 225, 211, 0.9), rgba(255, 222, 226, 0.9)),
            url('https://cdn-images.dzcdn.net/images/cover/2086f97d00c0926e9455b7fd858fd323/0x1900-000000-80-0-0.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 animate-float">
            <Heart className="w-6 h-6 text-pink-200/30" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float-delayed">
            <Heart className="w-8 h-8 text-pink-200/30" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative">
          <div 
            className="text-center space-y-4 animate-fade-in"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
          >
            <div className="relative inline-block group">
              <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3 transition-all duration-300 transform group-hover:scale-105">
                <Calendar className={`h-8 w-8 text-pink-400 transition-all duration-300 ${isHovered ? 'rotate-12' : ''}`} />
                Calendário Romântico
                <Heart 
                  className={`h-8 w-8 text-pink-500 fill-pink-500 transition-all duration-500 ${
                    isHovered ? 'scale-125 animate-pulse' : ''
                  }`} 
                />
              </h1>
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent transition-all duration-300 ${
                isHovered ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
              }`} />
              <Sparkles 
                className="absolute text-yellow-400 w-6 h-6 transition-all duration-200 pointer-events-none"
                style={{
                  left: `${sparklePosition.x}px`,
                  top: `${sparklePosition.y}px`,
                  transform: 'translate(-50%, -50%)',
                  opacity: isHovered ? 1 : 0
                }}
              />
            </div>
            
            <p className="text-gray-600 text-lg flex items-center justify-center gap-2 transition-all duration-300 hover:text-gray-800 relative z-10">
              <span className="flex items-center gap-2 group cursor-pointer">
                <span className="transition-all duration-300 group-hover:translate-x-1">
                  Entre para começar sua jornada romântica
                </span>
                <ArrowRight className="h-4 w-4 text-pink-400 animate-pulse group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </p>
          </div>
          
          <div className="flex justify-center p-8 bg-white/30 rounded-xl border border-pink-100/50 shadow-xl hover:shadow-pink-100/30 transition-all duration-300">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-3 md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              Seu Calendário Romântico
            </h2>
            <MonthCalendar />
          </div>
        </div>
        
        <div className="col-span-3 md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Marcos Especiais
            </h2>
            <p className="text-gray-600 text-sm">
              Registre e celebre os momentos mais importantes do seu relacionamento.
            </p>
            <Button 
              className="w-full bg-purple-500 hover:bg-purple-600"
              onClick={() => navigate('/milestones')}
            >
              Ver Marcos
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Metas do Casal
            </h2>
            <p className="text-gray-600 text-sm">
              Planeje juntos seus objetivos e acompanhe o progresso de vocês.
            </p>
            <Button 
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() => navigate('/goals')}
            >
              Ver Metas
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-6 rounded-xl shadow-sm border border-pink-200 space-y-4">
            <div className="flex justify-center">
              <Heart className="h-12 w-12 text-pink-500 animate-pulse" fill="rgba(236, 72, 153, 0.5)" />
            </div>
            <h2 className="text-center text-lg font-medium text-pink-800">
              Dica do dia
            </h2>
            <p className="text-center text-pink-700">
              "Reserve um tempo toda semana para conversarem sobre o que estão sentindo e compartilhar seus sonhos para o futuro."
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
