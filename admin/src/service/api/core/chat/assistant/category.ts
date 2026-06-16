import { request } from '@/service/request';

export function fetchGetAllCategory() {
  return request<Api.Core.Chat.Assistant.Category[]>({
    url: '/chat/assistant/getAllCategory'
  });
}

export function fetchPostCategory(id: number, name: string) {
  return request({
    url: '/chat/assistant/postCategory',
    method: 'POST',
    data: {
      id,
      name
    }
  });
}
