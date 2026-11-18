import React from 'react';
import { AuthenticatedSession } from '../config/briefingConfig';

interface SecurityWatermarkProps {
  user: AuthenticatedSession;
  suffix?: string;
}

/**
 * Non-interactive diagonal repeating SVG watermark overlay across the viewer.
 * Set to exact opacity: 0.035 and color: #0D1520 so it remains forensically traceable
 * without muddying crisp #FFFFFF cards or body text readability.
 */
export const SecurityWatermark: React.FC<SecurityWatermarkProps> = ({
  user,
  suffix = 'CONFIDENTIAL',
}) => {
  const watermarkText = user.hideHeaderIdentity
    ? `FORTIFAI · ${user.formattedTimestamp} · ${suffix}`
    : `${user.email} · ${user.organization} · ${user.formattedTimestamp} · ${suffix}`;

  return (
    <svg
      aria-hidden="true"
      className="fixed inset-0 z-40 h-full w-full pointer-events-none select-none opacity-[0.035]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="fortifai-confidential-watermark"
          width="600"
          height="260"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-26)"
        >
          <text
            x="300"
            y="88"
            textAnchor="middle"
            fill="#0D1520"
            fontFamily="DM Mono, ui-monospace, SFMono-Regular, monospace"
            fontSize="11"
            fontWeight="500"
            letterSpacing="0.06em"
          >
            {watermarkText}
          </text>
          <text
            x="0"
            y="218"
            textAnchor="middle"
            fill="#0D1520"
            fontFamily="DM Mono, ui-monospace, SFMono-Regular, monospace"
            fontSize="11"
            fontWeight="500"
            letterSpacing="0.06em"
          >
            {watermarkText}
          </text>
          <text
            x="600"
            y="218"
            textAnchor="middle"
            fill="#0D1520"
            fontFamily="DM Mono, ui-monospace, SFMono-Regular, monospace"
            fontSize="11"
            fontWeight="500"
            letterSpacing="0.06em"
          >
            {watermarkText}
          </text>
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#fortifai-confidential-watermark)"
      />
    </svg>
  );
};
