import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { AuthCard } from "@/components/AuthCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { betStore, type User } from "@/lib/betStore";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find existing user from betStore by email
    const existingUsers = Array.from((betStore as any).users.values()) as User[];
    const foundUser = existingUsers.find(u => u.email === email);
    
    if (foundUser) {
      // Use existing user from betStore
      setUser(foundUser);
    } else {
      // Create new user if not found (fallback)
      const newUser = betStore.addUser({
        email,
        displayName: email.split('@')[0]
      });
      setUser(newUser);
    }
    
    setShowAuth(false);
    
    toast({
      title: "Welcome back!",
      description: "You've successfully signed in to BetIt.",
    });
  };

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new user in betStore
    const newUser = betStore.addUser({
      email,
      displayName
    });
    
    setUser(newUser);
    setShowAuth(false);
    
    toast({
      title: "Account created!",
      description: "Welcome to BetIt! Start creating your first group.",
    });
  };

  const handleLogout = () => {
    setUser(null);
    setShowAuth(false);
    
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  // If user is logged in, show dashboard
  if (user) {
    return <DashboardLayout user={user} onLogout={handleLogout} />;
  }

  // If showing auth, show auth card
  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <AuthCard onLogin={handleLogin} onSignUp={handleSignUp} />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAuth(false)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: show hero section
  return <HeroSection onGetStarted={handleGetStarted} />;
};

export default Index;
