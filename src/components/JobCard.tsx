import { MapPin, Clock, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface JobCardProps {
  id: string;
  title: string;
  location: string;
  department: string;
  postedDate: string;
  description: string;
}

export const JobCard = ({
  id,
  title,
  location,
  department,
  postedDate,
  description,
}: JobCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card hover:border-primary/50 group">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {department}
            </Badge>
          </div>
          
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{postedDate}</span>
            </div>
          </div>
        </div>
        
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground md:mt-0"
          onClick={() => navigate(`/jobs/${id}`)}
        >
          Ver detalhes
        </Button>
      </div>
    </Card>
  );
};
