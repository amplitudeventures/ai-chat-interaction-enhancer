export interface ChatMessage {
  id: string;
  timestamp: string;
  type: 'server' | 'client';
  content: string;
  status?: string;
  metadata?: {
    bufferSize?: number;
    delta?: number;
  };
}
