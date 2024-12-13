export interface ChatHistory {
    id: string;
    title: string;
    message?: string;
    timestamp: string;
    preview: string;
    timeStamp?: string;
    model: string;
    sender?: 'user' | 'assistant' | 'system';
    // Add other properties as needed
}