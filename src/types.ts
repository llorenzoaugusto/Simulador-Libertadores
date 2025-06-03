
export interface Team {
  id: string; // Internal app identifier (e.g., 'sao_paulo')
  name: string;
  apiId?: number | null; // ID for external APIs, now optional as local logos are primary
  logo?: string; // Path to local logo (ex: "/logos/337.png")
}


export enum Round {
  OITAVAS = 'Oitavas de Final',
  QUARTAS = 'Quartas de Final',
  SEMIFINAL = 'Semifinal',
  FINAL = 'Final',
}

export interface Matchup {
  id: string; // e.g., "R16_L_0" for Round of 16, Left side, Match 0
  teams: [Team | null, Team | null];
  winner: Team | null;
  round: Round;
  side: 'left' | 'right' | 'center';
  matchIndex: number; // Index within its group (left/right/center) for that round
}

// Structure to hold matchups for each stage
// For OITAVAS, QUARTAS, SEMIFINAL, we have 'left' and 'right' sides
// For FINAL, we have 'center'
export interface BracketData {
  [Round.OITAVAS]: {
    left: Matchup[];
    right: Matchup[];
  };
  [Round.QUARTAS]: {
    left: Matchup[];
    right: Matchup[];
  };
  [Round.SEMIFINAL]: {
    left: Matchup[];
    right: Matchup[];
  };
  [Round.FINAL]: {
    center: Matchup[];
  };
  champion: Team | null;
}