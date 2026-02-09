import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = '搜索...',
}) => {
  const [localValue, setLocalValue] = useState(value);

  // 当外部 value 变化时（比如清空搜索），同步到本地状态
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(localValue);
    }
  };

  const handleClick = () => {
    onSearch(localValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`
          flex items-center gap-3
          bg-white/60
          backdrop-blur-[30px]
          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]
          rounded-full
          px-5 py-3
          shadow-xl shadow-black/5
          transition-all duration-300
          focus-within:bg-white/70
          focus-within:shadow-2xl focus-within:shadow-black/5
          hover:bg-white/65
          cursor-pointer
        `}
        onClick={handleClick}
      >
        {/* Search Icon - Clickable */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-apple-text/50 flex-shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          type="text"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            flex-1
            bg-transparent
            border-none
            outline-none
            text-apple-text
            placeholder:text-apple-text/40
            text-base
            cursor-text
          `}
        />
      </div>
    </form>
  );
};

export default SearchBar;
