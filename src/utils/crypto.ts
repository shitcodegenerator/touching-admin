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
 * 將 PEM 格式公鑰轉為 CryptoKey
 */
const importPublicKey = async (pem: string): Promise<CryptoKey> => {
  const pemBody = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
};

/**
 * 用 RSA-OAEP 公鑰加密密碼
 */
export const encryptPassword = async (password: string): Promise<string> => {
  const publicKeyPem = await fetchPublicKey();
  const publicKey = await importPublicKey(publicKeyPem);

  const encoded = new TextEncoder().encode(password);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encoded,
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};
