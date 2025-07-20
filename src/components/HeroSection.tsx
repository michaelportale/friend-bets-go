import heroImage from "@/assets/hero-image.jpg";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Shield, Zap } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const features = [
    {
      icon: Users,
      title: "Friends Only",
      description: "Private groups for trusted betting circles"
    },
    {
      icon: Trophy,
      title: "Proof System",
      description: "Democratic voting or trusted arbiters"
    },
    {
      icon: Shield,
      title: "No Real Money",
      description: "IOU tracking keeps it fun and social"
    },
    {
      icon: Zap,
      title: "Fast & Simple",
      description: "Create, accept, and resolve bets instantly"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/80" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                BetIt
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Make friendly bets with your crew. No money, just bragging rights and IOUs.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="xl" 
              variant="gradient"
              onClick={onGetStarted}
              className="animate-pulse-glow"
            >
              Get Started
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              className="border-primary/50 hover:border-primary"
            >
              How It Works
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="px-4 py-16 bg-card/30 backdrop-blur-sm border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Friends Choose BetIt
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="text-center space-y-4 p-6 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}