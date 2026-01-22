import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Job } from "@/hooks/useJobs";

interface FilterSidebarProps {
  jobs: Job[];
  locationFilter: string[];
  requirementsFilter: string;
  onLocationFilterChange: (filters: string[]) => void;
  onRequirementsFilterChange: (filter: string) => void;
}

export const FilterSidebar = ({ 
  jobs,
  locationFilter,
  requirementsFilter,
  onLocationFilterChange,
  onRequirementsFilterChange
}: FilterSidebarProps) => {
  // Extrair localizações únicas das Oportunidades ativas
  const availableLocations = useMemo(() => {
    const locations = jobs
      .filter(job => job.status === "active")
      .map(job => job.location)
      .filter((location, index, self) => self.indexOf(location) === index)
      .sort();
    return locations;
  }, [jobs]);

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      onLocationFilterChange([...locationFilter, location]);
    } else {
      onLocationFilterChange(locationFilter.filter(f => f !== location));
    }
  };


  return (
    <aside className="w-full md:w-64 bg-card rounded-xl p-6 border border-border h-fit sticky top-24">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Filtros</h3>
      
      <div className="space-y-6">
        {/* Filtro de Localização */}
        {availableLocations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 text-foreground">Localização</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableLocations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`location-${location}`}
                    checked={locationFilter.includes(location)}
                    onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                  />
                  <Label
                    htmlFor={`location-${location}`}
                    className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                  >
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtro de Requisitos - Campo Livre */}
        <div>
          <Label htmlFor="requirements-filter" className="text-sm font-medium mb-3 text-foreground block">
            Requisitos
          </Label>
          <Input
            id="requirements-filter"
            placeholder="Ex: React, TypeScript, Git..."
            value={requirementsFilter}
            onChange={(e) => onRequirementsFilterChange(e.target.value)}
            className="bg-input border-border text-foreground"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Digite palavras-chave para buscar nos requisitos
          </p>
        </div>

        {/* Mensagem quando não há filtros disponíveis */}
        {availableLocations.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            Nenhum filtro disponível
          </div>
        )}
      </div>
    </aside>
  );
};
