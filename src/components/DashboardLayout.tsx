import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  TrendingUp, 
  Clock, 
  Vote, 
  Trophy,
  Menu,
  LogOut,
  Settings,
  Home
} from "lucide-react";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  activeBets: number;
}

interface Bet {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'locked' | 'awaiting_proof' | 'voting' | 'resolved';
  stake: number;
  sideA: string;
  sideB: string;
  eventDate: Date;
  participants: number;
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'bets' | 'ledger'>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Mock data - in real app this would come from API
  const groups: Group[] = [
    { id: '1', name: 'College Friends', memberCount: 8, activeBets: 3 },
    { id: '2', name: 'Office Squad', memberCount: 12, activeBets: 5 },
    { id: '3', name: 'Gaming Crew', memberCount: 6, activeBets: 2 }
  ];

  const bets: Bet[] = [
    {
      id: '1',
      title: 'Lakers vs Warriors',
      description: 'Who wins the season opener?',
      status: 'voting',
      stake: 20,
      sideA: 'Lakers',
      sideB: 'Warriors', 
      eventDate: new Date('2024-01-15'),
      participants: 4
    },
    {
      id: '2',
      title: 'Super Bowl Winner',
      description: 'Who takes home the championship?',
      status: 'locked',
      stake: 50,
      sideA: 'Chiefs',
      sideB: 'Eagles',
      eventDate: new Date('2024-02-11'),
      participants: 8
    }
  ];

  const getStatusColor = (status: Bet['status']) => {
    switch (status) {
      case 'draft': return 'bg-muted';
      case 'pending': return 'bg-warning';
      case 'locked': return 'bg-accent';
      case 'awaiting_proof': return 'bg-primary';
      case 'voting': return 'bg-primary';
      case 'resolved': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: Bet['status']) => {
    switch (status) {
      case 'voting': return Vote;
      case 'locked': return Clock;
      case 'resolved': return Trophy;
      default: return Clock;
    }
  };

  const navigation = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'bets', label: 'Active Bets', icon: TrendingUp },
    { id: 'ledger', label: 'My Balance', icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          BetIt
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-1 min-h-0 bg-card border-r border-border">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  BetIt
                </h1>
              </div>
              
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-card'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* User section */}
            <div className="flex-shrink-0 flex border-t border-border p-4">
              <div className="flex items-center w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
              <div className="flex flex-col h-full pt-5 pb-4">
                <div className="flex items-center flex-shrink-0 px-4 mb-8">
                  <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    BetIt
                  </h1>
                </div>
                
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {navigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setShowMobileMenu(false);
                      }}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-foreground shadow-card'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
                
                <div className="flex-shrink-0 flex border-t border-border p-4">
                  <div className="flex items-center w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h1 className="text-2xl font-bold">Welcome back, {user.displayName}!</h1>
                    <p className="text-muted-foreground">Here's what's happening with your bets</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-card hover:shadow-elevated transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-primary" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold">{groups.length}</p>
                            <p className="text-sm text-muted-foreground">Groups</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-card hover:shadow-elevated transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <TrendingUp className="h-8 w-8 text-accent" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold">{bets.length}</p>
                            <p className="text-sm text-muted-foreground">Active Bets</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-card hover:shadow-elevated transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Vote className="h-8 w-8 text-warning" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold">1</p>
                            <p className="text-sm text-muted-foreground">Awaiting Vote</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-card hover:shadow-elevated transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Trophy className="h-8 w-8 text-success" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold">+$25</p>
                            <p className="text-sm text-muted-foreground">Net Balance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle>Recent Bets</CardTitle>
                        <CardDescription>Your latest betting activity</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {bets.slice(0, 3).map((bet) => {
                          const StatusIcon = getStatusIcon(bet.status);
                          return (
                            <div key={bet.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                              <StatusIcon className="h-5 w-5 text-primary" />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">{bet.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {bet.sideA} vs {bet.sideB} • ${bet.stake}
                                </p>
                              </div>
                              <Badge variant="secondary" className={getStatusColor(bet.status)}>
                                {bet.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle>My Groups</CardTitle>
                        <CardDescription>Active betting circles</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {groups.map((group) => (
                          <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-sm font-medium">{group.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {group.memberCount} members • {group.activeBets} active bets
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="fixed bottom-6 right-6">
                <Button size="lg" variant="gradient" className="rounded-full shadow-elevated">
                  <Plus className="h-5 w-5 mr-2" />
                  New Bet
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}