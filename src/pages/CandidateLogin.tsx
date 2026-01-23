import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const CandidateLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Aguardar o estado de autenticação ser atualizado antes de redirecionar
      // Isso evita problemas de race condition com o onAuthStateChanged no ApplyJob
      await new Promise<void>((resolve) => {
        // Verificar se o usuário já está disponível imediatamente
        if (auth.currentUser) {
          resolve();
          return;
        }
        
        // Caso contrário, aguardar o onAuthStateChanged
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe();
            resolve();
          }
        });
        
        // Timeout de segurança (3 segundos)
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 3000);
      });
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o formulário de candidatura...",
      });

      // Pequeno delay adicional para garantir que o estado foi propagado
      setTimeout(() => {
        // Redirecionar para o formulário de candidatura
        if (jobId) {
          navigate(`/apply/${jobId}`);
        } else {
          navigate("/");
        }
      }, 200);
    } catch (err: any) {
      console.error("Erro ao fazer login:", err);
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "Usuário não encontrado. Faça o cadastro primeiro.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Senha incorreta. Tente novamente.";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email inválido.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
      } else if (err.code === "auth/user-disabled") {
        errorMessage = "Esta conta foi desabilitada. Entre em contato com o suporte.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(jobId ? `/jobs/${jobId}` : "/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="max-w-md mx-auto">
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">Login</CardTitle>
              <CardDescription className="text-muted-foreground">
                Faça login para se candidatar à oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-input border-border text-foreground"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-input border-border text-foreground"
                      required
                    />
                  </div>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary hover:underline"
                    onClick={() => navigate(`/register${jobId ? `?jobId=${jobId}` : ""}`)}
                  >
                    Cadastre-se
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CandidateLogin;

