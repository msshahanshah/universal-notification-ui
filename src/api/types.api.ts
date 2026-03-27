export interface SlackThread {
  id: number;
  messageId: string;
  service: string;
  destination: string;
  status: string;
  attempts: number;
  messageDate: string;
  message: string;
  referenceId: string;
  userReplyedMessages: UserReplyMessage[];
}

export interface UserReplyMessage {
  username: string;
  reactions: string[];
  message: string;
}

export interface SlackThreadsResponse {
  success: boolean;
  message: string;
  data: SlackThread[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}