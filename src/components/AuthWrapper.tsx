import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { type User } from "@/lib/betStore";

interface AuthWrapperProps {
  children: (user: User, onLogout: () => void) => ReactNode;
  user: User | null;
  onLogout: () => void;
}

export function AuthWrapper({ children, user, onLogout }: AuthWrapperProps) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children(user, onLogout)}</>;
}