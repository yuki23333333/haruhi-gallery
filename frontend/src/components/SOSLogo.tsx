import React from 'react';

const SOSLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-4">
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* SOS Text */}
        <text
          x="100"
          y="55"
          textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
          fontSize="48"
          fontWeight="700"
          fill="#1D1D1F"
          letterSpacing="8"
        >
          SOS
        </text>

        {/* Decorative underline */}
        <path
          d="M 40 65 Q 100 75 160 65"
          stroke="#1D1D1F"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  );
};

export default SOSLogo;
