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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Save, Eye, Trash2, Plus, LogOut, Maximize2, X } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";
import { Job, DynamicField } from "@/hooks/useJobs";
import { useToast } from "@/hooks/use-toast";

const jobSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  status: z.enum(["active", "inactive", "draft"]),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  requirements: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal(""))
});

type JobFormData = z.infer<typeof jobSchema>;

const AdminEditJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, updateJob, deleteJob } = useJobs();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationType, setLocationType] = useState<"remoto" | "especifico">("remoto");
  const [customFields, setCustomFields] = useState<DynamicField[]>([]);
  const [statusValue, setStatusValue] = useState<"active" | "inactive" | "draft">("draft");
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  // Campos sempre editáveis
  const isReadOnly = false;

  const job = id ? getJobById(id) : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      status: "draft"
    }
  });

  useEffect(() => {
    if (job) {
      console.log("Preenchendo formulário com dados da oportunidade:", job);
      console.log("Status do job:", job.status);
      const isRemote = job.location === "Remoto";
      setLocationType(isRemote ? "remoto" : "especifico");
      const jobStatus = (job.status || "draft") as "active" | "inactive" | "draft";
      setStatusValue(jobStatus);
      reset({
        title: job.title,
        location: job.location,
        status: jobStatus,
        description: job.description,
        requirements: job.requirements || "",
        contactEmail: job.contactEmail || "",
        website: job.website || ""
      });
      // Garantir que o status seja definido explicitamente
      setValue("status", jobStatus, { shouldValidate: true });
      // Carregar campos dinâmicos se existirem
      setCustomFields(job.customFields || []);
    }
  }, [job, reset, setValue]);

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

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true);
    setError("");

    // Validar campos dinâmicos
    const validCustomFields = customFields.filter(field => field.label.trim() !== "");
    if (customFields.length > 0 && validCustomFields.length !== customFields.length) {
      setError("Todos os campos dinâmicos devem ter um label preenchido.");
      setIsLoading(false);
      return;
    }

    try {
      const updatedData = {
        ...data,
        requirements: data.requirements || "",
        contactEmail: data.contactEmail || "",
        website: data.website || "",
        customFields: validCustomFields.length > 0 ? validCustomFields : undefined
      };
      
      // Verificar se os dados realmente mudaram
      const hasChanges = Object.keys(updatedData).some(key => {
        const originalValue = job[key as keyof typeof job];
        const newValue = updatedData[key as keyof typeof updatedData];
        return originalValue !== newValue;
      });
      
      if (!hasChanges) {
        toast({
          title: "Nenhuma alteração detectada",
          description: "Os dados da oportunidade não foram modificados.",
        });
        setIsLoading(false);
        return;
      }
      
      await updateJob(job.id, updatedData);
      
      toast({
        title: "Oportunidade atualizada com sucesso!",
        description: `A oportunidade "${data.title}" foi atualizada.`,
      });
      
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Erro ao atualizar oportunidade:", err);
      setError("Erro ao atualizar oportunidade. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
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

  const handlePreview = () => {
    navigate(`/admin/jobs/${job.id}`);
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
                  Editar Oportunidade
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
                disabled={isReadOnly}
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
          {/* Informações Básicas */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Informações Básicas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Preencha as informações principais da oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Título da Oportunidade *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Desenvolvedor Frontend React"
                    {...register("title")}
                    className="bg-input border-border text-foreground"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground">Localização *</Label>
                  <Select 
                    value={locationType}
                    onValueChange={(value: "remoto" | "especifico") => {
                      setLocationType(value);
                      if (value === "remoto") {
                        setValue("location", "Remoto");
                      } else {
                        setValue("location", "");
                      }
                    }}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground" disabled={isReadOnly}>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remoto">Remoto</SelectItem>
                      <SelectItem value="especifico">Local específico</SelectItem>
                    </SelectContent>
                  </Select>
                  {locationType === "especifico" && (
                    <Input
                      id="location"
                      placeholder="Ex: São Paulo, SP"
                      {...register("location")}
                      className="bg-input border-border text-foreground mt-2"
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                    />
                  )}
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground">Status</Label>
                <Select 
                  value={statusValue} 
                  onValueChange={(value) => {
                    const newStatus = value as "active" | "inactive" | "draft";
                    setStatusValue(newStatus);
                    setValue("status", newStatus, { shouldValidate: true });
                  }} 
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="bg-input border-border text-foreground" disabled={isReadOnly}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Descrição da Oportunidade</CardTitle>
              <CardDescription className="text-muted-foreground">
                Descreva as responsabilidades e atividades da oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-foreground">Descrição *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDescriptionModalOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                    title="Expandir para edição em tela cheia"
                  >
                    <Maximize2 className="h-4 w-4 mr-1" />
                    Expandir
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Descreva as principais responsabilidades e atividades da oportunidade..."
                  rows={4}
                  {...register("description")}
                  className="bg-input border-border text-foreground"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Modal de Descrição em Tela Cheia */}
          <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] flex flex-col p-0 gap-0 translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                <DialogTitle className="text-foreground">Editar Descrição da Oportunidade</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto p-6">
                <Textarea
                  placeholder="Descreva as principais responsabilidades e atividades da oportunidade..."
                  {...register("description")}
                  className="bg-input border-border text-foreground w-full h-full min-h-[calc(95vh-200px)] resize-none font-mono text-sm"
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-2">{errors.description.message}</p>
                )}
              </div>
              <DialogFooter className="px-6 py-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDescriptionModalOpen(false)}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Requisitos */}
          {/* <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Requisitos</CardTitle>
              <CardDescription className="text-muted-foreground">
                Liste os requisitos e qualificações necessárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-foreground">Requisitos</Label>
                <Textarea
                  id="requirements"
                  placeholder="• Experiência com React&#10;• Conhecimento em TypeScript&#10;• Experiência com Git"
                  rows={4}
                  {...register("requirements")}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </CardContent>
          </Card> */}


          {/* Contato */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Informações de Contato</CardTitle>
              <CardDescription className="text-muted-foreground">
                Informações para candidatos entrarem em contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-foreground">Email de Contato</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="Ex: rh@empresa.com"
                    {...register("contactEmail")}
                    className="bg-input border-border text-foreground"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-foreground">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="Ex: https://exemplo.com"
                    {...register("website")}
                    className="bg-input border-border text-foreground"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campos Dinâmicos */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Campos Dinâmicos do Formulário</CardTitle>
              <CardDescription className="text-muted-foreground">
                Adicione campos personalizados ao formulário de candidatura (texto ou booleano)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end p-4 border border-border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Label do Campo</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[index].label = e.target.value;
                          setCustomFields(updated);
                        }}
                        placeholder="Ex: Possui experiência com React?"
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Tipo</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: "text" | "boolean" | "file") => {
                          const updated = [...customFields];
                          updated[index].type = value;
                          setCustomFields(updated);
                        }}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Campo de Texto</SelectItem>
                          <SelectItem value="boolean">Campo Booleano (Sim/Não)</SelectItem>
                          <SelectItem value="file">Upload de Arquivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required || false}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[index].required = e.target.checked;
                          setCustomFields(updated);
                        }}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`required-${field.id}`} className="text-foreground cursor-pointer">
                        Obrigatório
                      </Label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomFields(customFields.filter((_, i) => i !== index));
                    }}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCustomFields([
                    ...customFields,
                    {
                      id: `field-${Date.now()}`,
                      label: "",
                      type: "text",
                      required: false
                    }
                  ]);
                }}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Campo
              </Button>
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
            <Button type="submit" disabled={isLoading || isReadOnly} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditJob;
