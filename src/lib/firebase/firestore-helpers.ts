import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  where,
  type DocumentData,
  type CollectionReference,
  type QueryConstraint,
  type WithFieldValue,
} from 'firebase/firestore'
import { db } from './client'
import type {
  AgencyDocument,
  FirestoreUserDocument,
  ProjectDocument,
  TaskDocument,
} from '../../types/firebase'

export const usersCollection = collection(db, 'users') as CollectionReference<FirestoreUserDocument>
export const agenciesCollection = collection(db, 'agencies') as CollectionReference<AgencyDocument>
export const projectsCollection = collection(db, 'projects') as CollectionReference<ProjectDocument>
export const tasksCollection = collection(db, 'tasks') as CollectionReference<TaskDocument>

/**
 * Creates or fully replaces a document.
 */
export async function createDocument<T extends DocumentData>(
  ref: CollectionReference<T>,
  id: string,
  payload: WithFieldValue<T>
) {
  await setDoc(doc(ref, id), payload)
}

/**
 * Reads a single document by id.
 */
export async function readDocument<T extends DocumentData>(
  ref: CollectionReference<T>,
  id: string
): Promise<T | null> {
  const snapshot = await getDoc(doc(ref, id))
  return snapshot.exists() ? (snapshot.data() as T) : null
}

/**
 * Reads many documents with optional query constraints.
 */
export async function readDocuments<T extends DocumentData>(
  ref: CollectionReference<T>,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const snapshot = await getDocs(query(ref, ...constraints))
  return snapshot.docs.map((d) => d.data() as T)
}

/**
 * Updates a subset of fields in an existing document.
 */
export async function updateDocument<T extends DocumentData>(
  ref: CollectionReference<T>,
  id: string,
  payload: Partial<T>
) {
  await updateDoc(doc(ref, id), payload as DocumentData)
}

/**
 * Deletes a document by id.
 */
export async function deleteDocument<T extends DocumentData>(
  ref: CollectionReference<T>,
  id: string
) {
  await deleteDoc(doc(ref, id))
}

/**
 * Writes multiple create/update operations atomically.
 */
export async function batchUpsert<T extends DocumentData>(
  ref: CollectionReference<T>,
  docs: Array<{ id: string; payload: Partial<T> }>
) {
  const batch = writeBatch(db)
  docs.forEach(({ id, payload }) => {
    batch.set(doc(ref, id), payload as DocumentData, { merge: true })
  })
  await batch.commit()
}

/**
 * Reads users by role for RBAC workflows.
 */
export async function getUsersByRole(role: FirestoreUserDocument['role']) {
  return readDocuments(usersCollection, [where('role', '==', role)])
}

