import { visit } from "unist-util-visit";

/**
 * spoiler（Aether 兼容）：
 * 支持行内语法：!!spoiler!! -> <Spoiler title="...">spoiler</Spoiler>
 *
 * 说明：
 * - 只处理普通 text 节点，避免破坏 code/inlineCode/math 等节点。
 * - 支持转义：\!! 会被视为普通文本 "!!"。
 */
export default function spoiler(options = {}) {
  // 兼容旧参数名 spoilerTitle
  const title = options.title ?? options.spoilerTitle ?? "...";

  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (parent.type === "code" || parent.type === "inlineCode") return;
      if (parent.type === "math" || parent.type === "inlineMath") return;

      const value = node.value;
      if (typeof value !== "string" || !value.includes("!!")) return;

      const parts = [];
      let i = 0;
      while (i < value.length) {
        const open = value.indexOf("!!", i);
        if (open === -1) break;

        // 处理转义：\!! 视为普通文本 "!!"
        if (open > 0 && value[open - 1] === "\\") {
          // 把转义反斜杠去掉，继续向后找
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
          // 空内容：按字面输出
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

      parent.children.splice(index, 1, ...parts);
      // eslint-disable-next-line consistent-return
      return index + parts.length - 1;
    });
  };
}
