
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
      <header className="bg-card shadow-lg border-b border-white/10">
        <div className="container mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <img 
              src="/lovable-uploads/e2fa95c3-42d8-4225-8fbe-933873129a02.png" 
              alt="REV Logo" 
              className="h-8 hover-fade"
            />
            <h1 className="text-xl font-semibold tracking-wide">{title}</h1>
            {userRole && (
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium tracking-wide">
                {userRole}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="hidden md:inline text-sm text-muted-foreground">
                  {currentUser.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hover-glow"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/")}
                className="hover-glow"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6">
        {children}
      </main>
      <footer className="bg-card py-6 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            REV - Reach Every Vehicle © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
