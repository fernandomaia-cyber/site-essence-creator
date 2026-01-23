import { JobCard } from "./JobCard";
import { useJobs } from "@/contexts/JobsContext";

interface JobListProps {
  searchTerm?: string;
  locationFilter?: string;
  locationFilterArray?: string[];
  requirementsFilter?: string;
}

export const JobList = ({ 
  searchTerm = "", 
  locationFilter = "",
  locationFilterArray = [],
  requirementsFilter = ""
}: JobListProps) => {
  const { jobs, isLoading } = useJobs();

  // Filtrar apenas Oportunidades ativas para o site público
  let activeJobs = jobs.filter(job => job.status === "active");

  // Aplicar filtro de busca (título, descrição, requisitos)
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    activeJobs = activeJobs.filter(job => {
      const titleMatch = job.title.toLowerCase().includes(searchLower);
      const descriptionMatch = job.description?.toLowerCase().includes(searchLower) || false;
      const requirementsMatch = job.requirements?.toLowerCase().includes(searchLower) || false;
      return titleMatch || descriptionMatch || requirementsMatch;
    });
  }

  // Aplicar filtro de localização
  // Prioridade: checkboxes do sidebar primeiro, depois campo de busca
  if (locationFilterArray.length > 0) {
    activeJobs = activeJobs.filter(job => 
      locationFilterArray.includes(job.location)
    );
  } else if (locationFilter) {
    activeJobs = activeJobs.filter(job => 
      job.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }

  // Aplicar filtro de requisitos (busca por texto livre)
  if (requirementsFilter.trim()) {
    const searchTerms = requirementsFilter.toLowerCase().split(',').map(term => term.trim()).filter(term => term);
    activeJobs = activeJobs.filter(job => {
      if (!job.requirements) return false;
      const reqText = job.requirements.toLowerCase();
      // A oportunidade deve conter pelo menos um dos termos de busca
      return searchTerms.some(term => reqText.includes(term));
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Carregando Oportunidades...
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-card border border-border rounded-lg animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-secondary rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-secondary rounded mb-2"></div>
                  <div className="h-4 bg-secondary rounded w-1/3"></div>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="h-6 bg-secondary rounded w-20"></div>
                <div className="h-6 bg-secondary rounded w-24"></div>
              </div>
              <div className="h-4 bg-secondary rounded mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-secondary rounded w-32"></div>
                <div className="h-4 bg-secondary rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {activeJobs.length} Oportunidades disponíveis
        </h2>
      </div>
      
      {activeJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {(searchTerm?.trim() || locationFilter?.trim() || locationFilterArray.length > 0 || requirementsFilter?.trim()) 
              ? "Nenhuma oportunidade encontrada com os filtros aplicados"
              : "Nenhuma oportunidade disponível no momento"}
          </h3>
          <p className="text-muted-foreground">
            {(searchTerm?.trim() || locationFilter?.trim() || locationFilterArray.length > 0 || requirementsFilter?.trim())
              ? "Tente ajustar os filtros de busca para ver mais resultados."
              : "Volte em breve para ver novas oportunidades!"}
          </p>
        </div>
      ) : (
        activeJobs.map((job) => (
          <JobCard 
            key={job.id} 
            id={job.id} 
            title={job.title}
            location={job.location}
            department="Tecnologia" // Mapear para um campo padrão
            postedDate={new Date(job.postedAt).toLocaleDateString('pt-BR')}
            description={job.description}
          />
        ))
      )}
    </div>
  );
};
