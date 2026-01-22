import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar se já está autenticado ao carregar a página
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    const sessionStr = localStorage.getItem("adminSession");
    
    if (auth === "true" && sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        // Se a sessão ainda é válida, redirecionar para o dashboard
        if (now < expiresAt && session.email === "admin@dotgroup.com.br") {
          navigate("/admin/dashboard");
        } else {
          // Sessão expirada, limpar
          localStorage.removeItem("adminAuth");
          localStorage.removeItem("adminEmail");
          localStorage.removeItem("adminSession");
        }
      } catch (error) {
        // Sessão inválida, limpar
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminSession");
      }
    }
  }, [navigate]);

  // Verificar se o email é admin@dotgroup.com.br para desabilitar campos
  const isAdminEmail = email === "admin@dotgroup.com.br";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Autenticação mockada para admin@dotgroup.com.br
    if (email === "admin@dotgroup.com.br" && password === "Dotgroup@123") {
      // Criar sessão com timestamp
      const sessionData = {
        email: email,
        authenticated: true,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };
      
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminEmail", email);
      localStorage.setItem("adminSession", JSON.stringify(sessionData));
      
      navigate("/admin/dashboard");
    } else {
      setError("Credenciais inválidas. Tente novamente.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src="/portal/logo.svg" 
              alt="DOT Digital Group" 
              className="h-12 w-auto mx-auto brightness-0 invert"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Área Administrativa</CardTitle>
          <CardDescription className="text-muted-foreground">
            Faça login para acessar o painel de administração
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
                  placeholder="admin@dotgroup.com.br"
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          {/* <div className="mt-6 text-center text-sm text-muted-foreground"> */}
            {/* <p>Credenciais de teste:</p>
            <p>Email: admin@dotgroup.com.br</p>
            <p>Senha: admin123</p> */}
          {/* </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
