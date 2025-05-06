import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      toast({
        title: isLogin ? "Login realizado! ❤️" : "Cadastro realizado! ❤️",
        description: isLogin
          ? "Bem-vindo(a) de volta!"
          : "Verifique seu email para confirmar o cadastro.",
        className: "bg-pink-50 border-pink-200",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-white/80 border-pink-100">
      <div className={`text-center space-y-2 transition-all duration-500 transform ${isLogin ? 'translate-y-0' : '-translate-y-2'}`}>
        <h2 className="text-2xl font-bold text-pink-800 flex items-center justify-center gap-2">
          {isLogin ? "Login" : "Cadastro"}
          <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
        </h2>
        <p className="text-gray-600">
          {isLogin
            ? "Entre para gerenciar suas datas especiais"
            : "Crie sua conta para começar"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-pink-200"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-pink-200"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600"
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : isLogin ? "Entrar" : "Cadastrar"}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-pink-600 hover:text-pink-700 text-sm transition-all duration-300 hover:scale-105 transform"
        >
          {isLogin
            ? "Não tem uma conta? Cadastre-se"
            : "Já tem uma conta? Faça login"}
        </button>
      </div>
    </Card>
  );
};

export default AuthForm;