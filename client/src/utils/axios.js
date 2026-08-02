import axios from 'axios'
import handleUnauthorized from '@/utils/handleUnauthorized'

const baseURL = import.meta.env.VITE_BASE_URL
const instance = axios.create({
  baseURL
})

instance.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data && data.status === -1 && data.error === 'Unauthorized') {
      handleUnauthorized()
    }
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      handleUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default instance
