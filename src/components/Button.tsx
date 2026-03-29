import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'white' | 'red' | 'info' | 'yellow';
  size?: 'sm' | 'md' | 'lg'; // 🟢 අලුතෙන් එකතු කළ Size Prop එක
  className?: string;
}

export default function Button({ 
  children, 
  variant = 'green', 
  size = 'md', // සාමාන්‍ය ප්‍රමාණය 'md' ලෙස සකසා ඇත
  className = '', 
  ...props 
}: ButtonProps) {
  
  // 📏 Size Styles - ප්‍රමාණය අනුව padding සහ text size වෙනස් වේ
  const sizes = {
    sm: "px-4 py-1.5 text-xs gap-1.5",
    md: "px-6 py-2 text-sm gap-2",
    lg: "px-8 py-3 text-base gap-2.5",
  };

  const baseStyles = "group relative overflow-hidden font-bold rounded-lg transition-all duration-300 transform active:scale-95 uppercase tracking-[0.1em] flex items-center justify-center backdrop-blur-md border border-t-0 border-l-0 shadow-lg";

  const variants = {
    green: "bg-green-500/10 border-green-500/40 text-green-400 hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:text-green-300",
    white: "bg-white/10 border-white/40 text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:text-white",
    red: "bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:text-red-300",
    info: "bg-blue-500/10 border-blue-500/40 text-blue-400 hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:text-blue-300",
    yellow: "bg-yellow-400/10 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/20 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)] hover:text-yellow-300",
  };

  const shineColors = {
    green: "from-green-500/0 via-green-500/30 to-green-500/0",
    white: "from-white/0 via-white/30 to-white/0",
    red: "from-red-500/0 via-red-500/30 to-red-500/0",
    info: "from-blue-500/0 via-blue-500/30 to-blue-500/0",
    yellow: "from-yellow-400/0 via-yellow-400/30 to-yellow-400/0",
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      <div className={`absolute inset-0 -translate-x-[150%] skew-x-[30deg] bg-gradient-to-r ${shineColors[variant]} transition-transform duration-700 ease-in-out group-hover:translate-x-[150%] z-0`}></div>
      <span className="relative z-10 flex items-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
        {children}
      </span>
    </button>
  );
}