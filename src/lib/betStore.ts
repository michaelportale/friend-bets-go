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
  
  // Bet progression methods
  lockBet(betId: string): void {
    const bet = this.bets.get(betId);
    if (bet && bet.status === 'draft' && bet.participants.length >= 2) {
      bet.status = 'locked';
      this.bets.set(betId, bet);
    }
  }

  submitProof(betId: string, userId: string, proof: string): void {
    const bet = this.bets.get(betId);
    if (bet && bet.status === 'awaiting_proof') {
      // Store proof (in real app, this would be stored separately)
      bet.status = 'voting';
      this.bets.set(betId, bet);
    }
  }

  voteOnBet(betId: string, userId: string, winningSide: 'A' | 'B'): void {
    const bet = this.bets.get(betId);
    if (bet && bet.status === 'voting') {
      // In real app, store votes separately and count them
      // For demo, we'll just resolve immediately
      this.resolveBet(betId, winningSide);
    }
  }

  resolveBet(betId: string, winningSide: 'A' | 'B'): void {
    const bet = this.bets.get(betId);
    if (!bet || bet.status === 'resolved') return;

    bet.status = 'resolved';
    this.bets.set(betId, bet);

    // Calculate payouts
    const winners = bet.participants.filter(p => p.side === winningSide);
    const losers = bet.participants.filter(p => p.side !== winningSide);

    if (winners.length > 0 && losers.length > 0) {
      const winningsPerPerson = (bet.stake * losers.length) / winners.length;

      // Add ledger entries
      winners.forEach(winner => {
        this.addLedgerEntry({
          userId: winner.userId,
          betId: bet.id,
          amount: winningsPerPerson
        });
      });

      losers.forEach(loser => {
        this.addLedgerEntry({
          userId: loser.userId,
          betId: bet.id,
          amount: -bet.stake
        });
      });
    }
  }

  // Auto-progress bet based on conditions
  checkAndProgressBet(betId: string): void {
    const bet = this.bets.get(betId);
    if (!bet) return;

    const now = new Date();
    
    // Auto-lock if event date has passed and bet has participants
    if (bet.status === 'draft' && bet.participants.length >= 2 && bet.eventDate <= now) {
      bet.status = 'locked';
      this.bets.set(betId, bet);
    }
    
    // Auto-move to awaiting proof if event date has passed
    if (bet.status === 'locked' && bet.eventDate <= now) {
      bet.status = 'awaiting_proof';
      this.bets.set(betId, bet);
    }
  }

  updateBetStatus(betId: string, status: string): void {
    const bet = this.bets.get(betId);
    if (bet) {
      bet.status = status as any;
      this.bets.set(betId, bet);
    }
  }

  // Ledger methods
  addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
    const ledgerEntry: LedgerEntry = {
      ...entry,
      id: this.generateId(),
      createdAt: new Date()
    };
    this.ledger.push(ledgerEntry);
    return ledgerEntry;
  }

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

// Initialize with comprehensive mock data for demo
export function initializeMockData() {
  // Create test users (matching the quick login buttons)
  const alice = betStore.addUser({
    email: "alice@test.com",
    displayName: "Alice",
  });
  
  const bob = betStore.addUser({
    email: "bob@test.com", 
    displayName: "Bob",
  });
  
  const charlie = betStore.addUser({
    email: "charlie@test.com",
    displayName: "Charlie", 
  });
  
  const diana = betStore.addUser({
    email: "diana@test.com",
    displayName: "Diana",
  });

  // Create groups with multiple members
  const collegeFriends = betStore.createGroup("College Friends", alice.id);
  betStore.joinGroup(collegeFriends.inviteCode, bob.id);
  betStore.joinGroup(collegeFriends.inviteCode, charlie.id);
  
  const officeSquad = betStore.createGroup("Office Squad", bob.id);
  betStore.joinGroup(officeSquad.inviteCode, alice.id);
  betStore.joinGroup(officeSquad.inviteCode, diana.id);
  
  const gamingCrew = betStore.createGroup("Gaming Crew", charlie.id);
  betStore.joinGroup(gamingCrew.inviteCode, alice.id);
  betStore.joinGroup(gamingCrew.inviteCode, bob.id);
  betStore.joinGroup(gamingCrew.inviteCode, diana.id);

  // Create bets in different states to showcase the full lifecycle
  
  // 1. Active bet in voting stage
  const bet1 = betStore.createBet({
    groupId: collegeFriends.id,
    creatorId: alice.id,
    title: "Lakers vs Warriors",
    description: "Who wins the season opener?",
    sideA: "Lakers",
    sideB: "Warriors",
    stake: 25,
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    proofType: "vote"
  });
  betStore.acceptBet(bet1.id, bob.id, 'B');
  betStore.acceptBet(bet1.id, charlie.id, 'A');
  
  // 2. Locked bet (event happening soon)
  const bet2 = betStore.createBet({
    groupId: officeSquad.id,
    creatorId: bob.id,
    title: "Super Bowl Winner",
    description: "Who takes home the championship this year?",
    sideA: "Chiefs",
    sideB: "49ers",
    stake: 50,
    eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    proofType: "vote"
  });
  betStore.acceptBet(bet2.id, alice.id, 'A');
  betStore.acceptBet(bet2.id, diana.id, 'B');
  
  // 3. Draft bet (pending acceptance)
  const bet3 = betStore.createBet({
    groupId: gamingCrew.id,
    creatorId: charlie.id,
    title: "Elden Ring DLC Release",
    description: "Will the DLC drop before March?",
    sideA: "Before March",
    sideB: "After March",
    stake: 20,
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    proofType: "vote"
  });
  
  // 4. Resolved bet for ledger history
  const bet4 = betStore.createBet({
    groupId: collegeFriends.id,
    creatorId: alice.id,
    title: "Bitcoin Price Prediction",
    description: "Will Bitcoin hit $100k by end of year?",
    sideA: "Yes",
    sideB: "No", 
    stake: 30,
    eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Past date
    proofType: "vote"
  });
  betStore.acceptBet(bet4.id, bob.id, 'B');
  betStore.acceptBet(bet4.id, charlie.id, 'A');
  
  // Add some ledger entries to show transaction history
  betStore.addLedgerEntry({
    userId: alice.id,
    betId: bet4.id,
    amount: 30, // Alice won
  });
  
  betStore.addLedgerEntry({
    userId: bob.id,
    betId: bet4.id,
    amount: -30, // Bob lost
  });
  
  betStore.addLedgerEntry({
    userId: charlie.id,
    betId: bet4.id,
    amount: 0, // Charlie tied (for demo)
  });

  // 5. More variety in bet types
  const bet5 = betStore.createBet({
    groupId: officeSquad.id,
    creatorId: diana.id,
    title: "Company All-Hands Attendance",
    description: "Will more than 50 people attend?",
    sideA: "50+ people",
    sideB: "Under 50",
    stake: 15,
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    proofType: "vote"
  });
  betStore.acceptBet(bet5.id, alice.id, 'A');

  return { alice, bob, charlie, diana, collegeFriends, officeSquad, gamingCrew };
}

// Auto-initialize mock data for demo
initializeMockData();