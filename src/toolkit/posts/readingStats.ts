/**
 * 统一的字数与阅读时长估算。
 *
 * 首页卡片、分页列表与文章详情页必须共用同一套口径，
 * 避免出现「首页显示 3 分钟、详情页显示 8 分钟」的不一致。
 *
 * 口径：
 * - 中日韩字符按 1 字计；
 * - 其余语言按空白/标点切分为「词」，每个词按 1 字计；
 * - 阅读速度取 300 字/分钟（中文精读 + 代码/公式的保守值）。
 */
const WORDS_PER_MINUTE = 300;

/** 去掉 Markdown 标记和代码围栏，只保留可阅读文字 */
export function toReadableText(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 统计可阅读字数（中日韩字符 + 其他语言词数） */
export function countWords(body: string): number {
  const text = toReadableText(body);
  if (!text) {
    return 0;
  }

  const cjkChars = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) ?? [])
    .length;
  const latinWords = (
    text
      .replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g, " ")
      .match(/[A-Za-z0-9][A-Za-z0-9'’+-]*/g) ?? []
  ).length;

  return cjkChars + latinWords;
}

/** 由正文估算阅读时长（分钟，至少 1 分钟；空正文返回 0） */
export function estimateReadTime(body: string): number {
  const words = countWords(body);
  if (words === 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** 一次性拿到字数与阅读时长 */
export function getReadingStats(body: string): { wordCount: number; readTime: number } {
  const wordCount = countWords(body);

  return {
    wordCount,
    readTime: wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
  };
}
