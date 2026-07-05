import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "@/firebase";

export type AdminRole = "superadmin" | "admin" | "editor";

interface AdminContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  role: AdminRole | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: AdminRole[]) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const snap = await get(ref(database, `admins/${u.uid}`));
          if (snap.exists()) {
            const data = snap.val();
            setUser(u);
            setRole((data.role as AdminRole) || "admin");
          } else {
            // Not an authorized admin — sign out silently
            await signOut(auth);
            setUser(null);
            setRole(null);
          }
        } catch {
          await signOut(auth);
          setUser(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await get(ref(database, `admins/${cred.user.uid}`));
      if (!snap.exists()) {
        await signOut(auth);
        return { ok: false, error: "Access denied. You are not an admin." };
      }
      const data = snap.val();
      setUser(cred.user);
      setRole((data.role as AdminRole) || "admin");
      return { ok: true };
    } catch (err: any) {
      const code = err?.code || "";
      let msg = "Login failed. Please try again.";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
        msg = "Invalid email or password.";
      } else if (code.includes("too-many-requests")) {
        msg = "Too many attempts. Try again later.";
      } else if (code.includes("invalid-email")) {
        msg = "Invalid email address.";
      }
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  const hasRole = (roles: AdminRole[]) => (role ? roles.includes(role) : false);

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated: !!user && !!role,
        loading,
        user,
        role,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};
