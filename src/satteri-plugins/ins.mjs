import { defineMdastPlugin } from "satteri";

/**
 * ins（satteri 版）：
 * 支持行内语法：++插入文本++ -> <ins>插入文本</ins>
 *
 * 策略与 spoiler 一致：订阅 text visitor，拆分文本并插入 mdxJsxTextElement
 */
export default function ins() {
  return defineMdastPlugin({
    name: "ins",
    text(node, ctx) {
      const value = node.value;
      if (typeof value !== "string" || !value.includes("++")) return;

      const parts = [];
      let i = 0;
      while (i < value.length) {
        const open = value.indexOf("++", i);
        if (open === -1) break;

        // 转义：\++ 视为普通文本
        if (open > 0 && value[open - 1] === "\\") {
          if (open - 1 > i) parts.push({ type: "text", value: value.slice(i, open - 1) });
          parts.push({ type: "text", value: "++" });
          i = open + 2;
          continue;
        }

        const close = value.indexOf("++", open + 2);
        if (close === -1) break;

        if (open > i) {
          parts.push({ type: "text", value: value.slice(i, open) });
        }

        const content = value.slice(open + 2, close);
        if (content.length === 0) {
          parts.push({ type: "text", value: "++++" });
        } else {
          parts.push({
            type: "mdxJsxTextElement",
            name: "ins",
            attributes: [],
            children: [{ type: "text", value: content }],
          });
        }

        i = close + 2;
      }

      if (parts.length === 0) return;
      if (i < value.length) {
        parts.push({ type: "text", value: value.slice(i) });
      }

      ctx.insertBefore(node, parts);
      ctx.removeNode(node);
    },
  });
}
