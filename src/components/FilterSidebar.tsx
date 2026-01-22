import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const FilterSidebar = () => {
  const departments = [
    "Tecnologia",
    "Marketing",
    "Vendas",
    "Design",
    "Recursos Humanos",
    "Financeiro",
  ];

  const jobTypes = [
    "Tempo integral",
    "Meio período",
    "Remoto",
    "Híbrido",
    "Estágio",
  ];

  const locations = [
    "São Paulo",
    "Rio de Janeiro",
    "Belo Horizonte",
    "Curitiba",
    "Porto Alegre",
  ];

  return (
    <aside className="w-full md:w-64 bg-card rounded-xl p-6 border border-border h-fit sticky top-24">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Filtros</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3 text-foreground">Departamento</h4>
          <div className="space-y-2">
            {departments.map((dept) => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox id={dept} />
                <Label
                  htmlFor={dept}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                >
                  {dept}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-foreground">Tipo de vaga</h4>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={type} />
                <Label
                  htmlFor={type}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                >
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-foreground">Localização</h4>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox id={location} />
                <Label
                  htmlFor={location}
                  className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                >
                  {location}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
