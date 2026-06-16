import { request } from '@/service/request';

export function fetchGetAllViews() {
  return request<Api.Core.Chat.Assistant.View[]>({
    url: '/chat/assistant/getAllViews'
  });
}

export interface PostViewParams {
  id: number;
  name: string;
  imgBlob?: File | undefined;
  content_zh_CN: string;
  categoryId: number;
}

export function fetchPostView(d: PostViewParams) {
  const formData = new FormData();
  formData.append('id', d.id.toString());
  formData.append('name', d.name);
  if (d.imgBlob) formData.append('imgBlob', d.imgBlob as File);
  formData.append('content_zh_CN', d.content_zh_CN);
  formData.append('categoryId', d.categoryId.toString());
  return request({
    url: '/chat/assistant/postView',
    method: 'POST',
    data: formData
  });
}

export function fetchDeleteView(id: number) {
  return request({
    url: '/chat/assistant/deleteView',
    method: 'DELETE',
    data: {
      id
    }
  });
}
