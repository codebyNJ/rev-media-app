
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  userRole: "controller" | "client" | null;
  setUserRole: (role: "controller" | "client" | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  userRole: null,
  setUserRole: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"controller" | "client" | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Restore role from localStorage if available
    if (currentUser) {
      const savedRole = localStorage.getItem(`userRole_${currentUser.id}`);
      if (savedRole === "controller" || savedRole === "client") {
        setUserRole(savedRole);
      }
    } else {
      setUserRole(null);
    }
  }, [currentUser]);

  // Save role to localStorage when it changes
  useEffect(() => {
    if (currentUser && userRole) {
      localStorage.setItem(`userRole_${currentUser.id}`, userRole);
    }
  }, [userRole, currentUser]);

  const value = {
    currentUser,
    loading,
    userRole,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
