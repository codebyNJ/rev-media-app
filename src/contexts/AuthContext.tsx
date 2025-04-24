
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
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<"controller" | "client" | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Handle auth state changes
      if (event === 'SIGNED_IN') {
        toast({
          title: "Signed in",
          description: "You've been successfully signed in.",
        });
        setCurrentUser(newSession?.user ?? null);
        setSession(newSession);
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
        setCurrentUser(null);
        setSession(null);
        setUserRole(null); 
        localStorage.removeItem(`userRole_${currentUser?.id}`);
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setCurrentUser(initialSession?.user ?? null);
      setSession(initialSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Restore role from localStorage if available
  useEffect(() => {
    if (currentUser) {
      const savedRole = localStorage.getItem(`userRole_${currentUser.id}`);
      if (savedRole === "controller" || savedRole === "client") {
        setUserRole(savedRole);
      }
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
