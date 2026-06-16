import { request } from '@/service/request';

export function fetchGetAllFeedback() {
  return request<Api.Core.UserService.Feedback[]>({
    url: '/user-service/feedback'
  });
}

export function fetchProcessFeedback(id: number) {
  return request({
    url: '/user-service/feedback/process',
    method: 'POST',
    data: {
      id
    }
  });
}
