"use client";

import { useId } from "react";

const STAR = "60,38 65.29,52.72 80.92,53.2 68.56,62.78 72.93,77.8 60,69 47.07,77.8 51.44,62.78 39.08,53.2 54.71,52.72";

export default function Seal({ size = 48, className = "" }: { size?: number; className?: string }) {
  const arc = useId();
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <path id={arc} d="M 60,60 m -43,0 a 43,43 0 1,1 86,0 a 43,43 0 1,1 -86,0" />
      </defs>
      <circle cx="60" cy="60" r="57" fill="#0b1b42" stroke="#e9b949" strokeWidth="5" />
      <text fill="#f7f0e1" fontSize="10.5" fontWeight="700" fontFamily="var(--ff-narrow), sans-serif" letterSpacing="1">
        <textPath href={`#${arc}`} textLength="266" lengthAdjust="spacing">
          ★ US PRESIDENT 2028 ★ $PRESIDENT ★ ON PUMP.FUN
        </textPath>
      </text>
      <circle cx="60" cy="60" r="33" fill="#d62839" stroke="#f7f0e1" strokeWidth="3" />
      <polygon points={STAR} fill="#f7f0e1" />
    </svg>
  );
}
