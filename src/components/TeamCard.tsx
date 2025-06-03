import React from 'react';
import { Team } from '../types';
import { GenericLogoPlaceholderIcon } from './icons/GenericLogoPlaceholderIcon';

interface TeamCardProps {
  team: Team | null;
  onClick?: () => void;
  isWinner?: boolean;
  isLoser?: boolean;
  isClickable?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onClick, isWinner, isLoser, isClickable }) => {
  const cardBaseHeightStyle = { height: 'var(--team-card-actual-height)' };
  // Dynamic font size for team name using clamp. Base text-[10px] removed, relies on clamp.
  let cardClasses = `w-full bg-neutral-800 border border-neutral-700 rounded-lg flex items-center p-1 my-[var(--team-card-internal-margin)] transition-all duration-200 ease-in-out relative overflow-hidden`;
  // Dynamic font size for team name. Targeting smaller base and scaling up.
  let textClasses = "font-medium text-gray-200 ml-1.5 truncate flex-1 min-w-0"; 
  // Dynamic logo container size defined by inline style.
  let logoContainerClasses = "flex-shrink-0 flex items-center justify-center"; 
  let logoImageClasses = "max-w-full max-h-full object-contain";

  // Dynamic styles for logo container
  const logoContainerStyle: React.CSSProperties = {
    width: `clamp(18px, 3.8vh, 26px)`,
    height: `clamp(18px, 3.8vh, 26px)`,
  };
  // At md breakpoint, slightly larger logo
  const mdLogoContainerStyle: React.CSSProperties = {
    width: `clamp(22px, 4.2vh, 30px)`,
    height: `clamp(22px, 4.2vh, 30px)`,
  };

  // Dynamic font size for team name
  const teamNameStyle: React.CSSProperties = {
    fontSize: `clamp(9px, 1.6vw, 11px)`, // Slightly adjusted clamp values
  };
   // At md breakpoint, slightly larger font
  const mdTeamNameStyle: React.CSSProperties = {
    fontSize: `clamp(10px, 1.8vw, 12px)`,
  };


  if (!team) {
    return (
      <div 
        className={`w-full bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center p-1 my-[var(--team-card-internal-margin)] text-neutral-500 italic`}
        style={cardBaseHeightStyle}
      >
        Aguardando...
      </div>
    );
  }

  if (isClickable && !isWinner && !isLoser) {
    cardClasses += " cursor-pointer hover:bg-neutral-700 hover:border-yellow-400 active:bg-neutral-600";
  }
  if (isWinner) {
    cardClasses = cardClasses.replace("bg-neutral-800", "bg-yellow-400").replace("border-neutral-700", "border-yellow-300");
    textClasses = "font-bold text-neutral-900 ml-1.5 truncate flex-1 min-w-0";
    cardClasses += " shadow-lg shadow-yellow-400/30";
  }
  if (isLoser) {
    cardClasses += " opacity-40 grayscale";
  }

  const handleImageLoadError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback && fallback.classList.contains('generic-logo-placeholder')) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div
      className={cardClasses}
      style={cardBaseHeightStyle}
      onClick={onClick}
      title={team.name}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `Select ${team.name} as winner` : team.name}
      aria-pressed={isClickable ? (isWinner ? "true" : "false") : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div 
        className={logoContainerClasses}
        // Apply base style, then override with md styles via media query if possible,
        // or rely on Tailwind's md: prefix for classes if converting fully.
        // For now, using a simple check for illustration if we weren't using Tailwind's md: for style obj.
        style={typeof window !== 'undefined' && window.innerWidth >= 768 ? mdLogoContainerStyle : logoContainerStyle}
      >
        <img
          src={team.logo}
          alt={`${team.name} logo`}
          className={logoImageClasses}
          onError={handleImageLoadError}
        />
        <div className="generic-logo-placeholder hidden">
          <GenericLogoPlaceholderIcon className="w-full h-full text-neutral-500" />
        </div>
      </div>
      <div className={textClasses} style={typeof window !== 'undefined' && window.innerWidth >= 768 ? mdTeamNameStyle : teamNameStyle}>
        {team.name}
      </div>
      {isWinner && (
        <div className="absolute top-0.5 right-0.5 text-[9px] text-neutral-900 bg-yellow-300 px-0.5 rounded-sm font-bold" aria-label="Winner">
          ✓
        </div>
      )}
    </div>
  );
};

export default TeamCard;