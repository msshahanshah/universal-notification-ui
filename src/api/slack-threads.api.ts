import api from "src/lib/axios";
import { cleanQueryParams } from "./endpoints.api";

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
  userRepliedMessages: UserReplyMessage[];
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

export interface SlackEmojiResponse {
  ok: boolean;
  emoji: Record<string, {
    url: string;
    alias?: string;
  }>;
}

// Fetch Slack threads
export const fetchSlackThreads = async () => {
  try {
    const res = await api.get(`/slack-logs`);
    return res?.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

// Fetch thread messages
export const fetchThreadMessages = async (messageId: string) => {
  try {
    const response = await api.get(`/slack/threads/messages/${messageId}`);
    return response?.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
