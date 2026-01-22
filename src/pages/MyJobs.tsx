import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Calendar, 
  Building2, 
  Eye,
  FileText,
  Loader2
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useCandidates } from "@/contexts/CandidatesContext";
import { useJobs } from "@/contexts/JobsContext";
import { Candidate } from "@/contexts/CandidatesContext";

const MyJobs = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myApplications, setMyApplications] = useState<Candidate[]>([]);
  const navigate = useNavigate();
  const { candidates, isLoading: isLoadingCandidates } = useCandidates();
  const { jobs, getJobById } = useJobs();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Se não estiver autenticado, redirecionar para login
        navigate("/login");
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user && candidates.length > 0) {
      // Filtrar candidaturas do usuário atual
      const userApplications = candidates.filter(
        (candidate) => candidate.candidateUserId === user.uid || candidate.email === user.email
      );
      setMyApplications(userApplications);
    }
  }, [user, candidates]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-gray-100 text-gray-800">Novo</Badge>;
      case "technical_evaluation":
        return <Badge className="bg-blue-100 text-blue-800">Avaliação Técnica</Badge>;
      case "technical_analysis":
        return <Badge className="bg-indigo-100 text-indigo-800">Análise Técnica</Badge>;
      case "interview":
        return <Badge className="bg-purple-100 text-purple-800">Entrevista</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case "homologated":
        return <Badge className="bg-emerald-100 text-emerald-800">Homologado</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Reprovado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading || isLoadingCandidates) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Vagas</h1>
            <p className="text-muted-foreground">
              Veja todas as oportunidades para as quais você se candidatou
            </p>
          </div>

          {myApplications.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Alert>
                  <AlertDescription className="text-center py-4">
                    Você ainda não se candidatou a nenhuma oportunidade.
                    <Button
                      variant="link"
                      onClick={() => navigate("/")}
                      className="ml-2 p-0 h-auto"
                    >
                      Ver oportunidades disponíveis
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myApplications.map((application) => {
                const job = application.jobId ? getJobById(application.jobId) : null;
                
                return (
                  <Card key={application.id} className="bg-card border-border hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-foreground mb-2">
                            {job?.title || application.jobTitle}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {job?.company || application.company}
                          </CardDescription>
                        </div>
                        {/* {getStatusBadge(application.status)} */}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {job?.location && (
                          <div className="flex items-center space-x-2 text-sm text-foreground">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-foreground">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Candidatado em {new Date(application.appliedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      {job?.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        {job && (
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="border-border text-foreground hover:bg-secondary"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        )}
                        {application.resume && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(application.resume, '_blank')}
                            className="border-border text-foreground hover:bg-secondary"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Currículo
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyJobs;

