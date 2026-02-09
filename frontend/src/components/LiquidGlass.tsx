import React from 'react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`
        bg-white/30
        backdrop-blur-xl
        border
        border-white/50
        shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]
        shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]
        rounded-[32px]
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default LiquidGlass;
