import React, { useState, useRef, ChangeEvent } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface TextInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function TextInput({ onSendMessage, disabled }: TextInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    // Reset height to auto to properly calculate scroll height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      // Set new height based on scroll height, with max height of 100px
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleInput}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 min-h-[40px] max-h-[100px] resize-none"
        rows={1}
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      <Button 
        type="submit" 
        disabled={disabled || !message.trim()}
        size="icon"
        className="mt-1"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
} 