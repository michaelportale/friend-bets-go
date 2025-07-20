import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Link as LinkIcon, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string) => Promise<{ id: string; inviteCode: string }>;
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setLoading(true);
    try {
      const result = await onCreateGroup(groupName.trim());
      setInviteCode(result.inviteCode);
      toast({
        title: "Group created!",
        description: `${groupName} is ready for betting. Share the invite code with friends.`,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteCode) {
      const inviteLink = `${window.location.origin}/join/${inviteCode}`;
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard.",
      });
    }
  };

  const handleClose = () => {
    setGroupName("");
    setInviteCode(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {inviteCode ? "Group Created!" : "Create New Group"}
          </DialogTitle>
          <DialogDescription>
            {inviteCode 
              ? "Share this invite link with your friends to get them betting!"
              : "Start a new betting circle with your friends."
            }
          </DialogDescription>
        </DialogHeader>

        {!inviteCode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g., College Friends, Office Squad"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                maxLength={50}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={loading || !groupName.trim()} className="flex-1">
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Invite Link</span>
              </div>
              <div className="text-xs text-muted-foreground break-all">
                {`${window.location.origin}/join/${inviteCode}`}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={copyInviteLink} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="gradient" onClick={handleClose} className="flex-1">
                Done
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Friends can join by clicking the link or entering the code: <strong>{inviteCode}</strong>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}