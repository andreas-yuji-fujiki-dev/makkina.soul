interface ClaudeIconProps {
  size?: number;
}

export function ClaudeIcon({ size = 18 }: ClaudeIconProps) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {petals.map((deg) => (
        <rect
          key={deg}
          x="11"
          y="2"
          width="2"
          height="7"
          rx="1"
          fill="#D97757"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </svg>
  );
}
