// Simple in-memory store for betting data
// In production, this would integrate with Supabase

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  creatorId: string;
  inviteCode: string;
  memberIds: string[];
  createdAt: Date;
}

export interface Bet {
  id: string;
  groupId: string;
  creatorId: string;
  title: string;
  description: string;
  sideA: string;
  sideB: string;
  stake: number;
  eventDate: Date;
  status: 'draft' | 'pending' | 'locked' | 'awaiting_proof' | 'voting' | 'resolved' | 'void';
  proofType: 'vote' | 'arbiter';
  arbiterId?: string;
  winnerSide?: 'A' | 'B';
  participants: BetParticipant[];
  createdAt: Date;
}

export interface BetParticipant {
  userId: string;
  side: 'A' | 'B';
  acceptedAt: Date;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  betId: string;
  amount: number; // positive = won, negative = lost
  createdAt: Date;
}

// In-memory storage (replace with Supabase in production)
class BetStore {
  private users: Map<string, User> = new Map();
  private groups: Map<string, Group> = new Map();
  private bets: Map<string, Bet> = new Map();
  private ledger: LedgerEntry[] = [];
  private groupMembers: Map<string, Set<string>> = new Map(); // groupId -> userIds

  // Generate simple IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  // User methods
  addUser(user: Omit<User, 'id'>): User {
    const id = this.generateId();
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  // Group methods
  createGroup(name: string, creatorId: string): Group {
    const id = this.generateId();
    const inviteCode = this.generateInviteCode();
    const group: Group = {
      id,
      name,
      creatorId,
      inviteCode,
      memberIds: [creatorId],
      createdAt: new Date()
    };
    
    this.groups.set(id, group);
    
    // Add to group members
    if (!this.groupMembers.has(id)) {
      this.groupMembers.set(id, new Set());
    }
    this.groupMembers.get(id)!.add(creatorId);
    
    return group;
  }

  joinGroup(inviteCode: string, userId: string): Group | null {
    const group = Array.from(this.groups.values()).find(g => g.inviteCode === inviteCode);
    if (!group || group.memberIds.includes(userId)) {
      return null;
    }

    group.memberIds.push(userId);
    this.groupMembers.get(group.id)!.add(userId);
    this.groups.set(group.id, group);
    
    return group;
  }

  getUserGroups(userId: string): Group[] {
    return Array.from(this.groups.values()).filter(group => 
      group.memberIds.includes(userId)
    );
  }

  getGroup(id: string): Group | undefined {
    return this.groups.get(id);
  }

  // Bet methods
  createBet(bet: Omit<Bet, 'id' | 'status' | 'participants' | 'createdAt'>): Bet {
    const id = this.generateId();
    const newBet: Bet = {
      ...bet,
      id,
      status: 'draft',
      participants: [],
      createdAt: new Date()
    };
    
    this.bets.set(id, newBet);
    return newBet;
  }

  acceptBet(betId: string, userId: string, side: 'A' | 'B'): Bet | null {
    const bet = this.bets.get(betId);
    if (!bet || bet.status !== 'draft') {
      return null;
    }

    // Check if user is already in this bet
    if (bet.participants.some(p => p.userId === userId)) {
      return null;
    }

    // Check if the opposite side is already taken
    const oppositeSide = side === 'A' ? 'B' : 'A';
    const oppositeTaken = bet.participants.some(p => p.side === oppositeSide);
    
    bet.participants.push({
      userId,
      side,
      acceptedAt: new Date()
    });

    // If both sides are taken, lock the bet
    if (bet.participants.length === 2) {
      bet.status = 'locked';
    } else {
      bet.status = 'pending';
    }

    this.bets.set(betId, bet);
    return bet;
  }

  getBet(id: string): Bet | undefined {
    return this.bets.get(id);
  }

  getGroupBets(groupId: string): Bet[] {
    return Array.from(this.bets.values()).filter(bet => bet.groupId === groupId);
  }

  getUserBets(userId: string): Bet[] {
    return Array.from(this.bets.values()).filter(bet => 
      bet.creatorId === userId || bet.participants.some(p => p.userId === userId)
    );
  }

  // Bet resolution
  resolveBet(betId: string, winnerSide: 'A' | 'B'): boolean {
    const bet = this.bets.get(betId);
    if (!bet || bet.status !== 'voting') {
      return false;
    }

    bet.status = 'resolved';
    bet.winnerSide = winnerSide;

    // Create ledger entries
    bet.participants.forEach(participant => {
      const isWinner = participant.side === winnerSide;
      const amount = isWinner ? bet.stake : -bet.stake;
      
      this.ledger.push({
        id: this.generateId(),
        userId: participant.userId,
        betId: bet.id,
        amount,
        createdAt: new Date()
      });
    });

    this.bets.set(betId, bet);
    return true;
  }

  // Ledger methods
  getUserBalance(userId: string): number {
    return this.ledger
      .filter(entry => entry.userId === userId)
      .reduce((total, entry) => total + entry.amount, 0);
  }

  getUserLedger(userId: string): LedgerEntry[] {
    return this.ledger.filter(entry => entry.userId === userId);
  }
}

// Export singleton instance
export const betStore = new BetStore();

// Initialize with some mock data
export function initializeMockData() {
  // Add some sample users
  const user1 = betStore.addUser({
    email: "demo@betit.com",
    displayName: "Demo User",
  });

  // Add some sample groups
  const group1 = betStore.createGroup("College Friends", user1.id);
  const group2 = betStore.createGroup("Office Squad", user1.id);

  // Add some sample bets
  betStore.createBet({
    groupId: group1.id,
    creatorId: user1.id,
    title: "Lakers vs Warriors",
    description: "Season opener game prediction",
    sideA: "Lakers",
    sideB: "Warriors",
    stake: 25,
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    proofType: "vote"
  });

  return { user1, group1, group2 };
}