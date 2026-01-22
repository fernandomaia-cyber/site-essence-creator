import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Building2,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Eye,
  LogOut
} from "lucide-react";
import { useCandidates, Candidate } from "@/contexts/CandidatesContext";
import { useJobs } from "@/contexts/JobsContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";

const AdminViewCandidate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCandidateById, deleteCandidate, updateCandidate } = useCandidates();
  const { getJobById } = useJobs();
  const { toast } = useToast();

  const candidate = id ? getCandidateById(id) : null;
  const job = candidate?.jobId ? getJobById(candidate.jobId) : null;

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              Candidato não encontrado ou ID inválido.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate("/admin/dashboard")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

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

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este candidato? Esta ação não pode ser desfeita.")) {
      deleteCandidate(candidate.id);
      toast({
        title: "Candidato excluído com sucesso!",
        description: `O candidato "${candidate.name}" foi removido da lista.`,
      });
      // Voltar para o job se existir, senão para o dashboard
      if (candidate.jobId) {
        navigate(`/admin/jobs/${candidate.jobId}`);
      } else {
        navigate("/admin/dashboard");
      }
    }
  };

  const handleBack = () => {
    // Voltar para o job correspondente se existir, senão para o dashboard
    if (candidate.jobId) {
      navigate(`/admin/jobs/${candidate.jobId}`);
    } else {
      navigate("/admin/dashboard");
    }
  };

  const handleLogout = () => {
    // Limpar toda a sessão
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminSession");
    navigate("/admin");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!candidate || candidate.status === newStatus) return;
    
    try {
      await updateCandidate(candidate.id, { status: newStatus as Candidate["status"] });
      toast({
        title: "Status atualizado",
        description: `O status do candidato "${candidate.name}" foi atualizado para "${getStatusLabel(newStatus)}".`,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Novo";
      case "technical_evaluation":
        return "Avaliação Técnica";
      case "technical_analysis":
        return "Análise Técnica";
      case "interview":
        return "Entrevista";
      case "approved":
        return "Aprovado";
      case "homologated":
        return "Homologado";
      case "rejected":
        return "Reprovado";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-4 text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src="/portal/logo.svg" 
                  alt="DOT Digital Group" 
                  className="h-6 w-auto brightness-0 invert"
                />
                <h1 className="text-xl font-semibold text-foreground">
                  Visualizar Candidato
                </h1>
              </div>
            </div>
            <div className="flex space-x-2">
              {/* <Button 
                variant="outline"
                onClick={() => navigate(`/admin/candidates/${candidate.id}/edit`)}
                className="border-border text-foreground hover:bg-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button> */}
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="border-border text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-border text-foreground hover:bg-secondary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Cabeçalho do Candidato */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-foreground">{candidate.name}</CardTitle>
                  <CardDescription className="text-lg mt-2 text-muted-foreground">
                    {candidate.email}
                  </CardDescription>
                </div>
                {getStatusBadge(candidate.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{candidate.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    Candidatou-se em {new Date(candidate.appliedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da oportunidade */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Briefcase className="h-5 w-5 mr-2" />
                Oportunidade Candidatada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{candidate.jobTitle}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{candidate.company}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experiência */}
          {candidate.experience && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Experiência Profissional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{candidate.experience}</p>
              </CardContent>
            </Card>
          )}

          {/* Educação */}
          {candidate.education && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Formação Acadêmica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{candidate.education}</p>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {candidate.notes && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="h-5 w-5 mr-2" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{candidate.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Currículo */}
          {candidate.resume && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="h-5 w-5 mr-2" />
                  Currículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (!candidate.resume) {
                        throw new Error("Currículo não encontrado");
                      }

                      let downloadUrl = candidate.resume;
                      
                      // Se já for uma URL HTTP completa, usar diretamente
                      if (candidate.resume.startsWith("http://") || candidate.resume.startsWith("https://")) {
                        downloadUrl = candidate.resume;
                      } else {
                        // Se for um caminho do Storage (gs:// ou caminho relativo), obter URL de download
                        try {
                          const resumeRef = ref(storage, candidate.resume);
                          downloadUrl = await getDownloadURL(resumeRef);
                        } catch (storageError) {
                          // Se falhar, tentar como caminho completo
                          console.warn("Tentando caminho alternativo:", storageError);
                          const resumeRef = ref(storage, `resumes/${candidate.resume}`);
                          downloadUrl = await getDownloadURL(resumeRef);
                        }
                      }
                      
                      // Abrir URL em nova aba para download
                      if (downloadUrl) {
                        const link = document.createElement("a");
                        link.href = downloadUrl;
                        link.download = candidate.resume.split("/").pop() || "curriculo.pdf";
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        toast({
                          title: "Download iniciado",
                          description: "O currículo está sendo baixado.",
                        });
                      } else {
                        throw new Error("URL do currículo não encontrada");
                      }
                    } catch (error) {
                      console.error("Erro ao baixar currículo:", error);
                      toast({
                        title: "Erro ao baixar currículo",
                        description: error instanceof Error ? error.message : "Não foi possível baixar o currículo. Verifique se o arquivo existe.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Baixar Currículo
                </Button>
                {candidate.resume && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {typeof candidate.resume === "string" && candidate.resume.length > 50 
                      ? candidate.resume.substring(0, 50) + "..." 
                      : candidate.resume}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Campos Dinâmicos */}
          {job?.customFields && job.customFields.length > 0 && candidate?.customFieldsData && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <FileText className="h-5 w-5 mr-2" />
                  Campos Adicionais
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Informações adicionais fornecidas pelo candidato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.customFields.map((field) => {
                    const fieldValue = candidate.customFieldsData?.[field.id];
                    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
                      return null;
                    }

                    return (
                      <div key={field.id} className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <div className="p-3 bg-secondary rounded-lg">
                          {field.type === "boolean" ? (
                            <span className="text-foreground">
                              {fieldValue === true ? "Sim" : fieldValue === false ? "Não" : "Não informado"}
                            </span>
                          ) : field.type === "file" ? (
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const fileUrl = fieldValue as string;
                                    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
                                      window.open(fileUrl, "_blank");
                                    } else {
                                      const fileRef = ref(storage, fileUrl);
                                      const downloadUrl = await getDownloadURL(fileRef);
                                      window.open(downloadUrl, "_blank");
                                    }
                                    toast({
                                      title: "Arquivo aberto",
                                      description: "O arquivo foi aberto em uma nova aba.",
                                    });
                                  } catch (error) {
                                    console.error("Erro ao abrir arquivo:", error);
                                    toast({
                                      title: "Erro ao abrir arquivo",
                                      description: "Não foi possível abrir o arquivo.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="border-border text-foreground hover:bg-secondary"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Ver Arquivo
                              </Button>
                            </div>
                          ) : (
                            <p className="text-foreground whitespace-pre-wrap">{String(fieldValue)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Eye className="h-5 w-5 mr-2" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground block">Status Atual</Label>
                  <Select 
                    value={candidate.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="technical_evaluation">Avaliação Técnica</SelectItem>
                      <SelectItem value="technical_analysis">Análise Técnica</SelectItem>
                      <SelectItem value="interview">Entrevista</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="homologated">Homologado</SelectItem>
                      <SelectItem value="rejected">Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-center">
                    {getStatusBadge(candidate.status)}
                  </div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.floor((Date.now() - new Date(candidate.appliedAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias desde a candidatura</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminViewCandidate;

