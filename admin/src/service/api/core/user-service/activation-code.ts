import { request } from '@/service/request';

export function fetchGetActicationCode() {
  return request<Api.Core.UserService.ActivationCode[]>({
    url: '/user-service/activation-code'
  });
}

export function fetchDeleteActicationCode(id: number) {
  return request({
    url: '/user-service/activation-code',
    method: 'DELETE',
    data: {
      id
    }
  });
}

interface CreateActicationCodeParams {
  // 密码
  password: string;
  // 对话数
  dialogueCount: number;
  // 绘画数
  paintingCount: number;
}
export function fetchCreateActicationCode(d: CreateActicationCodeParams) {
  return request<Api.Core.UserService.ActivationCode>({
    url: '/user-service/activation-code',
    method: 'POST',
    data: {
      password: d.password,
      dialogueCount: d.dialogueCount,
      paintingCount: d.paintingCount
    }
  });
}
