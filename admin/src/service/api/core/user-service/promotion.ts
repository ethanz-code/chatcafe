import { request } from '@/service/request';

export function fetchGetAllPromotion() {
  return request<Api.Core.UserService.Promotion[]>({
    url: '/user-service/promotion'
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
