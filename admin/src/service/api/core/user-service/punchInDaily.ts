import { request } from '@/service/request';

export function fetchGetAllPunchInDaily() {
  return request<Api.Core.UserService.PunchInDaily[]>({
    url: '/user-service/punch-in-daily'
  });
}
