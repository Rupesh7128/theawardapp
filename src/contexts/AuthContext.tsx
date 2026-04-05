import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: string | null;
  billingBypass: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [billingBypass, setBillingBypass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Error completing sign-in redirect", error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure user exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: currentUser.email,
            name: currentUser.displayName,
            role: 'user',
            billingBypass: false,
            createdAt: new Date().toISOString()
          });
          setRole('user');
          setBillingBypass(false);
        } else {
          setRole(userSnap.data().role || 'user');
          setBillingBypass(Boolean(userSnap.data().billingBypass));
        }
      } else {
        setRole(null);
        setBillingBypass(false);
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const code = error?.code as string | undefined;

      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        const host = window.location.hostname;
        alert(
          `Sign-in is blocked because this domain is not authorized in Firebase.\n\nAdd "${host}" to:\nFirebase Console → Authentication → Settings → Authorized domains\n\nThen try again.`
        );
        return;
      }

      console.error("Error signing in with Google", error);
      alert("Sign-in failed. Please try again.");
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, billingBypass, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
