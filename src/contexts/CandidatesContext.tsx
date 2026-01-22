import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

// Interface para candidatos
// Fluxo de status: new → technical_evaluation → technical_analysis → interview → approved/homologated/rejected
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  status: "new" | "technical_evaluation" | "technical_analysis" | "interview" | "approved" | "homologated" | "rejected";
  appliedAt: string;
  resume?: string;
  notes?: string;
  experience?: string;
  education?: string;
  jobId?: string;
  candidateId?: string;
  candidateUserId?: string;
  sentForAnalysis?: boolean;
  customFieldsData?: Record<string, string | boolean>; // Valores dos campos dinâmicos (customField_${fieldId})
}

interface CandidatesContextType {
  candidates: Candidate[];
  isLoading: boolean;
  createCandidate: (candidateData: Omit<Candidate, 'id' | 'appliedAt'>) => Promise<Candidate>;
  updateCandidate: (id: string, candidateData: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  getCandidateById: (id: string) => Candidate | undefined;
  getCandidatesByJobId: (jobId: string) => Promise<Candidate[]>;
}

const CandidatesContext = createContext<CandidatesContextType | undefined>(undefined);

const APPLICATIONS_COLLECTION = "job_applications";

// Converter documento do Firestore para Candidate
const firestoreToCandidate = (docSnapshot: DocumentSnapshot<DocumentData>): Candidate => {
  const data = docSnapshot.data();
  if (!data) {
    throw new Error(`Documento ${docSnapshot.id} sem dados`);
  }
  
  // Tratar diferentes formatos de data
  let appliedAt: string;
  if (data.appliedAt?.toDate) {
    appliedAt = data.appliedAt.toDate().toISOString().split('T')[0];
  } else if (data.appliedAt instanceof Timestamp) {
    appliedAt = data.appliedAt.toDate().toISOString().split('T')[0];
  } else if (data.appliedAt) {
    appliedAt = typeof data.appliedAt === 'string' 
      ? data.appliedAt.split('T')[0]
      : new Date(data.appliedAt).toISOString().split('T')[0];
  } else {
    appliedAt = new Date().toISOString().split('T')[0];
  }

  // Extrair campos dinâmicos (campos que começam com customField_)
  const customFieldsData: Record<string, string | boolean> = {};
  Object.keys(data).forEach(key => {
    if (key.startsWith('customField_')) {
      const fieldId = key.replace('customField_', '');
      customFieldsData[fieldId] = data[key];
    }
  });

  const candidate: Candidate = {
    id: docSnapshot.id,
    name: data.candidateName || data.name || "",
    email: data.candidateEmail || data.email || "",
    phone: data.candidatePhone || data.phone || "",
    jobTitle: data.jobTitle || "",
    company: data.company || "",
    status: data.status || "new",
    appliedAt,
    resume: data.resumeUrl || data.resume || "",
    notes: data.notes || "",
    experience: data.experience || "",
    education: data.education || "",
    jobId: data.jobId || "",
    candidateId: data.candidateId || "",
    candidateUserId: data.candidateUserId || "",
    sentForAnalysis: data.sentForAnalysis || false,
    customFieldsData: Object.keys(customFieldsData).length > 0 ? customFieldsData : undefined,
  };

  // Validar campos obrigatórios
  if (!candidate.name || !candidate.email) {
    console.warn(`[CandidatesContext] Candidato ${docSnapshot.id} com dados incompletos:`, data);
  }

  return candidate;
};

export const CandidatesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const applicationsCollection = collection(db, APPLICATIONS_COLLECTION);
    const q = query(applicationsCollection);

    // Escutar mudanças em tempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`[CandidatesContext] Recebidos ${snapshot.size} documentos da coleção ${APPLICATIONS_COLLECTION}`);
        const candidatesList: Candidate[] = [];
        snapshot.forEach((docSnapshot) => {
          try {
            const candidate = firestoreToCandidate(docSnapshot);
            candidatesList.push(candidate);
          } catch (error) {
            console.error("Erro ao converter documento:", error, docSnapshot.id, docSnapshot.data());
          }
        });
        // Ordenar por appliedAt (mais recente primeiro)
        candidatesList.sort((a, b) => {
          const dateA = new Date(a.appliedAt).getTime();
          const dateB = new Date(b.appliedAt).getTime();
          return dateB - dateA;
        });
        console.log(`[CandidatesContext] ${candidatesList.length} candidatos processados com sucesso`);
        setCandidates(candidatesList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar candidatos do Firestore:", error);
        console.error("Detalhes do erro:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createCandidate = async (candidateData: Omit<Candidate, 'id' | 'appliedAt'>): Promise<Candidate> => {
    try {
      const applicationsCollection = collection(db, APPLICATIONS_COLLECTION);
      const newCandidateData = {
        ...candidateData,
        appliedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(applicationsCollection, newCandidateData);
      
      const newCandidate: Candidate = {
        ...candidateData,
        id: docRef.id,
        appliedAt: new Date().toISOString().split('T')[0]
      };

      return newCandidate;
    } catch (error) {
      console.error("Erro ao criar candidato no Firestore:", error);
      throw error;
    }
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

  const updateCandidate = async (id: string, candidateData: Partial<Candidate>): Promise<void> => {
    try {
      const candidateRef = doc(db, APPLICATIONS_COLLECTION, id);
      const updateData = {
        ...candidateData,
        updatedAt: Timestamp.now(),
      };
      // Remover campos undefined antes de enviar ao Firebase
      const cleanedData = removeUndefinedFields(updateData);
      await updateDoc(candidateRef, cleanedData);
    } catch (error) {
      console.error("Erro ao atualizar candidato no Firestore:", error);
      throw error;
    }
  };

  const deleteCandidate = async (id: string): Promise<void> => {
    try {
      const candidateRef = doc(db, APPLICATIONS_COLLECTION, id);
      await deleteDoc(candidateRef);
    } catch (error) {
      console.error("Erro ao deletar candidato no Firestore:", error);
      throw error;
    }
  };

  const getCandidateById = (id: string) => {
    return candidates.find(candidate => candidate.id === id);
  };

  const getCandidatesByJobId = async (jobId: string): Promise<Candidate[]> => {
    try {
      const applicationsCollection = collection(db, APPLICATIONS_COLLECTION);
      const q = query(applicationsCollection, where("jobId", "==", jobId));
      const querySnapshot = await getDocs(q);
      
      const candidatesList: Candidate[] = [];
      querySnapshot.forEach((docSnapshot) => {
        try {
          const candidate = firestoreToCandidate(docSnapshot);
          candidatesList.push(candidate);
        } catch (error) {
          console.error("Erro ao converter documento:", error);
        }
      });
      
      // Ordenar por appliedAt (mais recente primeiro)
      candidatesList.sort((a, b) => {
        const dateA = new Date(a.appliedAt).getTime();
        const dateB = new Date(b.appliedAt).getTime();
        return dateB - dateA;
      });
      
      return candidatesList;
    } catch (error) {
      console.error("Erro ao buscar candidatos por oportunidade:", error);
      return [];
    }
  };

  return (
    <CandidatesContext.Provider value={{
      candidates,
      isLoading,
      createCandidate,
      updateCandidate,
      deleteCandidate,
      getCandidateById,
      getCandidatesByJobId
    }}>
      {children}
    </CandidatesContext.Provider>
  );
};

export const useCandidates = () => {
  const context = useContext(CandidatesContext);
  if (context === undefined) {
    throw new Error('useCandidates must be used within a CandidatesProvider');
  }
  return context;
};

