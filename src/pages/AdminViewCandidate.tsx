import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCandidates, Candidate } from "@/contexts/CandidatesContext";
import { useJobs } from "@/contexts/JobsContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL } from "firebase/storage";

type CandidateStatus = Candidate["status"];

const EMAIL_TEMPLATES: Record<
  CandidateStatus,
  { subject: string; body: string }
> = {
  new: {
    subject: "Recebemos sua candidatura",
    body: `Olá, {candidateName}!\n\n Agradecemos o seu cadastro para a oportunidade de Fornecedor "{jobTitle}".\n\nSuas informações já fazem parte do nosso banco de fornecedores.\n\nAssim que tivermos uma demanda com o seu perfil, nosso time entrará em contato.\n\nAbraço,\nEquipe DOT Digital Group`,
  },
  technical_evaluation: {
    subject: "Sua candidatura está em avaliação técnica",
    body: `Olá! Como você está?\n\nAgora você está na etapa de avaliação técnica! 💚\n\nNa sequência, você receberá um e-mail com as instruções para a realização da avaliação técnica. O objetivo é conhecermos um pouco mais da sua entrega. \n\nVocê tem até 3 (três) dias para responder a avaliação através do e-mail recebido.\n\nQualquer dúvida ou necessidade de negociar o prazo, ficamos à disposição, ok?\n\nSucesso na realização da avaliação técnica e até logo! \n\nEquipe DOT ForHub`,
  },
  technical_analysis: {
    subject: "Sua candidatura está em análise técnica",
    body: `Olá, {candidateName}!\n\nSua candidatura para a vaga "{jobTitle}" está em análise técnica pela nossa equipe.\n\nAgradecemos sua paciência.\n\nAtenciosamente,\nEquipe DOT Digital Group`,
  },
  interview: {
    subject: "Convite para entrevista - {jobTitle}",
    body: "Olá, {candidateName}! Tudo bem?\n\nTô aqui pra dizer que você foi aprovado para a próxima etapa :)\n\nAgora teremos um bate-papo mais técnico.\n\nA conversa será para te conhecer um pouco mais, alinhar expectativas e tirar suas dúvidas.\n\nEsta conversa será remota, por vídeo chamada, e o link desse vídeo você receberá por e-mail em breve.\n\nNo horário combinado é só acessar o link que foi enviado à você por e-mail (por vezes o link da entrevista pode ter ido para a caixa de SPAM, pedimos para que confira lá também).\n\nCaso não seja possível participar ou tenha alguma dúvida, nos avise respondendo o e-mail que consta o link da vídeo chamada.\n\nEstamos à disposição!\n\nAbraços!\nEquipe DOT ForHub",
  },
  approved: {
    subject: "Parabéns! Você foi aprovado(a) - {jobTitle}",
    body: "Olá {candidateName}! Finalizamos a avaliação do seu perfil técnico para a oportunidade de Fornecedor Gestor de Biblioteca Virtual! Nas próximas semanas nossa equipe de Compras entrará em contato com você para dar continuidade ao processo, ok? Abraço, Equipe DOT ForHub 💚",
  },
  homologated: {
    subject: "Candidatura homologada - {jobTitle}",
    body: `Olá, {candidateName}!\n\nSua candidatura para a vaga "{jobTitle}" foi homologada.\n\nEm breve nossa equipe dará continuidade ao processo.\n\nAtenciosamente,\nEquipe DOT Digital Group`,
  },
  rejected: {
    subject: "Retorno sobre sua candidatura - {jobTitle}",
    body: `Olá, {candidateName}. Tudo bem? \n\nGostaríamos de agradecer por sua inscrição para a oportunidade de Fornecedor Gestor de Biblioteca Virtual.\n\n Obrigado pelo seu interesse em fazer parte do nosso time de fornecedores, ficamos muito felizes em ter pessoas como você com vontade de crescer conosco. \n\nDesta vez optamos por outro fornecedor considerando além dos requisitos da oportunidade, o projeto em que irá atuar. Mais uma vez, agradecemos e desejamos sucesso na sua trajetória! Abraços! Equipe DOT ForHub`,
  },
};

const AdminViewCandidate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCandidateById, deleteCandidate, updateCandidate } = useCandidates();
  const { getJobById } = useJobs();
  const { toast } = useToast();

  const candidate = id ? getCandidateById(id) : null;
  const job = candidate?.jobId ? getJobById(candidate.jobId) : null;

  const [emailModal, setEmailModal] = useState<{ newStatus: CandidateStatus } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

  const openEmailModal = async (newStatus: CandidateStatus) => {
    if (!candidate || candidate.status === newStatus) return;

    // Para "technical_analysis", atualiza o status direto (sem exigir envio de e-mail)
    if (newStatus === "technical_analysis") {
      try {
        await updateCandidate(candidate.id, { status: newStatus });
        toast({
          title: "Status atualizado",
          description: `O status foi alterado para "${getStatusLabel(newStatus)}".`,
        });
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive",
        });
      }
      return;
    }

    const template = EMAIL_TEMPLATES[newStatus];
    const jobTitle = job?.title ?? "a vaga";
    const subject = template.subject.replace(/\{jobTitle\}/g, jobTitle);
    const body = template.body
      .replace(/\{candidateName\}/g, candidate.name)
      .replace(/\{jobTitle\}/g, jobTitle);
    setEmailSubject(subject);
    setEmailBody(body);
    setEmailModal({ newStatus });
  };

  const closeEmailModal = () => {
    setEmailModal(null);
    setEmailSubject("");
    setEmailBody("");
  };

  const handleConfirmSendEmail = async () => {
    if (!emailModal || !candidate) return;
    setIsSendingEmail(true);
    try {
      await updateCandidate(candidate.id, { status: emailModal.newStatus });
      toast({
        title: "E-mail enviado e status atualizado",
        description: `O e-mail foi enviado para ${candidate.name} e o status foi alterado para "${getStatusLabel(emailModal.newStatus)}".`,
      });
      closeEmailModal();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail e atualizar o status.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-w-0">
        <div className="space-y-6 min-w-0 max-w-full">
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

          {/* Como ficou sabendo da vaga */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <FileText className="h-5 w-5 mr-2" />
                Como ficou sabendo da vaga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">
                {candidate.howDidYouHearAboutJob || "Não informado"}
              </p>
            </CardContent>
          </Card>

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
            <Card className="bg-card border-border min-w-0 max-w-full overflow-hidden">
              <CardHeader className="min-w-0">
                <CardTitle className="flex items-center text-foreground min-w-0">
                  <FileText className="h-5 w-5 mr-2 shrink-0" />
                  Campos Adicionais
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Informações adicionais fornecidas pelo candidato
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 max-w-full overflow-hidden">
                <div className="space-y-4 min-w-0 max-w-full">
                  {job.customFields.map((field) => {
                    const fieldValue = candidate.customFieldsData?.[field.id];
                    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
                      return null;
                    }

                    return (
                      <div key={field.id} className="space-y-2 min-w-0 max-w-full">
                        <Label className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <div className="p-3 bg-secondary rounded-lg min-w-0 max-w-full overflow-hidden">
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
                            <p 
                              className="text-foreground whitespace-pre-wrap w-full min-w-0 max-w-full overflow-hidden"
                              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                            >
                              {String(fieldValue)}
                            </p>
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
                    value={emailModal ? emailModal.newStatus : candidate.status}
                    onValueChange={(value: CandidateStatus) => openEmailModal(value)}
                  >
                    <SelectTrigger className="w-[200px] bg-background border-border text-foreground mx-auto">
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
                    {getStatusBadge(emailModal ? emailModal.newStatus : candidate.status)}
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

      {/* Modal de envio de e-mail ao alterar status */}
      <Dialog open={!!emailModal} onOpenChange={(open) => !open && closeEmailModal()}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Enviar e-mail ao candidato</DialogTitle>
            <DialogDescription>
              {emailModal && candidate && (
                <>
                  Alteração de status para{" "}
                  <strong>{getStatusLabel(emailModal.newStatus)}</strong> –{" "}
                  {candidate.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {emailModal && candidate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Assunto</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Mensagem</Label>
                <Textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="bg-input border-border text-foreground resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeEmailModal}
              className="border-border text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSendEmail}
              disabled={!emailModal || isSendingEmail}
            >
              {isSendingEmail ? "Enviando..." : "Confirmar enviar e-mail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminViewCandidate;

