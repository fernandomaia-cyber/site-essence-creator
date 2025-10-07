import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <SearchBar />
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <FilterSidebar />
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
