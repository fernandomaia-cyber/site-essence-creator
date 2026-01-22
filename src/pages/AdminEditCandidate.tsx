import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Eye, Trash2, LogOut } from "lucide-react";
import { useCandidates, Candidate } from "@/contexts/CandidatesContext";
import { useToast } from "@/hooks/use-toast";

const candidateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  jobTitle: z.string().min(1, "Oportunidade é obrigatória"),
  company: z.string().min(1, "Empresa é obrigatória"),
  status: z.enum(["new", "technical_evaluation", "technical_analysis", "interview", "approved", "homologated", "rejected"]),
  resume: z.string().optional(),
  notes: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional()
});

type CandidateFormData = z.infer<typeof candidateSchema>;

const AdminEditCandidate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCandidateById, updateCandidate, deleteCandidate } = useCandidates();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const candidate = id ? getCandidateById(id) : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema)
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (candidate) {
      reset({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        jobTitle: candidate.jobTitle,
        company: candidate.company,
        status: candidate.status,
        resume: candidate.resume || "",
        notes: candidate.notes || "",
        experience: candidate.experience || "",
        education: candidate.education || ""
      });
      // Garantir que o status seja definido explicitamente
      setValue("status", candidate.status);
    }
  }, [candidate, reset, setValue]);

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

  const onSubmit = async (data: CandidateFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const updatedData = {
        ...data,
        resume: data.resume || undefined,
        notes: data.notes || undefined,
        experience: data.experience || undefined,
        education: data.education || undefined
      };
      
      const hasChanges = Object.keys(updatedData).some(key => {
        const originalValue = candidate[key as keyof typeof candidate];
        const newValue = updatedData[key as keyof typeof updatedData];
        return originalValue !== newValue;
      });
      
      if (!hasChanges) {
        toast({
          title: "Nenhuma alteração detectada",
          description: "Os dados do candidato não foram modificados.",
        });
        setIsLoading(false);
        return;
      }
      
      updateCandidate(candidate.id, updatedData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Candidato atualizado com sucesso!",
        description: `O candidato "${data.name}" foi atualizado.`,
      });
      
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Erro ao atualizar candidato:", err);
      setError("Erro ao atualizar candidato. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este candidato? Esta ação não pode ser desfeita.")) {
      deleteCandidate(candidate.id);
      toast({
        title: "Candidato excluído com sucesso!",
        description: `O candidato "${candidate.name}" foi removido da lista.`,
      });
      navigate("/admin/dashboard");
    }
  };

  const handlePreview = () => {
    navigate(`/admin/candidates/${candidate.id}`);
  };

  const handleLogout = () => {
    // Limpar toda a sessão
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminSession");
    navigate("/admin");
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
                  Editar Candidato
                </h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePreview} className="border-border text-foreground hover:bg-secondary">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Pessoais */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Informações Pessoais</CardTitle>
              <CardDescription className="text-muted-foreground">
                Dados pessoais do candidato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: João Silva"
                    {...register("name")}
                    className="bg-input border-border text-foreground"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: joao.silva@email.com"
                    {...register("email")}
                    className="bg-input border-border text-foreground"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="Ex: (11) 98765-4321"
                  {...register("phone")}
                  className="bg-input border-border text-foreground"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações da Oportunidade */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Informações da Oportunidade</CardTitle>
              <CardDescription className="text-muted-foreground">
              Oportunidade para a qual o candidato se candidatou
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-foreground">Oportunidade *</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Ex: Desenvolvedor Frontend React"
                    {...register("jobTitle")}
                    className="bg-input border-border text-foreground"
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-destructive">{errors.jobTitle.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-foreground">Empresa *</Label>
                  <Input
                    id="company"
                    placeholder="Ex: TechCorp"
                    {...register("company")}
                    className="bg-input border-border text-foreground"
                  />
                  {errors.company && (
                    <p className="text-sm text-destructive">{errors.company.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground">Status</Label>
                <Select value={statusValue} onValueChange={(value) => setValue("status", value as Candidate["status"])}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selecione o status" />
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
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Experiência */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Experiência Profissional</CardTitle>
              <CardDescription className="text-muted-foreground">
                Histórico profissional do candidato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-foreground">Experiência</Label>
                <Textarea
                  id="experience"
                  placeholder="Descreva a experiência profissional do candidato..."
                  rows={4}
                  {...register("experience")}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Educação */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Formação Acadêmica</CardTitle>
              <CardDescription className="text-muted-foreground">
                Educação e formação do candidato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="education" className="text-foreground">Formação</Label>
                <Textarea
                  id="education"
                  placeholder="Descreva a formação acadêmica do candidato..."
                  rows={4}
                  {...register("education")}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Notas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Observações e notas sobre o candidato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre o candidato..."
                  rows={4}
                  {...register("notes")}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Currículo */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Currículo</CardTitle>
              <CardDescription className="text-muted-foreground">
                Arquivo do currículo do candidato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-foreground">Nome do Arquivo</Label>
                <Input
                  id="resume"
                  placeholder="Ex: joao_silva_cv.pdf"
                  {...register("resume")}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/dashboard")}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditCandidate;

