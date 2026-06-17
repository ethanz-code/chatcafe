import { Axios } from 'axios'

const baseURL = import.meta.env.VITE_BASE_URL
export default new Axios({
  baseURL: baseURL,
  // withCredentials: true, // 跨域请求时发送 cookies
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
    // Authorization: 'Bearer ' + (localStorage.getItem('token') || '')
  }
})
