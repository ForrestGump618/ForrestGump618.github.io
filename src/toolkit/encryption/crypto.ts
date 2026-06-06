/**
 * 文章加密/解密核心模块
 * 使用 AES-GCM 算法 + PBKDF2 密钥派生
 * 同时支持构建时（Node.js/Bun）和运行时（浏览器）环境
 */
import type { EncryptedData, EncryptionConfig, TocItem } from "./types";
import { DEFAULT_ENCRYPTION_CONFIG } from "./types";

/** 运行时类型守卫：验证值是否为 TocItem[] */
function isTocItemArray(v: unknown): v is TocItem[] {
  return (
    Array.isArray(v) &&
    v.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.text === "string",
    )
  );
}

// 获取加密 API（兼容 Node.js 和浏览器）
async function getSubtle(): Promise<SubtleCrypto> {
  // 浏览器环境
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  // Node.js / Bun 环境
  // Node.js 全局
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error("Web Crypto API not available");
}

/**
 * 将 Uint8Array 转换为 Base64 字符串
 */
function arrayToBase64(array: Uint8Array): string {
  // Node.js / Bun 环境
  if (typeof Buffer !== "undefined") {
    return Buffer.from(array).toString("base64");
  }
  // 浏览器环境
  let binary = "";
  for (let i = 0; i < array.length; i++) {
    binary += String.fromCodePoint(array[i]);
  }
  return btoa(binary);
}

/**
 * 将 Base64 字符串转换为 Uint8Array
 */
function base64ToArray(base64: string): Uint8Array {
  // Node.js / Bun 环境
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  // 浏览器环境
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.codePointAt(i) ?? 0;
  }
  return array;
}

/**
 * 从密码派生加密密钥
 * 使用 PBKDF2 算法
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_ENCRYPTION_CONFIG.iterations,
): Promise<CryptoKey> {
  const subtle = await getSubtle();

  // 将密码转换为 CryptoKey
  const passwordKey = await subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  // 派生 AES-GCM 密钥
  return subtle.deriveKey(
    {
      name: "PBKDF2",
      // eslint-disable-next-line no-unsafe-type-assertion
      salt: salt as unknown as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * 加密内容
 * @param content 要加密的明文内容
 * @param password 加密密码
 * @param config 加密配置
 * @returns 加密数据
 */
export async function encryptContent(
  content: string,
  password: string,
  config: EncryptionConfig = {},
): Promise<EncryptedData> {
  const subtle = await getSubtle();
  const {
    iterations = DEFAULT_ENCRYPTION_CONFIG.iterations,
    saltLength = DEFAULT_ENCRYPTION_CONFIG.saltLength,
    ivLength = DEFAULT_ENCRYPTION_CONFIG.ivLength,
  } = config;

  // 生成随机盐值和初始化向量
  const salt = new Uint8Array(saltLength);
  const iv = new Uint8Array(ivLength);

  // 使用 Web Crypto API 生成随机值
  const randomValues = new Uint8Array(saltLength + ivLength);
  // 在 Node.js/Bun 环境中使用 crypto.getRandomValues
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  }
  for (let i = 0; i < saltLength; i++) {
    salt[i] = randomValues[i];
  }
  for (let i = 0; i < ivLength; i++) {
    iv[i] = randomValues[saltLength + i];
  }

  // 派生密钥
  const key = await deriveKey(password, salt, iterations);

  // 加密内容
  const encodedContent = new TextEncoder().encode(content);
  const encrypted = await subtle.encrypt(
    {
      name: "AES-GCM",
      // eslint-disable-next-line no-unsafe-type-assertion
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedContent,
  );

  return {
    ciphertext: arrayToBase64(new Uint8Array(encrypted)),
    iv: arrayToBase64(iv),
    salt: arrayToBase64(salt),
    algorithm: "AES-GCM",
    iterations,
  };
}

/**
 * 解密内容
 * @param encryptedData 加密数据
 * @param password 解密密码
 * @returns 解密后的明文内容
 */
export async function decryptContent(
  encryptedData: EncryptedData,
  password: string,
): Promise<string> {
  const subtle = await getSubtle();

  // 解码 Base64 数据
  const salt = base64ToArray(encryptedData.salt);
  const iv = base64ToArray(encryptedData.iv);
  const ciphertext = base64ToArray(encryptedData.ciphertext);

  // 派生密钥
  const key = await deriveKey(password, salt, encryptedData.iterations);

  // 解密内容
  const decrypted = await subtle.decrypt(
    {
      name: "AES-GCM",
      // eslint-disable-next-line no-unsafe-type-assertion
      iv: iv as unknown as BufferSource,
    },
    key,
    // eslint-disable-next-line no-unsafe-type-assertion
    ciphertext as unknown as BufferSource,
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * 加密文章内容和目录
 * @param content HTML 内容
 * @param toc TOC 目录数据
 * @param password 加密密码
 * @returns 加密数据
 */
export async function encryptPost(
  content: string,
  toc: TocItem[] | undefined,
  password: string,
): Promise<{ content: EncryptedData; toc?: EncryptedData }> {
  const contentData = await encryptContent(content, password);

  let tocData: EncryptedData | undefined;
  if (toc && toc.length > 0) {
    tocData = await encryptContent(JSON.stringify(toc), password);
  }

  return {
    content: contentData,
    toc: tocData,
  };
}

/**
 * 解密文章内容和目录
 * @param encryptedData 加密数据
 * @param password 解密密码
 * @returns 解密后的内容和目录
 */
export async function decryptPost(
  encryptedData: { content: EncryptedData; toc?: EncryptedData },
  password: string,
): Promise<{ content: string; toc?: TocItem[] }> {
  const content = await decryptContent(encryptedData.content, password);

  let toc: TocItem[] | undefined;
  if (encryptedData.toc) {
    const tocJson = await decryptContent(encryptedData.toc, password);
    const parsed: unknown = JSON.parse(tocJson);
    toc = isTocItemArray(parsed) ? parsed : [];
  }

  return { content, toc };
}

/**
 * 验证密码是否正确
 * 通过尝试解密来验证
 */
export async function verifyPassword(
  encryptedData: EncryptedData,
  password: string,
): Promise<boolean> {
  try {
    await decryptContent(encryptedData, password);
    return true;
  } catch {
    return false;
  }
}
