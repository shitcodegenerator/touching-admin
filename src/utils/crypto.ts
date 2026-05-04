import JSEncrypt from "jsencrypt";
import http from "../request/http";

let cachedPublicKey: string | null = null;

/**
 * 從後端取得 RSA 公鑰
 */
export const fetchPublicKey = async (): Promise<string> => {
  if (cachedPublicKey) return cachedPublicKey;
  const { data } = await http.get("/auth/public-key");
  cachedPublicKey = data.data.publicKey;
  return cachedPublicKey!;
};

/**
 * 用 RSA 公鑰加密密碼
 */
export const encryptPassword = async (password: string): Promise<string> => {
  const publicKey = await fetchPublicKey();
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encrypted = encrypt.encrypt(password);
  if (!encrypted) {
    throw new Error("加密失敗");
  }
  return encrypted;
};
