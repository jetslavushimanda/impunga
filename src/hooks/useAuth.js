import { useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import useAuthStore from '../store/authStore';

export function useAuth() {
  const { user, userProfile, loading, setUser, setUserProfile, clearUser, setLoading, setSelectedPath } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserProfile(firebaseUser.uid);
      } else {
        clearUser();
      }
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        if (data.selectedPath) {
          setSelectedPath(data.selectedPath);
        }
        await updateDoc(docRef, { lastActive: serverTimestamp() });
      }
    } catch {
      // Profile may not exist yet for new users
    }
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const profile = {
        fullName: user.displayName || '',
        email: user.email || '',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      };
      await setDoc(docRef, profile);
      setUserProfile(profile);
    } else {
      const data = docSnap.data();
      setUserProfile(data);
      if (data.selectedPath) {
        setSelectedPath(data.selectedPath);
      }
    }
    return user;
  }

  async function register(email, password, profileData) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const profile = {
      ...profileData,
      email: user.email,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    setUserProfile(profile);
    return user;
  }

  async function logout() {
    await signOut(auth);
    clearUser();
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateProfile(updates) {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, { ...updates, lastActive: serverTimestamp() });
    setUserProfile({ ...userProfile, ...updates });
  }

  return { user, userProfile, loading, login, loginWithGoogle, register, logout, resetPassword, updateProfile, loadUserProfile };
}
