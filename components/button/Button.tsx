import React from 'react';
import { Icon } from 'react-feather';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: Icon;
  iconPosition?: 'start' | 'end';
  iconColor?: 'red' | 'green' | 'grey';
  iconFill?: boolean;
  buttonStyle?: 'regular' | 'action' | 'alert' | 'flush';
}

export function Button({
  label = 'Okay',
  icon = void 0,
  iconPosition = 'start',
  iconColor = void 0,
  iconFill = false,
  buttonStyle = 'regular',
  className = '',
  ...rest
}: ButtonProps) {
  const StartIcon = iconPosition === 'start' ? icon : null;
  const EndIcon = iconPosition === 'end' ? icon : null;

  const baseStyles = "flex items-center gap-2 font-['Roboto_Mono'] text-xs font-normal rounded-full px-6 py-2 min-h-[42px] transition-all duration-100 ease-in-out outline-none";
  const iconStyles = {
    red: "text-red-600",
    green: "text-green-600",
    grey: "text-gray-500",
  };
  
  const buttonStyles = {
    regular: "bg-[#ececf1] text-[#101010] hover:enabled:bg-[#d8d8d8]",
    action: "bg-[#101010] text-[#ececf1] hover:enabled:bg-[#404040]",
    alert: "bg-red-600 text-[#ececf1] hover:enabled:bg-red-600",
    flush: "bg-transparent",
  };

  return (
    <button 
      className={`
        ${baseStyles}
        ${buttonStyles[buttonStyle]}
        ${iconColor ? iconStyles[iconColor] : ''}
        disabled:text-gray-500
        disabled:cursor-not-allowed
        enabled:cursor-pointer
        enabled:active:translate-y-[1px]
        ${className}
      `}
      {...rest}
    >
      {StartIcon && (
        <span className={`flex -ml-2 ${iconFill ? 'fill-current' : ''}`}>
          <StartIcon className="w-4 h-4" />
        </span>
      )}
      <span>{label}</span>
      {EndIcon && (
        <span className={`flex -mr-2 ${iconFill ? 'fill-current' : ''}`}>
          <EndIcon className="w-4 h-4" />
        </span>
      )}
    </button>
  );
} 