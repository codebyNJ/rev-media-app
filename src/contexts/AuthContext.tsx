
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
  const [userRole, setUserRole] = useState<"controller" | "client" | null>(() => {
    // Initialize userRole from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      const storedRole = localStorage.getItem('userRole');
      if (storedUser && storedRole) {
        return storedRole as "controller" | "client";
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN') {
        toast({
          title: "Signed in",
          description: "You've been successfully signed in.",
        });
        setCurrentUser(newSession?.user ?? null);
        setSession(newSession);
        
        // Store user data in localStorage
        if (newSession?.user) {
          localStorage.setItem('currentUser', JSON.stringify(newSession.user));
        }
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
        setCurrentUser(null);
        setSession(null);
        // Only clear role if user is controller
        if (userRole === 'controller') {
          setUserRole(null);
          localStorage.removeItem('userRole');
          localStorage.removeItem('currentUser');
        }
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setCurrentUser(initialSession?.user ?? null);
      setSession(initialSession);
      setLoading(false);

      // Restore user data from localStorage if session exists
      if (initialSession?.user) {
        localStorage.setItem('currentUser', JSON.stringify(initialSession.user));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save role to localStorage when it changes
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    }
  }, [userRole]);

  const value = {
    currentUser,
    loading,
    userRole,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
