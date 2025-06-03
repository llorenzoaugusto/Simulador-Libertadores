import React from 'react';
import StandardConnector from './StandardConnector';

interface ConnectorColumnProps {
  numInputs: number; // Number of matchups in the previous stage feeding into this connector column
  numOutputs: number; // Number of matchups in the next stage this column feeds into (determines number of StandardConnectors)
  reversed?: boolean;
}

const ConnectorColumn: React.FC<ConnectorColumnProps> = ({ numOutputs, reversed }) => {
  // This column will contain 'numOutputs' StandardConnector instances.
  // Each StandardConnector is designed to visually connect two inputs to one output slot,
  // and its height is var(--matchup-block-total-height).
  // The flex properties (justify-around, self-stretch) will handle spacing.
  return (
    <div className="flex flex-col justify-around items-center px-[var(--column-gap)] self-stretch">
      {Array.from({ length: numOutputs }).map((_, i) => (
        <StandardConnector key={i} reversed={reversed} />
      ))}
    </div>
  );
};

export default ConnectorColumn;