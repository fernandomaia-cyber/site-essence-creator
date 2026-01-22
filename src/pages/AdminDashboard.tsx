import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LogOut, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  MapPin,
  Calendar,
  Users,
  Mail,
  Phone,
  FileText
} from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";
import { Job } from "@/hooks/useJobs";
import { useCandidates, Candidate } from "@/contexts/CandidatesContext";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [candidateSearchTerm, setCandidateSearchTerm] = useState("");
  const [candidateStatusFilter, setCandidateStatusFilter] = useState("all");
  const navigate = useNavigate();
  const { jobs, isLoading, deleteJob } = useJobs();
  const { candidates, isLoading: isLoadingCandidates, deleteCandidate } = useCandidates();
  const { toast } = useToast();

  useEffect(() => {
    // Debug: verificar candidatos carregados
    console.log(`[AdminDashboard] Total de candidatos: ${candidates.length}`, candidates);
  }, [candidates]);

  const handleLogout = () => {
    // Limpar toda a sessão
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminSession");
    navigate("/admin");
  };

  const handleDeleteJob = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (window.confirm("Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.")) {
      try {
        await deleteJob(id);
        toast({
          title: "oportunidade excluída com sucesso!",
          description: `A oportunidade "${job?.title}" foi removida da lista.`,
        });
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

  const getCandidateStatusBadge = (status: Candidate["status"]) => {
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

  const handleDeleteCandidate = (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    if (window.confirm("Tem certeza que deseja excluir este candidato? Esta ação não pode ser desfeita.")) {
      deleteCandidate(id);
      toast({
        title: "Candidato excluído com sucesso!",
        description: `O candidato "${candidate?.name}" foi removido da lista.`,
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
                         candidate.jobTitle.toLowerCase().includes(candidateSearchTerm.toLowerCase()) ||
                         candidate.company.toLowerCase().includes(candidateSearchTerm.toLowerCase());
    const matchesStatus = candidateStatusFilter === "all" || candidate.status === candidateStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(job => job.status === "active").length,
    inactive: jobs.filter(job => job.status === "inactive").length,
    draft: jobs.filter(job => job.status === "draft").length,
    totalApplications: jobs.reduce((sum, job) => sum + job.applications, 0)
  };

  if (isLoading || isLoadingCandidates) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/portal/logo.svg" 
                alt="DOT Digital Group" 
                className="h-8 w-auto brightness-0 invert"
              />
              <h1 className="text-xl font-semibold text-foreground">
                Painel Administrativo
              </h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-border text-foreground hover:bg-secondary">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total de Oportunidades</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Oportunidades Ativas</CardTitle>
              <Eye className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Oportunidades Inativas</CardTitle>
              <Eye className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Rascunhos</CardTitle>
              <Edit className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Candidaturas</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Abas de Oportunidades e Candidatos */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="jobs">Oportunidades</TabsTrigger>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
          </TabsList>

          {/* Aba de Oportunidades */}
          <TabsContent value="jobs" className="space-y-6">
            {/* Filtros e Ações */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-foreground">Gerenciar Oportunidades</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Visualize e gerencie todas as Oportunidades de emprego
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate("/admin/jobs/new")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova oportunidade
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-input border-border text-foreground"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="inactive">Inativas</SelectItem>
                      <SelectItem value="draft">Rascunhos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Oportunidades */}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Oportunidade</TableHead>
                      <TableHead className="text-foreground">Localização</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Candidaturas</TableHead>
                      <TableHead className="text-foreground">Data</TableHead>
                      <TableHead className="text-foreground">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.length === 0 ? (
                      <TableRow className="border-border">
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhuma oportunidade encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredJobs.map((job) => (
                        <TableRow key={job.id} className="border-border">
                          <TableCell>
                            <div className="font-medium text-foreground">{job.title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-foreground">{job.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(job.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-foreground">{job.applications}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-foreground">{new Date(job.postedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                                className="border-border text-foreground hover:bg-secondary"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                                className="border-border text-foreground hover:bg-secondary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-border text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteJob(job.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Candidatos */}
          <TabsContent value="candidates" className="space-y-6">
            {/* Filtros e Ações */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-foreground">Gerenciar Candidatos</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Visualize e gerencie todos os candidatos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, email, oportunidade ou empresa..."
                        value={candidateSearchTerm}
                        onChange={(e) => setCandidateSearchTerm(e.target.value)}
                        className="pl-10 bg-input border-border text-foreground"
                      />
                    </div>
                  </div>
                  <Select value={candidateStatusFilter} onValueChange={setCandidateStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-input border-border text-foreground">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="reviewed">Revisado</SelectItem>
                      <SelectItem value="interviewed">Entrevistado</SelectItem>
                      <SelectItem value="hired">Contratado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Candidatos */}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-foreground">Nome</TableHead>
                      <TableHead className="text-foreground">Email</TableHead>
                      <TableHead className="text-foreground">Telefone</TableHead>
                      <TableHead className="text-foreground">Oportunidade</TableHead>
                      <TableHead className="text-foreground">Empresa</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Data de Candidatura</TableHead>
                      <TableHead className="text-foreground">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.length === 0 ? (
                      <TableRow className="border-border">
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {candidates.length === 0 
                            ? "Nenhum candidato cadastrado ainda" 
                            : "Nenhum candidato encontrado com os filtros aplicados"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <TableRow key={candidate.id} className="border-border">
                          <TableCell>
                            <div className="font-medium text-foreground">{candidate.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-foreground">{candidate.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-foreground">{candidate.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{candidate.jobTitle}</TableCell>
                          <TableCell className="text-foreground">{candidate.company}</TableCell>
                          <TableCell>{getCandidateStatusBadge(candidate.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-foreground">{new Date(candidate.appliedAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                                className="border-border text-foreground hover:bg-secondary"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {/* <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/admin/candidates/${candidate.id}/edit`)}
                                className="border-border text-foreground hover:bg-secondary"
                              >
                                <Edit className="h-4 w-4" />
                              </Button> */}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-border text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteCandidate(candidate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
