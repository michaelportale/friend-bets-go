import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Users, Trophy } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { betStore, type User, type Group } from "@/lib/betStore";
import { useToast } from "@/hooks/use-toast";

interface CreateBetPageProps {
  currentUser: User;
  onLogout: () => void;
}

export default function CreateBetPage({ currentUser, onLogout }: CreateBetPageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const groupId = searchParams.get('groupId');
  const group = groupId ? betStore.getGroup(groupId) : null;
  const userGroups = betStore.getUserGroups(currentUser.id);

  const [formData, setFormData] = useState({
    groupId: groupId || '',
    title: '',
    description: '',
    sideA: '',
    sideB: '',
    stake: '',
    eventDate: null as Date | null,
    proofType: 'vote' as 'vote' | 'arbiter',
    arbiterId: ''
  });

  const [loading, setLoading] = useState(false);

  // If no group specified, redirect to dashboard
  useEffect(() => {
    if (!groupId && userGroups.length === 0) {
      toast({
        title: "No groups found",
        description: "Create a group first before making bets.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [groupId, userGroups.length, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupId || !formData.title || !formData.description || 
        !formData.sideA || !formData.sideB || !formData.stake || !formData.eventDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const bet = betStore.createBet({
        groupId: formData.groupId,
        creatorId: currentUser.id,
        title: formData.title,
        description: formData.description,
        sideA: formData.sideA,
        sideB: formData.sideB,
        stake: parseInt(formData.stake),
        eventDate: formData.eventDate,
        proofType: formData.proofType
      });

      toast({
        title: "Bet created!",
        description: `${formData.title} is ready for participants.`,
      });

      // Navigate to the bet details page
      navigate(`/bet/${bet.id}`);
    } catch (error) {
      console.error('Error creating bet:', error);
      toast({
        title: "Error",
        description: "Failed to create bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!group && groupId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Group not found</h2>
            <p className="text-muted-foreground mb-4">This group doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/")} variant="gradient">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Create New Bet
                </h1>
                <p className="text-muted-foreground">
                  {group ? `In ${group.name}` : 'Choose a group to get started'}
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Bet Details
            </CardTitle>
            <CardDescription>
              Create a new bet for your group members to participate in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Selection */}
              <div className="space-y-2">
                <Label htmlFor="group">Group *</Label>
                <Select 
                  value={formData.groupId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.memberIds.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bet Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Bet Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Lakers vs Warriors Game"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what the bet is about and any specific conditions..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Betting Sides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sideA">Side A *</Label>
                  <Input
                    id="sideA"
                    placeholder="e.g., Lakers"
                    value={formData.sideA}
                    onChange={(e) => setFormData(prev => ({ ...prev, sideA: e.target.value }))}
                    required
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sideB">Side B *</Label>
                  <Input
                    id="sideB"
                    placeholder="e.g., Warriors"
                    value={formData.sideB}
                    onChange={(e) => setFormData(prev => ({ ...prev, sideB: e.target.value }))}
                    required
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Stake Amount */}
              <div className="space-y-2">
                <Label htmlFor="stake">Stake Amount ($) *</Label>
                <Input
                  id="stake"
                  type="number"
                  placeholder="25"
                  value={formData.stake}
                  onChange={(e) => setFormData(prev => ({ ...prev, stake: e.target.value }))}
                  required
                  min="1"
                  max="1000"
                />
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.eventDate ? format(formData.eventDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, eventDate: date || null }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Proof Type */}
              <div className="space-y-2">
                <Label htmlFor="proofType">How will the outcome be determined? *</Label>
                <Select 
                  value={formData.proofType} 
                  onValueChange={(value: 'vote' | 'arbiter') => 
                    setFormData(prev => ({ ...prev, proofType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vote">Group vote on evidence</SelectItem>
                    <SelectItem value="arbiter">Designated arbiter decides</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Arbiter Selection (if needed) */}
              {formData.proofType === 'arbiter' && group && (
                <div className="space-y-2">
                  <Label htmlFor="arbiter">Choose Arbiter</Label>
                  <Select 
                    value={formData.arbiterId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, arbiterId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group member as arbiter" />
                    </SelectTrigger>
                    <SelectContent>
                      {group.memberIds
                        .filter(id => id !== currentUser.id)
                        .map((memberId) => {
                          const member = betStore.getUser(memberId);
                          return member ? (
                            <SelectItem key={member.id} value={member.id}>
                              {member.displayName}
                            </SelectItem>
                          ) : null;
                        })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="gradient" 
                  disabled={loading || !formData.groupId || !formData.title || !formData.description || 
                           !formData.sideA || !formData.sideB || !formData.stake || !formData.eventDate} 
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create Bet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}