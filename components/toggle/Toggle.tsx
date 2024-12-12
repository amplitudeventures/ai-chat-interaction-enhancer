import { useState, useEffect, useRef } from 'react';

interface ToggleProps {
  defaultValue?: string | boolean;
  values?: string[];
  labels?: string[];
  onChange?: (isEnabled: boolean, value: string) => void;
}

export function Toggle({
  defaultValue = false,
  values = [],
  labels,
  onChange = () => {},
}: ToggleProps) {
  if (typeof defaultValue === 'string') {
    defaultValue = !!Math.max(0, values.indexOf(defaultValue));
  }

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggleValue = () => {
    const v = !value;
    const index = +v;
    setValue(v);
    onChange(v, values[index]);
  };

  useEffect(() => {
    const leftEl = leftRef.current;
    const rightEl = rightRef.current;
    const bgEl = bgRef.current;
    if (leftEl && rightEl && bgEl) {
      if (value) {
        bgEl.style.left = rightEl.offsetLeft + 'px';
        bgEl.style.width = rightEl.offsetWidth + 'px';
      } else {
        bgEl.style.left = '';
        bgEl.style.width = leftEl.offsetWidth + 'px';
      }
    }
  }, [value]);

  return (
    <div
      className={`
        relative flex items-center gap-2 cursor-pointer overflow-hidden
        bg-[#ececf1] hover:bg-[#d8d8d8] text-[#101010]
        h-10 rounded-full
      `}
      onClick={toggleValue}
      data-enabled={value.toString()}
    >
      {labels && (
        <div 
          ref={leftRef}
          className={`
            relative px-4 select-none z-[2] transition-colors duration-100 ease-in-out
            ${value ? 'text-gray-600' : 'text-white'}
          `}
        >
          {labels[0]}
        </div>
      )}
      {labels && (
        <div 
          ref={rightRef}
          className={`
            relative px-4 -ml-2 select-none z-[2] transition-colors duration-100 ease-in-out
            ${value ? 'text-white' : 'text-gray-600'}
          `}
        >
          {labels[1]}
        </div>
      )}
      <div 
        ref={bgRef}
        className="
          absolute top-0 left-0 bottom-0 z-[1]
          bg-[#101010] rounded-full
          transition-all duration-100 ease-in-out
        "
      ></div>
    </div>
  );
}; 