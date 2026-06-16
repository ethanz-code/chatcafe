import { request } from '@/service/request';

export function fetchGetAllGoods() {
  return request<Api.Core.Recharge.Goods[]>({
    url: '/recharge/goods/getAllGoods'
  });
}

export function fetchPostGoods(d: Partial<Api.Core.Recharge.Goods>) {
  return request({
    url: '/recharge/goods/postGoods',
    method: 'POST',
    data: {
      ...d
    }
  });
}
