import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("adminAuth");
      const sessionStr = localStorage.getItem("adminSession");
      
      if (auth === "true" && sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          const now = new Date();
          const expiresAt = new Date(session.expiresAt);
          
          // Verificar se a sessão ainda é válida
          if (now < expiresAt && session.email === "admin@dotgroup.com.br") {
        setIsAuthenticated(true);
          } else {
            // Sessão expirada, limpar e redirecionar
            localStorage.removeItem("adminAuth");
            localStorage.removeItem("adminEmail");
            localStorage.removeItem("adminSession");
            setIsAuthenticated(false);
            navigate("/admin");
          }
        } catch (error) {
          // Sessão inválida, limpar e redirecionar
          localStorage.removeItem("adminAuth");
          localStorage.removeItem("adminEmail");
          localStorage.removeItem("adminSession");
          setIsAuthenticated(false);
          navigate("/admin");
        }
      } else {
        setIsAuthenticated(false);
        navigate("/admin");
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // O navigate já foi chamado
  }

  return <>{children}</>;
};

export default AdminRoute;
