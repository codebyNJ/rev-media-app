
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-black overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.8)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.8)_2px,transparent_2px)] bg-[size:40px_40px] [background-position:center] opacity-20"></div>
      
      {/* Animated Stars */}
      <div className="stars absolute inset-0" aria-hidden="true">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="star absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center mb-12 animate-fade-in">
        <img 
          src="/lovable-uploads/e2fa95c3-42d8-4225-8fbe-933873129a02.png" 
          alt="REV Logo" 
          className="w-24 h-24 mx-auto mb-6 hover-scale"
        />
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70">
          Reach Every Vehicle
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl animate-slide-in relative z-10">
        <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:border-white/20 transition-all">
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <CardTitle className="text-xl font-bold">Controller</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-400">
            For company use only
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/login/controller")} 
              variant="default" 
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Login as Controller
            </Button>
          </CardFooter>
        </Card>

        <Card className="backdrop-blur-sm bg-white/5 border-white/10 hover:border-white/20 transition-all">
          <CardHeader className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <CardTitle className="text-xl font-bold">Client</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-400">
            For authorized auto drivers
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/login/client")} 
              variant="default" 
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Login as Client
            </Button>
          </CardFooter>
        </Card>
      </div>

      <footer className="relative z-10 mt-16 text-center text-gray-500">
        <p>© {new Date().getFullYear()} REV - Reach Every Vehicle</p>
      </footer>
    </div>
  );
};

export default Index;
