'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';

/**
 * Initiates a setDoc operation for a document reference.
 */
export async function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  if (options) {
    await setDoc(docRef, data, options);
  } else {
    await setDoc(docRef, data);
  }
}


/**
 * Initiates an addDoc operation for a collection reference.
 */
export async function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  return await addDoc(colRef, data);
}


/**
 * Initiates an updateDoc operation for a document reference.
 */
export async function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  await updateDoc(docRef, data);
}


/**
 * Initiates a deleteDoc operation for a document reference.
 */
export async function deleteDocumentNonBlocking(docRef: DocumentReference) {
  await deleteDoc(docRef);
}
