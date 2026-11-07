import axios from "axios"

import { API_CONFIG } from "../config/api.config"
import { clearSession, getAccessToken } from "./sessionStorage"

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
      clearSession()
    }

    if (status === 403) {
      const data = error?.response?.data
      const rawMsg =
        data?.message ||
        data?.error?.message ||
        (typeof data?.error === "string" ? data.error : null) ||
        error?.message ||
        ""

      let finalMsg
      if (!rawMsg || rawMsg.toLowerCase() === "forbidden" || rawMsg.toLowerCase() === "account restricted") {
        finalMsg = "Account restricted: You do not have permission to perform this action."
      } else if (rawMsg.toLowerCase().startsWith("account restricted")) {
        finalMsg = rawMsg
      } else {
        finalMsg = `Account restricted: ${rawMsg}`
      }

      if (data && typeof data === "object") {
        data.message = finalMsg
        if (data.error && typeof data.error === "object") {
          data.error.message = finalMsg
        } else if (typeof data.error === "string") {
          data.error = finalMsg
        }
      }
      error.message = finalMsg
    }

    return Promise.reject(error)
  },
)

export default apiClient
