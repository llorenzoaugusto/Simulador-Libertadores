import React from 'react';

interface StandardConnectorProps {
  style?: React.CSSProperties;
  reversed?: boolean; 
}

const StandardConnector: React.FC<StandardConnectorProps> = ({ style, reversed }) => {
  const armLength = 'var(--connector-arm-length)';
  const thickness = 'var(--connector-line-thickness)';
  const totalHeight = 'var(--matchup-block-total-height)'; // Height of one full matchup block it aligns with
  const lineColor = 'var(--connector-line-color)';
  const lineOpacity = 'var(--connector-line-opacity)';

  // Calculate horizontal position for the vertical line based on 'reversed'
  const verticalLineLeft = reversed ? `calc(${armLength} - (${thickness} / 2))` : `calc(${armLength} - (${thickness} / 2))`;
  // Calculate horizontal position for the outgoing arm based on 'reversed'
  const outgoingArmLeft = reversed ? '0px' : armLength;
  // Calculate horizontal position for incoming arms based on 'reversed'
  const incomingArmLeft = reversed ? armLength : '0px';

  return (
    <div
      className="relative"
      style={{
        width: `calc(2 * ${armLength})`, // Total width the connector element itself occupies
        height: totalHeight, // This connector spans the height of one output matchup
        ...style,
      }}
    >
      {/* Top incoming arm */}
      <div style={{
        position: 'absolute',
        top: `calc(${totalHeight} * 0.25 - (${thickness} / 2))`, // Aligns with center of top incoming matchup's visual space
        left: incomingArmLeft,
        width: armLength,
        height: thickness,
        backgroundColor: lineColor,
        opacity: lineOpacity,
      }} />
      {/* Bottom incoming arm */}
      <div style={{
        position: 'absolute',
        bottom: `calc(${totalHeight} * 0.25 - (${thickness} / 2))`, // Aligns with center of bottom incoming matchup's visual space
        left: incomingArmLeft,
        width: armLength,
        height: thickness,
        backgroundColor: lineColor,
        opacity: lineOpacity,
      }} />
      {/* Vertical joining line */}
      <div style={{
        position: 'absolute',
        top: `calc(${totalHeight} * 0.25)`,
        left: verticalLineLeft, 
        width: thickness,
        height: `calc(${totalHeight} * 0.5)`, // Spans between the two incoming arms centers
        backgroundColor: lineColor,
        opacity: lineOpacity,
      }} />
      {/* Outgoing arm to next stage */}
      <div style={{
        position: 'absolute',
        top: `calc(${totalHeight} * 0.5 - (${thickness} / 2))`, // Aligns with the center of the output matchup
        left: outgoingArmLeft,
        width: armLength,
        height: thickness,
        backgroundColor: lineColor,
        opacity: lineOpacity,
      }} />
    </div>
  );
};

export default StandardConnector;