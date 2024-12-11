export interface AssistantItem {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export const assistants: AssistantItem[] = [
  {
    id: 'content-creation',
    icon: '📝',
    name: 'Content Creation Assistant',
    description: 'Configurable for LinkedIn, SEO, Podcasts'
  },
  {
    id: 'general-chat',
    icon: '💭',
    name: 'General Chat Assistant',
    description: 'For interactive conversations'
  },
  {
    id: 'task-specific',
    icon: '🤖',
    name: 'Task Specific Assistant',
    description: 'Customized for specific tasks'
  }
]; 