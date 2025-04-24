
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const { currentUser, userRole } = useAuth();

  // Validate role parameter
  if (role !== "controller" && role !== "client") {
    return <Navigate to="/" />;
  }

  // Redirect if already logged in with a role
  if (currentUser && userRole) {
    return <Navigate to={userRole === "controller" ? "/controller" : "/client"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[conic-gradient(from_0deg_at_50%_50%,_#1E293B_0%,_#090F1A_50%,_#1E293B_100%)] p-4">
      <div className="max-w-md w-full">
        <LoginForm role={role as "controller" | "client"} />
      </div>
    </div>
  );
};

export default Login;
