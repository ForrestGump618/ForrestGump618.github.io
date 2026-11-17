<svelte:options customElement="image-zoom" />

<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { currentLocale, getT } from "@/i18n";
  import { lockBodyScroll } from "@/toolkit/ui/scrollLock";

  let container = $state<HTMLElement | null>(null);
  let dialogElement = $state<HTMLDialogElement | null>(null);
  let isOpen = $state(false);
  let previewSrc = $state("");
  let previewAlt = $state("");
  let previewImages = $state<{ src: string; alt: string }[]>([]);
  let previewIndex = $state(0);

  let cleanupImageListeners: (() => void) | null = null;
  let cleanupSlotListener: (() => void) | null = null;
  let isClosing = $state(false);

  type PreviewImage = { src: string; alt: string };
  type PreviewImageCandidate = PreviewImage & { element: HTMLImageElement };
  const t = getT(currentLocale);

  let releaseBodyScrollLock: (() => void) | null = null;

  const restoreBodyScroll = () => {
    releaseBodyScrollLock?.();
    releaseBodyScrollLock = null;
  };

  const finalizeClosePreview = () => {
    isOpen = false;
    isClosing = false;
    previewSrc = "";
    previewAlt = "";
    previewImages = [];
    previewIndex = 0;

    restoreBodyScroll();
  };

  const requestClosePreview = async () => {
    if (!isOpen || isClosing) {
      return;
    }

    isClosing = true;
    await tick();
    const animations = dialogElement?.getAnimations() ?? [];
    await Promise.allSettled(animations.map((animation) => animation.finished));
    finalizeClosePreview();
  };

  const syncPreviewWithIndex = () => {
    const currentImage = previewImages[previewIndex];
    if (!currentImage) {
      return;
    }

    previewSrc = currentImage.src;
    previewAlt = currentImage.alt;
  };

  const resolvePreviewImages = (image: HTMLImageElement): PreviewImageCandidate[] => {
    const galleryRoot = image.closest("[data-image-zoom-gallery]");
    const galleryImages = galleryRoot
      ? Array.from(galleryRoot.querySelectorAll<HTMLImageElement>("image-zoom img"))
      : [image];

    return galleryImages
      .map((galleryImage) => ({
        element: galleryImage,
        src: galleryImage.currentSrc || galleryImage.src,
        alt: galleryImage.alt || "",
      }))
      .filter((galleryImage) => Boolean(galleryImage.src));
  };

  const openPreview = (image: HTMLImageElement, event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();

    const galleryImages = resolvePreviewImages(image);
    if (galleryImages.length === 0) {
      return;
    }

    isClosing = false;
    previewImages = galleryImages.map(({ src, alt }) => ({ src, alt }));
    previewIndex = Math.max(
      0,
      galleryImages.findIndex((galleryImage) => galleryImage.element === image),
    );
    syncPreviewWithIndex();
    isOpen = true;

    if (typeof document !== "undefined" && typeof window !== "undefined" && !releaseBodyScrollLock) {
      releaseBodyScrollLock = lockBodyScroll(document, {
        innerWidth: window.innerWidth,
        getComputedPaddingInlineEnd: () => window.getComputedStyle(document.body).paddingInlineEnd,
      });
    }
  };

  const hasMultiplePreviewImages = () => previewImages.length > 1;

  const showPreviousPreview = (event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!hasMultiplePreviewImages()) {
      return;
    }

    previewIndex = (previewIndex - 1 + previewImages.length) % previewImages.length;
    syncPreviewWithIndex();
  };

  const showNextPreview = (event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!hasMultiplePreviewImages()) {
      return;
    }

    previewIndex = (previewIndex + 1) % previewImages.length;
    syncPreviewWithIndex();
  };

  $effect(() => {
    if (!dialogElement || typeof dialogElement.showModal !== "function") {
      return;
    }

    if (isOpen && !dialogElement.open) {
      dialogElement.showModal();
      return;
    }

    if (!isOpen && dialogElement.open) {
      dialogElement.close();
    }
  });

  const bindImage = () => {
    cleanupImageListeners?.();
    cleanupImageListeners = null;

    const slot = container?.querySelector("slot") as HTMLSlotElement | null;
    const assignedElements = slot?.assignedElements({ flatten: true }) ?? [];
    const image = assignedElements.find((el) => el.tagName === "IMG") as
      | HTMLImageElement
      | undefined;

    if (!image) {
      return;
    }

    image.classList.add("image-zoom-trigger");

    const hasRole = image.hasAttribute("role");
    const hasTabindex = image.hasAttribute("tabindex");

    if (!hasRole) {
      image.setAttribute("role", "button");
    }

    if (!hasTabindex) {
      image.setAttribute("tabindex", "0");
    }

    const onImageClick = (event: MouseEvent) => {
      openPreview(image, event);
    };

    const onImageKeydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPreview(image, event);
      }
    };

    image.addEventListener("click", onImageClick);
    image.addEventListener("keydown", onImageKeydown);

    cleanupImageListeners = () => {
      image.removeEventListener("click", onImageClick);
      image.removeEventListener("keydown", onImageKeydown);
      image.classList.remove("image-zoom-trigger");

      if (!hasRole) {
        image.removeAttribute("role");
      }

      if (!hasTabindex) {
        image.removeAttribute("tabindex");
      }
    };
  };

  const handleOverlayClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(".image-zoom-content") ||
      target?.closest(".image-zoom-close") ||
      target?.closest(".image-zoom-nav")
    ) {
      return;
    }

    requestClosePreview();
  };

  const handleWindowKeydown = (event: KeyboardEvent) => {
    if (!isOpen) {
      return;
    }

    if (event.key === "Escape") {
      requestClosePreview();
      return;
    }

    if (event.key === "ArrowLeft") {
      showPreviousPreview(event);
      return;
    }

    if (event.key === "ArrowRight") {
      showNextPreview(event);
    }
  };

  onMount(() => {
    bindImage();

    const slot = container?.querySelector("slot") as HTMLSlotElement | null;
    if (slot) {
      const onSlotChange = () => {
        bindImage();
      };

      slot.addEventListener("slotchange", onSlotChange);
      cleanupSlotListener = () => {
        slot.removeEventListener("slotchange", onSlotChange);
      };
    }

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleWindowKeydown);
    }
  });

  onDestroy(() => {
    cleanupSlotListener?.();
    cleanupImageListeners?.();

    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleWindowKeydown);
    }

    restoreBodyScroll();
  });
</script>

<div bind:this={container} class="image-zoom-wrapper">
  <slot />
</div>

<dialog
  bind:this={dialogElement}
  class="image-zoom-overlay {isOpen ? '' : 'hidden'} {isClosing ? 'closing' : ''}"
  aria-label={previewAlt || t("imageZoom.dialog")}
  onclick={handleOverlayClick}
  onclose={() => {
    if (!dialogElement?.open && (isOpen || isClosing)) {
      finalizeClosePreview();
    }
  }}
  onkeydown={(event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      requestClosePreview();
    }
  }}
>
  {#if hasMultiplePreviewImages()}
    <button
      type="button"
      class="image-zoom-nav image-zoom-nav-prev"
      aria-label={t("imageZoom.previous")}
      onclick={showPreviousPreview}
    >
      ‹
    </button>
  {/if}
  <button
    type="button"
    class="image-zoom-close"
    aria-label={t("imageZoom.close")}
    onclick={requestClosePreview}
  >
    ×
  </button>
  {#if previewSrc}
    <img
      class="image-zoom-content"
      src={previewSrc}
      alt={previewAlt}
      loading="eager"
      decoding="async"
    />
  {/if}
  {#if previewAlt}
    <p class="image-zoom-caption">{previewAlt}</p>
  {/if}
  {#if hasMultiplePreviewImages()}
    <button
      type="button"
      class="image-zoom-nav image-zoom-nav-next"
      aria-label={t("imageZoom.next")}
      onclick={showNextPreview}
    >
      ›
    </button>
  {/if}
</dialog>

<style>
  :global(image-zoom) {
    display: block;
    margin: 1.2rem auto;
    width: fit-content;
    max-width: 100%;
  }

  .image-zoom-wrapper {
    display: block;
    max-width: 100%;
  }

  /* 画廊模式：宿主给定宽高时，图片在框内完整居中展示 */
  :host([data-fill]) .image-zoom-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  :global(image-zoom .image-zoom-trigger) {
    cursor: zoom-in;
    transform-origin: center;
    transition:
      filter 0.2s ease,
      transform 0.2s ease;
  }

  :global(image-zoom .image-zoom-trigger:hover) {
    filter: brightness(0.96);
    transform: translateY(-1px) scale(1.01);
  }

  .image-zoom-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--z-fullscreen);
    display: grid;
    place-items: center;
    gap: 0;
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    border: 0;
    margin: 0;
    padding: 2rem 1rem;
    box-sizing: border-box;
    background: var(--codeblock-overlay-bg, rgba(8, 10, 16, 0.72));
    backdrop-filter: blur(0.35rem);
    animation: image-zoom-fade-in var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-overlay.hidden {
    display: none;
  }

  .image-zoom-overlay::backdrop {
    background: var(--codeblock-overlay-bg, rgba(8, 10, 16, 0.72));
    backdrop-filter: blur(0.35rem);
  }

  .image-zoom-overlay.closing {
    animation: image-zoom-fade-out var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-content {
    margin: 0;
    max-width: min(92vw, 1100px);
    max-height: 86vh;
    object-fit: contain;
    border-radius: 0.5rem;
    box-shadow: 0 0.75rem 2rem var(--grey-9-a15);
    cursor: zoom-out;
    animation: image-zoom-scale-in var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-overlay.closing .image-zoom-content {
    animation: image-zoom-scale-out var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2.4rem;
    height: 2.4rem;
    border: 0;
    border-radius: 50%;
    background: rgba(17, 25, 40, 0.58);
    color: #fff;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
    animation: image-zoom-ui-in var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-overlay.closing .image-zoom-close {
    animation: image-zoom-ui-out var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-close:hover {
    background: rgba(17, 25, 40, 0.8);
    transform: scale(1.06);
  }

  .image-zoom-nav {
    position: absolute;
    top: 50%;
    width: 2.75rem;
    height: 2.75rem;
    border: 0;
    border-radius: 999px;
    background: rgba(17, 25, 40, 0.58);
    color: #fff;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    transform: translateY(-50%);
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
    animation: image-zoom-ui-in var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-nav:hover {
    background: rgba(17, 25, 40, 0.8);
    transform: translateY(-50%) scale(1.06);
  }

  .image-zoom-nav-prev {
    left: max(1rem, calc(50vw - min(46vw, 550px) - 3.75rem));
  }

  .image-zoom-nav-next {
    right: max(1rem, calc(50vw - min(46vw, 550px) - 3.75rem));
  }

  .image-zoom-caption {
    margin: 0.8rem 0 0;
    font-size: 0.9rem;
    color: var(--grey-1);
    text-align: center;
    max-width: min(92vw, 1100px);
    line-height: 1.5;
    animation: image-zoom-ui-in var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-overlay.closing .image-zoom-caption {
    animation: image-zoom-ui-out var(--dur-3) var(--ease-out) both;
  }

  .image-zoom-overlay.closing .image-zoom-nav {
    animation: image-zoom-ui-out var(--dur-3) var(--ease-out) both;
  }

  @keyframes image-zoom-fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes image-zoom-fade-out {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @keyframes image-zoom-scale-in {
    from {
      opacity: 0;
      transform: scale(0.94) translateY(10px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes image-zoom-scale-out {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    to {
      opacity: 0;
      transform: scale(0.94) translateY(10px);
    }
  }

  @keyframes image-zoom-ui-in {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes image-zoom-ui-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }

    to {
      opacity: 0;
      transform: translateY(-6px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(image-zoom .image-zoom-trigger),
    .image-zoom-close,
    .image-zoom-nav {
      transition: none;
    }

    .image-zoom-overlay,
    .image-zoom-overlay.closing,
    .image-zoom-content,
    .image-zoom-overlay.closing .image-zoom-content,
    .image-zoom-caption,
    .image-zoom-overlay.closing .image-zoom-caption,
    .image-zoom-nav,
    .image-zoom-overlay.closing .image-zoom-nav,
    .image-zoom-overlay.closing .image-zoom-close {
      animation: none;
    }
  }
</style>
