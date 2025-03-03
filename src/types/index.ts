// Basic message type
export interface Message {
    user: string;
    text: string;
    timestamp?: string;
    threadTs?: string;
  }
  
  // Slack-specific types
  export interface SlackMessage {
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
    reactions?: SlackReaction[];
    files?: SlackFile[];
  }
  
  export interface SlackReaction {
    name: string;
    count: number;
    users: string[];
  }
  
  export interface SlackFile {
    id: string;
    name: string;
    mimetype: string;
    url_private?: string;
  }
  
  export interface SlackChannel {
    id: string;
    name: string;
    is_private: boolean;
    num_members: number;
  }
  
  // Topic analysis types
  export interface TopicData {
    topic: string;
    dayIdx: number;
    value: number;
    trend: number;
    tickets: string[];
    messages: Message[];
  }
  
  export interface SuggestedTicket {
    topic: string;
    day: number;
    suggestion: string;
    reason: string;
    relevantMessages: Message[];
  }
  
  export interface TopicAnalysisResult {
    topics: string[];
    days: string[];
    values: number[][];
    trends: number[][];
  }
  
  // API response types
  export interface ExtractTopicsResponse {
    topics: string[];
    error?: string;
  }
  
  export interface SummarizeTopicResponse {
    summary: string;
    error?: string;
  }
  
  export interface SuggestTicketResponse {
    suggestion: string;
    reason: string;
    error?: string;
  }
  
  // UI state types
  export interface CellData {
    topicIdx: number;
    dayIdx: number;
  }