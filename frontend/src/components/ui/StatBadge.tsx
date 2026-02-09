import React from 'react';

interface StatBadgeProps {
  value: number | string;
  label: string;
  className?: string;
}

const StatBadge: React.FC<StatBadgeProps> = ({ value, label, className = '' }) => {
  return (
    <div
      className={`
        bg-gray-100/80 px-4 py-2 rounded-full
        text-sm font-medium text-apple-text
        ${className}
      `}
    >
      <span className="font-zcool">
        {value} {label}
      </span>
    </div>
  );
};

export default StatBadge;
