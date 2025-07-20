import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User } from "lucide-react";

interface AuthCardProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, displayName: string) => void;
}

export function AuthCard({ onLogin, onSignUp }: AuthCardProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onSignUp(email, password, displayName);
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-elevated border-border/50 bg-card/95 backdrop-blur-sm animate-scale-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold">
          {isLogin ? "Welcome Back" : "Join BetIt"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          {isLogin 
            ? "Sign in to your account to continue" 
            : "Create an account to start betting with friends"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            variant="gradient"
            size="lg"
            disabled={loading}
          >
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>

        {/* Test Users for Development */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">Quick Test Users (Dev Mode)</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onLogin("alice@test.com", "password")}
              className="text-xs"
            >
              Alice
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onLogin("bob@test.com", "password")}
              className="text-xs"
            >
              Bob
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onLogin("charlie@test.com", "password")}
              className="text-xs"
            >
              Charlie
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onLogin("diana@test.com", "password")}
              className="text-xs"
            >
              Diana
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}