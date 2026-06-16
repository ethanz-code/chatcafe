import { request } from '@/service/request';

export function fetchGetConfiguration() {
  return request<Api.Core.Configuration[]>({
    url: '/configuration'
  });
}

export function fetchPostConfiguration(id: number, name: string, value: string) {
  return request({
    url: '/configuration',
    method: 'POST',
    data: {
      id,
      name,
      value
    }
  });
}
