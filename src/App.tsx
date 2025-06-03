import React, { useState, useCallback } from 'react';
import { Team, Matchup, BracketData, Round } from './types';
import { INITIAL_TEAMS } from './constants';
import TeamCard from './components/TeamCard';
import FinalInfoDisplay from './components/FinalInfoDisplay';
import ConnectorColumn from './components/ConnectorColumn';

const App: React.FC = () => {
  const [bracketData, setBracketData] = useState<BracketData>(initializeBracket());
  const [showConfetti, setShowConfetti] = useState(false);

  function initializeBracket(): BracketData {
    const initialR16Teams = [...INITIAL_TEAMS];
    const r16LeftMatchups: Matchup[] = [];
    const r16RightMatchups: Matchup[] = [];

    for (let i = 0; i < 4; i++) {
      r16LeftMatchups.push({
        id: `R16_L_${i}`,
        teams: [initialR16Teams[i*2], initialR16Teams[i*2+1]],
        winner: null,
        round: Round.OITAVAS,
        side: 'left',
        matchIndex: i,
      });
      r16RightMatchups.push({
        id: `R16_R_${i}`,
        teams: [initialR16Teams[8 + i*2], initialR16Teams[8 + i*2+1]],
        winner: null,
        round: Round.OITAVAS,
        side: 'right',
        matchIndex: i,
      });
    }

    return {
      [Round.OITAVAS]: { left: r16LeftMatchups, right: r16RightMatchups },
      [Round.QUARTAS]: { left: createEmptyMatchups(2, Round.QUARTAS, 'left', 'QF_L_'), right: createEmptyMatchups(2, Round.QUARTAS, 'right', 'QF_R_') },
      [Round.SEMIFINAL]: { left: createEmptyMatchups(1, Round.SEMIFINAL, 'left', 'SF_L_'), right: createEmptyMatchups(1, Round.SEMIFINAL, 'right', 'SF_R_') },
      [Round.FINAL]: { center: createEmptyMatchups(1, Round.FINAL, 'center', 'F_C_') },
      champion: null,
    };
  }

  function createEmptyMatchups(count: number, round: Round, side: 'left' | 'right' | 'center', idPrefix: string): Matchup[] {
    return Array(count).fill(null).map((_, i) => ({
      id: `${idPrefix}${i}`,
      teams: [null, null] as [Team | null, Team | null],
      winner: null,
      round,
      side,
      matchIndex: i,
    }));
  }

  const handleWinnerSelected = useCallback((matchupId: string, winner: Team) => {
    setBracketData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData)) as BracketData;
      let targetMatchup: Matchup | undefined;
      let stageKey: Round | undefined;
      let sideKey: 'left' | 'right' | 'center' | undefined; 
      let matchupIndex = -1;

      for (const r of Object.values(Round)) {
        if (targetMatchup) break; 

        if (r === Round.FINAL) {
          const roundFinalData = newData[Round.FINAL];
          const idx = roundFinalData.center.findIndex(m => m.id === matchupId);
          if (idx !== -1) {
            targetMatchup = roundFinalData.center[idx];
            stageKey = r; sideKey = 'center'; matchupIndex = idx;
          }
        } else {
          const roundNonFinalData = newData[r as Exclude<Round, Round.FINAL>];
          
          let foundIdx = roundNonFinalData.left.findIndex(m => m.id === matchupId);
          if (foundIdx !== -1) {
            targetMatchup = roundNonFinalData.left[foundIdx];
            stageKey = r; sideKey = 'left'; matchupIndex = foundIdx;
            break; 
          }

          foundIdx = roundNonFinalData.right.findIndex(m => m.id === matchupId);
          if (foundIdx !== -1) {
            targetMatchup = roundNonFinalData.right[foundIdx];
            stageKey = r; sideKey = 'right'; matchupIndex = foundIdx;
            break;
          }
        }
      }
      
      if (targetMatchup && stageKey && sideKey !== undefined && matchupIndex !== -1) {
        targetMatchup.winner = winner;
        if (stageKey === Round.OITAVAS) {
          const nextStageData = newData[Round.QUARTAS];
          const nextMatchIndex = Math.floor(matchupIndex / 2);
          const teamSlot = matchupIndex % 2;
          if (sideKey === 'left' && nextStageData.left?.[nextMatchIndex]) nextStageData.left[nextMatchIndex].teams[teamSlot] = winner;
          if (sideKey === 'right' && nextStageData.right?.[nextMatchIndex]) nextStageData.right[nextMatchIndex].teams[teamSlot] = winner;
        } else if (stageKey === Round.QUARTAS) {
          const nextStageData = newData[Round.SEMIFINAL];
          const nextMatchIndex = Math.floor(matchupIndex / 2);
          const teamSlot = matchupIndex % 2;
          if (sideKey === 'left' && nextStageData.left?.[nextMatchIndex]) nextStageData.left[nextMatchIndex].teams[teamSlot] = winner;
          if (sideKey === 'right' && nextStageData.right?.[nextMatchIndex]) nextStageData.right[nextMatchIndex].teams[teamSlot] = winner;
        } else if (stageKey === Round.SEMIFINAL) {
          const nextStageData = newData[Round.FINAL]; 
          const teamSlot = sideKey === 'left' ? 0 : 1; 
          if (nextStageData.center?.[0]) nextStageData.center[0].teams[teamSlot] = winner;
        } else if (stageKey === Round.FINAL) {
          newData.champion = winner;
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
      return newData;
    });
  }, []);

  const resetBracket = () => {
    setBracketData(initializeBracket());
    setShowConfetti(false);
  };

  const simulateAll = useCallback(() => {
    const newData = JSON.parse(JSON.stringify(bracketData)) as BracketData;
    
    const simulateMatchupsList = (
      matchupsList: Matchup[], 
      currentRoundKey: Round, 
      nextRdKey?: Round
    ) => {
      matchupsList.forEach(matchup => {
        if (!matchup.winner && matchup.teams[0] && matchup.teams[1]) {
          const randomWinner = Math.random() < 0.5 ? matchup.teams[0]! : matchup.teams[1]!;
          matchup.winner = randomWinner;

          if (currentRoundKey === Round.OITAVAS && nextRdKey === Round.QUARTAS) {
            const nextStage = newData[Round.QUARTAS];
            const nextMatchIndex = Math.floor(matchup.matchIndex / 2);
            const teamSlot = matchup.matchIndex % 2;
            if (matchup.side === 'left' && nextStage.left?.[nextMatchIndex]) nextStage.left[nextMatchIndex].teams[teamSlot] = randomWinner;
            if (matchup.side === 'right' && nextStage.right?.[nextMatchIndex]) nextStage.right[nextMatchIndex].teams[teamSlot] = randomWinner;
          } else if (currentRoundKey === Round.QUARTAS && nextRdKey === Round.SEMIFINAL) {
            const nextStage = newData[Round.SEMIFINAL];
            const nextMatchIndex = Math.floor(matchup.matchIndex / 2);
            const teamSlot = matchup.matchIndex % 2;
            if (matchup.side === 'left' && nextStage.left?.[nextMatchIndex]) nextStage.left[nextMatchIndex].teams[teamSlot] = randomWinner;
            if (matchup.side === 'right' && nextStage.right?.[nextMatchIndex]) nextStage.right[nextMatchIndex].teams[teamSlot] = randomWinner;
          } else if (currentRoundKey === Round.SEMIFINAL && nextRdKey === Round.FINAL) {
            const nextStage = newData[Round.FINAL];
            const teamSlot = matchup.side === 'left' ? 0 : 1;
            if (nextStage.center?.[0]) nextStage.center[0].teams[teamSlot] = randomWinner;
          } else if (currentRoundKey === Round.FINAL) {
            newData.champion = randomWinner;
          }
        }
      });
    };

    simulateMatchupsList(newData[Round.OITAVAS].left, Round.OITAVAS, Round.QUARTAS);
    simulateMatchupsList(newData[Round.OITAVAS].right, Round.OITAVAS, Round.QUARTAS);
    simulateMatchupsList(newData[Round.QUARTAS].left, Round.QUARTAS, Round.SEMIFINAL);
    simulateMatchupsList(newData[Round.QUARTAS].right, Round.QUARTAS, Round.SEMIFINAL);
    simulateMatchupsList(newData[Round.SEMIFINAL].left, Round.SEMIFINAL, Round.FINAL);
    simulateMatchupsList(newData[Round.SEMIFINAL].right, Round.SEMIFINAL, Round.FINAL);
    simulateMatchupsList(newData[Round.FINAL].center, Round.FINAL);
    
    setBracketData(newData);
    if (newData.champion) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [bracketData]);
  
  const renderMatchup = (matchup: Matchup, keyPrefix: string) => {
    const { teams, winner, id } = matchup;
    const team1 = teams[0];
    const team2 = teams[1];
    const canSelect = !!(team1 && team2 && !winner);

    return (
      <div key={`${keyPrefix}-${id}`} className="my-[var(--matchup-item-margin-y)] relative matchup-item w-full" style={{ height: 'var(--matchup-content-height)'}}>
        <TeamCard team={team1} onClick={canSelect && team1 ? () => handleWinnerSelected(id, team1) : undefined} isWinner={winner === team1} isLoser={!!(winner && winner !== team1)} isClickable={canSelect} />
        <div className="text-center text-[10px] md:text-xs text-yellow-400 my-0.5 h-[var(--vs-div-height)] flex items-center justify-center">vs</div>
        <TeamCard team={team2} onClick={canSelect && team2 ? () => handleWinnerSelected(id, team2) : undefined} isWinner={winner === team2} isLoser={!!(winner && winner !== team2)} isClickable={canSelect} />
      </div>
    );
  };

  const renderStageColumn = (matchups: Matchup[] | undefined, title: string, stageKey: string) => {
    if (!matchups) return null;
    const simplifiedTitle = title.split(' ')[0].toUpperCase(); 

    return (
      <div className="flex flex-col items-center justify-around flex-grow self-stretch py-[var(--matchup-item-margin-y)]">
        <h2 className="text-sm md:text-lg font-['Anton'] text-yellow-400 mb-1.5 md:mb-2 uppercase tracking-wider">{simplifiedTitle}</h2>
        <div className="flex flex-col justify-around flex-grow w-full">
          {matchups.map((matchup, index) => (
            <div key={`${stageKey}-matchup-container-${index}`} className="w-full">
              {renderMatchup(matchup, `${stageKey}-${index}`)}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 p-1 md:p-2 flex flex-col items-center w-full">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 150 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * -50 - 10}%`, 
                width: `${Math.random() * 8 + 5}px`,
                height: `${Math.random() * 8 + 5}px`,
                animationName: 'fall',
                animationDuration: `${Math.random() * 3 + 2.5}s`,
                animationTimingFunction: 'linear',
                animationDelay: `${Math.random() * 3}s`,
                animationFillMode: 'forwards',
                opacity: Math.random() * 0.6 + 0.4,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      <header className="w-full flex flex-col items-center my-2 md:my-3">
        <h1 className="text-title">
            COPA LIBERTADORES <span className="text-white">2025</span>
        </h1>
         <p className="text-neutral-400 text-xs sm:text-sm mt-1 md:mt-1.5">Simulador do Mata-Mata</p>
      </header>
      
      <div className="flex justify-center space-x-2 sm:space-x-3 mb-3 md:mb-4">
        <button 
            onClick={simulateAll} 
            className="btn-primary"
        >
            Simular Tudo
        </button>
        <button 
            onClick={resetBracket} 
            className="btn-secondary"
        >
            Resetar
        </button>
      </div>

      {/* Added flex-grow here to allow main content to expand vertically */}
      <main className="flex flex-row items-stretch justify-between w-full max-w-full px-0.5 sm:px-1 mx-auto pb-4 flex-grow">
        {/* Left Bracket */}
        {renderStageColumn(bracketData[Round.OITAVAS]?.left, Round.OITAVAS, 'R16L')}
        <ConnectorColumn numInputs={4} numOutputs={2} />
        {renderStageColumn(bracketData[Round.QUARTAS]?.left, Round.QUARTAS, 'QFL')}
        <ConnectorColumn numInputs={2} numOutputs={1} />
        {renderStageColumn(bracketData[Round.SEMIFINAL]?.left, Round.SEMIFINAL, 'SFL')}
        
        <div className="flex flex-col justify-center items-center px-[var(--column-gap)] self-stretch">
            <div className="w-full h-[var(--connector-line-thickness)] bg-[var(--connector-line-color)]" style={{opacity: 'var(--connector-line-opacity)'}} />
        </div>
        
        <div className="flex flex-col items-center justify-center flex-grow py-[var(--matchup-item-margin-y)]">
            <FinalInfoDisplay champion={bracketData.champion} />
            {bracketData[Round.FINAL]?.center && bracketData[Round.FINAL].center[0] &&
                renderMatchup(bracketData[Round.FINAL].center[0], 'F_C')
            }
        </div>

        <div className="flex flex-col justify-center items-center px-[var(--column-gap)] self-stretch">
            <div className="w-full h-[var(--connector-line-thickness)] bg-[var(--connector-line-color)]" style={{opacity: 'var(--connector-line-opacity)'}} />
        </div>

        {/* Right Bracket */}
        {renderStageColumn(bracketData[Round.SEMIFINAL]?.right, Round.SEMIFINAL, 'SFR')}
        <ConnectorColumn numInputs={2} numOutputs={1} reversed />
        {renderStageColumn(bracketData[Round.QUARTAS]?.right, Round.QUARTAS, 'QFR')}
        <ConnectorColumn numInputs={4} numOutputs={2} reversed />
        {renderStageColumn(bracketData[Round.OITAVAS]?.right, Round.OITAVAS, 'R16R')}
      </main>
    </div>
  );
};

export default App;