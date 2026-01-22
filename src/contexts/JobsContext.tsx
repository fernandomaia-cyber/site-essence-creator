import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Job } from "@/hooks/useJobs";
import { db } from "@/lib/firebase";

// Re-exportar Job para compatibilidade
export type { Job };
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

// Dados mockados para demonstração (usados apenas na primeira inicialização)
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Desenvolvedor Frontend React",
    location: "Remoto",
    status: "active",
    applications: 45,
    postedAt: "2024-01-15",
    description: "Desenvolvedor frontend com experiência em React, TypeScript e Next.js",
    requirements: "• 3+ anos de experiência com React\n• Conhecimento em TypeScript\n• Experiência com Next.js\n• Conhecimento em CSS/SASS\n• Experiência com Git",
    contactEmail: "rh@techcorp.com",
    website: "https://techcorp.com"
  },
  {
    id: "2",
    title: "Designer UX/UI",
    location: "Remoto",
    status: "active",
    applications: 32,
    postedAt: "2024-01-14",
    description: "Designer com experiência em Figma, Adobe Creative Suite e prototipagem",
    requirements: "• 2+ anos de experiência em UX/UI\n• Domínio do Figma\n• Conhecimento em Adobe Creative Suite\n• Experiência com prototipagem\n• Portfolio demonstrando habilidades",
    contactEmail: "contato@designstudio.com",
    website: "https://designstudio.com"
  },
  {
    id: "3",
    title: "Analista de Marketing Digital",
    location: "São Paulo, SP",
    status: "draft",
    applications: 0,
    postedAt: "2024-01-13",
    description: "Analista com experiência em Google Ads, Facebook Ads e SEO",
    requirements: "• 2+ anos de experiência em marketing digital\n• Conhecimento em Google Ads\n• Experiência com Facebook Ads\n• Conhecimento em SEO\n• Análise de métricas",
    contactEmail: "rh@marketingpro.com",
    website: "https://marketingpro.com"
  },
  {
    id: "4",
    title: "Desenvolvedor Backend Node.js",
    location: "Remoto",
    status: "inactive",
    applications: 28,
    postedAt: "2024-01-12",
    description: "Desenvolvedor backend com experiência em Node.js, Express e MongoDB",
    requirements: "• 4+ anos de experiência com Node.js\n• Conhecimento em Express.js\n• Experiência com MongoDB\n• Conhecimento em APIs REST\n• Experiência com Git",
    contactEmail: "dev@devcompany.com",
    website: "https://devcompany.com"
  }
];

interface JobsContextType {
  jobs: Job[];
  isLoading: boolean;
  createJob: (jobData: Omit<Job, 'id' | 'applications' | 'postedAt'>) => Promise<Job>;
  updateJob: (id: string, jobData: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJobById: (id: string) => Job | undefined;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

const COLLECTION_NAME = "dot_jobs";

// Converter documento do Firestore para Job
const firestoreToJob = (docSnapshot: DocumentSnapshot<DocumentData>): Job => {
  const data = docSnapshot.data();
  if (!data) {
    throw new Error("Documento sem dados");
  }
  return {
    id: docSnapshot.id,
    title: data.title || "",
    location: data.location || "",
    status: data.status || "draft",
    applications: data.applications || 0,
    postedAt: data.postedAt || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    description: data.description || "",
    requirements: data.requirements || "",
    contactEmail: data.contactEmail || "",
    website: data.website || "",
    customFields: data.customFields || [],
  };
};

// Função auxiliar para remover campos undefined (Firebase não aceita undefined)
const removeUndefinedFields = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Converter Job para formato do Firestore
const jobToFirestore = (job: Partial<Job>) => {
  const { id, ...data } = job;
  // Converter campos opcionais undefined para string vazia ou null
  const firestoreData: Record<string, any> = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  
  // Garantir que campos opcionais não sejam undefined
  if (firestoreData.requirements === undefined) {
    firestoreData.requirements = "";
  }
  if (firestoreData.contactEmail === undefined) {
    firestoreData.contactEmail = "";
  }
  if (firestoreData.website === undefined) {
    firestoreData.website = "";
  }
  // Se customFields estiver vazio ou undefined, não incluir
  if (!firestoreData.customFields || (Array.isArray(firestoreData.customFields) && firestoreData.customFields.length === 0)) {
    delete firestoreData.customFields;
  }
  
  return removeUndefinedFields(firestoreData);
};

export const JobsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do Firestore na inicialização e escutar mudanças
  useEffect(() => {
    setIsLoading(true);
    
    const jobsCollection = collection(db, COLLECTION_NAME);
    
    // Buscar todos os documentos sem ordenação (ordenaremos no cliente)
    const q = query(jobsCollection);

    // Escutar mudanças em tempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const jobsList: Job[] = [];
        snapshot.forEach((docSnapshot) => {
          try {
            const job = firestoreToJob(docSnapshot);
            jobsList.push(job);
          } catch (error) {
            console.error("Erro ao converter documento:", error);
          }
        });
        // Ordenar por postedAt (mais recente primeiro)
        jobsList.sort((a, b) => {
          const dateA = new Date(a.postedAt).getTime();
          const dateB = new Date(b.postedAt).getTime();
          return dateB - dateA; // Mais recente primeiro
        });
        setJobs(jobsList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar jobs do Firestore:", error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const createJob = async (jobData: Omit<Job, 'id' | 'applications' | 'postedAt'>): Promise<Job> => {
    try {
      const jobsCollection = collection(db, COLLECTION_NAME);
      const newJobData: Record<string, any> = {
        ...jobData,
        applications: 0,
        postedAt: new Date().toISOString().split('T')[0],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Garantir que campos opcionais não sejam undefined
      if (newJobData.requirements === undefined) {
        newJobData.requirements = "";
      }
      if (newJobData.contactEmail === undefined) {
        newJobData.contactEmail = "";
      }
      if (newJobData.website === undefined) {
        newJobData.website = "";
      }
      // Se customFields estiver vazio ou undefined, não incluir
      if (!newJobData.customFields || (Array.isArray(newJobData.customFields) && newJobData.customFields.length === 0)) {
        delete newJobData.customFields;
      }
      
      // Remover campos undefined antes de enviar ao Firebase
      const cleanedData = removeUndefinedFields(newJobData);

      const docRef = await addDoc(jobsCollection, cleanedData);
      
      const newJob: Job = {
        ...jobData,
        id: docRef.id,
        applications: 0,
        postedAt: new Date().toISOString().split('T')[0]
      };

      return newJob;
    } catch (error) {
      console.error("Erro ao criar job no Firestore:", error);
      throw error;
    }
  };

  const updateJob = async (id: string, jobData: Partial<Job>): Promise<void> => {
    try {
      const jobRef = doc(db, COLLECTION_NAME, id);
      const updateData = jobToFirestore(jobData);
      await updateDoc(jobRef, updateData);
    } catch (error) {
      console.error("Erro ao atualizar job no Firestore:", error);
      throw error;
    }
  };

  const deleteJob = async (id: string): Promise<void> => {
    try {
      const jobRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(jobRef);
    } catch (error) {
      console.error("Erro ao deletar job no Firestore:", error);
      throw error;
    }
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  return (
    <JobsContext.Provider value={{
      jobs,
      isLoading,
      createJob,
      updateJob,
      deleteJob,
      getJobById
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
