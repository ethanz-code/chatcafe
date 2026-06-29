import { request } from '@/service/request';

export function fetchGetAllPromotion() {
  return request<Api.Core.UserService.Promotion[]>({
    url: '/user-service/promotion'
  });
}
