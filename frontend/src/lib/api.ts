import axios from 'axios'

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // 1. ถ้ามี env NEXT_PUBLIC_API_URL ใช้เลย (Vercel → Render)
    // 2. ถ้า port 80/443 (production) ใช้ /api
    // 3. ถ้า dev ใช้ hostname:4000
    const envUrl = process.env.NEXT_PUBLIC_API_URL
    if (envUrl) {
      config.baseURL = envUrl
    } else {
      const port = window.location.port
      const isProduction = port === '' || port === '80' || port === '443'
      config.baseURL = isProduction
        ? '/api'
        : `http://${window.location.hostname}:4000/api`
    }

    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } else {
    config.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
