import { request } from '@/service/request';

export function fetchGetAllTask() {
  return request<Api.Core.UserService.TaskReward[]>({
    url: '/user-service/task-reward/get-all-task'
  });
}

export interface PostTaskStruct {
  id: number;
  condition: string;
  description: string;
  rewardDialogue: number;
  rewardPainting: number;
}
export function fetchPostTask(d: PostTaskStruct) {
  return request({
    url: '/user-service/task-reward/post-task',
    method: 'POST',
    data: {
      id: d.id,
      condition: d.condition,
      description: d.description,
      rewardDialogue: d.rewardDialogue,
      rewardPainting: d.rewardPainting
    }
  });
}

export function fetchGetAllTaskRewardReceive() {
  return request<Api.Core.UserService.TaskRewardReceive[]>({
    url: '/user-service/task-reward/get-all-task-reward-receive'
  });
}
