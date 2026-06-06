<script lang="ts">
  import type { EncryptedData, TocItem } from "@/toolkit/encryption/types";
  import { decryptContent } from "@/toolkit/encryption/crypto";
  import { encryptedTocStore } from "@/stores/encryptedTocStore";
  import { currentLocale, getT } from "@/i18n";
  import PasswordModal from "./PasswordModal.svelte";
  import "./encrypted.css";

  interface Props {
    encryptedContent: EncryptedData;
    encryptedToc?: EncryptedData;
    title?: string;
    passwordPlaceholder?: string;
    submitText?: string;
    errorText?: string;
  }

  let {
    encryptedContent,
    encryptedToc,
    title = "",
    passwordPlaceholder,
    submitText,
    errorText,
  }: Props = $props();

  const t = getT(currentLocale);

  let isDecrypted = $state(false);
  let decryptedContent = $state("");
  let decryptedToc = $state<TocItem[] | undefined>();
  let isDecrypting = $state(false);

  async function handleDecrypted(content: string) {
    isDecrypting = true;
    try {
      decryptedContent = content;
      // 如果有加密的 TOC，解密 TOC
      if (encryptedToc) {
        const password =
          sessionStorage.getItem(`encrypted_${window.location.pathname}`) || "";
        const tocJson = await decryptContent(encryptedToc, password);
        decryptedToc = JSON.parse(tocJson) as TocItem[];
        // 更新侧边栏 TOC
        encryptedTocStore.set(decryptedToc);
      }
      isDecrypted = true;
    } finally {
      isDecrypting = false;
    }
  }
</script>

{#if isDecrypted}
  <div class="encrypted-content">
    {@html decryptedContent}
  </div>
{:else if isDecrypting}
  <div class="encrypted-post encrypted-decrypting">
    <div class="loading-spinner"></div>
    <p class="encrypted-decrypting-text">{t("encrypted.decrypting")}</p>
  </div>
{:else}
  <PasswordModal
    encryptedData={encryptedContent}
    {title}
    {passwordPlaceholder}
    {submitText}
    {errorText}
    on:decrypted={(event) => {
      void handleDecrypted(event.detail);
    }}
  />
{/if}
