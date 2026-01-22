import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { Briefcase } from "lucide-react";

export const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginClick = () => {
    // Se estiver na página de detalhes de uma vaga, passar o jobId
    const jobId = new URLSearchParams(location.search).get("jobId");
    // Também verificar se estamos na rota /jobs/:id
    const pathMatch = location.pathname.match(/\/jobs\/([^\/]+)/);
    const jobIdFromPath = pathMatch ? pathMatch[1] : null;
    
    if (jobId) {
      navigate(`/login?jobId=${jobId}`);
    } else if (jobIdFromPath) {
      navigate(`/login?jobId=${jobIdFromPath}`);
    } else {
      navigate("/login");
    }
  };

  const handleMyJobsClick = () => {
    navigate("/my-jobs");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/portal/logo.svg" 
            alt="DOT Digital Group" 
            className="h-10 w-auto hover:opacity-80 transition-opacity brightness-0 invert cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            Oportunidades
          </button>
          <a 
            href="https://dotgroup.com.br/sobre/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sobre
          </a>
          <a 
            href="https://dotgroup.com.br/contato/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </a>
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleMyJobsClick}
                    className="border-border text-foreground hover:bg-secondary"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Minhas Vagas
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  onClick={handleLoginClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Login
                </Button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
