import { request } from '@/service/request';

export function fetchGetAllModel() {
  return request<Api.Core.Chat.Language.Model[]>({
    url: '/chat/language/getAllModel'
  });
}

export interface PostModelParams {
  id: number;
  name: string;
  cost: number;
  relatedUrl?: string;
}
export function fetchPostModel(d: PostModelParams) {
  return request({
    url: '/chat/language/postModel',
    method: 'POST',
    data: {
      ...d
    }
  });
}
