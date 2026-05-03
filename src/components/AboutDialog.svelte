<script lang="ts">
  import { t } from "@/i18n";
  import { onMount, tick } from "svelte";

  type Speaker = "bot" | "user";

  interface ChatOption {
    label: string;
    nextId: string;
    reply?: string;
  }

  interface ChatNode {
    id: string;
    text: string;
    options?: ChatOption[];
  }

  interface ChatMessage {
    id: string;
    speaker: Speaker;
    text: string;
  }

  interface Props {
    title?: string;
    intro?: string;
    authorName?: string;
    authorAvatar?: string;
    startId?: string;
    nodes?: ChatNode[];
    endHint?: string;
    typingDelayMs?: number;
  }

  const defaultNodes: ChatNode[] = [
    {
      id: "intro",
      text: t("aboutDialog.defaultNodes.intro.text"),
      options: [
        {
          label: t("aboutDialog.defaultNodes.intro.optionA.label"),
          reply: t("aboutDialog.defaultNodes.intro.optionA.reply"),
          nextId: "answer-a",
        },
        {
          label: t("aboutDialog.defaultNodes.intro.optionB.label"),
          reply: t("aboutDialog.defaultNodes.intro.optionB.reply"),
          nextId: "answer-b",
        },
      ],
    },
    {
      id: "answer-a",
      text: t("aboutDialog.defaultNodes.answerA.text"),
      options: [
        {
          label: t("aboutDialog.defaultNodes.backToMenu.label"),
          reply: t("aboutDialog.defaultNodes.backToMenu.reply"),
          nextId: "intro",
        },
      ],
    },
    {
      id: "answer-b",
      text: t("aboutDialog.defaultNodes.answerB.text"),
      options: [
        {
          label: t("aboutDialog.defaultNodes.backToMenu.label"),
          reply: t("aboutDialog.defaultNodes.backToMenu.reply"),
          nextId: "intro",
        },
      ],
    },
  ];

  let {
    title = t("aboutDialog.defaults.title"),
    intro = t("aboutDialog.defaults.intro"),
    authorName = t("aboutDialog.defaults.authorName"),
    authorAvatar = "",
    startId = "intro",
    nodes = defaultNodes,
    endHint = t("aboutDialog.defaults.endHint"),
    typingDelayMs = 650,
  }: Props = $props();

  let viewport = $state<HTMLDivElement | null>(null);
  let messages = $state<ChatMessage[]>([]);
  let currentNodeId = $state("");
  let isTyping = $state(false);

  const nodeMap = $derived(new Map(nodes.map((node) => [node.id, node])));
  const currentNode = $derived(nodeMap.get(currentNodeId));
  const currentOptions = $derived(currentNode?.options ?? []);
  const authorInitial = $derived(
    authorName.trim().slice(0, 1) || t("aboutDialog.defaults.authorInitial"),
  );

  const createMessage = (speaker: Speaker, text: string): ChatMessage => ({
    id: `${speaker}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    speaker,
    text,
  });

  const scrollToBottom = async () => {
    await tick();
    viewport?.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  };

  const waitForTyping = (delay: number) =>
    new Promise<void>((resolve) => {
      const normalizedDelay = Number.isFinite(delay) ? Math.max(0, delay) : 0;
      setTimeout(() => {
        resolve();
      }, normalizedDelay);
    });

  const initializeConversation = () => {
    const firstNode = nodeMap.get(startId);
    currentNodeId = firstNode?.id ?? startId;
    isTyping = false;

    messages = firstNode
      ? [createMessage("bot", firstNode.text)]
      : [createMessage("bot", t("aboutDialog.runtime.noNodesConfigured"))];
    void scrollToBottom();
  };

  const chooseOption = async (option: ChatOption) => {
    if (isTyping) {
      return;
    }

    const nextNode = nodeMap.get(option.nextId);
    const botReply = nextNode
      ? nextNode.text
      : t("aboutDialog.runtime.branchNotConfigured");

    messages = [
      ...messages,
      createMessage("user", option.reply ?? option.label),
    ];
    isTyping = true;
    await scrollToBottom();

    await waitForTyping(typingDelayMs);

    if (nextNode) {
      currentNodeId = nextNode.id;
    }

    messages = [...messages, createMessage("bot", botReply)];
    isTyping = false;
    await scrollToBottom();
  };

  const restart = () => {
    initializeConversation();
  };

  onMount(() => {
    initializeConversation();
  });

  $effect(() => {
    if (currentNodeId === "") {
      currentNodeId = startId;
    }
  });
</script>

<section class="about-dialog" aria-label={title}>
  <header class="dialog-header">
    <h3>{title}</h3>
    <p>{intro}</p>
  </header>

  <div class="dialog-body" bind:this={viewport}>
    {#if messages.length === 0}
      <p class="dialog-empty">{t("aboutDialog.runtime.noDialogContent")}</p>
    {:else}
      {#each messages as message (message.id)}
        <div class="message-row" class:is-user={message.speaker === "user"}>
          {#if message.speaker === "bot"}
            <div class="author-avatar" aria-hidden="true">
              {#if authorAvatar}
                <img src={authorAvatar} alt="" loading="lazy" decoding="async" />
              {:else}
                <span>{authorInitial}</span>
              {/if}
            </div>
          {/if}

          <div class="message-content" class:is-user={message.speaker === "user"}>
            {#if message.speaker === "bot"}
              <p class="author-name">{authorName}</p>
            {/if}
            <div class="message-bubble" class:is-user={message.speaker === "user"}>
              {message.text}
            </div>
          </div>
        </div>
      {/each}

      {#if isTyping}
        <div class="message-row">
          <div class="author-avatar" aria-hidden="true">
            {#if authorAvatar}
              <img src={authorAvatar} alt="" loading="lazy" decoding="async" />
            {:else}
              <span>{authorInitial}</span>
            {/if}
          </div>

          <div class="message-content">
            <p class="author-name">{authorName}</p>
            <div
              class="message-bubble typing-bubble"
              role="status"
              aria-live="polite"
              aria-label={t("aboutDialog.typing.ariaLabel")}
            >
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <footer class="dialog-footer">
    <div class="fake-input" class:is-typing={isTyping} aria-hidden="true">
      <span class="fake-input-text"
        >{isTyping
          ? t("aboutDialog.typing.peerTyping")
          : t("aboutDialog.typing.inputPlaceholder")}</span
      >
      <span class="fake-input-action">{t("aboutDialog.actions.send")}</span>
    </div>

    {#if currentOptions.length > 0}
      <div class="options-grid">
        {#each currentOptions as option}
          <button
            type="button"
            class="option-button"
            disabled={isTyping}
            onclick={() => void chooseOption(option)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    {:else}
      <p class="dialog-end">{endHint}</p>
    {/if}

    <button
      type="button"
      class="restart-button"
      disabled={isTyping}
      onclick={restart}
    >
      {t("aboutDialog.actions.restart")}
    </button>
  </footer>
</section>

<style>
  .about-dialog {
    --dialog-accent: var(--primary-color);

    margin: 2rem 0;
    border: 1px solid var(--grey-3);
    border-radius: 0.9rem;
    overflow: hidden;
    background: linear-gradient(180deg, var(--grey-1), var(--grey-0));
    box-shadow: 0 0.75rem 1.5rem var(--box-bg-shadow);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      border-color 0.25s ease;
  }

  .about-dialog:hover {
    transform: translateY(-2px);
    border-color: var(--border-color-muted);
    box-shadow: 0 1rem 2rem var(--grey-9-a15);
  }

  .dialog-header {
    position: relative;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid var(--grey-3);
    background: linear-gradient(
      120deg,
      var(--grey-1),
      var(--color-pink-light-a3),
      var(--grey-1)
    );
    background-size: 220% 220%;
    animation: dialog-header-flow 10s ease infinite;
  }

  .dialog-header h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--grey-7);
  }

  .dialog-header p {
    margin: 0.35rem 0 0;
    color: var(--grey-6);
    font-size: 0.875rem;
    line-height: 1.6;
  }

  .dialog-body {
    padding: 0.9rem;
    max-height: 22rem;
    overflow-y: auto;
    background: linear-gradient(180deg, var(--grey-0), var(--grey-1));
    scroll-behavior: smooth;
  }

  .dialog-empty,
  .dialog-end {
    margin: 0;
    color: var(--grey-5);
    font-size: 0.875rem;
    line-height: 1.6;
    animation: dialog-fade-in 0.28s ease;
  }

  .message-row {
    display: flex;
    align-items: flex-end;
    margin-bottom: 0.65rem;
    animation: message-in-left 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .message-row:last-child {
    margin-bottom: 0;
  }

  .message-row.is-user {
    justify-content: flex-end;
    animation-name: message-in-right;
  }

  .message-content {
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-width: min(34rem, 80%);
  }

  .message-content.is-user {
    align-items: flex-end;
  }

  .author-avatar {
    width: 2.2rem;
    height: 2.2rem;
    margin-top: 0.05rem;
    margin-right: 0.55rem;
    align-self: flex-start;
    border-radius: 9999px;
    border: 1px solid var(--grey-3);
    background: var(--grey-1);
    overflow: hidden;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    box-shadow: 0 0.25rem 0.6rem var(--grey-9-a1);
  }

  .author-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .author-avatar span {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--grey-6);
  }

  .author-name {
    margin: 0 0 0.25rem;
    color: var(--grey-5);
    font-size: 0.75rem;
    line-height: 1.1;
  }

  .message-bubble {
    box-sizing: border-box;
    max-width: 100%;
    padding: 0.55rem 0.75rem;
    border-radius: 0.8rem;
    line-height: 1.65;
    color: var(--grey-7);
    background: var(--grey-1);
    border: 1px solid var(--grey-3);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 0.92rem;
    box-shadow: 0 0.35rem 0.9rem var(--grey-9-a1);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .message-row:hover .message-bubble {
    transform: translateY(-1px);
    box-shadow: 0 0.55rem 1.1rem var(--grey-9-a15);
  }

  .message-bubble.is-user {
    background: var(--color-blue);
    border-color: var(--color-blue);
    color: var(--grey-0);
  }

  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    width: fit-content;
    min-width: 2.9rem;
    padding-inline: 0.7rem;
  }

  .typing-dot {
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 9999px;
    background: var(--grey-5);
    animation: typing-dot-bounce 1s ease-in-out infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.12s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.24s;
  }

  .fake-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    padding: 0.55rem 0.72rem;
    border: 1px solid var(--grey-3);
    border-radius: 0.75rem;
    background: var(--grey-0);
    color: var(--grey-5);
    box-shadow: inset 0 1px 0 var(--grey-1);
    animation: dialog-fade-in 0.24s ease;
  }

  .fake-input.is-typing {
    border-color: var(--dialog-accent);
    box-shadow:
      inset 0 1px 0 var(--grey-1),
      0 0 0 1px var(--color-red-a1);
  }

  .fake-input-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.86rem;
    line-height: 1.4;
  }

  .fake-input-action {
    flex-shrink: 0;
    font-size: 0.76rem;
    color: var(--dialog-accent);
    border: 1px solid var(--grey-3);
    border-radius: 9999px;
    background: var(--grey-1);
    padding: 0.2rem 0.5rem;
  }

  .dialog-footer {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 1.25rem 1rem 1rem;
    border-top: 1px solid var(--grey-3);
    background: var(--grey-1);
  }

  .options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    animation: dialog-fade-in 0.24s ease;
  }

  .option-button,
  .restart-button {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--grey-3);
    border-radius: 9999px;
    background: var(--grey-0);
    color: var(--grey-7);
    font-size: 0.85rem;
    line-height: 1.2;
    padding: 0.45rem 0.8rem;
    cursor: pointer;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .option-button::after,
  .restart-button::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      120deg,
      var(--grey-1-a0),
      var(--color-red-a1),
      var(--grey-1-a0)
    );
    opacity: 0;
    transform: translateX(-120%);
    transition:
      transform 0.35s ease,
      opacity 0.2s ease;
  }

  .option-button:not(:disabled):hover,
  .restart-button:not(:disabled):hover {
    border-color: var(--dialog-accent);
    color: var(--dialog-accent);
    transform: translateY(-1px);
    box-shadow: 0 0.4rem 0.9rem var(--grey-9-a1);
  }

  .option-button:not(:disabled):hover::after,
  .restart-button:not(:disabled):hover::after {
    opacity: 1;
    transform: translateX(120%);
  }

  .option-button:not(:disabled):active,
  .restart-button:not(:disabled):active {
    transform: translateY(0) scale(0.98);
  }

  .option-button:disabled,
  .restart-button:disabled {
    cursor: not-allowed;
    opacity: 0.62;
    color: var(--grey-5);
    border-color: var(--grey-3);
    transform: none;
    box-shadow: none;
  }

  .option-button:disabled::after,
  .restart-button:disabled::after {
    opacity: 0;
  }

  .option-button:focus-visible,
  .restart-button:focus-visible {
    outline: 2px solid var(--dialog-accent);
    outline-offset: 2px;
  }

  .restart-button {
    align-self: flex-end;
    border-color: var(--dialog-accent);
    animation: dialog-fade-in 0.3s ease;
  }

  @keyframes dialog-header-flow {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes dialog-fade-in {
    from {
      opacity: 0;
      transform: translateY(0.25rem);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes message-in-left {
    from {
      opacity: 0;
      transform: translateX(-0.8rem);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes message-in-right {
    from {
      opacity: 0;
      transform: translateX(0.8rem);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes typing-dot-bounce {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.45;
    }

    40% {
      transform: translateY(-0.22rem);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .message-content {
      max-width: 80%;
    }

    .dialog-body {
      max-height: 18rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .about-dialog,
    .message-row,
    .dialog-header,
    .dialog-empty,
    .dialog-end,
    .fake-input,
    .options-grid,
    .option-button,
    .restart-button,
    .typing-dot {
      animation: none;
      transition: none;
    }
  }
</style>
