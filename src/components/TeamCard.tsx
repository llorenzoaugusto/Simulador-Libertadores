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
  const cardBaseHeight = "h-[70px] md:h-[80px]";
  let cardClasses = `w-full bg-neutral-800 border border-neutral-700 rounded-lg flex items-center p-2 my-1 transition-all duration-200 ease-in-out text-xs md:text-sm ${cardBaseHeight} relative overflow-hidden`;
  let textClasses = "font-medium text-gray-200 ml-2 truncate flex-1 min-w-0";
  let logoContainerClasses = "w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center";
  let logoImageClasses = "max-w-full max-h-full object-contain";

  if (!team) {
    return (
      <div className={`${cardBaseHeight} w-full bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center p-2 my-1 text-neutral-500 italic text-xs md:text-sm`}>
        Aguardando...
      </div>
    );
  }

  if (isClickable && !isWinner && !isLoser) {
    cardClasses += " cursor-pointer hover:bg-neutral-700 hover:border-yellow-400 active:bg-neutral-600";
  }
  if (isWinner) {
    cardClasses = cardClasses.replace("bg-neutral-800", "bg-yellow-400").replace("border-neutral-700", "border-yellow-300");
    textClasses = "font-bold text-neutral-900 ml-2 truncate flex-1 min-w-0";
    cardClasses += " shadow-lg shadow-yellow-400/30";
  }
  if (isLoser) {
    cardClasses += " opacity-40 grayscale";
  }

  const handleImageLoadError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide the broken image
    e.currentTarget.style.display = 'none';
    // Show the placeholder that is its next sibling
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback && fallback.classList.contains('generic-logo-placeholder')) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      title={team.name}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `Select ${team.name} as winner` : team.name}
    >
      <div className={logoContainerClasses}>
        {team.logo ? (
          <>
            <img
              src={team.logo}
              alt={`${team.name} logo`}
              className={logoImageClasses}
              onError={handleImageLoadError}
              // crossOrigin="anonymous" removed as images are local
            />
            {/* This placeholder is shown by onError if the img above fails */}
            <GenericLogoPlaceholderIcon
              className={`${logoImageClasses} text-neutral-500 hidden generic-logo-placeholder`} 
            />
          </>
        ) : (
          // This placeholder is shown if team.logo is not provided at all
          <GenericLogoPlaceholderIcon className={`${logoImageClasses} text-neutral-500 flex generic-logo-placeholder`} />
        )}
      </div>
      <span className={textClasses}>{team.name}</span>
      {isWinner && (
        <div className="absolute top-1 right-1 text-xs text-neutral-900 bg-yellow-300 px-1 py-0.5 rounded-sm font-bold" aria-label="Winner">
          ✓
        </div>
      )}
    </div>
  );
};

export default TeamCard;