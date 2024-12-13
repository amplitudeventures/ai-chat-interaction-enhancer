'use client';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute z-10 invisible group-hover:visible
        bg-gray-900 text-white text-xs rounded py-1 px-2
        -top-8 left-1/2 transform -translate-x-1/2
        whitespace-nowrap opacity-0 group-hover:opacity-100
        transition-opacity duration-200">
        {content}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2
          border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
} 