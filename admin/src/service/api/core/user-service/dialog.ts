import { request } from '@/service/request';

export function fetchGetAllDialog() {
  return request<Api.Core.UserService.Dialog[]>({
    url: '/user-service/dialog/allDialog'
  });
}

export function fetchDeleteDialog(id: number) {
  return request({
    url: '/user-service/dialog/deleteDialog',
    method: 'DELETE',
    data: {
      id
    }
  });
}

export function fetchGetAllDetail() {
  return request<Api.Core.UserService.DialogDetail[]>({
    url: '/user-service/dialog/allDetail'
  });
}

export function fetchDeleteDetail(id: number) {
  return request({
    url: '/user-service/dialog/deleteDetail',
    method: 'DELETE',
    data: {
      id
    }
  });
}

export function fetchPostDetail(id: number, role: string, content: string) {
  return request({
    url: '/user-service/dialog/postDetail',
    method: 'POST',
    data: {
      id,
      role,
      content
    }
  });
}

export function fetchGetAllStarDialogDetail() {
  return request<Api.Core.UserService.StarDialogDetail[]>({
    url: '/user-service/dialog/allStarDialogDetail'
  });
}

export function fetchDeleteStarDialogDetail(id: number) {
  return request({
    url: '/user-service/dialog/deleteStarDialogDetail',
    method: 'DELETE',
    data: {
      id
    }
  });
}

export function fetchPostDialogDetail(id: number, userMsg: string, assistantMsg: string) {
  return request({
    url: '/user-service/dialog/postStarDialogDetail',
    method: 'POST',
    data: {
      id,
      userMsg,
      assistantMsg
    }
  });
}
