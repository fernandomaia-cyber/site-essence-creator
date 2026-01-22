import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { useJobs } from "@/contexts/JobsContext";

const Index = () => {
  const { jobs } = useJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [locationFilterArray, setLocationFilterArray] = useState<string[]>([]);
  const [requirementsFilter, setRequirementsFilter] = useState<string>("");

  // Quando o usuário digita no campo de busca de localização, limpar os checkboxes
  const handleLocationSearchChange = (value: string) => {
    setLocationFilter(value);
    if (value) {
      setLocationFilterArray([]);
    }
  };

  // Quando o usuário seleciona checkboxes de localização, limpar o campo de busca
  const handleLocationFilterChange = (filters: string[]) => {
    setLocationFilterArray(filters);
    if (filters.length > 0) {
      setLocationFilter("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SearchBar 
          searchTerm={searchTerm}
          locationFilter={locationFilter}
          onSearchChange={setSearchTerm}
          onLocationChange={handleLocationSearchChange}
        />
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <FilterSidebar 
              jobs={jobs}
              locationFilter={locationFilterArray}
              requirementsFilter={requirementsFilter}
              onLocationFilterChange={handleLocationFilterChange}
              onRequirementsFilterChange={setRequirementsFilter}
            />
            <div className="flex-1">
              <JobList 
                searchTerm={searchTerm}
                locationFilter={locationFilter}
                locationFilterArray={locationFilterArray}
                requirementsFilter={requirementsFilter}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
