import { request } from '@/service/request';

export function fetchGetAllCommunity() {
  return request<Api.Core.Image.Community[]>({
    url: '/image/getAllCommunity'
  });
}

export function fetchGetAllList() {
  return request<Api.Core.Image.List[]>({
    url: '/image/getAllList'
  });
}
