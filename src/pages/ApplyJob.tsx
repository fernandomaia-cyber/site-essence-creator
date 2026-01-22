import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { useJobs } from "@/contexts/JobsContext";
import { useCandidates } from "@/contexts/CandidatesContext";
import { DynamicField } from "@/hooks/useJobs";
import { auth, db, storage } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, User } from "firebase/auth";

interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ApplyJob = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById } = useJobs();
  const { createCandidate } = useCandidates();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [notes, setNotes] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [customFieldsValues, setCustomFieldsValues] = useState<Record<string, string | boolean>>({});
  const [customFieldsFiles, setCustomFieldsFiles] = useState<Record<string, File>>({});

  const job = jobId ? getJobById(jobId) : null;

  useEffect(() => {
    // Verificar autenticação
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Se não estiver autenticado, redirecionar para login
        navigate(`/login?jobId=${jobId}`);
        return;
      }

      setUser(currentUser);
      
      // Buscar perfil do candidato
      try {
        const candidatesRef = collection(db, "candidates");
        const q = query(candidatesRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const candidateData = querySnapshot.docs[0].data();
          const profile: CandidateProfile = {
            id: querySnapshot.docs[0].id,
            userId: candidateData.userId || currentUser.uid,
            name: candidateData.name || "",
            email: candidateData.email || "",
            phone: candidateData.phone || "",
            createdAt: candidateData.createdAt?.toDate(),
            updatedAt: candidateData.updatedAt?.toDate(),
          };
          setCandidateProfile(profile);
          // Preencher os campos com os dados do perfil
          setName(profile.name);
          setEmail(profile.email);
          setPhone(profile.phone);
        } else {
          // Se não tiver perfil, usar dados do usuário autenticado
          setName(currentUser.displayName || "");
          setEmail(currentUser.email || "");
          setError("Perfil de candidato não encontrado. Você pode preencher os dados abaixo.");
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setError("Erro ao carregar perfil do candidato.");
      } finally {
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [jobId, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!job) {
      setError("Oportunidade não encontrada. Tente novamente.");
      setIsLoading(false);
      return;
    }

    // Validações básicas
    if (!name || !email) {
      setError("Nome e email são obrigatórios.");
      setIsLoading(false);
      return;
    }

    // Validar campos dinâmicos obrigatórios
    if (job.customFields && job.customFields.length > 0) {
      for (const field of job.customFields) {
        if (field.required) {
          if (field.type === "file") {
            // Para campos de arquivo, verificar se foi selecionado
            if (!customFieldsFiles[field.id]) {
              setError(`O campo "${field.label}" é obrigatório.`);
              setIsLoading(false);
              return;
            }
          } else if (field.type === "boolean") {
            // Para campos booleanos, apenas verificar se foi selecionado (não pode ser undefined)
            const value = customFieldsValues[field.id];
            if (value === undefined) {
              setError(`O campo "${field.label}" é obrigatório.`);
              setIsLoading(false);
              return;
            }
          } else {
            // Para campos de texto, verificar se não está vazio
            const value = customFieldsValues[field.id];
            if (value === undefined || value === "") {
              setError(`O campo "${field.label}" é obrigatório.`);
              setIsLoading(false);
              return;
            }
          }
        }
      }
    }

    try {
      // Criar ou atualizar perfil do candidato se necessário
      let candidateId = candidateProfile?.id;
      
      if (!candidateProfile) {
        // Criar perfil do candidato se não existir
        const candidatesRef = collection(db, "candidates");
        const newCandidateDoc = await addDoc(candidatesRef, {
          userId: user.uid,
          name,
          email,
          phone,
          createdAt: Timestamp.now(),
        });
        candidateId = newCandidateDoc.id;
      } else if (name !== candidateProfile.name || email !== candidateProfile.email || phone !== candidateProfile.phone) {
        // Atualizar perfil se os dados foram alterados
        const candidateRef = doc(db, "candidates", candidateProfile.id);
        await updateDoc(candidateRef, {
          name,
          email,
          phone,
          updatedAt: Timestamp.now(),
        });
      }

      // Fazer upload do currículo se houver
      let resumeUrl = "";
      if (resume) {
        try {
          // Validar tamanho do arquivo (máximo 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB em bytes
          if (resume.size > maxSize) {
            setError("O arquivo do currículo é muito grande. O tamanho máximo é 5MB.");
            setIsLoading(false);
            return;
          }

          // Validar tipo de arquivo (apenas PDF)
          if (resume.type !== "application/pdf") {
            setError("Apenas arquivos PDF são aceitos para o currículo.");
            setIsLoading(false);
            return;
          }

          // Criar referência no Storage
          const resumeRef = ref(storage, `resumes/${user.uid}/${job.id}_${Date.now()}_${resume.name}`);
          
          // Fazer upload do arquivo
          const snapshot = await uploadBytes(resumeRef, resume);
          
          // Obter URL de download
          resumeUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.error("Erro ao fazer upload do currículo:", uploadError);
          setError("Erro ao fazer upload do currículo. Tente novamente.");
          setIsLoading(false);
          return;
        }
      }

      // Fazer upload dos arquivos dos campos dinâmicos
      const customFieldsFileUrls: Record<string, string> = {};
      if (job.customFields && job.customFields.length > 0) {
        for (const field of job.customFields) {
          if (field.type === "file" && customFieldsFiles[field.id]) {
            try {
              const file = customFieldsFiles[field.id];
              
              // Validar tamanho do arquivo (máximo 50MB para permitir vídeos)
              const maxSize = 50 * 1024 * 1024; // 50MB em bytes
              if (file.size > maxSize) {
                setError(`O arquivo do campo "${field.label}" é muito grande. O tamanho máximo é 50MB.`);
                setIsLoading(false);
                return;
              }

              // Criar referência no Storage
              const fileRef = ref(storage, `custom-fields/${user.uid}/${job.id}/${field.id}_${Date.now()}_${file.name}`);
              
              // Fazer upload do arquivo
              const snapshot = await uploadBytes(fileRef, file);
              
              // Obter URL de download
              const fileUrl = await getDownloadURL(snapshot.ref);
              customFieldsFileUrls[field.id] = fileUrl;
            } catch (uploadError) {
              console.error(`Erro ao fazer upload do arquivo do campo "${field.label}":`, uploadError);
              setError(`Erro ao fazer upload do arquivo do campo "${field.label}". Tente novamente.`);
              setIsLoading(false);
              return;
            }
          }
        }
      }

      // Criar candidatura no Firestore
      const applicationData: Record<string, any> = {
        candidateId: candidateId,
        candidateUserId: user.uid,
        candidateName: name,
        candidateEmail: email,
        candidatePhone: phone,
        jobId: job.id,
        jobTitle: job.title,
        experience: experience || "",
        education: education || "",
        notes: notes || "",
        status: "new",
        appliedAt: Timestamp.now(),
        resumeUrl: resumeUrl,
      };

      // Adicionar valores dos campos dinâmicos
      if (job.customFields && job.customFields.length > 0) {
        job.customFields.forEach(field => {
          if (field.type === "file") {
            // Para campos de arquivo, adicionar a URL
            if (customFieldsFileUrls[field.id]) {
              applicationData[`customField_${field.id}`] = customFieldsFileUrls[field.id];
            }
          } else {
            // Para outros tipos, adicionar o valor
            const value = customFieldsValues[field.id];
            if (value !== undefined) {
              applicationData[`customField_${field.id}`] = value;
            }
          }
        });
      }

      // Verificar se já existe candidatura para esta oportunidade
      const applicationsRef = collection(db, "job_applications");
      const existingQuery = query(
        applicationsRef,
        where("candidateUserId", "==", user.uid),
        where("jobId", "==", job.id)
      );
      const existingDocs = await getDocs(existingQuery);

      if (!existingDocs.empty) {
        setError("Você já se candidatou a esta oportunidade.");
        toast({
          title: "Candidatura já realizada",
          description: "Você já se candidatou a esta oportunidade anteriormente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Criar candidatura
      await addDoc(applicationsRef, applicationData);

      // Atualizar contador de candidaturas da oportunidade
      const jobRef = doc(db, "dot_jobs", job.id);
      await updateDoc(jobRef, {
        applications: (job.applications || 0) + 1
      });

      toast({
        title: "Candidatura realizada com sucesso!",
        description: `Sua candidatura para "${job.title}" foi enviada.`,
      });

      // Redirecionar para a página da oportunidade
      navigate(`/jobs/${job.id}`);
    } catch (err) {
      console.error("Erro ao criar candidatura:", err);
      setError("Erro ao enviar candidatura. Tente novamente.");
      toast({
        title: "Erro ao enviar candidatura",
        description: "Não foi possível enviar sua candidatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-32 mb-6"></div>
            <div className="h-64 bg-secondary rounded-lg"></div>
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
          <Alert variant="destructive">
            <AlertDescription>
            Oportunidade não encontrada ou não está mais disponível.
            </AlertDescription>
          </Alert>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Oportunidades
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/jobs/${jobId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a oportunidade
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              Candidatar-se à oportunidade
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {job.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações do Candidato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Seus Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Nome *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="bg-input border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="bg-input border-border text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Experiência */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-foreground">
                  Experiência Profissional
                </Label>
                <Textarea
                  id="experience"
                  placeholder="Descreva sua experiência profissional relevante para esta oportunidade..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="bg-input border-border text-foreground min-h-[100px]"
                />
              </div>

              {/* Educação */}
              <div className="space-y-2">
                <Label htmlFor="education" className="text-foreground">
                  Formação Acadêmica
                </Label>
                <Textarea
                  id="education"
                  placeholder="Descreva sua formação acadêmica..."
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="bg-input border-border text-foreground min-h-[100px]"
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">
                  Observações Adicionais (Opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione qualquer informação adicional que considere relevante..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-input border-border text-foreground min-h-[100px]"
                />
              </div>

              {/* Upload de Currículo */}
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-foreground">
                  Currículo (PDF) - Opcional
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="bg-input border-border text-foreground"
                  />
                  {resume && (
                    <span className="text-sm text-muted-foreground">
                      {resume.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Envie seu currículo em formato PDF (máximo 5MB)
                </p>
              </div>

              {/* Campos Dinâmicos */}
              {job.customFields && job.customFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Informações Adicionais</h3>
                  {job.customFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={`custom-${field.id}`} className="text-foreground">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.type === "boolean" ? (
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`custom-${field.id}`}
                              value="true"
                              checked={customFieldsValues[field.id] === true}
                              onChange={() => {
                                setCustomFieldsValues({
                                  ...customFieldsValues,
                                  [field.id]: true
                                });
                              }}
                              className="h-4 w-4"
                              required={field.required}
                            />
                            <span className="text-foreground">Sim</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`custom-${field.id}`}
                              value="false"
                              checked={customFieldsValues[field.id] === false}
                              onChange={() => {
                                setCustomFieldsValues({
                                  ...customFieldsValues,
                                  [field.id]: false
                                });
                              }}
                              className="h-4 w-4"
                              required={field.required}
                            />
                            <span className="text-foreground">Não</span>
                          </label>
                          {!field.required && (
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`custom-${field.id}`}
                                value=""
                                checked={customFieldsValues[field.id] === undefined}
                                onChange={() => {
                                  const newValues = { ...customFieldsValues };
                                  delete newValues[field.id];
                                  setCustomFieldsValues(newValues);
                                }}
                                className="h-4 w-4"
                              />
                              <span className="text-foreground text-muted-foreground">Não informar</span>
                            </label>
                          )}
                        </div>
                      ) : field.type === "file" ? (
                        <div className="space-y-2">
                          <Input
                            id={`custom-${field.id}`}
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setCustomFieldsFiles({
                                  ...customFieldsFiles,
                                  [field.id]: e.target.files[0]
                                });
                              }
                            }}
                            className="bg-input border-border text-foreground"
                            required={field.required}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.avi,.mkv,.webm,.wmv,.flv"
                          />
                          {customFieldsFiles[field.id] && (
                            <p className="text-sm text-muted-foreground">
                              Arquivo selecionado: {customFieldsFiles[field.id].name} ({(customFieldsFiles[field.id].size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Formatos aceitos: PDF, DOC, DOCX, JPG, JPEG, PNG, MP4, MOV, AVI, MKV, WEBM, WMV, FLV (máximo 50MB)
                          </p>
                        </div>
                      ) : (
                        <Input
                          id={`custom-${field.id}`}
                          type="text"
                          value={customFieldsValues[field.id] as string || ""}
                          onChange={(e) => {
                            setCustomFieldsValues({
                              ...customFieldsValues,
                              [field.id]: e.target.value
                            });
                          }}
                          placeholder={`Digite ${field.label.toLowerCase()}`}
                          className="bg-input border-border text-foreground"
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/jobs/${jobId}`)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar Candidatura"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApplyJob;

