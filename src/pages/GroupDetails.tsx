import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { betStore, type Group, type User, type Bet } from "@/lib/betStore";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Users, 
  Copy, 
  Plus,
  TrendingUp,
  Crown,
  Calendar
} from "lucide-react";

interface GroupDetailsProps {
  currentUser: User;
  onLogout: () => void;
}

export default function GroupDetails({ currentUser, onLogout }: GroupDetailsProps) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");

  const group = betStore.getGroup(groupId!);
  const groupBets = betStore.getGroupBets(groupId!);
  const groupMembers = group?.memberIds.map(id => betStore.getUser(id)).filter(Boolean) as User[];

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Group not found</h2>
            <p className="text-muted-foreground mb-4">This group doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate("/")} variant="gradient">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${group.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard.",
    });
  };

  const handleJoinGroup = () => {
    if (!inviteCode.trim()) return;
    
    const joinedGroup = betStore.joinGroup(inviteCode.trim(), currentUser.id);
    if (joinedGroup) {
      toast({
        title: "Joined group!",
        description: `Welcome to ${joinedGroup.name}`,
      });
      navigate(`/group/${joinedGroup.id}`);
    } else {
      toast({
        title: "Failed to join",
        description: "Invalid invite code or you're already a member.",
        variant: "destructive",
      });
    }
  };

  const isCreator = group.creatorId === currentUser.id;
  const isMember = group.memberIds.includes(currentUser.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  {group.name}
                  {isCreator && <Crown className="h-5 w-5 text-primary" />}
                </h1>
                <p className="text-muted-foreground">
                  {groupMembers.length} members • {groupBets.length} bets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Bets */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Group Bets
                  </div>
                  {isMember && (
                    <Link to={`/create-bet?groupId=${group.id}`}>
                      <Button size="sm" variant="gradient">
                        <Plus className="h-4 w-4 mr-2" />
                        New Bet
                      </Button>
                    </Link>
                  )}
                </CardTitle>
                <CardDescription>All bets in this group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupBets.map((bet) => (
                    <Card key={bet.id} className="border-border hover:shadow-card transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{bet.title}</h3>
                              <Badge variant="secondary" className={getStatusColor(bet.status)}>
                                {bet.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">{bet.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{bet.sideA} vs {bet.sideB}</span>
                              <span>Stake: ${bet.stake}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {bet.eventDate.toLocaleDateString()}
                              </span>
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
                  ))}
                  {groupBets.length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No bets yet</h3>
                      <p className="text-muted-foreground mb-4">Be the first to create a bet in this group!</p>
                      {isMember && (
                        <Link to={`/create-bet?groupId=${group.id}`}>
                          <Button variant="gradient">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Bet
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Members ({groupMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>{member.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          {member.displayName}
                          {member.id === group.creatorId && (
                            <Crown className="h-3 w-3 text-primary" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Invite Section */}
            {isMember && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Invite Friends</CardTitle>
                  <CardDescription>Share this group with others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg border-2 border-dashed border-primary/30">
                    <p className="text-sm font-medium mb-1">Invite Code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-background px-2 py-1 rounded flex-1">
                        {group.inviteCode}
                      </code>
                      <Button variant="outline" size="sm" onClick={copyInviteCode}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button variant="gradient" className="w-full" onClick={copyInviteLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Link
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Join Group Section (if not a member) */}
            {!isMember && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Join This Group</CardTitle>
                  <CardDescription>Enter an invite code to join</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                  <Button 
                    variant="gradient" 
                    className="w-full" 
                    onClick={handleJoinGroup}
                    disabled={!inviteCode.trim()}
                  >
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'bg-muted text-muted-foreground';
    case 'pending': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
    case 'locked': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
    case 'awaiting_proof': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
    case 'voting': return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
    case 'resolved': return 'bg-green-500/20 text-green-700 dark:text-green-300';
    default: return 'bg-muted text-muted-foreground';
  }
}