import { JobCard } from "./JobCard";

const jobs = [
  {
    id: 1,
    title: "Desenvolvedor Full Stack Sênior",
    company: "Tech Solutions",
    location: "São Paulo, SP",
    type: "Tempo integral",
    department: "Tecnologia",
    postedDate: "Há 2 dias",
    description: "Buscamos um desenvolvedor full stack experiente para liderar projetos desafiadores usando React, Node.js e PostgreSQL.",
  },
  {
    id: 2,
    title: "Designer de Produto",
    company: "Creative Studio",
    location: "Remoto",
    type: "Tempo integral",
    department: "Design",
    postedDate: "Há 1 semana",
    description: "Procuramos um designer criativo para criar experiências de usuário excepcionais para nossos produtos digitais.",
  },
  {
    id: 3,
    title: "Gerente de Marketing Digital",
    company: "Marketing Pro",
    location: "Rio de Janeiro, RJ",
    type: "Tempo integral",
    department: "Marketing",
    postedDate: "Há 3 dias",
    description: "Oportunidade para liderar estratégias de marketing digital e crescimento para marcas estabelecidas.",
  },
  {
    id: 4,
    title: "Analista de Dados",
    company: "Data Insights",
    location: "Belo Horizonte, MG",
    type: "Híbrido",
    department: "Tecnologia",
    postedDate: "Há 5 dias",
    description: "Junte-se à nossa equipe para transformar dados em insights valiosos usando Python, SQL e ferramentas de BI.",
  },
  {
    id: 5,
    title: "Desenvolvedor Frontend",
    company: "Web Innovations",
    location: "Curitiba, PR",
    type: "Remoto",
    department: "Tecnologia",
    postedDate: "Há 4 dias",
    description: "Estamos procurando um desenvolvedor frontend apaixonado por criar interfaces modernas com React e TypeScript.",
  },
  {
    id: 6,
    title: "Especialista em UX/UI",
    company: "Design Hub",
    location: "Porto Alegre, RS",
    type: "Tempo integral",
    department: "Design",
    postedDate: "Há 1 semana",
    description: "Oportunidade para moldar a experiência do usuário de produtos digitais inovadores em um ambiente colaborativo.",
  },
];

export const JobList = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {jobs.length} vagas disponíveis
        </h2>
      </div>
      
      {jobs.map((job) => (
        <JobCard key={job.id} {...job} />
      ))}
    </div>
  );
};
