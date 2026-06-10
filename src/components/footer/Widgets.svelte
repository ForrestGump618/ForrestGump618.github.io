<script lang="ts">
  import { shuffle } from "es-toolkit";
  import { onMount } from "svelte";
  import { currentLocale, t } from "@/i18n";
  import { toPostHref } from "@/toolkit/posts/url";

  interface Post {
    id: string;
    slug?: string;
    data: {
      title: string;
      description?: string;
    };
  }

  interface Props {
    posts?: Post[];
    enableRandomPosts?: boolean;
    enableRecentComments?: boolean;
    recentCommentsLimit?: number;
    walineServerURL?: string;
  }

  const {
    posts = [],
    enableRandomPosts = true,
    enableRecentComments = true,
    recentCommentsLimit = 6,
    walineServerURL = "",
  }: Props = $props();

  interface RecentCommentItem {
    nick: string;
    time: string;
    text: string;
    href: string;
  }

  let randomPosts = $state<Post[]>([]);
  let recentComments = $state<RecentCommentItem[]>([]);
  let loadFailed = $state(false);

  const hasWaline = $derived(Boolean(walineServerURL));

  function formatDateTime(input: unknown): string {
    const date = input instanceof Date ? input : new Date(String(input || ""));

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString(currentLocale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function toPlainText(input: unknown): string {
    return String(input || "")
      .replaceAll(/<[^>]*>/g, "")
      .replaceAll(/\s+/g, " ")
      .trim();
  }

  function normalizePath(path: string): string {
    if (!path) {
      return "/";
    }

    if (/^https?:\/\//.test(path)) {
      return path;
    }

    if (path.endsWith("/")) {
      return path;
    }

    return `${path}/`;
  }

  function mapRecentComment(comment: unknown): RecentCommentItem {
    const value = comment as {
      nick?: string;
      insertedAt?: string;
      time?: string;
      updatedAt?: string;
      comment?: string;
      text?: string;
      url?: string;
      path?: string;
      objectId?: string;
      id?: string;
      _id?: string;
    };

    const nick = String(value.nick || t("footer.commentAnonymous"));
    const time = formatDateTime(
      value.insertedAt || value.time || value.updatedAt,
    );
    const text = toPlainText(value.comment || value.text || "");
    const basePath = normalizePath(String(value.url || value.path || "/"));
    const id = String(value.objectId || value.id || value._id || "");

    return {
      nick,
      time,
      text,
      href: id ? `${basePath}#waline-comment-${id}` : basePath,
    };
  }

  onMount(() => {
    let destroyRecentComments: (() => void) | undefined;

    // Get random posts
    if (enableRandomPosts && posts.length > 0) {
      randomPosts = shuffle([...posts]).slice(0, 10);
    }

    // Fetch recent comments from Waline
    if (enableRecentComments && hasWaline) {
      const loadRecentComments = async () => {
        const { RecentComments } = await import("@waline/client");
        try {
          const result = await RecentComments({
            serverURL: walineServerURL,
            count: recentCommentsLimit,
          });
          destroyRecentComments = result.destroy;
          // @ts-expect-error - Waline 的 TS 定义存在问题，此处缺少了对data属性的定义
          recentComments = (result.comments.data || []).map((comment) =>
            mapRecentComment(comment),
          );
        } catch {
          loadFailed = true;
          recentComments = [];
        }
      };

      loadRecentComments();
    }

    return () => {
      destroyRecentComments?.();
    };
  });

  function truncateText(text: string, maxLength: number = 50): string {
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  }
</script>

<aside class="widgets bg-body-bg-shadow px-4 flex gap-4 justify-around z-1">
  <!-- Random Posts Widget -->
  {#if enableRandomPosts && randomPosts.length > 0}
    <div class="rpost px-4 py-4 w-1/2">
      <h2 class="text-base color-grey-5 font-semibold m-0 mb-4">
        {t("footer.randomPosts")}
      </h2>
      <ul class="post-list m-0 p-0 list-none color-grey-5">
        {#each randomPosts as post}
          <li
            class="item border-grey-4 pb-2 pl-8 border-b border-dashed relative"
          >
            <a
              href={toPostHref(post.slug || post.id)}
              class="hover:text-color-link text-inherit no-underline flex flex-col transition-colors"
            >
              <span class="widget-title text-sm font-semibold m-0 max-h-6"
                >{post.data.title}</span
              >
              <span class="text-grey-5 text-xs mt-1 max-h-8"
                >{truncateText(post.data.description || "")}</span
              >
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Recent Comments Widget -->
  {#if enableRecentComments && hasWaline}
    <div class="rpost px-4 py-4 w-1/2">
      <h2 class="text-base font-semibold m-0 mb-4">
        {t("footer.recentComments")}
      </h2>
      <ul id="recent-comment" class="post-list m-0 p-0 list-none">
        {#if recentComments.length > 0}
          {#each recentComments as comment}
            <li
              class="item border-grey-4 pb-2 pl-8 border-b border-dashed relative"
            >
              <a
                href={comment.href}
                class="hover:text-color-link text-inherit no-underline flex flex-col transition-colors"
              >
                <span class="widget-title text-sm font-semibold m-0 max-h-6"
                  >{comment.nick} @ {comment.time}</span
                >
                <span class="text-grey-5 text-xs mt-1 max-h-8"
                  >{truncateText(comment.text)}</span
                >
              </a>
            </li>
          {/each}
        {:else if loadFailed}
          <li class="item text-grey-5 py-4 text-center">
            {t("footer.recentCommentsLoadFailed")}
          </li>
        {:else}
          <li class="item text-grey-5 py-4 text-center">
            {t("footer.noRecentComments")}
          </li>
        {/if}
      </ul>
    </div>
  {/if}
</aside>

<style>
  .widgets {
    --un-bg-opacity: 1;
    --widget-heading-color: color-mix(
      in oklch,
      var(--text-color) 80%,
      var(--grey-0)
    );
    --widget-body-color: color-mix(
      in oklch,
      var(--text-color) 72%,
      var(--grey-0)
    );
    --widget-meta-color: color-mix(
      in oklch,
      var(--text-color) 60%,
      var(--grey-0)
    );
  }

  .widgets > div {
    min-width: 0;
  }

  .widgets h2 {
    margin-top: 0;
    color: var(--widget-heading-color);
    font-weight: 500;
  }

  .post-list {
    counter-reset: post-counter;
  }

  .item {
    margin: 0;
    color: var(--widget-body-color);
  }

  .item::before {
    counter-increment: post-counter;
    content: counter(post-counter);
    position: absolute;
    left: 0;
    font-size: 1.5em;
    color: var(--widget-meta-color);
    line-height: 1.2;
    text-align: right;
    width: 1em;
    font-weight: bold;
  }

  .item a {
    display: flex;
    flex-direction: column;
    color: inherit;
    text-decoration: none;
  }

  .item span {
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .widget-title {
    max-height: 1.5rem;
    color: var(--widget-heading-color);
    font-weight: 500;
  }

  .item span:not(.widget-title) {
    max-height: 2rem;
    color: var(--widget-body-color);
  }

  .post-list .item.text-grey-5 {
    color: var(--widget-meta-color);
  }

  @media (max-width: 768px) {
    :global(.widgets) {
      flex-direction: column-reverse;
      gap: 0;
    }

    :global(.widgets > div) {
      width: 100%;
      padding: 0.5rem;
      border-bottom: 1px dashed var(--grey-3);
    }

    :global(.widgets > div:last-child) {
      border-bottom: none;
    }
  }
</style>
