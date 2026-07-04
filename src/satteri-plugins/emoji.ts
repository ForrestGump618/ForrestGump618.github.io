import { defineMdastPlugin, type MdastPluginDefinition, type MdastContent } from "satteri";
import { get as getEmoji } from "node-emoji";

/**
 * emoji（satteri 版）：
 * 将 :emoji_name: 语法替换为实际 emoji 字符，等价于 remark-emoji
 *
 * 机制：订阅 text visitor，用正则匹配 :emoji_name: 模式，
 * 通过 node-emoji 的 get() 查询对应 emoji 字符并替换。
 * 不创建新 AST 节点，直接在 text 节点中替换文本（与 remark-emoji 一致）。
 *
 * 与 remark-emoji 的区别：
 * - remark-emoji 使用 mdast-util-find-and-replace 遍历整棵树
 * - satteri 版直接订阅 text visitor，效果等价
 */

// 匹配 :emoji_name: 的正则（与 remark-emoji 一致）
const RE_EMOJI = /:\+1:|:-1:|:[\w-]+:/g;

export interface EmojiOptions {
  /**
   * 在 emoji 后添加一个空格（对应 remark-emoji 的 padSpaceAfter 选项）
   * 默认 false
   */
  padSpaceAfter?: boolean;
}

export default function emoji(options: EmojiOptions = {}): MdastPluginDefinition {
  const padSpaceAfter = options.padSpaceAfter ?? false;

  return defineMdastPlugin({
    name: "emoji",
    text(node, ctx) {
      const value = node.value;
      if (typeof value !== "string" || !RE_EMOJI.test(value)) return;
      // 重置 lastIndex（因为 test 会推进它）
      RE_EMOJI.lastIndex = 0;

      const parts: MdastContent[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      let hasReplacement = false;

      while ((match = RE_EMOJI.exec(value)) !== null) {
        const [token] = match;
        const emojiChar = getEmoji(token.slice(1, -1));

        // 未找到对应 emoji，保留原文本
        if (emojiChar === undefined) continue;

        hasReplacement = true;
        const matchStart = match.index;

        // 添加匹配前的普通文本
        if (matchStart > lastIndex) {
          parts.push({ type: "text", value: value.slice(lastIndex, matchStart) });
        }

        // 添加 emoji 字符（可选后置空格）
        const emojiValue = padSpaceAfter ? `${emojiChar} ` : emojiChar;
        parts.push({ type: "text", value: emojiValue });

        lastIndex = matchStart + token.length;
      }

      if (!hasReplacement) return;

      // 添加剩余文本
      if (lastIndex < value.length) {
        parts.push({ type: "text", value: value.slice(lastIndex) });
      }

      // 一对多替换：先插入所有片段，再移除原节点
      ctx.insertBefore(node, parts);
      ctx.removeNode(node);
    },
  });
}
