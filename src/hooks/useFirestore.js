import { useState } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, getDocs, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import useAuthStore from '../store/authStore';

export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  async function addDocument(collectionName, data) {
    setLoading(true);
    setError(null);
    try {
      const ref = await addDoc(collection(db, collectionName), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      return ref.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateDocument(collectionName, id, data) {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteDocument(collectionName, id) {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getUserDocuments(collectionName, orderByField = 'createdAt', limitCount = 50) {
    if (!user) return [];
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, collectionName),
        where('userId', '==', user.uid),
        orderBy(orderByField, 'desc'),
        limit(limitCount),
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getDocument(collectionName, id) {
    try {
      const snap = await getDoc(doc(db, collectionName, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function getUserDocumentCount(collectionName) {
    if (!user) return 0;
    try {
      const q = query(collection(db, collectionName), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      return snap.size;
    } catch {
      return 0;
    }
  }

  return { loading, error, addDocument, updateDocument, deleteDocument, getUserDocuments, getDocument, getUserDocumentCount };
}
