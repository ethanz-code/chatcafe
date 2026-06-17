import axios from '@/utils/axios'

export default async function loginVerify(token) {
  // 验证token是否有效
  // 返回一个布尔值，表示token是否有效
  // 这里可以根据自己的需求进行实现，比如验证token的过期时间、签名等

  if (!token) return false
  const result = await axios.get('/user/verify', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })

  if (result.status !== 200) return false
  const data = JSON.parse(result.data)
  if (data.status === -1) return false

  return true
}
