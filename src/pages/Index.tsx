
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building2, User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,38,44,1)_0%,rgba(0,0,0,1)_100%)]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(55,65,81,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(55,65,81,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <img
            src="/lovable-uploads/e2fa95c3-42d8-4225-8fbe-933873129a02.png"
            alt="REV Logo"
            className="w-32 h-32 mx-auto mb-8 hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70">
            Reach Every Vehicle
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Revolutionizing vehicle management through innovative solutions
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4 animate-slide-in">
          {/* Controller Card */}
          <Card className="group backdrop-blur-md bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Controller</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <p className="text-gray-400">For company use only</p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/login/controller")}
                className="w-full bg-blue-500/80 hover:bg-blue-600 transition-colors duration-300"
              >
                Login as Controller
              </Button>
            </CardFooter>
          </Card>

          {/* Client Card */}
          <Card className="group backdrop-blur-md bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Client</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <p className="text-gray-400">For authorized auto drivers</p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate("/login/client")}
                className="w-full bg-green-500/80 hover:bg-green-600 transition-colors duration-300"
              >
                Login as Client
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-24 text-center text-gray-500">
          <p className="text-sm">© {new Date().getFullYear()} REV - Reach Every Vehicle</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
