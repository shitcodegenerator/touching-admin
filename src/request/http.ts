import axios from "axios";
import { ElMessage } from "element-plus";
import router from "../router";
import { useAuthStore } from "../store/auth";

const http = axios.create({
  baseURL: "/proxyApi",
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
