import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar, 
  Users, 
  FileText,
  CheckCircle,
  Mail,
  Globe,
  Eye,
  Send,
  Phone,
  LogOut
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJobs } from "@/contexts/JobsContext";
import { useCandidates, Candidate } from "@/contexts/CandidatesContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

const AdminViewJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, deleteJob } = useJobs();
  const { getCandidatesByJobId, updateCandidate } = useCandidates();
  const { toast } = useToast();
  const [jobCandidates, setJobCandidates] = useState<Candidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const job = id ? getJobById(id) : null;

  const loadCandidates = useCallback(async () => {
    if (!id) return;
    setIsLoadingCandidates(true);
    try {
      const candidates = await getCandidatesByJobId(id);
      setJobCandidates(candidates);
    } catch (error) {
      console.error("Erro ao carregar candidatos:", error);
    } finally {
      setIsLoadingCandidates(false);
    }
  }, [id, getCandidatesByJobId]);

  useEffect(() => {
    if (id) {
      loadCandidates();
    }
  }, [id, loadCandidates]);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
            Oportunidade não encontrada ou ID inválido.
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
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inativa</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };


  const handleLogout = () => {
    // Limpar toda a sessão
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminSession");
    navigate("/admin");
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.")) {
      try {
        await deleteJob(job.id);
        toast({
          title: "Oportunidade excluída com sucesso!",
          description: `A oportunidade "${job.title}" foi removida da lista.`,
        });
        navigate("/admin/dashboard");
      } catch (error) {
        console.error("Erro ao excluir oportunidade:", error);
        toast({
          title: "Erro ao excluir oportunidade",
          description: "Não foi possível excluir a oportunidade. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (candidate: Candidate, newStatus: Candidate["status"]) => {
    if (candidate.status === newStatus) return;
    
    try {
      await updateCandidate(candidate.id, { status: newStatus });
      toast({
        title: "Status atualizado",
        description: `O status do candidato "${candidate.name}" foi atualizado.`,
      });
      // Recarregar lista de candidatos para refletir a mudança
      await loadCandidates();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSendForAnalysis = async (candidate: Candidate) => {
    try {
      // Verificar se já existe um supplier com este email
      const suppliersRef = collection(db, "suppliers");
      const existingSupplierQuery = query(
        suppliersRef,
        where("email", "==", candidate.email)
      );
      const existingSuppliers = await getDocs(existingSupplierQuery);

      // Se já existe, não criar duplicado
      if (!existingSuppliers.empty) {
        toast({
          title: "Fornecedor já existe",
          description: `O fornecedor "${candidate.name}" já está cadastrado na lista de fornecedores.`,
          variant: "default",
        });
      } else {
        // Criar registro na collection suppliers
        const supplierData = {
          nome: candidate.name,
          email: candidate.email,
          tipo: "PF", // Padrão: Pessoa Física (pode ser ajustado conforme necessário)
          categoria: "Recursos Humanos", // Categoria padrão para candidatos
          centroDeCusto: "RH", // Centro de custo padrão para candidatos
          createdAt: serverTimestamp(),
          updatedAt: null,
          // Campos adicionais para referência
          candidateId: candidate.id,
          jobId: candidate.jobId || job?.id || "",
          jobTitle: candidate.jobTitle || job?.title || "",
          phone: candidate.phone || "",
          sentForAnalysisAt: serverTimestamp(),
        };

        await addDoc(suppliersRef, supplierData);

        toast({
          title: "Candidato enviado para análise",
          description: `O candidato "${candidate.name}" foi enviado para análise e adicionado à lista de fornecedores.`,
        });
      }

      // Marcar como enviado para análise (sem alterar o status)
      await updateCandidate(candidate.id, { sentForAnalysis: true });
      
      // Recarregar lista de candidatos para refletir a mudança
      await loadCandidates();
    } catch (error) {
      console.error("Erro ao enviar candidato para análise:", error);
      toast({
        title: "Erro ao enviar para análise",
        description: "Não foi possível enviar o candidato para análise. Tente novamente.",
        variant: "destructive",
      });
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
                onClick={() => navigate("/admin/dashboard")}
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
                  Visualizar Oportunidade
                </h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                className="border-border text-foreground hover:bg-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
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
          {/* Cabeçalho da oportunidade */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-foreground">{job.title}</CardTitle>
                </div>
                {getStatusBadge(job.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{job.applications} candidaturas</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  Publicada em {new Date(job.postedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2" />
                Descrição da Oportunidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Requisitos */}
          {job.requirements && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Requisitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-foreground">
                  {job.requirements}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Informações de Contato */}
          {(job.contactEmail || job.website) && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.contactEmail && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{job.contactEmail}</span>
                    </div>
                  )}
                  {job.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={job.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {job.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Eye className="h-5 w-5 mr-2" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{job.applications}</div>
                  <div className="text-sm text-muted-foreground">Candidaturas</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {job.status === 'active' ? 'Ativa' : job.status === 'inactive' ? 'Inativa' : 'Rascunho'}
                  </div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-muted-foreground">Dias ativa</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Candidatos */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Users className="h-5 w-5 mr-2" />
                Candidatos ({jobCandidates.length})
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Lista de candidatos que se candidataram a esta oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCandidates ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando candidatos...
                </div>
              ) : jobCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum candidato se candidatou a esta oportunidade ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">Candidato</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-foreground">Data</TableHead>
                        <TableHead className="text-foreground">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-foreground font-medium">
                                {candidate.name}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{candidate.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={candidate.status}
                              onValueChange={(value: Candidate["status"]) => handleStatusChange(candidate, value)}
                            >
                              <SelectTrigger className="w-[200px]">
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
                          </TableCell>
                          <TableCell className="text-foreground">
                            {new Date(candidate.appliedAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                                className="text-primary hover:text-primary"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              
                              {/* Mostrar label ou botão de enviar para análise */}
                              {candidate.sentForAnalysis ? (
                                <span className="text-sm text-muted-foreground px-2 py-1 bg-blue-50 rounded-md">
                                  Enviado para análise
                                </span>
                              ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendForAnalysis(candidate)}
                                    className="border-primary text-primary hover:bg-primary/10"
                                  >
                                    <Send className="h-4 w-4 mr-1" />
                                    Enviar para análise
                                  </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminViewJob;
