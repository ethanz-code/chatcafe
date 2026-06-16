import { request } from '@/service/request';

export function fetchGetAllHotIssues() {
  return request<Api.Core.Chat.Language.HotIssues[]>({
    url: '/chat/language/getAllHotIssues'
  });
}

export function fetchCreateHotIssue(description: string) {
  return request({
    url: '/chat/language/createHotIssue',
    method: 'POST',
    data: {
      description
    }
  });
}

export function fetchDeleteHotIssue(id: number) {
  return request({
    url: '/chat/language/deleteHotIssue',
    method: 'DELETE',
    data: {
      id
    }
  });
}
