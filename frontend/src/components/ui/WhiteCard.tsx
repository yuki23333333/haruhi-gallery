import React from 'react';
import { motion } from 'framer-motion';

interface WhiteCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const WhiteCard: React.FC<WhiteCardProps> = ({
  children,
  className = '',
  onClick,
  padding = 'md',
  hover = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        bg-white rounded-3xl
        shadow-sm border border-white/20
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default WhiteCard;
