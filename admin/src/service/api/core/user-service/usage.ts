import { request } from '@/service/request';

export interface UsageOverview {
  total: { calls: number; tokens: number; promptTokens: number; completionTokens: number; cost: number };
  today: { calls: number; tokens: number; cost: number; activeUsers: number };
  week: { calls: number; tokens: number; cost: number };
  month: { calls: number; tokens: number; cost: number };
}

export interface ModelUsage {
  model: string;
  calls: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
}

export interface UserUsage {
  userId: number;
  phoneNumber: string;
  name: string;
  calls: number;
  totalTokens: number;
  cost: number;
  lastUsed: string;
}

export interface UserUsageResult {
  list: UserUsage[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DailyTrend {
  date: string;
  calls: number;
  tokens: number;
  cost: number;
}

export function fetchUsageOverview() {
  return request<UsageOverview>({ url: '/user-service/usage/overview' });
}

export function fetchUsageByModel(days: number = 30) {
  return request<ModelUsage[]>({ url: '/user-service/usage/by-model', params: { days } });
}

export function fetchUsageByUser(days: number = 30, page: number = 1, pageSize: number = 20) {
  return request<UserUsageResult>({ url: '/user-service/usage/by-user', params: { days, page, pageSize } });
}

export function fetchUsageTrends(days: number = 30) {
  return request<DailyTrend[]>({ url: '/user-service/usage/trends', params: { days } });
}
