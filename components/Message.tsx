import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface MessageProps {
  role: 'user' | 'assistant' | string;
  content: string;
}

export function Message({ role, content }: MessageProps) {
  return (
    <div className={cn(
      "flex w-full gap-2 p-4",
      role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/50'
    )}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          {role === 'user' ? 'You' : 'Assistant'}
        </span>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {content}
        </p>
      </div>
    </div>
  )
} 