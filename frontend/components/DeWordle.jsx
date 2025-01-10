import React from "react";

function DeWordle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 120"
      width="500"
      height="500"
    >
      <g fill="none" stroke="#29296E" strokeWidth="1.5" opacity="0.2">
        <path d="M20,40 L40,30 L60,40 L60,60 L40,70 L20,60 Z" />
        <path d="M70,40 L90,30 L110,40 L110,60 L90,70 L70,60 Z" />
      </g>

      <g fontFamily="Montserrat, sans-serif" fontWeight="900">
        <text x="50" y="80" fontSize="60" fill="#29296E">
          DE
        </text>

        <text x="140" y="80" fontSize="60" fill="#B14CF9">
          W
        </text>

        <text x="220" y="80" fontSize="60" fill="#29296E">
          RDLE
        </text>
      </g>

      <g stroke="#B14CF9" strokeWidth="2" fill="none">
        <path d="M300,20 L320,30 L320,50 L300,60 L280,50 L280,30 Z" />
        <path
          d="M330,25 L350,35 L350,55 L330,65 L310,55 L310,35 Z"
          opacity="0.4"
        />
      </g>

      <g stroke="#B14CF9" strokeWidth="1.5">
        <line x1="50" y1="90" x2="350" y2="90" opacity="0.6" />

        <circle cx="50" cy="90" r="3" fill="#B14CF9" />
        <circle cx="200" cy="90" r="3" fill="#B14CF9" />
        <circle cx="350" cy="90" r="3" fill="#B14CF9" />
      </g>

      <path
        d="M365,45 L375,50 L375,60 L365,65 L355,60 L355,50 Z"
        fill="none"
        stroke="#29296E"
        strokeWidth="1.5"
        opacity="0.3"
      />
    </svg>
  );
}

export default DeWordle;
