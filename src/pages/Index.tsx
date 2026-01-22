import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { useJobs } from "@/contexts/JobsContext";

const Index = () => {
  const { jobs, isLoading } = useJobs();
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [requirementsFilter, setRequirementsFilter] = useState<string>("");

  // Garantir que jobs seja sempre um array
  const safeJobs = useMemo(() => {
    return Array.isArray(jobs) ? jobs : [];
  }, [jobs]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SearchBar />
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <FilterSidebar 
              jobs={safeJobs}
              locationFilter={locationFilter}
              requirementsFilter={requirementsFilter}
              onLocationFilterChange={setLocationFilter}
              onRequirementsFilterChange={setRequirementsFilter}
            />
            <div className="flex-1">
              <JobList />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
