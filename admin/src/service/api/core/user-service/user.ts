import { request } from '@/service/request';

export function fetchGetAllUser() {
  return request<Api.Core.UserService.User[]>({
    url: '/user-service/user/get-all-user'
  });
}

export function fetchPostBalance(id: number, dialogueBalance: number, paintingBalance: number) {
  return request({
    url: '/user-service/user/post-balance',
    method: 'POST',
    data: {
      id,
      dialogueBalance,
      paintingBalance
    }
  });
}
