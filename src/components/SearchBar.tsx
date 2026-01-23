import { useState, FormEvent } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  locationSearch: string;
  onSearchTermChange: (value: string) => void;
  onLocationSearchChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchBar = ({
  searchTerm,
  locationSearch,
  onSearchTermChange,
  onLocationSearchChange,
  onSearch,
}: SearchBarProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Encontre sua próxima oportunidade
          </h2>
          <p className="text-xl text-muted-foreground">
            Explore vagas em diversas áreas e localizações
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="bg-card rounded-2xl p-4 shadow-lg border border-border animate-slide-in">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Cargo, palavra-chave ou empresa"
                  className="pl-10 h-12 bg-input border-border text-foreground"
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Localização"
                  className="pl-10 h-12 bg-input border-border text-foreground"
                  value={locationSearch}
                  onChange={(e) => onLocationSearchChange(e.target.value)}
                />
              </div>
              <Button 
                type="submit"
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Buscar vagas
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
