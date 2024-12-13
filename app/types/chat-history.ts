export interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  category?: string;
}

export interface TimelineCategory {
  id: string;
  title: string;
  chats: ChatHistoryItem[];
}

