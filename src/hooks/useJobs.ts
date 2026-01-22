export interface DynamicField {
  id: string;
  label: string;
  type: "text" | "boolean" | "file";
  required?: boolean;
}

export interface Job {
  id: string;
  title: string;
  location: string;
  status: "active" | "inactive" | "draft";
  applications: number;
  postedAt: string;
  description: string;
  requirements?: string;
  contactEmail?: string;
  website?: string;
  customFields?: DynamicField[];
}

