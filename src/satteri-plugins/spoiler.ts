import { defineMdastPlugin, type MdastPluginDefinition, type MdastContent } from "satteri";

/**
 * spoiler（satteri 版）：
 * 支持行内语法：!!spoiler!! -> <Spoiler title="...">spoiler</Spoiler>
 *
 * 与 remark 版逻辑一致，仅适配 satteri 插件 API：
 * - 使用 text visitor 订阅文本节点
 * - 通过 ctx.insertBefore + ctx.removeNode 实现一对多节点替换
 */
export interface SpoilerOptions {
  /** Spoiler 组件的 title 属性值 */
  title?: string;
  /** 兼容旧参数名 */
  spoilerTitle?: string;
}

export default function spoiler(options: SpoilerOptions = {}): MdastPluginDefinition {
  const title = options.title ?? options.spoilerTitle ?? "...";

  return defineMdastPlugin({
    name: "spoiler",
    text(node, ctx) {
      const value = node.value;
      if (typeof value !== "string" || !value.includes("!!")) return;

      const parts: MdastContent[] = [];
      let i = 0;
      while (i < value.length) {
        const open = value.indexOf("!!", i);
        if (open === -1) break;

        // 转义：\!! 视为普通文本 "!!"
        if (open > 0 && value[open - 1] === "\\") {
          if (open - 1 > i) parts.push({ type: "text", value: value.slice(i, open - 1) });
          parts.push({ type: "text", value: "!!" });
          i = open + 2;
          continue;
        }

        const close = value.indexOf("!!", open + 2);
        if (close === -1) break;

        if (open > i) {
          parts.push({ type: "text", value: value.slice(i, open) });
        }

        const content = value.slice(open + 2, close);
        if (content.length === 0) {
          parts.push({ type: "text", value: "!!!!" });
        } else {
          parts.push({
            type: "mdxJsxTextElement",
            name: "Spoiler",
            attributes: [
              {
                type: "mdxJsxAttribute",
                name: "title",
                value: title,
              },
            ],
            children: [{ type: "text", value: content }],
          });
        }

        i = close + 2;
      }

      if (parts.length === 0) return;
      if (i < value.length) {
        parts.push({ type: "text", value: value.slice(i) });
      }

      // 一对多替换：先在原节点前插入所有片段，再移除原节点
      ctx.insertBefore(node, parts);
      ctx.removeNode(node);
    },
  });
}
