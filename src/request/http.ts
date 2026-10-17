import axios from "axios";
import { ElMessage } from "element-plus";
import router from "../router";
import { useAuthStore } from "../store/auth";

// 後端位址由 VITE_API_BASE_URL 設定；未設時打正式後端（Cloud Run 台灣）
const DEFAULT_API_BASE_URL =
  "https://touching-api-415964224522.asia-east1.run.app/api";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  timeout: 30000,
});

// Request interceptor: 自動帶 token
http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Response interceptor: 401 時導向登入
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore();
      auth.clearToken();
      ElMessage.error("登入已過期，請重新登入");
      router.push("/login");
    } else if (error.response?.status >= 400) {
      ElMessage.error(error.response?.data?.error ?? "請求失敗");
    }
    return Promise.reject(error);
  },
);

export default http;
