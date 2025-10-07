import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  Share2,
  Bookmark,
  DollarSign,
} from "lucide-react";

// Mock data - in a real app, this would come from an API/database
const jobData = {
  id: "1",
  title: "Desenvolvedor Full Stack Sênior",
  company: "Tech Solutions",
  companyLogo: "TS",
  location: "São Paulo, SP",
  workMode: "Híbrido",
  type: "Tempo integral",
  department: "Tecnologia",
  salary: "R$ 10.000 - R$ 15.000",
  postedDate: "Há 2 dias",
  applicants: 45,
  description: `Estamos buscando um Desenvolvedor Full Stack Sênior para se juntar à nossa equipe de engenharia. 
  
  Você será responsável por desenvolver e manter aplicações web de alta qualidade, trabalhando com tecnologias modernas e em um ambiente colaborativo.`,
  
  responsibilities: [
    "Desenvolver e manter aplicações web usando React, Node.js e PostgreSQL",
    "Colaborar com designers e product managers para criar experiências excepcionais",
    "Escrever código limpo, testável e bem documentado",
    "Participar de code reviews e contribuir para melhorias técnicas",
    "Mentorar desenvolvedores júnior e mid-level",
  ],
  
  requirements: [
    "5+ anos de experiência com desenvolvimento full stack",
    "Expertise em React, TypeScript e Node.js",
    "Experiência com bancos de dados relacionais (PostgreSQL, MySQL)",
    "Conhecimento sólido de Git e metodologias ágeis",
    "Excelentes habilidades de comunicação",
    "Inglês intermediário ou avançado",
  ],
  
  niceToHave: [
    "Experiência com AWS ou Azure",
    "Conhecimento de Docker e Kubernetes",
    "Contribuições para projetos open source",
    "Experiência com testes automatizados (Jest, Cypress)",
  ],
  
  benefits: [
    "Vale refeição e alimentação",
    "Plano de saúde e odontológico",
    "Gympass",
    "Day off no aniversário",
    "Auxílio home office",
    "Budget para cursos e livros",
    "Stock options",
    "Horário flexível",
  ],
  
  aboutCompany: `A Tech Solutions é uma empresa líder em desenvolvimento de software, com mais de 10 anos de experiência no mercado. 
  
  Trabalhamos com clientes nacionais e internacionais, criando soluções inovadoras que impactam milhões de usuários. Nossa cultura valoriza a inovação, colaboração e o desenvolvimento contínuo de nossos profissionais.`,
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
          Voltar para vagas
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="p-6 border-border bg-card">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-primary">
                    {jobData.companyLogo}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 text-foreground">
                    {jobData.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-muted-foreground mb-3">
                    <Building2 className="w-5 h-5" />
                    <span>{jobData.company}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{jobData.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{jobData.workMode}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{jobData.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{jobData.salary}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                  {jobData.department}
                </Badge>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {jobData.type}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Publicado {jobData.postedDate} • {jobData.applicants} candidatos
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6 border-border bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Sobre a vaga
              </h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {jobData.description}
              </p>
            </Card>

            {/* Responsibilities */}
            <Card className="p-6 border-border bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Responsabilidades
              </h2>
              <ul className="space-y-3">
                {jobData.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Requirements */}
            <Card className="p-6 border-border bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Requisitos
              </h2>
              <ul className="space-y-3 mb-6">
                {jobData.requirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Separator className="my-4" />

              <h3 className="text-lg font-semibold mb-3 text-foreground">
                Diferenciais
              </h3>
              <ul className="space-y-3">
                {jobData.niceToHave.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Benefits */}
            <Card className="p-6 border-border bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Benefícios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jobData.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* About Company */}
            <Card className="p-6 border-border bg-card">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                Sobre a empresa
              </h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {jobData.aboutCompany}
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card - Sticky */}
            <Card className="p-6 border-border bg-card sticky top-24">
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mb-4">
                Candidatar-se à vaga
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Seu perfil será enviado diretamente para o recrutador
              </p>
            </Card>

            {/* Company Info */}
            <Card className="p-6 border-border bg-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Sobre {jobData.company}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Setor</p>
                    <p className="text-foreground font-medium">Tecnologia</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Localização</p>
                    <p className="text-foreground font-medium">São Paulo, SP</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Tamanho</p>
                    <p className="text-foreground font-medium">201-500 funcionários</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Similar Jobs */}
            <Card className="p-6 border-border bg-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Vagas similares
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <h4 className="font-medium text-foreground mb-1">
                      Desenvolvedor Backend
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Empresa XYZ • São Paulo
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
