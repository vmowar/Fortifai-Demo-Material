import React from 'react';

interface FortifaiLogoProps {
  className?: string;
  height?: number;
}

/**
 * Official Fortifai Color Logo Lockup
 * Renders the uploaded asset (/assets/aistudio/Fortifai_Logo_color_58c63f6f.png, 640×324 RGBA)
 * tightly framed to its exact visible glyph bounds (x: 32..597, y: 99..235 => 565×136)
 * so the blue angled mark and continuous-crossbar "fortifai" wordmark align optically
 * with zero dead transparent padding.
 */
export const FortifaiLogo: React.FC<FortifaiLogoProps> = ({
  className = '',
  height = 27,
}) => {
  const width = Math.round((height * 565) / 136);

  return (
    <svg
      width={width}
      height={height}
      viewBox="32 99 565 136"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Fortifai"
      className={`shrink-0 select-none ${className}`}
    >
      <image
        href="/assets/aistudio/Fortifai_Logo_color_58c63f6f.png"
        x="0"
        y="0"
        width="640"
        height="324"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};
