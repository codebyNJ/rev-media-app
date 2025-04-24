
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Toast notification handled in AuthContext.tsx
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-card shadow-md">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="ml-4 text-sm text-muted-foreground">
              {userRole && <span className="px-2 py-1 rounded-full bg-primary/20 text-primary-foreground">{userRole}</span>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="hidden md:inline text-sm text-muted-foreground">{currentUser.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6">
        {children}
      </main>
      <footer className="bg-card py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Media Sync Stream © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
