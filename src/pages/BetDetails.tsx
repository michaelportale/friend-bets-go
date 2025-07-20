import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { betStore, type Bet, type User, type Group } from "@/lib/betStore";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar,
  Users,
  Trophy,
  Vote,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  MessageSquare
} from "lucide-react";

interface BetDetailsProps {
  currentUser: User;
  onLogout: () => void;
}

export default function BetDetails({ currentUser, onLogout }: BetDetailsProps) {
  const { betId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSide, setSelectedSide] = useState<'A' | 'B' | null>(null);
  const [proofText, setProofText] = useState("");

  const bet = betStore.getBet(betId!);
  const group = bet ? betStore.getGroup(bet.groupId) : null;
  const creator = bet ? betStore.getUser(bet.creatorId) : null;
  const participants = bet?.participants.map(p => ({
    ...p,
    user: betStore.getUser(p.userId)
  })).filter(p => p.user) || [];

  if (!bet || !group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Bet not found</h2>
            <p className="text-muted-foreground mb-4">This bet doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate("/")} variant="gradient">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCreator = bet.creatorId === currentUser.id;
  const isGroupMember = group.memberIds.includes(currentUser.id);
  const userParticipation = participants.find(p => p.userId === currentUser.id);
  const canParticipate = isGroupMember && !userParticipation && bet.status === 'draft';

  const handleAcceptBet = (side: 'A' | 'B') => {
    try {
      betStore.acceptBet(bet.id, currentUser.id, side);
      toast({
        title: "Bet accepted!",
        description: `You're betting on ${side === 'A' ? bet.sideA : bet.sideB}`,
      });
      // Refresh page data by navigating to self
      navigate(`/bet/${bet.id}`, { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitProof = () => {
    if (!proofText.trim()) return;
    
    // For now, just show success message
    toast({
      title: "Proof submitted!",
      description: "Your proof has been submitted for voting.",
    });
    setProofText("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Clock;
      case 'pending': return Users;
      case 'locked': return Trophy;
      case 'awaiting_proof': return Upload;
      case 'voting': return Vote;
      case 'resolved': return CheckCircle;
      default: return Clock;
    }
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

  const StatusIcon = getStatusIcon(bet.status);
  const sideAParticipants = participants.filter(p => p.side === 'A');
  const sideBParticipants = participants.filter(p => p.side === 'B');

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
                  <StatusIcon className="h-6 w-6 text-primary" />
                  {bet.title}
                </h1>
                <p className="text-muted-foreground">
                  In <Link to={`/group/${group.id}`} className="text-primary hover:underline">{group.name}</Link> • Created by {creator?.displayName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getStatusColor(bet.status)}>
                {bet.status}
              </Badge>
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
            {/* Bet Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Bet Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{bet.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Stake Amount</p>
                    <p className="text-2xl font-bold">${bet.stake}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {bet.eventDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Proof Type</p>
                    <p className="text-lg font-semibold">{bet.proofType}</p>
                  </div>
                </div>

                {/* Betting Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">Side A</h4>
                        <Badge variant="outline">{sideAParticipants.length} bettors</Badge>
                      </div>
                      <p className="text-primary font-semibold text-xl mb-3">{bet.sideA}</p>
                      <div className="space-y-2">
                        {sideAParticipants.map((participant) => (
                          <div key={participant.userId} className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={participant.user?.avatarUrl} />
                              <AvatarFallback>{participant.user?.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <span>{participant.user?.displayName}</span>
                          </div>
                        ))}
                      </div>
                      {canParticipate && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={() => handleAcceptBet('A')}
                        >
                          Bet on {bet.sideA}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">Side B</h4>
                        <Badge variant="outline">{sideBParticipants.length} bettors</Badge>
                      </div>
                      <p className="text-primary font-semibold text-xl mb-3">{bet.sideB}</p>
                      <div className="space-y-2">
                        {sideBParticipants.map((participant) => (
                          <div key={participant.userId} className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={participant.user?.avatarUrl} />
                              <AvatarFallback>{participant.user?.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <span>{participant.user?.displayName}</span>
                          </div>
                        ))}
                      </div>
                      {canParticipate && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={() => handleAcceptBet('B')}
                        >
                          Bet on {bet.sideB}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {!isGroupMember && (
                  <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                        <Users className="h-5 w-5" />
                        <p className="font-medium">You must be a member of {group.name} to participate in this bet.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Proof Submission */}
            {bet.status === 'awaiting_proof' && userParticipation && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Submit Proof
                  </CardTitle>
                  <CardDescription>
                    The event has occurred. Submit your proof for verification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe your proof or paste links to evidence..."
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    variant="gradient" 
                    onClick={handleSubmitProof}
                    disabled={!proofText.trim()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Proof
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Voting Section */}
            {bet.status === 'voting' && userParticipation && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="h-5 w-5 text-primary" />
                    Cast Your Vote
                  </CardTitle>
                  <CardDescription>
                    Review the evidence and vote on the outcome.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="font-semibold">Vote for {bet.sideA}</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4">
                      <div className="text-center">
                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="font-semibold">Vote for {bet.sideB}</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.user?.avatarUrl} />
                        <AvatarFallback>{participant.user?.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.user?.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          Betting on {participant.side === 'A' ? bet.sideA : bet.sideB}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Side {participant.side}
                      </Badge>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No participants yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Group Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Group</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/group/${group.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.memberIds.length} members
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium">Bet created</p>
                      <p className="text-muted-foreground">{bet.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${bet.status !== 'draft' ? 'bg-primary' : 'bg-muted'}`}></div>
                    <div>
                      <p className="font-medium">Event date</p>
                      <p className="text-muted-foreground">{bet.eventDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}