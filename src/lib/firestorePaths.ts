import {
  type Firestore,
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";

/** Coleção de topo que agrupa todos os dados do portal Dot. */
export const DOTGROUP_COLLECTION = "dotgroup";

const SUB = {
  jobs: "dot_jobs",
  applications: "job_applications",
  candidates: "candidates",
  suppliers: "suppliers",
} as const;

/**
 * Documento `dotgroup/{id}` sob o qual ficam as subcoleções (`dot_jobs`, `job_applications`, etc.).
 * Defina `VITE_DOTGROUP_DOC_ID` no `.env` se usar outro tenant; padrão: `default`.
 */
export function getDotGroupDocId(): string {
  const id = import.meta.env.VITE_DOTGROUP_DOC_ID?.trim();
  return id || "default";
}

export function dotGroupDocRef(db: Firestore): DocumentReference {
  return doc(db, DOTGROUP_COLLECTION, getDotGroupDocId());
}

export function dotJobsCollection(db: Firestore): CollectionReference {
  return collection(dotGroupDocRef(db), SUB.jobs);
}

export function dotJobDoc(db: Firestore, jobId: string): DocumentReference {
  return doc(dotGroupDocRef(db), SUB.jobs, jobId);
}

export function jobApplicationsCollection(db: Firestore): CollectionReference {
  return collection(dotGroupDocRef(db), SUB.applications);
}

export function jobApplicationDoc(db: Firestore, applicationId: string): DocumentReference {
  return doc(dotGroupDocRef(db), SUB.applications, applicationId);
}

export function candidatesCollection(db: Firestore): CollectionReference {
  return collection(dotGroupDocRef(db), SUB.candidates);
}

export function candidateDoc(db: Firestore, candidateId: string): DocumentReference {
  return doc(dotGroupDocRef(db), SUB.candidates, candidateId);
}

export function suppliersCollection(db: Firestore): CollectionReference {
  return collection(dotGroupDocRef(db), SUB.suppliers);
}
