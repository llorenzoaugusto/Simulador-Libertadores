import React from 'react';
import { Team } from '../types';
import { TrophyIcon } from './icons/TrophyIcon';
import { TNTSportsLogo } from './icons/TNTSportsLogo';


interface FinalInfoDisplayProps {
  champion: Team | null;
}

const FinalInfoDisplay: React.FC<FinalInfoDisplayProps> = ({ champion }) => {
  const tntLogoBaseStyle: React.CSSProperties = { width: `clamp(60px, 12vw, 80px)` };
  const tntLogoMdStyle: React.CSSProperties = { width: `clamp(70px, 14vw, 90px)` };
  
  const trophyBaseStyle: React.CSSProperties = { 
    width: `clamp(35px, 7vh, 45px)`, 
    height: `clamp(35px, 7vh, 45px)` 
  };
  const trophyMdStyle: React.CSSProperties = { 
    width: `clamp(45px, 8vh, 55px)`, 
    height: `clamp(45px, 8vh, 55px)` 
  };
  // lg styles for trophy, Tailwind's lg: maps to 1024px
  const trophyLgStyle: React.CSSProperties = {
    width: `clamp(50px, 9vh, 60px)`, 
    height: `clamp(50px, 9vh, 60px)` 
  };


  const dateTextStyle: React.CSSProperties = { fontSize: `clamp(0.8rem, 2vw, 1rem)` };
  const dateMdTextStyle: React.CSSProperties = { fontSize: `clamp(0.9rem, 2.2vw, 1.125rem)` };

  const finalTitleStyle: React.CSSProperties = { fontSize: `clamp(0.75rem, 1.8vw, 0.875rem)` };
  const finalMdTitleStyle: React.CSSProperties = { fontSize: `clamp(0.875rem, 2vw, 1rem)` };
  
  const championAreaTitleStyle: React.CSSProperties = { fontSize: `clamp(0.5rem, 1.2vw, 0.625rem)` };
  const championAreaSmTitleStyle: React.CSSProperties = { fontSize: `clamp(0.55rem, 1.3vw, 0.7rem)` };

  const championNameStyle: React.CSSProperties = { fontSize: `clamp(0.65rem, 1.5vw, 0.75rem)` };
  const championSmNameStyle: React.CSSProperties = { fontSize: `clamp(0.7rem, 1.6vw, 0.875rem)` };
  const championMdNameStyle: React.CSSProperties = { fontSize: `clamp(0.75rem, 1.8vw, 1rem)` };
  
  const awaitingTextStyle: React.CSSProperties = { fontSize: `clamp(0.65rem, 1.5vw, 0.75rem)` };

  // Helper to apply responsive styles, assuming window object is available
  const getResponsiveStyle = (base: React.CSSProperties, sm?: React.CSSProperties, md?: React.CSSProperties, lg?: React.CSSProperties) => {
    if (typeof window === 'undefined') return base;
    if (lg && window.innerWidth >= 1024) return {...base, ...sm, ...md, ...lg};
    if (md && window.innerWidth >= 768) return {...base, ...sm, ...md};
    if (sm && window.innerWidth >= 640) return {...base, ...sm};
    return base;
  };


  return (
    <div className="flex flex-col items-center text-center p-1.5 md:p-2 my-2 md:my-0 bg-neutral-800/50 rounded-xl shadow-xl border border-neutral-700/50 w-full">
      <TNTSportsLogo 
        className="h-auto mb-1.5 md:mb-2 text-neutral-300" 
        style={getResponsiveStyle(tntLogoBaseStyle, undefined, tntLogoMdStyle)}
      />
      <div 
        className="font-bold text-yellow-400 mb-0.5 md:mb-1 tracking-wide"
        style={getResponsiveStyle(dateTextStyle, undefined, dateMdTextStyle)}
      >
        29 NOV
      </div>
      <div 
        className="font-semibold text-white mb-1.5 md:mb-2 uppercase"
        style={getResponsiveStyle(finalTitleStyle, undefined, finalMdTitleStyle)}
      >
        Final
      </div>
      <TrophyIcon 
         className={`text-yellow-400 transition-all duration-700 ease-out ${champion ? 'opacity-100 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)]' : 'opacity-40 scale-90'}`}
         style={getResponsiveStyle(trophyBaseStyle, undefined, trophyMdStyle, trophyLgStyle)}
      />
      {champion && (
        <div className="mt-2 md:mt-2.5 p-1.5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-2xl w-full max-w-xs">
          <p 
            className="text-neutral-900 font-semibold uppercase tracking-wider"
            style={getResponsiveStyle(championAreaTitleStyle, championAreaSmTitleStyle)}
          >
            Campeão 2025
          </p>
          <p 
            className="font-bold text-neutral-900 truncate"
            style={getResponsiveStyle(championNameStyle, championSmNameStyle, championMdNameStyle)}
          >
            {champion.name}
          </p>
        </div>
      )}
      {!champion && (
         <div 
            className="mt-2 md:mt-2.5 p-1.5 text-neutral-500 italic text-xs w-full"
            style={awaitingTextStyle}
          >
            Aguardando Vencedor...
        </div>
      )}
    </div>
  );
};

export default FinalInfoDisplay;