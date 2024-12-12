import React from 'react';
import { ChevronDown } from 'react-feather';
import { UserCircle2 } from 'lucide-react';

interface InternalHeaderProps {
  apiKey?: string;
  resetAPIKey?: () => void;
  isLocalRelay: boolean;
}

const InternalHeader: React.FC<InternalHeaderProps> = ({ apiKey, resetAPIKey, isLocalRelay }) => {
  return (
    <header className="flex justify-between items-center pb-3 bg-[--bg-color] dark:bg-gray-800 border-b border-gray-100 mx-2">
      <div className="relative group">
        <button className="flex items-center bg-transparent text-[--text-color] dark:text-gray-200 px-4 py-2 rounded-md cursor-pointer text-sm transition-all duration-200 hover:bg-[--hover-bg] dark:hover:bg-gray-700">
          Lorem ipsum 
          <ChevronDown className="ml-1 transition-transform duration-200 group-hover:rotate-180" />
        </button>
        
        <div className="absolute top-[calc(100%+0.5rem)] left-0 min-w-[180px] bg-[--bg-color] dark:bg-gray-800 border border-[--border-color] dark:border-gray-700 rounded-md shadow-lg opacity-0 translate-y-[-10px] pointer-events-none transition-all duration-200 z-50 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
          {[
            { href: '#option1', text: 'Gpt' },
            { href: '#option2', text: 'Gpt 2' },
            { href: '#option3', text: 'Gpt 3' }
          ].map((option, index, array) => (
            <a 
              key={option.href}
              href={option.href}
              className={`
                block px-4 py-3 text-[--text-color] dark:text-gray-200 no-underline text-sm transition-colors duration-200 hover:bg-[--hover-bg] dark:hover:bg-gray-700
                ${index === 0 ? 'rounded-t-md' : ''}
                ${index === array.length - 1 ? 'rounded-b-md' : 'border-b border-[--border-color] dark:border-gray-700'}
              `}
            >
              {option.text}
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative group">
          <button 
            onClick={!isLocalRelay ? resetAPIKey : undefined}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors duration-200"
          >
            {!isLocalRelay ? (
              <span className="w-10 h-10 text-center text-sm font-medium bg-[#7989FF] text-white rounded-full p-3">
                {apiKey ? apiKey.slice(0, 2).toUpperCase() : 'API'}
              </span>
            ) : (
              <span className="text-sm">Local</span>
            )}
          </button>
          
          {!isLocalRelay && (
            <div className="absolute hidden group-hover:block top-full right-0 mt-2 px-2 py-1 bg-[#7989FF] text-white text-xs rounded whitespace-nowrap">
              API Key: {apiKey ? `${apiKey.slice(0, 6)}...` : 'Not set'}
              <br />
              Click to change
            </div>
          )}
        </div>

        {/* <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#4e4be6] cursor-pointer text-[#edebeb]">
          <UserCircle2 />
        </div> */}
      </div>
    </header>
  );
};

export default InternalHeader;
