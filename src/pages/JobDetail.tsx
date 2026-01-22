import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobs } from "@/contexts/JobsContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById, isLoading } = useJobs();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const job = id ? getJobById(id) : null;

  const handleShare = async () => {
    if (!job || !id) return;

    const url = `${window.location.origin}/portal/jobs/${id}`;
    const shareData = {
      title: job.title,
      text: `Confira esta oportunidade: ${job.title} - ${job.location}`,
      url: url,
    };

    try {
      // Tentar usar a Web Share API se disponível (principalmente em dispositivos móveis)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Compartilhado!",
          description: "A oportunidade foi compartilhada com sucesso.",
        });
      } else {
        // Fallback: copiar URL para a área de transferência
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copiado!",
          description: "O link da oportunidade foi copiado para a área de transferência.",
        });
      }
    } catch (error) {
      // Se o usuário cancelar o compartilhamento, não mostrar erro
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Erro ao compartilhar:", error);
        // Tentar fallback de copiar
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "Link copiado!",
            description: "O link da oportunidade foi copiado para a área de transferência.",
          });
        } catch (clipboardError) {
          toast({
            title: "Erro ao compartilhar",
            description: "Não foi possível compartilhar a oportunidade. Tente novamente.",
            variant: "destructive",
          });
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-secondary rounded-lg"></div>
                <div className="h-32 bg-secondary rounded-lg"></div>
                <div className="h-48 bg-secondary rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-secondary rounded-lg"></div>
                <div className="h-48 bg-secondary rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Oportunidades
          </Button>
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              Oportunidade não encontrada ou não está mais disponível.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Oportunidades
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="p-6 border-border bg-card">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 text-foreground">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  Tecnologia
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Publicado em {new Date(job.postedAt).toLocaleDateString('pt-BR')} • {job.applications} candidatos
                </span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleShare}
                  title="Compartilhar oportunidade"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 border-border bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Sobre a oportunidade
              </h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card className="p-6 border-border bg-card">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Requisitos
                </h2>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </div>
              </Card>
            )}


            {/* Contact Information */}
            {(job.contactEmail || job.website) && (
              <Card className="p-6 border-border bg-card">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Informações de Contato
                </h2>
                <div className="space-y-3">
                  {job.contactEmail && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{job.contactEmail}</span>
                    </div>
                  )}
                  {job.website && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Website:</span>
                      <a 
                        href={job.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {job.website}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card - Sticky */}
            <Card className="p-6 border-border bg-card sticky top-24">
              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mb-4"
                onClick={() => {
                  if (user && id) {
                    navigate(`/apply/${id}`);
                  } else if (id) {
                    navigate(`/login?jobId=${id}`);
                  } else {
                    navigate("/login");
                  }
                }}
              >
                Candidatar-se à oportunidade
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Seu perfil será enviado diretamente para o recrutador
              </p>
            </Card>

            {/* Job Info */}
            <Card className="p-6 border-border bg-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Informações da Oportunidade
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Setor</p>
                    <p className="text-foreground font-medium">Tecnologia</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Localização</p>
                    <p className="text-foreground font-medium">{job.location}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Job Stats */}
            <Card className="p-6 border-border bg-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Estatísticas da Oportunidade
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Publicada em</span>
                  <span className="text-foreground font-medium">
                    {new Date(job.postedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-foreground font-medium">
                    {job.status === 'active' ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
