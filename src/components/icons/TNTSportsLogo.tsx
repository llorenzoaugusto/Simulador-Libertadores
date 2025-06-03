
import React from 'react';

export const TNTSportsLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 220 60" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="tntGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#FFD700', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#FBBF24', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <rect width="220" height="60" fill="#1F2937" rx="8"/> {/* Tailwind gray-800 */}
      <text 
        x="50%" 
        y="35%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fontSize="36" 
        fontWeight="900" 
        fill="url(#tntGoldGradient)"
        fontFamily="'Anton', sans-serif"
        letterSpacing="-1"
      >
        TNT
      </text>
      <text 
        x="50%" 
        y="75%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fontSize="18" 
        fontWeight="bold" 
        fill="white" 
        letterSpacing="1.5"
        fontFamily="'Anton', sans-serif"
        style={{ textTransform: 'uppercase' }}
      >
        SPORTS
      </text>
    </svg>
);