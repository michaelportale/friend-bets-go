import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateBetModal } from "@/components/CreateBetModal";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { betStore, type Bet, type Group, type LedgerEntry } from "@/lib/betStore";
import { useToast } from "@/hooks/use-toast";
import { type BetFormData } from "@/components/CreateBetModal";
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
  Home,
  UserPlus
} from "lucide-react";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'bets' | 'ledger'>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { toast } = useToast();

  // Get real data from betStore
  const groups = betStore.getUserGroups(user.id);
  const bets = betStore.getUserBets(user.id);
  const ledger = betStore.getUserLedger(user.id);
  const userBalance = betStore.getUserBalance(user.id);

  const handleCreateGroup = async (name: string) => {
    const group = betStore.createGroup(user.id, name);
    return { id: group.id, inviteCode: group.inviteCode };
  };

  const handleCreateBet = (betData: BetFormData) => {
    const bet = betStore.createBet({
      title: betData.title,
      description: betData.description,
      sideA: betData.sideA,
      sideB: betData.sideB,
      stake: betData.stake,
      eventDate: betData.eventDate,
      proofType: betData.proofType === 'arbiter' ? 'vote' : betData.proofType,
      groupId: betData.groupId,
      creatorId: user.id
    });
    toast({
      title: "Bet created!",
      description: `${betData.title} is ready for participants.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'locked': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'awaiting_proof': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      case 'voting': return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      case 'resolved': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
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
                            <p className="text-2xl font-bold">{bets.filter(b => b.status === 'voting').length}</p>
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
                            <p className="text-2xl font-bold">${userBalance}</p>
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
                        {bets.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No bets yet. Create your first bet!
                          </p>
                        )}
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
                                {group.memberIds.length} members • Code: {group.inviteCode}
                              </p>
                            </div>
                            <Link to={`/group/${group.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        ))}
                        {groups.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No groups yet. Create your first group!
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Groups Tab */}
              {activeTab === 'groups' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">My Groups</h1>
                      <p className="text-muted-foreground">Manage your betting circles</p>
                    </div>
                    <Button onClick={() => setShowCreateGroup(true)} variant="gradient">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                      <Card key={group.id} className="shadow-card hover:shadow-elevated transition-all">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{group.name}</h3>
                              <Badge variant="secondary">{group.memberIds.length} members</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Invite Code: <span className="font-mono bg-muted px-2 py-1 rounded">{group.inviteCode}</span></p>
                            </div>
                            <Link to={`/group/${group.id}`}>
                              <Button variant="outline" className="w-full">
                                Manage Group
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {groups.length === 0 && (
                    <Card className="shadow-card">
                      <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first betting group to get started</p>
                        <Button onClick={() => setShowCreateGroup(true)} variant="gradient">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Group
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Bets Tab */}
              {activeTab === 'bets' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">My Bets</h1>
                      <p className="text-muted-foreground">Track all your betting activity</p>
                    </div>
                    <Button onClick={() => setShowCreateBet(true)} variant="gradient" disabled={groups.length === 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Bet
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {bets.map((bet) => {
                      const StatusIcon = getStatusIcon(bet.status);
                      return (
                        <Card key={bet.id} className="shadow-card hover:shadow-elevated transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                  <StatusIcon className="h-5 w-5 text-primary" />
                                  <h3 className="font-semibold">{bet.title}</h3>
                                  <Badge variant="secondary" className={getStatusColor(bet.status)}>
                                    {bet.status}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground">{bet.description}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span>{bet.sideA} vs {bet.sideB}</span>
                                  <span>Stake: ${bet.stake}</span>
                                  <span>Due: {bet.eventDate.toLocaleDateString()}</span>
                                </div>
                              </div>
                              <Link to={`/bet/${bet.id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {bets.length === 0 && (
                    <Card className="shadow-card">
                      <CardContent className="p-12 text-center">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No bets yet</h3>
                        <p className="text-muted-foreground mb-4">
                          {groups.length === 0 
                            ? "Create a group first, then start betting with friends"
                            : "Create your first bet to get started"
                          }
                        </p>
                        {groups.length === 0 ? (
                          <Button onClick={() => setShowCreateGroup(true)} variant="gradient">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Group First
                          </Button>
                        ) : (
                          <Button onClick={() => setShowCreateBet(true)} variant="gradient">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Bet
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Ledger Tab */}
              {activeTab === 'ledger' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h1 className="text-2xl font-bold">My Balance & History</h1>
                    <p className="text-muted-foreground">Track your wins, losses, and IOUs</p>
                  </div>

                  <Card className="shadow-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                          <p className={`text-4xl font-bold ${userBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${userBalance}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>All your betting transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                         {ledger.map((entry) => (
                           <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                             <div>
                               <p className="text-sm font-medium">Bet Transaction</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`font-semibold ${entry.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {entry.amount >= 0 ? '+' : ''}${entry.amount}
                            </span>
                          </div>
                        ))}
                        {ledger.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No transactions yet
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {groups.length > 0 && (
          <Button 
            size="lg" 
            variant="gradient" 
            className="rounded-full shadow-elevated"
            onClick={() => setShowCreateBet(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Bet
          </Button>
        )}
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full shadow-elevated bg-card"
          onClick={() => setShowCreateGroup(true)}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          New Group
        </Button>
      </div>

      {/* Modals */}
      <CreateGroupModal 
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
      />
      
      <CreateBetModal 
        isOpen={showCreateBet}
        onClose={() => setShowCreateBet(false)}
        onCreateBet={handleCreateBet}
        groups={groups.map(g => ({ ...g, memberCount: g.memberIds.length }))}
      />
    </div>
  );
}