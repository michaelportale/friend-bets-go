import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, Trophy, Vote } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
  memberCount: number;
}

interface CreateBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onCreateBet: (bet: BetFormData) => void;
}

export interface BetFormData {
  groupId: string;
  title: string;
  description: string;
  sideA: string;
  sideB: string;
  stake: number;
  eventDate: Date;
  proofType: 'vote' | 'arbiter';
  arbiterId?: string;
}

export function CreateBetModal({ isOpen, onClose, groups, onCreateBet }: CreateBetModalProps) {
  const [formData, setFormData] = useState<Partial<BetFormData>>({
    proofType: 'vote',
    stake: 10
  });
  const [eventDate, setEventDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate || !formData.groupId || !formData.title || !formData.sideA || !formData.sideB) {
      return;
    }

    setLoading(true);
    
    const betData: BetFormData = {
      groupId: formData.groupId,
      title: formData.title,
      description: formData.description || '',
      sideA: formData.sideA,
      sideB: formData.sideB,
      stake: formData.stake || 10,
      eventDate,
      proofType: formData.proofType || 'vote',
      arbiterId: formData.arbiterId
    };

    try {
      await onCreateBet(betData);
      onClose();
      // Reset form
      setFormData({ proofType: 'vote', stake: 10 });
      setEventDate(undefined);
    } catch (error) {
      console.error('Error creating bet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Create New Bet
          </DialogTitle>
          <DialogDescription>
            Set up a friendly wager with your group. All bets are IOU-based, no real money involved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Selection */}
          <div className="space-y-2">
            <Label htmlFor="group">Select Group</Label>
            <Select value={formData.groupId} onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a group for this bet" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {group.name} ({group.memberCount} members)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bet Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Bet Title</Label>
            <Input
              id="title"
              placeholder="e.g., Lakers vs Warriors Game"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details about the bet..."
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Bet Sides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sideA">Side A</Label>
              <Input
                id="sideA"
                placeholder="e.g., Lakers"
                value={formData.sideA || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sideA: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sideB">Side B</Label>
              <Input
                id="sideB"
                placeholder="e.g., Warriors"
                value={formData.sideB || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sideB: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stake">Stake Amount ($)</Label>
            <Input
              id="stake"
              type="number"
              min="1"
              max="1000"
              value={formData.stake || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, stake: parseInt(e.target.value) }))}
              required
            />
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label>Event Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : "Pick event date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Proof Type */}
          <div className="space-y-2">
            <Label>Resolution Method</Label>
            <Select value={formData.proofType} onValueChange={(value: 'vote' | 'arbiter') => setFormData(prev => ({ ...prev, proofType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vote">
                  <div className="flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    Democratic Vote (participants decide)
                  </div>
                </SelectItem>
                <SelectItem value="arbiter">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Designated Arbiter (neutral judge)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Bet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}