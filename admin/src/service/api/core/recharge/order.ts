import { request } from '@/service/request';

export function fetchGetAllOrders() {
  return request<Api.Core.Recharge.Order[]>({
    url: '/recharge/order/getAllOrders'
  });
}
