
import React from 'react';
import { Team } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { TNTSportsLogo } from './icons/TNTSportsLogo';


interface FinalInfoDisplayProps {
  champion: Team | null;
}

const FinalInfoDisplay: React.FC<FinalInfoDisplayProps> = ({ champion }) => {
  return (
    <div className="flex flex-col items-center text-center p-3 md:p-4 my-4 md:my-0 min-w-[180px] md:min-w-[220px] lg:min-w-[250px] bg-neutral-800/50 rounded-xl shadow-xl border border-neutral-700/50">
      <TNTSportsLogo className="w-28 h-auto md:w-36 mb-3 md:mb-4 text-neutral-300" />
      <div className="text-xl md:text-2xl font-bold text-yellow-400 mb-1 md:mb-2 tracking-wide">29 NOV</div>
      <div className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 uppercase">Final</div>
      <TrophyIcon className={`w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 text-yellow-400 transition-all duration-700 ease-out ${champion ? 'opacity-100 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)]' : 'opacity-40 scale-90'}`} />
      {champion && (
        <div className="mt-4 md:mt-5 p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-2xl w-full max-w-xs">
          <p className="text-xs sm:text-sm text-neutral-900 font-semibold uppercase tracking-wider">Campeão 2025</p>
          <p className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 truncate">{champion.name}</p>
        </div>
      )}
      {!champion && (
         <div className="mt-4 md:mt-5 p-3 text-neutral-500 italic text-sm w-full">
            Aguardando Vencedor...
        </div>
      )}
    </div>
  );
};

export default FinalInfoDisplay;
    