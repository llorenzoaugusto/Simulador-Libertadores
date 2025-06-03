
import React, { useState, useCallback } from 'react';
import { Team, Matchup, BracketData, Round } from './types';
import { INITIAL_TEAMS } from './constants';
import TeamCard from './components/TeamCard';
import FinalInfoDisplay from './components/FinalInfoDisplay';

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
      let sideKey: 'left' | 'right' | 'center' | undefined; // This sideKey is of the targetMatchup
      let matchupIndex = -1;

      // Find the matchup
      for (const r of Object.values(Round)) {
        if (targetMatchup) break; // Exit loop once matchup is found

        if (r === Round.FINAL) {
          const roundFinalData = newData[Round.FINAL];
          const idx = roundFinalData.center.findIndex(m => m.id === matchupId);
          if (idx !== -1) {
            targetMatchup = roundFinalData.center[idx];
            stageKey = r; sideKey = 'center'; matchupIndex = idx;
          }
        } else {
          // OITAVAS, QUARTAS, SEMIFINAL have left and right properties
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
        // Propagate winner to the next stage
        if (stageKey === Round.OITAVAS) {
          const nextStageData = newData[Round.QUARTAS]; // Has .left and .right
          const nextMatchIndex = Math.floor(matchupIndex / 2);
          const teamSlot = matchupIndex % 2;
          if (sideKey === 'left' && nextStageData.left?.[nextMatchIndex]) nextStageData.left[nextMatchIndex].teams[teamSlot] = winner;
          if (sideKey === 'right' && nextStageData.right?.[nextMatchIndex]) nextStageData.right[nextMatchIndex].teams[teamSlot] = winner;
        } else if (stageKey === Round.QUARTAS) {
          const nextStageData = newData[Round.SEMIFINAL]; // Has .left and .right
          const nextMatchIndex = Math.floor(matchupIndex / 2);
          const teamSlot = matchupIndex % 2;
          if (sideKey === 'left' && nextStageData.left?.[nextMatchIndex]) nextStageData.left[nextMatchIndex].teams[teamSlot] = winner;
          if (sideKey === 'right' && nextStageData.right?.[nextMatchIndex]) nextStageData.right[nextMatchIndex].teams[teamSlot] = winner;
        } else if (stageKey === Round.SEMIFINAL) {
          const nextStageData = newData[Round.FINAL]; // Has .center
          const teamSlot = sideKey === 'left' ? 0 : 1; // Semifinal's left winner goes to slot 0 of final, right to slot 1
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

  const simulateAll = () => {
    let currentData = JSON.parse(JSON.stringify(bracketData)) as BracketData;
    
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
              const nextStage = currentData[Round.QUARTAS];
              const nextMatchIndex = Math.floor(matchup.matchIndex / 2);
              const teamSlot = matchup.matchIndex % 2;
              if (matchup.side === 'left' && nextStage.left?.[nextMatchIndex]) nextStage.left[nextMatchIndex].teams[teamSlot] = randomWinner;
              if (matchup.side === 'right' && nextStage.right?.[nextMatchIndex]) nextStage.right[nextMatchIndex].teams[teamSlot] = randomWinner;
            } else if (currentRoundKey === Round.QUARTAS && nextRdKey === Round.SEMIFINAL) {
                const nextStage = currentData[Round.SEMIFINAL];
                const nextMatchIndex = Math.floor(matchup.matchIndex / 2);
                const teamSlot = matchup.matchIndex % 2;
                if (matchup.side === 'left' && nextStage.left?.[nextMatchIndex]) nextStage.left[nextMatchIndex].teams[teamSlot] = randomWinner;
                if (matchup.side === 'right' && nextStage.right?.[nextMatchIndex]) nextStage.right[nextMatchIndex].teams[teamSlot] = randomWinner;
            } else if (currentRoundKey === Round.SEMIFINAL && nextRdKey === Round.FINAL) {
                const nextStage = currentData[Round.FINAL];
                const teamSlot = matchup.side === 'left' ? 0 : 1;
                if (nextStage.center?.[0]) nextStage.center[0].teams[teamSlot] = randomWinner;
            } else if (currentRoundKey === Round.FINAL) {
                currentData.champion = randomWinner;
            }
          }
        });
      };

    // Simulate Oitavas
    const oitavasData = currentData[Round.OITAVAS];
    simulateMatchupsList(oitavasData.left, Round.OITAVAS, Round.QUARTAS);
    simulateMatchupsList(oitavasData.right, Round.OITAVAS, Round.QUARTAS);

    // Simulate Quartas
    const quartasData = currentData[Round.QUARTAS];
    simulateMatchupsList(quartasData.left, Round.QUARTAS, Round.SEMIFINAL);
    simulateMatchupsList(quartasData.right, Round.QUARTAS, Round.SEMIFINAL);
    
    // Simulate Semifinal
    const semifinalData = currentData[Round.SEMIFINAL];
    simulateMatchupsList(semifinalData.left, Round.SEMIFINAL, Round.FINAL);
    simulateMatchupsList(semifinalData.right, Round.SEMIFINAL, Round.FINAL);

    // Simulate Final
    const finalData = currentData[Round.FINAL];
    simulateMatchupsList(finalData.center, Round.FINAL);
    
    setBracketData(currentData);
    if (currentData.champion) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    }
  };
  
  const renderMatchup = (matchup: Matchup, keyPrefix: string) => {
    const { teams, winner, id } = matchup;
    const team1 = teams[0];
    const team2 = teams[1];
    const canSelect = !!(team1 && team2 && !winner);

    return (
      <div key={`${keyPrefix}-${id}`} className="my-2 relative matchup-item">
        <TeamCard team={team1} onClick={canSelect && team1 ? () => handleWinnerSelected(id, team1) : undefined} isWinner={winner === team1} isLoser={!!(winner && winner !== team1)} isClickable={canSelect} />
        <div className="text-center text-xs text-yellow-400 my-1">vs</div>
        <TeamCard team={team2} onClick={canSelect && team2 ? () => handleWinnerSelected(id, team2) : undefined} isWinner={winner === team2} isLoser={!!(winner && winner !== team2)} isClickable={canSelect} />
      </div>
    );
  };

  const renderStageColumn = (matchups: Matchup[] | undefined, title: string, stageKey: string) => {
    if (!matchups) return null;
    return (
      <div className="flex flex-col items-center mx-1 md:mx-2 lg:mx-4 min-w-[160px] md:min-w-[180px]">
        <h2 className="text-sm md:text-lg font-bold text-yellow-400 mb-2 uppercase tracking-wider">{title}</h2>
        {matchups.map((matchup, index) => (
          <div key={`${stageKey}-matchup-container-${index}`} className="w-full">
            {renderMatchup(matchup, `${stageKey}-${index}`)}
            { index % 2 === 1 && title !== Round.SEMIFINAL && title !== Round.FINAL && matchups.length > 1 && (
               <div className="h-8 md:h-12 w-px bg-yellow-400 mx-auto my-1 opacity-50"></div>
            )}
             { title === Round.SEMIFINAL && (
               <div className="h-8 md:h-16 w-px bg-yellow-400 mx-auto my-1 opacity-50"></div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const ConnectorLine: React.FC<{isVertical?: boolean; lengthClass?: string; className?: string}> = ({isVertical, lengthClass, className}) => {
    const orientationClass = isVertical ? `w-px ${lengthClass || 'h-16'}` : `${lengthClass || 'w-16'} h-px`;
    return <div className={`bg-yellow-400 opacity-50 ${orientationClass} ${className || ''}`}></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 p-2 md:p-4 flex flex-col items-center overflow-x-auto">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 150 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * -50 - 10}%`, // Start above screen
                width: `${Math.random() * 8 + 5}px`,
                height: `${Math.random() * 8 + 5}px`,
                animationName: 'fall',
                animationDuration: `${Math.random() * 3 + 2.5}s`,
                animationTimingFunction: 'linear',
                animationDelay: `${Math.random() * 3}s`,
                animationFillMode: 'forwards',
                opacity: Math.random() * 0.6 + 0.4,
                transform: `rotate(${Math.random() * 360}deg)` // Initial random rotation
              }}
            />
          ))}
        </div>
      )}

      <header className="w-full flex flex-col items-center my-4 md:my-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-400 tracking-wide text-center">
            COPA LIBERTADORES <span className="text-white">BRACKET 2025</span>
        </h1>
         <p className="text-neutral-400 text-sm md:text-base mt-2">Simulador do Mata-Mata</p>
      </header>
      
      <div className="flex justify-center space-x-3 sm:space-x-4 mb-6 md:mb-8">
        <button 
            onClick={simulateAll} 
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-yellow-500 text-neutral-900 font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-75 text-sm sm:text-base"
        >
            Simular Tudo
        </button>
        <button 
            onClick={resetBracket} 
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 text-sm sm:text-base"
        >
            Resetar
        </button>
      </div>

      <main className="flex flex-col items-center md:flex-row md:justify-center md:items-start w-full max-w-fit mx-auto pb-8">
        {/* Left Bracket */}
        {renderStageColumn(bracketData[Round.OITAVAS]?.left, Round.OITAVAS, 'R16L')}
        <div className="flex flex-col justify-around items-center mx-1 md:mx-2 lg:mx-4 self-stretch pt-10 md:pt-0">
          {[0,1].map(i => <ConnectorLine key={`con-r16l-qfl-${i}`} lengthClass="h-24 md:h-40 my-2 md:my-4"/>)}
        </div>
        {renderStageColumn(bracketData[Round.QUARTAS]?.left, Round.QUARTAS, 'QFL')}
        <div className="flex flex-col justify-around items-center mx-1 md:mx-2 lg:mx-4 self-stretch pt-20 md:pt-0">
           <ConnectorLine lengthClass="h-40 md:h-64 my-4 md:my-8"/>
        </div>
        {renderStageColumn(bracketData[Round.SEMIFINAL]?.left, Round.SEMIFINAL, 'SFL')}
        
        {/* Center: Final */}
        <div className="flex flex-col items-center mx-1 md:mx-4 lg:mx-8 self-stretch md:pt-16 lg:pt-24 order-first md:order-none mb-8 md:mb-0">
            <div className="flex justify-between w-full max-w-[180px] md:max-w-none md:flex-col md:h-full md:justify-center items-center relative md:top-[-40px] lg:top-[-60px]">
              <ConnectorLine lengthClass="w-10 h-px md:w-px md:h-48 lg:h-80" className="md:mb-auto"/>
              <ConnectorLine lengthClass="w-10 h-px md:w-px md:h-48 lg:h-80" className="md:mt-auto"/>
            </div>
            <FinalInfoDisplay champion={bracketData.champion} />
            {bracketData[Round.FINAL]?.center && renderMatchup(bracketData[Round.FINAL].center[0], 'F_C')}
        </div>

        {/* Right Bracket */}
        {renderStageColumn(bracketData[Round.SEMIFINAL]?.right, Round.SEMIFINAL, 'SFR')}
         <div className="flex flex-col justify-around items-center mx-1 md:mx-2 lg:mx-4 self-stretch pt-20 md:pt-0">
            <ConnectorLine lengthClass="h-40 md:h-64 my-4 md:my-8"/>
        </div>
        {renderStageColumn(bracketData[Round.QUARTAS]?.right, Round.QUARTAS, 'QFR')}
         <div className="flex flex-col justify-around items-center mx-1 md:mx-2 lg:mx-4 self-stretch pt-10 md:pt-0">
         {[0,1].map(i => <ConnectorLine key={`con-r16r-qfr-${i}`} lengthClass="h-24 md:h-40 my-2 md:my-4"/>)}
        </div>
        {renderStageColumn(bracketData[Round.OITAVAS]?.right, Round.OITAVAS, 'R16R')}
      </main>
    </div>
  );
};

export default App;
    